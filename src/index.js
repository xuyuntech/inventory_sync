/* eslint-disable camelcase, no-await-in-loop */
// const express = require('express');
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { parseExcel, yzInvoke, getShopList, syncItem, getItems, getItemByID, updateItem, formatUploadData, createShop, getYouzanShopSKU } from './util';
import log from './logger';
import shops from '../src/shops.json';
import outputData from './output.json';

const upload = multer({ dest: 'uploads/' });

// const log = console;

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

app.get('/uploadShops', async (req, res) => {
  // const shops = fs.readFileSync(path.join(__dirname, './shops.json'));
  try {
    const shopsHash = shops.data;
    const results = {};
    await Promise.all(Object.keys(shopsHash).map(async (key) => {
      shopsHash[key].image = shopsHash[key].image[0]; // eslint-disable-line
      shopsHash[key].business_hours_advanced = JSON.stringify(shopsHash[key].business_hours_advanced); // eslint-disable-line
      results[key] = await createShop(_.pick(
        shopsHash[key],
        'address', 'area', 'business_hours_advanced', 'city', 'county_id', 'description', 'image', 'is_optional_self_fetch_time',
        'is_self_fetch', 'is_store', 'lat', 'lng', 'name', 'offline_business_hours', 'phone1', 'phone2', 'province', 'support_local_delivery',
      ));
    }));
    res.json(results);
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

// 负责将upload 获得的信息解析为更方便展示以及 youzan sync 的数据格式
app.post('/syncAll', async (req, res) => {
  log.debug('syncAll body');
  const { item_no, update_jsons = [] } = req.body;
  if (!item_no) {
    res.json({
      status: 1,
      err: 'need item_no',
    });
    return;
  }
  if (!Array.isArray(update_jsons) || !update_jsons.length) {
    res.json({
      status: 1,
      err: 'need update_jsons',
    });
    return;
  }
  const data = await Promise.all(update_jsons.map(async (item) => {
    const { num_iid, offline_id, skus_with_json } = item;
    try {
      return {
        success: await syncItem({
          num_iid,
          offline_id,
          skus_with_json: JSON.stringify(skus_with_json),
        }),
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }));
  log.debug('syncAll ---------------');
  log.debug('syncAll data', data);
  let success = true;
  data.forEach((item) => {
    if (!item.success) {
      success = false;
    }
  });
  res.json({
    item_no,
    status: success ? 0 : 1,
    data,
  });
});


async function dealWithOneItem(shopHash, hashData, items, key) {
  const output = [];
  try {
    const item = items[key];
    if (!item) {
      return output;
    }
    // 根据 youzan 里的商品编码获取 excel 里对应的记录集合 [{itemCode,shopCode,count,price}]
    // 也就是同一个商品在每家门店的库存价格记录
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
      // continue; // eslint-disable-line
      return output.concat(await dealWithOneItem(shopHash, hashData, items, key + 1));
    }
    console.log('线下库存商品编号: ', item.item_no, excelItems.length);
    // 遍历一个 sku 每家门店，获取 youzan 里对应的门店与SKU的商品信息
    // for (let i = 0; i < excelItems.length; i += 1) {
    //   const excelItem = excelItems[i];

    // }
    await Promise.all(excelItems.map(async (excelItem = {}) => {
      const shopInYouzan = shopHash[(excelItem.shopName || '').trim()];
      if (shopInYouzan) {
        // 网点商品
        // console.log('获取网点商品 %s -> %s', shopInYouzan.name, item.title);
        // const itemInShop = await yzInvoke('youzan.multistore.goods.sku.get', {
        //   num_iid: item.item_id, // 商品 id
        //   offline_id: shopInYouzan.id, // 网点 id
        // });
        const itemInShop = await getYouzanShopSKU({
          num_iid: item.item_id, // 商品 id
          offline_id: shopInYouzan.id, // 网点 id
        });
        const {
          skus = [], title, outer_id,
        } = itemInShop.item; // 规格列表
        // 每件商品可能有多个 sku 规格，默认第一个 sku 是基础规格,也就是单价
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
    console.log('商品 %s 处理完毕 -----------', item.item_no);
    output.push({
      ...itemChangeLine,
      changeArr,
    });
    return output.concat(await dealWithOneItem(shopHash, hashData, items, key + 1));
  } catch (err) {
    console.log('dealWithOneItem error: ', err);
    return output;
  }
}
app.post('/upload', upload.single('file'), async (req, res) => {
  // const outputData = JSON.stringify(outputStr);
  res.json({
    status: 0,
    ...outputData,
  });
});
app.post('/upload1', upload.single('file'), async (req, res) => {
  const { file } = req;
  // const output = [];
  try {
    // 获取网点信息
    const shopHash = await getShopList();
    log.info('shops', Object.keys(shopHash));
    // 解析 excel 库存信息，返回 map[商品编码]商品
    const hashData = await parseExcel(file);
    // 获取商品列表
    const items = await getItems();
    const output = await dealWithOneItem(shopHash, hashData, items, 0);
    const syncRes = await formatUploadData(output);
    res.json({
      status: 0,
      ...syncRes,
    });
    // for (let i = 0; i < l; i += 1) {
    //   // item 是库存中的单个商品
    //   const item = items[i];
    // }
  } catch (err) {
    res.send({
      status: 1,
      err,
    });
  }
});

const server = app.listen(3001, () => {
  const address = server.address();
  console.log('InventorySync listening at http://%s:%s', address.address, address.port);
});
