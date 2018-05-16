'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var dealWithOneItem = function () {
  var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(shopHash, hashData, items, key) {
    var _this = this;

    var output, item, excelItems, itemChangeLine, changeArr;
    return _regenerator2.default.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            output = [];
            _context15.prev = 1;
            item = items[key];

            if (item) {
              _context15.next = 5;
              break;
            }

            return _context15.abrupt('return', output);

          case 5:
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
              _context15.next = 15;
              break;
            }

            changeArr.push({
              // item,
              err: 'excel \u91CC\u6CA1\u627E\u5230\u5546\u54C1\u7F16\u7801 ' + item.item_no
            });
            // continue; // eslint-disable-line
            _context15.t0 = output;
            _context15.next = 13;
            return dealWithOneItem(shopHash, hashData, items, key + 1);

          case 13:
            _context15.t1 = _context15.sent;
            return _context15.abrupt('return', _context15.t0.concat.call(_context15.t0, _context15.t1));

          case 15:
            console.log('线下库存商品编号: ', item.item_no, excelItems.length);
            // 遍历一个 sku 每家门店，获取 youzan 里对应的门店与SKU的商品信息
            // for (let i = 0; i < excelItems.length; i += 1) {
            //   const excelItem = excelItems[i];

            // }
            _context15.next = 18;
            return _promise2.default.all(excelItems.map(function () {
              var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                var excelItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var shopInYouzan, itemInShop, _itemInShop$item, _itemInShop$item$skus, skus, title, outer_id;

                return _regenerator2.default.wrap(function _callee14$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        shopInYouzan = shopHash[(excelItem.shopName || '').trim()];

                        if (!shopInYouzan) {
                          _context14.next = 9;
                          break;
                        }

                        _context14.next = 4;
                        return (0, _util.getYouzanShopSKU)({
                          num_iid: item.item_id, // 商品 id
                          offline_id: shopInYouzan.id // 网点 id
                        });

                      case 4:
                        itemInShop = _context14.sent;
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
                        _context14.next = 10;
                        break;

                      case 9:
                        changeArr.push({
                          // excelItem,
                          // item,
                          err: '\u95E8\u5E97 ' + excelItem.shopName + ' \u6CA1\u627E\u5230'
                        });

                      case 10:
                      case 'end':
                        return _context14.stop();
                    }
                  }
                }, _callee14, _this);
              }));

              return function () {
                return _ref15.apply(this, arguments);
              };
            }()));

          case 18:
            console.log('商品 %s 处理完毕 -----------', item.item_no);
            output.push((0, _extends3.default)({}, itemChangeLine, {
              changeArr: changeArr
            }));
            _context15.t2 = output;
            _context15.next = 23;
            return dealWithOneItem(shopHash, hashData, items, key + 1);

          case 23:
            _context15.t3 = _context15.sent;
            return _context15.abrupt('return', _context15.t2.concat.call(_context15.t2, _context15.t3));

          case 27:
            _context15.prev = 27;
            _context15.t4 = _context15['catch'](1);

            console.log('dealWithOneItem error: ', _context15.t4);
            return _context15.abrupt('return', output);

          case 31:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this, [[1, 27]]);
  }));

  return function dealWithOneItem(_x22, _x23, _x24, _x25) {
    return _ref14.apply(this, arguments);
  };
}();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('./util');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _shops = require('../src/shops.json');

var _shops2 = _interopRequireDefault(_shops);

var _output = require('./output.json');

var _output2 = _interopRequireDefault(_output);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable camelcase, no-await-in-loop */
// const express = require('express');
var upload = (0, _multer2.default)({ dest: 'uploads/' });

// const log = console;

// var YZClient = new YZClient(new Sign('0e6164502b72aa7d26', 'bb2bb44a29b5a14c0378f60234d14877'));
var app = (0, _express2.default)();

app.use(_bodyParser2.default.json()); // for parsing application/json
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token');
  next();
});

app.get('/getOnsale', function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
    var data, items, ggArr, i;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return (0, _util.yzInvoke)('youzan.items.onsale.get', {
              page_no: 2,
              page_size: 300
            }, 'GET', false);

          case 3:
            data = _context2.sent;
            items = data.items;
            ggArr = [];

            if (!Array.isArray(items)) {
              _context2.next = 11;
              break;
            }

            i = 0;

            _logger2.default.log('total', items.length);
            _context2.next = 11;
            return _promise2.default.all(items.map(function () {
              var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(item) {
                var sku;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return (0, _util.yzInvoke)('youzan.item.get', { item_id: item.item_id }, 'GET', false);

                      case 2:
                        sku = _context.sent;

                        if (sku.item && Array.isArray(sku.item.skus)) {
                          _logger2.default.log('sku.item.skus', sku.item.skus.length, i += 1);
                          sku.item.skus.forEach(function (a) {
                            if (!a.ittem_no) {
                              var gg = JSON.parse(a.properties_name_json);
                              _logger2.default.log('gg', gg);
                              if (Array.isArray(gg) && gg.length === 1) {
                                ggArr.push(gg[0].v);
                              } else {
                                _logger2.default.log('gg length not 1', gg);
                              }
                            }
                          });
                        }

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 11:
            _logger2.default.log('output ===>>>>>');
            res.send(ggArr);
            _context2.next = 18;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2['catch'](0);

            res.send(_context2.t0);

          case 18:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 15]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

app.get('/itemUpdate', function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {
    var item_no, toQuantity, data, skuDetail;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            item_no = req.query.item_no;

            _logger2.default.log('>>', req.query, req.params);
            toQuantity = 36;
            _context4.prev = 3;
            _context4.next = 6;
            return (0, _util.yzInvoke)('youzan.skus.custom.get', {
              item_no: item_no
            });

          case 6:
            data = _context4.sent;

            if (!(data.skus.length >= 1)) {
              _context4.next = 14;
              break;
            }

            _context4.next = 10;
            return (0, _util.yzInvoke)('youzan.item.get', {
              item_id: data.skus[0].item_id
            });

          case 10:
            skuDetail = _context4.sent;

            skuDetail.item.skus.forEach(function () {
              var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(sku) {
                var b, item_id, sku_id, regx, updateData;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        b = 1;
                        item_id = sku.item_id, sku_id = sku.sku_id;

                        if (sku.item_no !== item_no) {
                          regx = sku.item_no.match(sku.item_no + 'x(\\d)');

                          if (regx && regx[1]) {
                            b = parseInt(regx[1], 10);
                          }
                        }
                        _context3.next = 5;
                        return (0, _util.yzInvoke)('youzan.item.sku.update', {
                          item_id: item_id,
                          sku_id: sku_id,
                          quantity: Math.floor(toQuantity / b)
                        });

                      case 5:
                        updateData = _context3.sent;

                        if (!(updateData.is_success !== true)) {
                          _context3.next = 8;
                          break;
                        }

                        throw new Error({
                          type: 'youzan.item.sku.update',
                          sku: sku
                        });

                      case 8:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, undefined);
              }));

              return function (_x6) {
                return _ref4.apply(this, arguments);
              };
            }());
            res.send('ok');
            return _context4.abrupt('return');

          case 14:
            throw new Error('not found');

          case 17:
            _context4.prev = 17;
            _context4.t0 = _context4['catch'](3);

            res.send(_context4.t0);

          case 20:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[3, 17]]);
  }));

  return function (_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}());

app.get('/itemNoSync', function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(req, res) {
    var items, iItems, warnings;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return (0, _util.getItems)();

          case 3:
            items = _context6.sent;
            iItems = items.filter(function (item) {
              return item.item_no === '';
            });
            warnings = [];
            _context6.next = 8;
            return _promise2.default.all(iItems.map(function () {
              var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(item) {
                var item_id, title, itemDetail, skus, item_no;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        item_id = item.item_id, title = item.title;
                        _context5.next = 3;
                        return (0, _util.getItemByID)(item_id);

                      case 3:
                        itemDetail = _context5.sent;
                        skus = itemDetail.skus;

                        if (!(skus[0] && skus[0].item_no)) {
                          _context5.next = 13;
                          break;
                        }

                        item_no = skus[0].item_no;
                        _context5.next = 9;
                        return (0, _util.updateItem)({
                          item_id: item_id,
                          item_no: item_no
                        });

                      case 9:
                        if (_context5.sent) {
                          _context5.next = 11;
                          break;
                        }

                        _logger2.default.error('update item failed', item_id, item_no);

                      case 11:
                        _context5.next = 15;
                        break;

                      case 13:
                        _logger2.default.error('skus is null', item_id);
                        warnings.push(title);

                      case 15:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, undefined);
              }));

              return function (_x9) {
                return _ref6.apply(this, arguments);
              };
            }()));

          case 8:
            res.json({
              status: 0,
              count: iItems.length,
              warnings: warnings
            });
            _context6.next = 14;
            break;

          case 11:
            _context6.prev = 11;
            _context6.t0 = _context6['catch'](0);

            res.json({
              status: 1,
              err: _context6.t0
            });

          case 14:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[0, 11]]);
  }));

  return function (_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}());

app.get('/itemGet', function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(req, res) {
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.t0 = res;
            _context7.next = 4;
            return (0, _util.yzInvoke)('youzan.item.get', {
              item_id: req.query.item_id
            });

          case 4:
            _context7.t1 = _context7.sent;

            _context7.t0.json.call(_context7.t0, _context7.t1);

            _context7.next = 11;
            break;

          case 8:
            _context7.prev = 8;
            _context7.t2 = _context7['catch'](0);

            res.json({
              status: 1,
              err: _context7.t2
            });

          case 11:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[0, 8]]);
  }));

  return function (_x10, _x11) {
    return _ref7.apply(this, arguments);
  };
}());

// 根据外部编号获取商品信息
app.get('/customGet', function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(req, res) {
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _logger2.default.log('req.query.outer_id', req.query.outer_id);
            _context8.prev = 1;
            _context8.t0 = res;
            _context8.next = 5;
            return (0, _util.yzInvoke)('youzan.skus.custom.get', {
              item_no: req.query.outer_id
            });

          case 5:
            _context8.t1 = _context8.sent;

            _context8.t0.json.call(_context8.t0, _context8.t1);

            _context8.next = 12;
            break;

          case 9:
            _context8.prev = 9;
            _context8.t2 = _context8['catch'](1);

            res.json({
              status: 1,
              err: _context8.t2
            });

          case 12:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[1, 9]]);
  }));

  return function (_x12, _x13) {
    return _ref8.apply(this, arguments);
  };
}());

app.get('/uploadShops', function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(req, res) {
    var shopsHash, results;
    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            shopsHash = _shops2.default.data;
            results = {};
            _context10.next = 5;
            return _promise2.default.all((0, _keys2.default)(shopsHash).map(function () {
              var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(key) {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        shopsHash[key].image = shopsHash[key].image[0]; // eslint-disable-line
                        shopsHash[key].business_hours_advanced = (0, _stringify2.default)(shopsHash[key].business_hours_advanced); // eslint-disable-line
                        _context9.next = 4;
                        return (0, _util.createShop)(_lodash2.default.pick(shopsHash[key], 'address', 'area', 'business_hours_advanced', 'city', 'county_id', 'description', 'image', 'is_optional_self_fetch_time', 'is_self_fetch', 'is_store', 'lat', 'lng', 'name', 'offline_business_hours', 'phone1', 'phone2', 'province', 'support_local_delivery'));

                      case 4:
                        results[key] = _context9.sent;

                      case 5:
                      case 'end':
                        return _context9.stop();
                    }
                  }
                }, _callee9, undefined);
              }));

              return function (_x16) {
                return _ref10.apply(this, arguments);
              };
            }()));

          case 5:
            res.json(results);
            _context10.next = 11;
            break;

          case 8:
            _context10.prev = 8;
            _context10.t0 = _context10['catch'](0);

            res.json({
              status: 1,
              err: _context10.t0
            });

          case 11:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined, [[0, 8]]);
  }));

  return function (_x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}());

app.get('/exportShops', function () {
  var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(req, res) {
    var shopList;
    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _context11.next = 3;
            return (0, _util.getShopList)();

          case 3:
            shopList = _context11.sent;

            // var workbook = new Excel.Workbook();
            // var worksheet = workbook.addWorksheet('My Sheet');
            // worksheet.columns = [
            //   { header: 'Id', key: 'id', width: 10 },
            //   { header: 'Name', key: 'name', width: 32 },
            //   { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
            // ];
            res.json({
              status: 0,
              data: shopList
            });
            _context11.next = 10;
            break;

          case 7:
            _context11.prev = 7;
            _context11.t0 = _context11['catch'](0);

            res.json({
              status: 1,
              err: _context11.t0
            });

          case 10:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined, [[0, 7]]);
  }));

  return function (_x17, _x18) {
    return _ref11.apply(this, arguments);
  };
}());

// 负责将upload 获得的信息解析为更方便展示以及 youzan sync 的数据格式
app.post('/syncAll', function () {
  var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(req, res) {
    var _req$body, item_no, _req$body$update_json, update_jsons, data, success;

    return _regenerator2.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _logger2.default.debug('syncAll body');
            _req$body = req.body, item_no = _req$body.item_no, _req$body$update_json = _req$body.update_jsons, update_jsons = _req$body$update_json === undefined ? [] : _req$body$update_json;

            if (item_no) {
              _context13.next = 5;
              break;
            }

            res.json({
              status: 1,
              err: 'need item_no'
            });
            return _context13.abrupt('return');

          case 5:
            if (!(!Array.isArray(update_jsons) || !update_jsons.length)) {
              _context13.next = 8;
              break;
            }

            res.json({
              status: 1,
              err: 'need update_jsons'
            });
            return _context13.abrupt('return');

          case 8:
            _context13.next = 10;
            return _promise2.default.all(update_jsons.map(function () {
              var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(item) {
                var num_iid, offline_id, skus_with_json;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        num_iid = item.num_iid, offline_id = item.offline_id, skus_with_json = item.skus_with_json;
                        _context12.prev = 1;
                        _context12.next = 4;
                        return (0, _util.syncItem)({
                          num_iid: num_iid,
                          offline_id: offline_id,
                          skus_with_json: (0, _stringify2.default)(skus_with_json)
                        });

                      case 4:
                        _context12.t0 = _context12.sent;
                        return _context12.abrupt('return', {
                          success: _context12.t0
                        });

                      case 8:
                        _context12.prev = 8;
                        _context12.t1 = _context12['catch'](1);
                        return _context12.abrupt('return', {
                          success: false,
                          err: _context12.t1
                        });

                      case 11:
                      case 'end':
                        return _context12.stop();
                    }
                  }
                }, _callee12, undefined, [[1, 8]]);
              }));

              return function (_x21) {
                return _ref13.apply(this, arguments);
              };
            }()));

          case 10:
            data = _context13.sent;

            _logger2.default.debug('syncAll ---------------');
            _logger2.default.debug('syncAll data', data);
            success = true;

            data.forEach(function (item) {
              if (!item.success) {
                success = false;
              }
            });
            res.json({
              item_no: item_no,
              status: success ? 0 : 1,
              data: data
            });

          case 16:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined);
  }));

  return function (_x19, _x20) {
    return _ref12.apply(this, arguments);
  };
}());

app.post('/upload', upload.single('file'), function () {
  var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(req, res) {
    return _regenerator2.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            // const outputData = JSON.stringify(outputStr);
            res.json((0, _extends3.default)({
              status: 0
            }, _output2.default));

          case 1:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, undefined);
  }));

  return function (_x27, _x28) {
    return _ref16.apply(this, arguments);
  };
}());
app.post('/upload1', upload.single('file'), function () {
  var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(req, res) {
    var file, shopHash, hashData, items, output, syncRes;
    return _regenerator2.default.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            file = req.file;
            // const output = [];

            _context17.prev = 1;
            _context17.next = 4;
            return (0, _util.getShopList)();

          case 4:
            shopHash = _context17.sent;

            _logger2.default.info('shops', (0, _keys2.default)(shopHash));
            // 解析 excel 库存信息，返回 map[商品编码]商品
            _context17.next = 8;
            return (0, _util.parseExcel)(file);

          case 8:
            hashData = _context17.sent;
            _context17.next = 11;
            return (0, _util.getItems)();

          case 11:
            items = _context17.sent;
            _context17.next = 14;
            return dealWithOneItem(shopHash, hashData, items, 0);

          case 14:
            output = _context17.sent;
            _context17.next = 17;
            return (0, _util.formatUploadData)(output);

          case 17:
            syncRes = _context17.sent;

            res.json((0, _extends3.default)({
              status: 0
            }, syncRes));
            // for (let i = 0; i < l; i += 1) {
            //   // item 是库存中的单个商品
            //   const item = items[i];
            // }
            _context17.next = 24;
            break;

          case 21:
            _context17.prev = 21;
            _context17.t0 = _context17['catch'](1);

            res.send({
              status: 1,
              err: _context17.t0
            });

          case 24:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, undefined, [[1, 21]]);
  }));

  return function (_x29, _x30) {
    return _ref17.apply(this, arguments);
  };
}());

var server = app.listen(3001, function () {
  var address = server.address();
  console.log('InventorySync listening at http://%s:%s', address.address, address.port);
});