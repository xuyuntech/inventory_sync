'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable camelcase, no-await-in-loop */
// const express = require('express');
var upload = (0, _multer2.default)({ dest: 'uploads/' });

var log = console;

// var YZClient = new YZClient(new Sign('0e6164502b72aa7d26', 'bb2bb44a29b5a14c0378f60234d14877'));
var app = (0, _express2.default)();

app.use(_bodyParser2.default.json()); // for parsing application/json
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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

            log.log('total', items.length);
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
                          log.log('sku.item.skus', sku.item.skus.length, i += 1);
                          sku.item.skus.forEach(function (a) {
                            if (!a.ittem_no) {
                              var gg = JSON.parse(a.properties_name_json);
                              log.log('gg', gg);
                              if (Array.isArray(gg) && gg.length === 1) {
                                ggArr.push(gg[0].v);
                              } else {
                                log.log('gg length not 1', gg);
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
            log.log('output ===>>>>>');
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

            log.log('>>', req.query, req.params);
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

                        log.error('update item failed', item_id, item_no);

                      case 11:
                        _context5.next = 15;
                        break;

                      case 13:
                        log.error('skus is null', item_id);
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
            log.log('req.query.outer_id', req.query.outer_id);
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
app.get('/inventoryGet', function (req, res) {
  (0, _util.yzInvoke)('youzan.items.inventory.get', {
    page_size: 100,
    page_no: 1
  }).then(function (data) {
    res.send(data);
  }, function (err) {
    res.send(err);
  });
});

app.get('/', function (req, res) {
  var params = {
    page_size: 100,
    page_no: 1
  };
  (0, _util.yzInvoke)('youzan.multistore.offline.search', params).then(function (data) {
    res.send(data.list);
  }, function (err) {
    res.send(err);
  });
});

app.get('/sync', function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(req, res) {
    var page_size, data;
    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            page_size = 100;
            _context9.prev = 1;
            _context9.next = 4;
            return (0, _util.yzInvoke)('youzan.items.inventory.get', {
              page_no: 1,
              page_size: page_size
            });

          case 4:
            data = _context9.sent;

            res.send(data);
            _context9.next = 11;
            break;

          case 8:
            _context9.prev = 8;
            _context9.t0 = _context9['catch'](1);

            res.send(_context9.t0);

          case 11:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[1, 8]]);
  }));

  return function (_x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}());

app.get('/exportShops', function () {
  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(req, res) {
    var shopList;
    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _context10.next = 3;
            return (0, _util.getShopList)();

          case 3:
            shopList = _context10.sent;

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
            _context10.next = 10;
            break;

          case 7:
            _context10.prev = 7;
            _context10.t0 = _context10['catch'](0);

            res.json({
              status: 1,
              err: _context10.t0
            });

          case 10:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined, [[0, 7]]);
  }));

  return function (_x16, _x17) {
    return _ref10.apply(this, arguments);
  };
}());

app.post('/update', function () {
  var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(req, res) {
    var _req$body, shopInfo, skus, to, price, count, itemCode, shopCode, itemID, skus_with_json;

    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _req$body = req.body, shopInfo = _req$body.shopInfo, skus = _req$body.skus, to = _req$body.to;

            if (skus[0]) {
              _context11.next = 5;
              break;
            }

            res.json({
              status: 1,
              err: 'skus length 0'
            });
            return _context11.abrupt('return');

          case 5:
            price = to.price, count = to.count, itemCode = to.itemCode;
            shopCode = shopInfo.id;
            itemID = 0;
            skus_with_json = [];

            skus.forEach(function (sku) {
              var sku_json = {};
              var num_iid = sku.num_iid,
                  sku_id = sku.sku_id,
                  _sku$properties_name_ = sku.properties_name_json,
                  properties_name_json = _sku$properties_name_ === undefined ? '{}' : _sku$properties_name_;

              var properties = JSON.parse(properties_name_json);
              itemID = num_iid;
              if (properties[0]) {
                var _properties$ = properties[0],
                    k = _properties$.k,
                    v = _properties$.v;

                sku_json.sku_property = (0, _defineProperty3.default)({}, k, v);
                sku_json.sku_price = price;
                sku_json.sku_quantity = count;
                sku_json.sku_outer_id = itemCode;
                sku_json.sku_id = sku_id;
              }
              skus_with_json.push(sku_json);
            });

            _context11.next = 12;
            return (0, _util.syncItem)({
              num_iid: itemID,
              offline_id: shopCode,
              skus_with_json: (0, _stringify2.default)(skus_with_json)
            });

          case 12:
            if (!_context11.sent) {
              _context11.next = 16;
              break;
            }

            res.json({
              status: 0
            });
            _context11.next = 17;
            break;

          case 16:
            res.json({
              status: 1
            });

          case 17:
            _context11.next = 22;
            break;

          case 19:
            _context11.prev = 19;
            _context11.t0 = _context11['catch'](0);

            res.json({
              status: 1,
              err: _context11.t0
            });

          case 22:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined, [[0, 19]]);
  }));

  return function (_x18, _x19) {
    return _ref11.apply(this, arguments);
  };
}());

app.post('/upload', upload.single('file'), function () {
  var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(req, res) {
    var file, page_size, warnings, output;
    return _regenerator2.default.wrap(function _callee14$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            file = req.file;
            page_size = 100;
            warnings = [];
            output = [];
            _context15.prev = 4;
            return _context15.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
              var shopHash, hashData, inventoryItems, l, _loop, i, _ret2;

              return _regenerator2.default.wrap(function _callee13$(_context14) {
                while (1) {
                  switch (_context14.prev = _context14.next) {
                    case 0:
                      _context14.next = 2;
                      return (0, _util.getShopList)();

                    case 2:
                      shopHash = _context14.sent;

                      log.log('shops', (0, _keys2.default)(shopHash));
                      // 解析 excel 库存信息，返回 map[商品编码]商品
                      _context14.next = 6;
                      return (0, _util.parseExcel)(file);

                    case 6:
                      hashData = _context14.sent;
                      _context14.next = 9;
                      return (0, _util.yzInvoke)('youzan.items.inventory.get', {
                        page_no: 1,
                        page_size: page_size
                      }, 'GET', false);

                    case 9:
                      inventoryItems = _context14.sent;
                      l = inventoryItems.items.length;
                      _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(i) {
                        var item, excelItems, itemChangeLine, changeArr;
                        return _regenerator2.default.wrap(function _loop$(_context13) {
                          while (1) {
                            switch (_context13.prev = _context13.next) {
                              case 0:
                                // item 是库存中的单个商品
                                item = inventoryItems.items[i];
                                // excelItem 是 [{itemCode,shopCode,count,price}]

                                excelItems = hashData[item.item_no];

                                if (!excelItems) {
                                  log.log('excelItem', excelItems, item.item_no, item.title);
                                }

                                if (excelItems) {
                                  _context13.next = 6;
                                  break;
                                }

                                warnings.push({
                                  item: item,
                                  msg: 'excel \u91CC\u6CA1\u627E\u5230\u5546\u54C1\u7F16\u7801 ' + item.item_no
                                });
                                return _context13.abrupt('return', 'continue');

                              case 6:
                                itemChangeLine = {
                                  itemInfo: {
                                    item_id: item.item_id,
                                    item_no: item.item_no,
                                    title: item.title
                                  }
                                };
                                changeArr = [];
                                _context13.next = 10;
                                return _promise2.default.all(excelItems.map(function () {
                                  var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(excelItem) {
                                    var shopInYouzan, itemInShop, _itemInShop$item$skus, skus;

                                    return _regenerator2.default.wrap(function _callee12$(_context12) {
                                      while (1) {
                                        switch (_context12.prev = _context12.next) {
                                          case 0:
                                            shopInYouzan = shopHash[(excelItem.shopName || '').trim()];
                                            // log.log('shopInYouzan', shopInYouzan);

                                            if (!(excelItem && shopInYouzan)) {
                                              _context12.next = 9;
                                              break;
                                            }

                                            _context12.next = 4;
                                            return (0, _util.yzInvoke)('youzan.multistore.goods.sku.get', {
                                              num_iid: item.item_id, // 商品 id
                                              offline_id: shopInYouzan.id // 网点 id
                                            });

                                          case 4:
                                            itemInShop = _context12.sent;
                                            _itemInShop$item$skus = itemInShop.item.skus, skus = _itemInShop$item$skus === undefined ? [] : _itemInShop$item$skus; // 规格列表

                                            if (skus[0]) {
                                              if (excelItem.count != skus[0].quantity) {
                                                // eslint-disable-line
                                                changeArr.push({
                                                  shopInfo: {
                                                    id: shopInYouzan.id,
                                                    sid: shopInYouzan.sid,
                                                    name: shopInYouzan.name
                                                  },
                                                  skus: skus,
                                                  to: (0, _extends3.default)({}, excelItem)
                                                });
                                              }
                                            }
                                            _context12.next = 10;
                                            break;

                                          case 9:
                                            warnings.push({
                                              excelItem: excelItem,
                                              item: item,
                                              msg: 'item not found in excel'
                                            });

                                          case 10:
                                          case 'end':
                                            return _context12.stop();
                                        }
                                      }
                                    }, _callee12, undefined);
                                  }));

                                  return function (_x22) {
                                    return _ref13.apply(this, arguments);
                                  };
                                }()));

                              case 10:
                                output.push((0, _extends3.default)({}, itemChangeLine, {
                                  changeArr: changeArr
                                }));

                              case 11:
                              case 'end':
                                return _context13.stop();
                            }
                          }
                        }, _loop, undefined);
                      });
                      i = 0;

                    case 13:
                      if (!(i < l)) {
                        _context14.next = 21;
                        break;
                      }

                      return _context14.delegateYield(_loop(i), 't0', 15);

                    case 15:
                      _ret2 = _context14.t0;

                      if (!(_ret2 === 'continue')) {
                        _context14.next = 18;
                        break;
                      }

                      return _context14.abrupt('continue', 18);

                    case 18:
                      i += 1;
                      _context14.next = 13;
                      break;

                    case 21:
                      res.json({
                        status: 0,
                        data: output,
                        warnings: warnings
                      });

                    case 22:
                    case 'end':
                      return _context14.stop();
                  }
                }
              }, _callee13, undefined);
            })(), 't0', 6);

          case 6:
            _context15.next = 12;
            break;

          case 8:
            _context15.prev = 8;
            _context15.t1 = _context15['catch'](4);

            console.error('error', _context15.t1);
            res.send(_context15.t1);

          case 12:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee14, undefined, [[4, 8]]);
  }));

  return function (_x20, _x21) {
    return _ref12.apply(this, arguments);
  };
}());

var server = app.listen(3001, function () {
  var address = server.address();
  log.log('InventorySycn listening at http://%s:%s', address.address, address.port);
});