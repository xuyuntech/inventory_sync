'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncItem = exports.getItemByID = exports.updateItem = exports.getItems = exports.getShopList = exports.parseExcel = undefined;

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
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(file) {
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
    return _ref.apply(this, arguments);
  };
}();

var getShopList = exports.getShopList = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
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
    return _ref2.apply(this, arguments);
  };
}();

var getItemOnePage = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var api = arguments[1];
    var _ref4 = arguments[2];
    var page_no = _ref4.page_no,
        page_size = _ref4.page_size;
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

            log.log('data.items', data.items.length);
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
    return _ref3.apply(this, arguments);
  };
}();

// 获取所有商品


var getItems = exports.getItems = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var page_no, page_size, results;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            page_no = 1;
            page_size = 100;
            results = [];
            // eslint-disable-next-line

          case 4:
            _context4.next = 6;
            return getItemOnePage(results, 'youzan.items.inventory.get', { page_no: page_no, page_size: page_size });

          case 6:
            if (!_context4.sent) {
              _context4.next = 10;
              break;
            }

            page_no += 1;
            _context4.next = 4;
            break;

          case 10:
            page_no = 1;
            // eslint-disable-next-line

          case 11:
            _context4.next = 13;
            return getItemOnePage(results, 'youzan.items.onsale.get', { page_no: page_no, page_size: page_size });

          case 13:
            if (!_context4.sent) {
              _context4.next = 17;
              break;
            }

            page_no += 1;
            _context4.next = 11;
            break;

          case 17:
            return _context4.abrupt('return', results);

          case 20:
            _context4.prev = 20;
            _context4.t0 = _context4['catch'](0);
            throw _context4.t0;

          case 23:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 20]]);
  }));

  return function getItems() {
    return _ref5.apply(this, arguments);
  };
}();

var updateItem = exports.updateItem = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(data) {
    var re;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return yzInvoke('youzan.item.update', data);

          case 3:
            re = _context5.sent;
            return _context5.abrupt('return', re.is_success);

          case 7:
            _context5.prev = 7;
            _context5.t0 = _context5['catch'](0);
            throw _context5.t0;

          case 10:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 7]]);
  }));

  return function updateItem(_x5) {
    return _ref6.apply(this, arguments);
  };
}();

var getItemByID = exports.getItemByID = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(item_id) {
    var re;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return yzInvoke('youzan.item.get', { item_id: item_id });

          case 3:
            re = _context6.sent;
            return _context6.abrupt('return', re.item);

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

  return function getItemByID(_x6) {
    return _ref7.apply(this, arguments);
  };
}();

var syncItem = exports.syncItem = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(data) {
    var re;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return yzInvoke('youzan.multistore.goods.sku.update', data);

          case 3:
            re = _context7.sent;
            return _context7.abrupt('return', re.is_success);

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

  return function syncItem(_x7) {
    return _ref8.apply(this, arguments);
  };
}();

exports.yzInvoke = yzInvoke;

var _exceljs = require('exceljs');

var _exceljs2 = _interopRequireDefault(_exceljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable camelcase */
var log = console;
var YZSDK = require('yz-open-sdk-nodejs');
var Token = require('yz-open-sdk-nodejs/Token');

var YZClient = new YZSDK(new Token('5e4a56537fe036ffa13c9bbd6634c7d3'));

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