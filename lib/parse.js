'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var dealWithOneItem = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(shopHash, hashData, items, key) {
    var _this = this;

    var output, _ret;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('dealWithOneItem key: ', key);
            output = [];
            _context3.prev = 2;
            return _context3.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
              var item, excelItems, itemChangeLine, changeArr, chunk, i, excelItemsChunk;
              return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      item = items[key];

                      if (item) {
                        _context2.next = 3;
                        break;
                      }

                      return _context2.abrupt('return', {
                        v: output
                      });

                    case 3:
                      // 根据 youzan 里的商品编码获取 excel 里对应的记录集合 [{itemCode,shopCode,count,price}]
                      // 也就是同一个商品在每家门店的库存价格记录
                      excelItems = hashData[item.item_no];
                      itemChangeLine = {
                        itemInfo: {
                          item_id: item.item_id,
                          item_no: item.item_no,
                          title: item.title
                        }
                      };
                      changeArr = [];

                      if (excelItems) {
                        _context2.next = 14;
                        break;
                      }

                      changeArr.push({
                        // item,
                        err: 'excel \u91CC\u6CA1\u627E\u5230\u5546\u54C1\u7F16\u7801 ' + item.item_no
                      });
                      // continue; // eslint-disable-line
                      _context2.t0 = output;
                      _context2.next = 11;
                      return dealWithOneItem(shopHash, hashData, items, key + 1);

                    case 11:
                      _context2.t1 = _context2.sent;
                      _context2.t2 = _context2.t0.concat.call(_context2.t0, _context2.t1);
                      return _context2.abrupt('return', {
                        v: _context2.t2
                      });

                    case 14:
                      console.log('线下库存商品编号: ', item.item_no, excelItems.length);
                      // 遍历一个 sku 每家门店，获取 youzan 里对应的门店与SKU的商品信息
                      // for (let i = 0; i < excelItems.length; i += 1) {
                      //   const excelItem = excelItems[i];

                      // }
                      chunk = _lodash2.default.chunk(excelItems, 3);
                      i = 0;

                    case 17:
                      if (!(i < chunk.length)) {
                        _context2.next = 25;
                        break;
                      }

                      excelItemsChunk = chunk[i];

                      console.log('chunk ', excelItemsChunk.length);
                      _context2.next = 22;
                      return _promise2.default.all(excelItemsChunk.map(function () {
                        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                          var excelItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                          var shopInYouzan, itemInShop, _itemInShop$item, _itemInShop$item$skus, skus, title, outer_id;

                          return _regenerator2.default.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  shopInYouzan = shopHash[(excelItem.shopName || '').trim()];

                                  if (!shopInYouzan) {
                                    _context.next = 9;
                                    break;
                                  }

                                  _context.next = 4;
                                  return (0, _util.getYouzanShopSKU)({
                                    num_iid: item.item_id, // 商品 id
                                    offline_id: shopInYouzan.id // 网点 id
                                  });

                                case 4:
                                  itemInShop = _context.sent;
                                  _itemInShop$item = itemInShop.item, _itemInShop$item$skus = _itemInShop$item.skus, skus = _itemInShop$item$skus === undefined ? [] : _itemInShop$item$skus, title = _itemInShop$item.title, outer_id = _itemInShop$item.outer_id; // 规格列表
                                  // 每件商品可能有多个 sku 规格，默认第一个 sku 是基础规格,也就是单价

                                  if (skus[0]) {
                                    if (excelItem.count != skus[0].quantity || excelItem.price != skus[0].price) {
                                      // eslint-disable-line
                                      changeArr.push({
                                        shopInfo: {
                                          id: shopInYouzan.id,
                                          sid: shopInYouzan.sid,
                                          name: shopInYouzan.name
                                        },
                                        outer_id: outer_id,
                                        shopName: shopInYouzan.name,
                                        num_iid: item.item_id, // 商品 id
                                        offline_id: shopInYouzan.id, // 网点 id
                                        title: title,
                                        skus: skus,
                                        to: (0, _extends3.default)({}, excelItem)
                                      });
                                    } else {
                                      changeArr.push({
                                        // excelItem,
                                        // item,
                                        err: '库存或者价格没有变化'
                                      });
                                    }
                                  } else {
                                    changeArr.push({
                                      // excelItem,
                                      // item,
                                      err: '\u5546\u54C1 ' + item.title + ' \u6CA1\u6709 \u89C4\u683C \u4FE1\u606F'
                                    });
                                  }
                                  _context.next = 10;
                                  break;

                                case 9:
                                  changeArr.push({
                                    // excelItem,
                                    // item,
                                    err: '\u95E8\u5E97 ' + excelItem.shopName + ' \u6CA1\u627E\u5230'
                                  });

                                case 10:
                                case 'end':
                                  return _context.stop();
                              }
                            }
                          }, _callee, _this);
                        }));

                        return function () {
                          return _ref2.apply(this, arguments);
                        };
                      }()));

                    case 22:
                      i += 1;
                      _context2.next = 17;
                      break;

                    case 25:

                      console.log('商品 %s 处理完毕 -----------', item.item_no);
                      output.push((0, _extends3.default)({}, itemChangeLine, {
                        changeArr: changeArr
                      }));
                      _context2.t3 = output;
                      _context2.next = 30;
                      return dealWithOneItem(shopHash, hashData, items, key + 1);

                    case 30:
                      _context2.t4 = _context2.sent;
                      _context2.t5 = _context2.t3.concat.call(_context2.t3, _context2.t4);
                      return _context2.abrupt('return', {
                        v: _context2.t5
                      });

                    case 33:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, _callee2, _this);
            })(), 't0', 4);

          case 4:
            _ret = _context3.t0;

            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt('return', _ret.v);

          case 7:
            _context3.next = 13;
            break;

          case 9:
            _context3.prev = 9;
            _context3.t1 = _context3['catch'](2);

            console.log('dealWithOneItem error: ', _context3.t1);
            return _context3.abrupt('return', output);

          case 13:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[2, 9]]);
  }));

  return function dealWithOneItem(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}(); /* eslint-disable camelcase, no-await-in-loop */


var parse2JSON = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var shopHash, hashData, items, output, syncRes;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return (0, _util.getShopList)();

          case 3:
            shopHash = _context4.sent;

            _logger2.default.info('shops', (0, _keys2.default)(shopHash));
            // 解析 excel 库存信息，返回 map[商品编码]商品
            _context4.next = 7;
            return (0, _util.parseExcel)({
              destination: 'src',
              filename: '库存.xlsx'
            });

          case 7:
            hashData = _context4.sent;
            _context4.next = 10;
            return (0, _util.getItems)();

          case 10:
            items = _context4.sent;

            console.log('商品 ', items.length);
            _context4.next = 14;
            return dealWithOneItem(shopHash, hashData, items, 0);

          case 14:
            output = _context4.sent;

            console.log('output', output);
            _context4.next = 18;
            return (0, _util.formatUploadData)(output);

          case 18:
            syncRes = _context4.sent;

            _fs2.default.writeFileSync(_path2.default.join(__dirname, 'output.json'), (0, _stringify2.default)(syncRes, null, '\t'), 'UTF-8');
            // for (let i = 0; i < l; i += 1) {
            //   // item 是库存中的单个商品
            //   const item = items[i];
            // }
            _context4.next = 25;
            break;

          case 22:
            _context4.prev = 22;
            _context4.t0 = _context4['catch'](0);

            console.error(_context4.t0);

          case 25:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 22]]);
  }));

  return function parse2JSON() {
    return _ref3.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('./util');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

parse2JSON();