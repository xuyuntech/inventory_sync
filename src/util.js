/* eslint-disable camelcase */
import Excel from 'exceljs';
import path from 'path';
// import log from './logger';

const log = console;
const YZSDK = require('yz-open-sdk-nodejs');
const Token = require('yz-open-sdk-nodejs/Token');

const access_token = 'fec1c42e77333ad3a7d96726c1d268b6';
const YZClient = new YZSDK(new Token(access_token));


const http = require('http');
const url = require('url');

const zlib = require('zlib');

const gunzipStream = zlib.createGunzip();

// 要访问的目标页面
// const targetUrl = 'https://open.youzan.com/api/oauthentry/youzan.multistore.goods.sku/3.0.0/get';
// const targetUrl = "http://proxy.abuyun.com/switch-ip";
// const targetUrl = "http://proxy.abuyun.com/current-ip";

// const urlParsed = url.parse(targetUrl);

// 代理服务器
const proxyHost = 'http-dyn.abuyun.com';
const proxyPort = 9020;

// 代理隧道验证信息
const proxyUser = 'H3A2UN529H49XY3D';
const proxyPass = '4B09A8016E9E2B0C';

const proxyAuth = new Buffer(`${proxyUser}:${proxyPass}`).toString('base64');

// const options = {
//   hostname: proxyHost,
//   port: proxyPort,
//   path: targetUrl,
//   method: 'GET',
//   headers: {
//     Host: urlParsed.hostname,
//     Port: urlParsed.port,
//     'Accept-Encoding': 'gzip',
//     'Proxy-Authorization': `Basic ${proxyAuth}`,
//   },
// };

export function getYouzanShopSKU({ num_iid, offline_id }) {
  return new Promise((resolve, reject) => {
    const ts = Date.now();
    const response = (data) => {
      console.log(`请求用时 ${Date.now() - ts} ms`);
      const res = JSON.parse(data);
      if (res.response) {
        resolve(res.response);
      } else if (res.error_response) {
        reject(res.error_response);
      } else {
        reject(res);
      }
    };
    const targetUrl = `https://open.youzan.com/api/oauthentry/youzan.multistore.goods.sku/3.0.0/get?access_token=${access_token}&num_iid=${num_iid}&offline_id=${offline_id}`;
    const urlParsed = url.parse(targetUrl);
    http
      .request({
        hostname: proxyHost,
        port: proxyPort,
        path: targetUrl,
        method: 'GET',
        headers: {
          Host: urlParsed.hostname,
          Port: urlParsed.port,
          'Accept-Encoding': 'gzip',
          'Proxy-Authorization': `Basic ${proxyAuth}`,
        },
      }, (res) => {
        // console.log(`got response: ${res.statusCode}`);
        // console.log(res.headers);

        if (res.headers.hasOwnProperty('content-encoding') && res.headers['content-encoding'].indexOf('gzip') != -1) {
          res
            .pipe(gunzipStream)
            .on('data', (data) => {
              // console.log(data.toString());
              response(data.toString());
            })
            .on('end', () => {
            //
            });
        } else {
          res.on('data', (data) => {
            // console.log(data.toString());
            // console.log('data', data.toString());
            response(data);
          }).on('end', () => {
          //
          });
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .end();
  });
}

export function yzInvoke(api, params, method = 'GET', printLog = false) {
  if (printLog) {
    log.log('-------- yzInvoke --------');
    log.log(api, params, method);
  }
  return new Promise((resolve, reject) => {
    YZClient.invoke(api, '3.0.0', method, params, undefined)
      .then((resp) => {
        try {
          const res = JSON.parse(resp.body);
          if (printLog) {
            log.log('success ->\n', JSON.stringify(res, null, '\t'));
          }
          if (res.response) {
            resolve(res.response);
          } else if (res.error_response) {
            reject(res.error_response);
          } else {
            reject(res);
          }
        } catch (err) {
          reject(err);
        }
      }, (err) => {
        log.log('error', err);
        reject(err);
      });
  });
}


export async function parseExcel(file) {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(path.join(__dirname, '..', file.destination, file.filename));
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('no worksheet found');
    }
    const { rowCount } = worksheet;
    const hash = {};
    for (let i = 2; i < rowCount; i += 1) {
      const row = worksheet.getRow(i);
      const itemCode = row.getCell('A').value;
      if (!hash[itemCode]) {
        hash[itemCode] = [];
      }
      hash[itemCode].push({
        itemCode: row.getCell('A').value,
        shopCode: row.getCell('B').value,
        shopName: row.getCell('C').value,
        count: row.getCell('D').value,
        price: row.getCell('E').value,
      });
    }
    return hash;
  } catch (err) {
    throw err;
  }
}

export async function getShopList() {
  const page_size = 100;
  try {
    const shopList = await yzInvoke('youzan.multistore.offline.search', {
      page_no: 1,
      page_size,
    });
    const hash = {};
    shopList.list.map(item => ({
      ...item,
      name: (item.name || '').trim(),
    })).forEach((item) => {
      hash[item.name] = item;
    });
    return hash;
  } catch (err) {
    throw err;
  }
}

async function getItemOnePage(results = [], api, { page_no, page_size }) {
  try {
    const data = await yzInvoke(api, { page_no, page_size });
    log.info('data.items', data.items.length);
    data.items.forEach((item) => {
      results.push(item);
    });
    return data.items.length >= page_size;
  } catch (err) {
    throw err;
  }
}

// 创建门店
export async function createShop(shop = {}) {
  try {
    console.log('shop ==> ', shop);
    const result = await yzInvoke('youzan.multistore.offline.create', shop);
    return result.is_success;
  } catch (err) {
    throw err;
  }
}

// 获取所有商品
export async function getItems(type = 'all') {
  try {
    let page_no = 1;
    const page_size = 100;
    const results = [];
    if (type === 'all' || type === 'inventory') {
      // eslint-disable-next-line
      while (await getItemOnePage(results, 'youzan.items.inventory.get', { page_no, page_size })) {
        page_no += 1;
      }
    }
    if (type === 'all' || type === 'onsale') {
      page_no = 1;
      // eslint-disable-next-line
      while (await getItemOnePage(results, 'youzan.items.onsale.get', { page_no, page_size })) {
        page_no += 1;
      }
    }
    return results;
  } catch (err) {
    throw err;
  }
}

export async function updateItem(data) {
  try {
    const re = await yzInvoke('youzan.item.update', data);
    return re.is_success;
  } catch (err) {
    throw err;
  }
}


export async function getItemByID(item_id) {
  try {
    const re = await yzInvoke('youzan.item.get', { item_id });
    return re.item;
  } catch (err) {
    throw err;
  }
}

export async function syncItem(data) {
  try {
    const re = await yzInvoke('youzan.multistore.goods.sku.update', data);
    return re.is_success;
  } catch (err) {
    throw err;
  }
}

export async function formatUploadData(data = []) {
  const results = [];

  let i = 0;
  let update_num = 0;
  const total = data.length;
  while (i < total) {
    const item = data[i];
    const { itemInfo, changeArr } = item;
    const { item_id, item_no, title } = itemInfo;
    const changesByShop = []; // 门店商品价格库存变化
    log.debug(`${i}: 同步单品 [${title}]`);
    for (let j = 0; j < changeArr.length; j += 1) {
      const change = changeArr[j];
      if (change.err) {
        continue; //eslint-disable-line
      }
      const skus_with_json = [];
      const skus_change_json = [];
      const {
        offline_id, skus, shopName,
      } = change;
      log.debug(`\t门店: ${shopName}`);
      skus.forEach((sku) => {
        const { sku_id, properties_name_json } = sku;
        const pnj = JSON.parse(properties_name_json || '[]')[0];
        const uData = { ...change.to };
        if (pnj) {
          const reg = pnj.v.match(/(\d{1,})[盒装|盒套餐]/);
          if (reg && reg[1]) {
            const num = reg[1];
            uData.count = Math.floor(change.to.count / num);
            uData.price = change.to.price * num;
          }
          log.debug(`\t规格: ${sku.properties_name_json}`);
          log.debug(`\t\t库存变更: ${sku.quantity} -> ${uData.count}`);
          log.debug(`\t\t价格变更: ${sku.price} -> ${uData.price}`);
          skus_change_json.push({
            sku_id,
            sku_property: [pnj.k, pnj.v],
            origin: {
              quantity: sku.quantity,
              price: sku.price,
            },
            to: {
              quantity: uData.count,
              price: uData.price,
            },
          });
          skus_with_json.push({
            sku_property: {
              [pnj.k]: pnj.v,
            },
            sku_price: uData.price,
            sku_quantity: uData.count,
            sku_outer_id: item_no,
            sku_id,
          });
        }
      });
      const update_json = {
        num_iid: item_id,
        offline_id,
        skus_with_json,
      };
      changesByShop.push({
        // 要推送给有赞的数据格式, youzan api
        update_json,
        // 每个 sku 价格库存变化, 页面展示
        skus_change_json,
        shopName,
      });
    }
    if (changesByShop.length > 0) {
      update_num += 1;
      const result = {
        changesByShop,
        item_id,
        item_no,
        title,
      };
      // log.debug('\tupdate json:\n', JSON.stringify(result, null, '\t'));
      log.debug('=====================');
      results.push(result);
    }
    i += 1;
  }
  return {
    data: results,
    update_num,
  };
}

export default {};
