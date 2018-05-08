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
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
app.get('/inventoryGet', (req, res) => {
  yzInvoke('youzan.items.inventory.get', {
    page_size: 100,
    page_no: 1,
  }).then((data) => {
    res.send(data);
  }, (err) => {
    res.send(err);
  });
});

app.get('/', (req, res) => {
  const params = {
    page_size: 100,
    page_no: 1,
  };
  yzInvoke('youzan.multistore.offline.search', params).then((data) => {
    res.send(data.list);
  }, (err) => {
    res.send(err);
  });
});

app.get('/sync', async (req, res) => {
  const page_size = 100;
  try {
    const data = await yzInvoke('youzan.items.inventory.get', {
      page_no: 1,
      page_size,
    });
    res.send(data);
  } catch (err) {
    res.send(err);
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

app.post('/update', async (req, res) => {
  try {
    const {
      shopInfo,
      skus,
      to,
    } = req.body;
    if (!skus[0]) {
      res.json({
        status: 1,
        err: 'skus length 0',
      });
      return;
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
      res.json({
        status: 0,
      });
    } else {
      res.json({
        status: 1,
      });
    }
  } catch (err) {
    res.json({
      status: 1,
      err,
    });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  const page_size = 100;
  const warnings = [];
  const output = [];
  try {
    // 获取网点信息
    const shopHash = await getShopList();
    log.log('shops', Object.keys(shopHash));
    // 解析 excel 库存信息，返回 map[商品编码]商品
    const hashData = await parseExcel(file);
    // 获取库存中的商品列表
    const inventoryItems = await yzInvoke('youzan.items.inventory.get', {
      page_no: 1,
      page_size,
    }, 'GET', false);
    const l = inventoryItems.items.length;
    for (let i = 0; i < l; i += 1) {
      // item 是库存中的单个商品
      const item = inventoryItems.items[i];
      // excelItem 是 [{itemCode,shopCode,count,price}]
      const excelItems = hashData[item.item_no];
      if (!excelItems) {
        log.log('excelItem', excelItems, item.item_no, item.title);
      }
      if (!excelItems) {
        warnings.push({
          item,
          msg: `excel 里没找到商品编码 ${item.item_no}`,
        });
        continue; // eslint-disable-line
      }
      const itemChangeLine = {
        itemInfo: {
          item_id: item.item_id,
          item_no: item.item_no,
          title: item.title,
        },
      };
      const changeArr = [];
      await Promise.all(excelItems.map(async (excelItem) => {
        const shopInYouzan = shopHash[(excelItem.shopName || '').trim()];
        // log.log('shopInYouzan', shopInYouzan);
        if (excelItem && shopInYouzan) {
          // 网点商品
          const itemInShop = await yzInvoke('youzan.multistore.goods.sku.get', {
            num_iid: item.item_id, // 商品 id
            offline_id: shopInYouzan.id, // 网点 id
          });
          const {
            skus = [],
          } = itemInShop.item; // 规格列表
          if (skus[0]) {
            if (excelItem.count != skus[0].quantity) { // eslint-disable-line
              changeArr.push({
                shopInfo: {
                  id: shopInYouzan.id,
                  sid: shopInYouzan.sid,
                  name: shopInYouzan.name,
                },
                skus,
                to: {
                  ...excelItem,
                },
              });
            }
          }
        } else {
          warnings.push({
            excelItem,
            item,
            msg: 'item not found in excel',
          });
        }
      }));
      output.push({
        ...itemChangeLine,
        changeArr,
      });
    }
    res.json({
      status: 0,
      data: output,
      warnings,
    });
  } catch (err) {
    console.error('error', err);
    res.send(err);
  }
});

const server = app.listen(3001, () => {
  const address = server.address();
  log.log('InventorySycn listening at http://%s:%s', address.address, address.port);
});
