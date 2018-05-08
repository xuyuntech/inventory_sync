/* eslint-disable camelcase */
import Excel from 'exceljs';
import path from 'path';

const log = console;
const YZSDK = require('yz-open-sdk-nodejs');
const Token = require('yz-open-sdk-nodejs/Token');

const YZClient = new YZSDK(new Token('5e4a56537fe036ffa13c9bbd6634c7d3'));

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
    log.log('data.items', data.items.length);
    data.items.forEach((item) => {
      results.push(item);
    });
    return data.items.length >= page_size;
  } catch (err) {
    throw err;
  }
}

// 获取所有商品
export async function getItems() {
  try {
    let page_no = 1;
    const page_size = 100;
    const results = [];
    // eslint-disable-next-line
    while (await getItemOnePage(results, 'youzan.items.inventory.get', { page_no, page_size })) {
      page_no += 1;
    }
    page_no = 1;
    // eslint-disable-next-line
    while (await getItemOnePage(results, 'youzan.items.onsale.get', { page_no, page_size })) {
      page_no += 1;
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

export default {};
