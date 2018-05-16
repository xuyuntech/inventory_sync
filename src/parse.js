/* eslint-disable camelcase, no-await-in-loop */
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { parseExcel, yzInvoke, getShopList, syncItem, getItems, getItemByID, updateItem, formatUploadData, createShop, getYouzanShopSKU } from './util';
import log from './logger';


async function dealWithOneItem(shopHash, hashData, items, key) {
  console.log('dealWithOneItem key: ', key);
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
    const chunk = _.chunk(excelItems, 3);
    for (let i = 0; i < chunk.length; i += 1) {
      const excelItemsChunk = chunk[i];
      console.log('chunk ', excelItemsChunk.length);
      await Promise.all(excelItemsChunk.map(async (excelItem = {}) => {
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
    }


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

async function parse2JSON() {
  try {
    // 获取网点信息
    const shopHash = await getShopList();
    log.info('shops', Object.keys(shopHash));
    // 解析 excel 库存信息，返回 map[商品编码]商品
    const hashData = await parseExcel({
      destination: 'src',
      filename: '库存.xlsx',
    });
    // 获取商品列表
    const items = await getItems();
    console.log('商品 ', items.length);
    const output = await dealWithOneItem(shopHash, hashData, items, 0);
    console.log('output', output);
    const syncRes = await formatUploadData(output);
    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(syncRes, null, '\t'), 'UTF-8');
    // for (let i = 0; i < l; i += 1) {
    //   // item 是库存中的单个商品
    //   const item = items[i];
    // }
  } catch (err) {
    console.error(err);
  }
}

parse2JSON();
