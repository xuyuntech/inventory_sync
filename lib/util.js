'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatUploadData = exports.syncItem = exports.getItemByID = exports.updateItem = exports.getItems = exports.createShop = exports.getShopList = exports.parseExcel = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var parseExcel = exports.parseExcel = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(file) {
    var workbook, worksheet, rowCount, hash, i, row, itemCode;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            workbook = new _exceljs2.default.Workbook();
            _context.prev = 1;
            _context.next = 4;
            return workbook.xlsx.readFile(_path2.default.join(__dirname, '..', file.destination, file.filename));

          case 4:
            worksheet = workbook.getWorksheet(1);

            if (worksheet) {
              _context.next = 7;
              break;
            }

            throw new Error('no worksheet found');

          case 7:
            rowCount = worksheet.rowCount;
            hash = {};

            for (i = 2; i < rowCount; i += 1) {
              row = worksheet.getRow(i);
              itemCode = row.getCell('A').value;

              if (!hash[itemCode]) {
                hash[itemCode] = [];
              }
              hash[itemCode].push({
                itemCode: row.getCell('A').value,
                shopCode: row.getCell('B').value,
                shopName: row.getCell('C').value,
                count: row.getCell('D').value,
                price: row.getCell('E').value
              });
            }
            return _context.abrupt('return', hash);

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](1);
            throw _context.t0;

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 13]]);
  }));

  return function parseExcel(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

var getShopList = exports.getShopList = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var page_size, shopList, hash;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            page_size = 100;
            _context2.prev = 1;
            _context2.next = 4;
            return yzInvoke('youzan.multistore.offline.search', {
              page_no: 1,
              page_size: page_size
            });

          case 4:
            shopList = _context2.sent;
            hash = {};

            shopList.list.map(function (item) {
              return (0, _extends3.default)({}, item, {
                name: (item.name || '').trim()
              });
            }).forEach(function (item) {
              hash[item.name] = item;
            });
            return _context2.abrupt('return', hash);

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2['catch'](1);
            throw _context2.t0;

          case 13:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 10]]);
  }));

  return function getShopList() {
    return _ref3.apply(this, arguments);
  };
}();

var getItemOnePage = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var api = arguments[1];
    var _ref5 = arguments[2];
    var page_no = _ref5.page_no,
        page_size = _ref5.page_size;
    var data;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return yzInvoke(api, { page_no: page_no, page_size: page_size });

          case 3:
            data = _context3.sent;

            log.info('data.items', data.items.length);
            data.items.forEach(function (item) {
              results.push(item);
            });
            return _context3.abrupt('return', data.items.length >= page_size);

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3['catch'](0);
            throw _context3.t0;

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 9]]);
  }));

  return function getItemOnePage() {
    return _ref4.apply(this, arguments);
  };
}();

// 创建门店


var createShop = exports.createShop = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var shop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            console.log('shop ==> ', shop);
            _context4.next = 4;
            return yzInvoke('youzan.multistore.offline.create', shop);

          case 4:
            result = _context4.sent;
            return _context4.abrupt('return', result.is_success);

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4['catch'](0);
            throw _context4.t0;

          case 11:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 8]]);
  }));

  return function createShop() {
    return _ref6.apply(this, arguments);
  };
}();

// 获取所有商品


var getItems = exports.getItems = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
    var page_no, page_size, results;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            page_no = 1;
            page_size = 100;
            results = [];

            if (!(type === 'all' || type === 'inventory')) {
              _context5.next = 11;
              break;
            }

          case 5:
            _context5.next = 7;
            return getItemOnePage(results, 'youzan.items.inventory.get', { page_no: page_no, page_size: page_size });

          case 7:
            if (!_context5.sent) {
              _context5.next = 11;
              break;
            }

            page_no += 1;
            _context5.next = 5;
            break;

          case 11:
            if (!(type === 'all' || type === 'onsale')) {
              _context5.next = 19;
              break;
            }

            page_no = 1;
            // eslint-disable-next-line

          case 13:
            _context5.next = 15;
            return getItemOnePage(results, 'youzan.items.onsale.get', { page_no: page_no, page_size: page_size });

          case 15:
            if (!_context5.sent) {
              _context5.next = 19;
              break;
            }

            page_no += 1;
            _context5.next = 13;
            break;

          case 19:
            return _context5.abrupt('return', results);

          case 22:
            _context5.prev = 22;
            _context5.t0 = _context5['catch'](0);
            throw _context5.t0;

          case 25:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 22]]);
  }));

  return function getItems() {
    return _ref7.apply(this, arguments);
  };
}();

var updateItem = exports.updateItem = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(data) {
    var re;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return yzInvoke('youzan.item.update', data);

          case 3:
            re = _context6.sent;
            return _context6.abrupt('return', re.is_success);

          case 7:
            _context6.prev = 7;
            _context6.t0 = _context6['catch'](0);
            throw _context6.t0;

          case 10:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 7]]);
  }));

  return function updateItem(_x7) {
    return _ref8.apply(this, arguments);
  };
}();

var getItemByID = exports.getItemByID = function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(item_id) {
    var re;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return yzInvoke('youzan.item.get', { item_id: item_id });

          case 3:
            re = _context7.sent;
            return _context7.abrupt('return', re.item);

          case 7:
            _context7.prev = 7;
            _context7.t0 = _context7['catch'](0);
            throw _context7.t0;

          case 10:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 7]]);
  }));

  return function getItemByID(_x8) {
    return _ref9.apply(this, arguments);
  };
}();

var syncItem = exports.syncItem = function () {
  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(data) {
    var re;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return yzInvoke('youzan.multistore.goods.sku.update', data);

          case 3:
            re = _context8.sent;
            return _context8.abrupt('return', re.is_success);

          case 7:
            _context8.prev = 7;
            _context8.t0 = _context8['catch'](0);
            throw _context8.t0;

          case 10:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this, [[0, 7]]);
  }));

  return function syncItem(_x9) {
    return _ref10.apply(this, arguments);
  };
}();

var formatUploadData = exports.formatUploadData = function () {
  var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var results, i, update_num, total, _loop;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            results = [];
            i = 0;
            update_num = 0;
            total = data.length;

            _loop = function _loop() {
              var item = data[i];
              var itemInfo = item.itemInfo,
                  changeArr = item.changeArr;
              var item_id = itemInfo.item_id,
                  item_no = itemInfo.item_no,
                  title = itemInfo.title;

              var changesByShop = []; // 门店商品价格库存变化
              log.debug(i + ': \u540C\u6B65\u5355\u54C1 [' + title + ']');

              var _loop2 = function _loop2(j) {
                var change = changeArr[j];
                if (change.err) {
                  return 'continue'; //eslint-disable-line
                }
                var skus_with_json = [];
                var skus_change_json = [];
                var offline_id = change.offline_id,
                    skus = change.skus,
                    shopName = change.shopName;

                log.debug('\t\u95E8\u5E97: ' + shopName);
                skus.forEach(function (sku) {
                  var sku_id = sku.sku_id,
                      properties_name_json = sku.properties_name_json;

                  var pnj = JSON.parse(properties_name_json || '[]')[0];
                  var uData = (0, _extends3.default)({}, change.to);
                  if (pnj) {
                    var reg = pnj.v.match(/(\d{1,})[盒装|盒套餐]/);
                    if (reg && reg[1]) {
                      var num = reg[1];
                      uData.count = Math.floor(change.to.count / num);
                      uData.price = change.to.price * num;
                    }
                    log.debug('\t\u89C4\u683C: ' + sku.properties_name_json);
                    log.debug('\t\t\u5E93\u5B58\u53D8\u66F4: ' + sku.quantity + ' -> ' + uData.count);
                    log.debug('\t\t\u4EF7\u683C\u53D8\u66F4: ' + sku.price + ' -> ' + uData.price);
                    skus_change_json.push({
                      sku_id: sku_id,
                      sku_property: [pnj.k, pnj.v],
                      origin: {
                        quantity: sku.quantity,
                        price: sku.price
                      },
                      to: {
                        quantity: uData.count,
                        price: uData.price
                      }
                    });
                    skus_with_json.push({
                      sku_property: (0, _defineProperty3.default)({}, pnj.k, pnj.v),
                      sku_price: uData.price,
                      sku_quantity: uData.count,
                      sku_outer_id: item_no,
                      sku_id: sku_id
                    });
                  }
                });
                var update_json = {
                  num_iid: item_id,
                  offline_id: offline_id,
                  skus_with_json: skus_with_json
                };
                changesByShop.push({
                  // 要推送给有赞的数据格式, youzan api
                  update_json: update_json,
                  // 每个 sku 价格库存变化, 页面展示
                  skus_change_json: skus_change_json,
                  shopName: shopName
                });
              };

              for (var j = 0; j < changeArr.length; j += 1) {
                var _ret2 = _loop2(j);

                if (_ret2 === 'continue') continue;
              }
              if (changesByShop.length > 0) {
                update_num += 1;
                var result = {
                  changesByShop: changesByShop,
                  item_id: item_id,
                  item_no: item_no,
                  title: title
                };
                // log.debug('\tupdate json:\n', JSON.stringify(result, null, '\t'));
                log.debug('=====================');
                results.push(result);
              }
              i += 1;
            };

            while (i < total) {
              _loop();
            }
            return _context9.abrupt('return', {
              data: results,
              update_num: update_num
            });

          case 7:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function formatUploadData() {
    return _ref11.apply(this, arguments);
  };
}();

exports.getYouzanShopSKU = getYouzanShopSKU;
exports.yzInvoke = yzInvoke;

var _exceljs = require('exceljs');

var _exceljs2 = _interopRequireDefault(_exceljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import log from './logger';

/* eslint-disable camelcase */
var log = console;
var YZSDK = require('yz-open-sdk-nodejs');
var Token = require('yz-open-sdk-nodejs/Token');

var access_token = 'fec1c42e77333ad3a7d96726c1d268b6';
var YZClient = new YZSDK(new Token(access_token));

var http = require('http');
var url = require('url');

var zlib = require('zlib');

var gunzipStream = zlib.createGunzip();

// 要访问的目标页面
// const targetUrl = 'https://open.youzan.com/api/oauthentry/youzan.multistore.goods.sku/3.0.0/get';
// const targetUrl = "http://proxy.abuyun.com/switch-ip";
// const targetUrl = "http://proxy.abuyun.com/current-ip";

// const urlParsed = url.parse(targetUrl);

// 代理服务器
var proxyHost = 'http-dyn.abuyun.com';
var proxyPort = 9020;

// 代理隧道验证信息
var proxyUser = 'H3A2UN529H49XY3D';
var proxyPass = '4B09A8016E9E2B0C';

var proxyAuth = new Buffer(proxyUser + ':' + proxyPass).toString('base64');

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

function getYouzanShopSKU(_ref) {
  var num_iid = _ref.num_iid,
      offline_id = _ref.offline_id;

  return new _promise2.default(function (resolve, reject) {
    var ts = Date.now();
    var response = function response(data) {
      console.log('\u8BF7\u6C42\u7528\u65F6 ' + (Date.now() - ts) + ' ms');
      var res = JSON.parse(data);
      if (res.response) {
        resolve(res.response);
      } else if (res.error_response) {
        reject(res.error_response);
      } else {
        reject(res);
      }
    };
    var targetUrl = 'https://open.youzan.com/api/oauthentry/youzan.multistore.goods.sku/3.0.0/get?access_token=' + access_token + '&num_iid=' + num_iid + '&offline_id=' + offline_id;
    var urlParsed = url.parse(targetUrl);
    http.request({
      hostname: proxyHost,
      port: proxyPort,
      path: targetUrl,
      method: 'GET',
      headers: {
        Host: urlParsed.hostname,
        Port: urlParsed.port,
        'Accept-Encoding': 'gzip',
        'Proxy-Authorization': 'Basic ' + proxyAuth
      }
    }, function (res) {
      // console.log(`got response: ${res.statusCode}`);
      // console.log(res.headers);

      if (res.headers.hasOwnProperty('content-encoding') && res.headers['content-encoding'].indexOf('gzip') != -1) {
        res.pipe(gunzipStream).on('data', function (data) {
          // console.log(data.toString());
          response(data.toString());
        }).on('end', function () {
          //
        });
      } else {
        res.on('data', function (data) {
          // console.log(data.toString());
          // console.log('data', data.toString());
          response(data);
        }).on('end', function () {
          //
        });
      }
    }).on('error', function (err) {
      console.log(err);
      reject(err);
    }).end();
  });
}

function yzInvoke(api, params) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
  var printLog = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (printLog) {
    log.log('-------- yzInvoke --------');
    log.log(api, params, method);
  }
  return new _promise2.default(function (resolve, reject) {
    YZClient.invoke(api, '3.0.0', method, params, undefined).then(function (resp) {
      try {
        var res = JSON.parse(resp.body);
        if (printLog) {
          log.log('success ->\n', (0, _stringify2.default)(res, null, '\t'));
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
    }, function (err) {
      log.log('error', err);
      reject(err);
    });
  });
}

exports.default = {};