/* eslint-disable camelcase, no-await-in-loop */
// const express = require('express');
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import { parseExcel, yzInvoke, getShopList, syncItem, getItems, getItemByID, updateItem } from './util';

const upload = multer({ dest: 'uploads/' });

const log = console;

// var YZClient = new YZClient(new Sign('0e6164502b72aa7d26', 'bb2bb44a29b5a14c0378f60234d14877'));
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token');
  next();
});

app.get('/getOnsale', async (req, res) => {
  try {
    const data = await yzInvoke('youzan.items.onsale.get', {
      page_no: 2,
      page_size: 300,
    }, 'GET', false);
    const { items } = data;
    const ggArr = [];
    if (Array.isArray(items)) {
      let i = 0;
      log.log('total', items.length);
      await Promise.all(items.map(async (item) => {
        const sku = await yzInvoke('youzan.item.get', { item_id: item.item_id }, 'GET', false);
        if (sku.item && Array.isArray(sku.item.skus)) {
          log.log('sku.item.skus', sku.item.skus.length, i += 1);
          sku.item.skus.forEach((a) => {
            if (!a.ittem_no) {
              const gg = JSON.parse(a.properties_name_json);
              log.log('gg', gg);
              if (Array.isArray(gg) && gg.length === 1) {
                ggArr.push(gg[0].v);
              } else {
                log.log('gg length not 1', gg);
              }
            }
          });
        }
      }));
    }
    log.log('output ===>>>>>');
    res.send(ggArr);
  } catch (err) {
    res.send(err);
  }
});

app.get('/itemUpdate', async (req, res) => {
  const { item_no } = req.query;
  log.log('>>', req.query, req.params);
  const toQuantity = 36;
  try {
    const data = await yzInvoke('youzan.skus.custom.get', {
      item_no,
    });
    if (data.skus.length >= 1) {
      const skuDetail = await yzInvoke('youzan.item.get', {
        item_id: data.skus[0].item_id,
      });
      skuDetail.item.skus.forEach(async (sku) => {
        let b = 1;
        const { item_id, sku_id } = sku;
        if (sku.item_no !== item_no) {
          const regx = sku.item_no.match(`${sku.item_no}x(\\d)`);
          if (regx && regx[1]) {
            b = parseInt(regx[1], 10);
          }
        }
        const updateData = await yzInvoke('youzan.item.sku.update', {
          item_id,
          sku_id,
          quantity: Math.floor(toQuantity / b),
        });
        if (updateData.is_success !== true) {
          throw new Error({
            type: 'youzan.item.sku.update',
            sku,
          });
        }
      });
      res.send('ok');
      return;
    }
    throw new Error('not found');
    // data.skus.forEach(async (sku) => {
    // const { item_id, sku_id } = sku;
    // const updateData = await yzInvoke('youzan.item.sku.update', {
    //   item_id,
    //   sku_id,
    //   quantity: 12,
    // });
    // if (updateData.is_success !== true) {
    //   log.error('youzan.item.sku.update error: ', sku);
    //   throw new Error({
    //     msg: 'youzan.item.sku.update',
    //     sku,
    //   });
    // }
    // });

    // const { skus } = data;
    // if (skus.length === 1) {
    //   const { item_id } = skus[0];
    //   const skuItem = await yzInvoke('youzan.item.get', { item_id });
    //   res.send(JSON.stringify(skuItem, null, '\t'));
    // } else {
    //   res.send({
    //     msg: 'skus length not 1',
    //     skus,
    //   });
    // }
  } catch (err) {
    res.send(err);
  }
});

app.get('/itemNoSync', async (req, res) => {
  try {
    const items = await getItems();
    const iItems = items.filter(item => item.item_no === '');
    const warnings = [];
    await Promise.all(iItems.map(async (item) => {
      const { item_id, title } = item;
      const itemDetail = await getItemByID(item_id);
      const { skus } = itemDetail;
      if (skus[0] && skus[0].item_no) {
        const { item_no } = skus[0];
        if (!await updateItem({
          item_id,
          item_no,
        })) {
          log.error('update item failed', item_id, item_no);
        }
      } else {
        log.error('skus is null', item_id);
        warnings.push(title);
      }
    }));
    res.json({
      status: 0,
      count: iItems.length,
      warnings,
    });
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

app.get('/itemGet', async (req, res) => {
  try {
    res.json(await yzInvoke('youzan.item.get', {
      item_id: req.query.item_id,
    }));
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

// 根据外部编号获取商品信息
app.get('/customGet', async (req, res) => {
  log.log('req.query.outer_id', req.query.outer_id);
  try {
    res.json(await yzInvoke('youzan.skus.custom.get', {
      item_no: req.query.outer_id,
    }));
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

app.get('/exportShops', async (req, res) => {
  try {
    const shopList = await getShopList();
    // var workbook = new Excel.Workbook();
    // var worksheet = workbook.addWorksheet('My Sheet');
    // worksheet.columns = [
    //   { header: 'Id', key: 'id', width: 10 },
    //   { header: 'Name', key: 'name', width: 32 },
    //   { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
    // ];
    res.json({
      status: 0,
      data: shopList,
    });
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

async function doUpdateItem({
  shopInfo,
  skus,
  to,
}) {
  try {
    if (!skus[0]) {
      throw new Error('skus length 0');
    }
    const { price, count, itemCode } = to;
    const shopCode = shopInfo.id;
    let itemID = 0;
    const skus_with_json = [];
    skus.forEach((sku) => {
      const sku_json = {};
      const { num_iid, sku_id, properties_name_json = '{}' } = sku;
      const properties = JSON.parse(properties_name_json);
      itemID = num_iid;
      if (properties[0]) {
        const { k, v } = properties[0];
        sku_json.sku_property = {
          [k]: v,
        };
        sku_json.sku_price = price;
        sku_json.sku_quantity = count;
        sku_json.sku_outer_id = itemCode;
        sku_json.sku_id = sku_id;
      }
      skus_with_json.push(sku_json);
    });

    if (await syncItem({
      num_iid: itemID,
      offline_id: shopCode,
      skus_with_json: JSON.stringify(skus_with_json),
    })) {
      return true;
    }
  } catch (err) {
    throw err;
  }
}

async function doSyncAll(data = []) {
  const pData = [];
  data.forEach((item) => {
    item.changeArr.forEach((change) => {
      if (!change.err) {
        pData.push(change);
      }
    });
  });
  let i = 0;
  let success_num = 0;
  const total = pData.length;
  const errors = [];
  while (i < total) {
    try {
      // await doUpdateItem(pData[i]);

      const item = pData[i];
      const {
        num_iid, offline_id, skus, title, shopName, outer_id,
      } = item;
      const skus_with_json = [];
      log.debug(`${i}: 同步单品 [${title}]`);
      log.debug(`\t门店: ${shopName}`);
      skus.forEach((sku) => {
        const { sku_id, properties_name_json } = sku;
        const pnj = JSON.parse(properties_name_json || '[]')[0];
        const uData = { ...item.to };
        if (pnj) {
          const reg = pnj.v.match(/(\d{1,})[盒装|盒套餐]/);
          if (reg && reg[1]) {
            const num = reg[1];
            uData.count = Math.floor(item.to.count / num);
            uData.price = item.to.price * num;
          }
          log.debug(`\t规格: ${sku.properties_name_json}`);
          log.debug(`\t\t库存变更: ${sku.quantity} -> ${uData.count}`);
          log.debug(`\t\t价格变更: ${sku.price} -> ${uData.price}`);
          skus_with_json.push({
            sku_property: {
              [pnj.k]: pnj.v,
            },
            sku_price: uData.price,
            sku_quantity: uData.count,
            sku_outer_id: outer_id,
            sku_id,
          });
        }
      });
      const update_json = {
        num_iid,
        offline_id,
        skus_with_json,
      };
      log.debug('\tupdate json:\n', JSON.stringify(update_json, null, '\t'));
      log.debug('=====================');
      success_num += 1;
    } catch (err) {
      log.error(`doUpdateItem ${i} error: ${err}`);
      errors.push({
        idx: i,
        item: pData[i],
        err,
      });
    }
    i += 1;
  }
  return {
    data: {
      synced: pData,
      total,
      success_num,
      failed_num: total - success_num,
    },
    err: errors,
  };
}

app.post('/syncAll', async (req, res) => {
  if (!Array.isArray(req.body)) {
    res.json({
      status: 1,
      err: 'params invalid, need array',
    });
    return;
  }
  const data = await doSyncAll(req.body);
  res.json({
    status: 0,
    ...data,
  });
});

app.post('/syncOne', async (req, res) => {
  try {
    await doUpdateItem(req.body);
    res.json({
      status: 0,
    });
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  const output = [];
  try {
    // 获取网点信息
    const shopHash = await getShopList();
    log.log('shops', Object.keys(shopHash));
    // 解析 excel 库存信息，返回 map[商品编码]商品
    const hashData = await parseExcel(file);
    // 获取商品列表
    const items = await getItems();
    log.log(`获取商品 ${items.length} 个.`);
    const l = items.length;
    for (let i = 0; i < l; i += 1) {
      log.log(`处理 ${i} 个`);
      // item 是库存中的单个商品
      const item = items[i];
      // excelItem 是 [{itemCode,shopCode,count,price}]
      const excelItems = hashData[item.item_no];
      const itemChangeLine = {
        itemInfo: {
          item_id: item.item_id,
          item_no: item.item_no,
          title: item.title,
        },
      };
      const changeArr = [];
      if (!excelItems) {
        changeArr.push({
          // item,
          err: `excel 里没找到商品编码 ${item.item_no}`,
        });
        continue; // eslint-disable-line
      }
      await Promise.all(excelItems.map(async (excelItem = {}) => {
        const shopInYouzan = shopHash[(excelItem.shopName || '').trim()];
        // log.log('shopInYouzan', shopInYouzan);
        if (shopInYouzan) {
          // 网点商品
          const itemInShop = await yzInvoke('youzan.multistore.goods.sku.get', {
            num_iid: item.item_id, // 商品 id
            offline_id: shopInYouzan.id, // 网点 id
          });
          const {
            skus = [], title, outer_id,
          } = itemInShop.item; // 规格列表
          if (skus[0]) {
            if (excelItem.count != skus[0].quantity || excelItem.price != skus[0].price) { // eslint-disable-line
              changeArr.push({
                shopInfo: {
                  id: shopInYouzan.id,
                  sid: shopInYouzan.sid,
                  name: shopInYouzan.name,
                },
                outer_id,
                shopName: shopInYouzan.name,
                num_iid: item.item_id, // 商品 id
                offline_id: shopInYouzan.id, // 网点 id
                title,
                skus,
                to: {
                  ...excelItem,
                },
              });
            } else {
              changeArr.push({
                // excelItem,
                // item,
                err: '库存或者价格没有变化',
              });
            }
          } else {
            changeArr.push({
              // excelItem,
              // item,
              err: `商品 ${item.title} 没有 规格 信息`,
            });
          }
        } else {
          changeArr.push({
            // excelItem,
            // item,
            err: `门店 ${excelItem.shopName} 没找到`,
          });
        }
      }));
      output.push({
        ...itemChangeLine,
        changeArr,
      });
    }
    const syncRes = await doSyncAll(output);
    res.json({
      status: 0,
      ...syncRes,
    });
  } catch (err) {
    res.send({
      status: 1,
      err,
    });
  }
});

const server = app.listen(3001, () => {
  const address = server.address();
  log.log('InventorySycn listening at http://%s:%s', address.address, address.port);
});
