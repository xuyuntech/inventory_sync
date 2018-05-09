'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var doUpdateItem = function () {
  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref11) {
    var shopInfo = _ref11.shopInfo,
        skus = _ref11.skus,
        to = _ref11.to;
    var price, count, itemCode, shopCode, itemID, skus_with_json;
    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;

            if (skus[0]) {
              _context10.next = 3;
              break;
            }

            throw new Error('skus length 0');

          case 3:
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

            _context10.next = 10;
            return (0, _util.syncItem)({
              num_iid: itemID,
              offline_id: shopCode,
              skus_with_json: (0, _stringify2.default)(skus_with_json)
            });

          case 10:
            if (!_context10.sent) {
              _context10.next = 12;
              break;
            }

            return _context10.abrupt('return', true);

          case 12:
            _context10.next = 17;
            break;

          case 14:
            _context10.prev = 14;
            _context10.t0 = _context10['catch'](0);
            throw _context10.t0;

          case 17:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this, [[0, 14]]);
  }));

  return function doUpdateItem(_x16) {
    return _ref10.apply(this, arguments);
  };
}();

var doSyncAll = function () {
  var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var pData, i, success_num, total, errors;
    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            pData = [];

            data.forEach(function (item) {
              item.changeArr.forEach(function (change) {
                if (!change.err) {
                  pData.push(change);
                }
              });
            });
            i = 0;
            success_num = 0;
            total = pData.length;
            errors = [];

            while (i < total) {
              try {
                (function () {
                  // await doUpdateItem(pData[i]);

                  var item = pData[i];
                  var num_iid = item.num_iid,
                      offline_id = item.offline_id,
                      skus = item.skus,
                      title = item.title,
                      shopName = item.shopName,
                      outer_id = item.outer_id;

                  var skus_with_json = [];
                  log.debug(i + ': \u540C\u6B65\u5355\u54C1 [' + title + ']');
                  log.debug('\t\u95E8\u5E97: ' + shopName);
                  skus.forEach(function (sku) {
                    var sku_id = sku.sku_id,
                        properties_name_json = sku.properties_name_json;

                    var pnj = JSON.parse(properties_name_json || '[]')[0];
                    var uData = (0, _extends3.default)({}, item.to);
                    if (pnj) {
                      var reg = pnj.v.match(/(\d{1,})[盒装|盒套餐]/);
                      if (reg && reg[1]) {
                        var num = reg[1];
                        uData.count = Math.floor(item.to.count / num);
                        uData.price = item.to.price * num;
                      }
                      log.debug('\t\u89C4\u683C: ' + sku.properties_name_json);
                      log.debug('\t\t\u5E93\u5B58\u53D8\u66F4: ' + sku.quantity + ' -> ' + uData.count);
                      log.debug('\t\t\u4EF7\u683C\u53D8\u66F4: ' + sku.price + ' -> ' + uData.price);
                      skus_with_json.push({
                        sku_property: (0, _defineProperty3.default)({}, pnj.k, pnj.v),
                        sku_price: uData.price,
                        sku_quantity: uData.count,
                        sku_outer_id: outer_id,
                        sku_id: sku_id
                      });
                    }
                  });
                  var update_json = {
                    num_iid: num_iid,
                    offline_id: offline_id,
                    skus_with_json: skus_with_json
                  };
                  log.debug('\tupdate json:\n', (0, _stringify2.default)(update_json, null, '\t'));
                  log.debug('=====================');
                  success_num += 1;
                })();
              } catch (err) {
                log.error('doUpdateItem ' + i + ' error: ' + err);
                errors.push({
                  idx: i,
                  item: pData[i],
                  err: err
                });
              }
              i += 1;
            }
            return _context11.abrupt('return', {
              data: {
                synced: pData,
                total: total,
                success_num: success_num,
                failed_num: total - success_num
              },
              err: errors
            });

          case 8:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function doSyncAll() {
    return _ref12.apply(this, arguments);
  };
}();

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

app.get('/exportShops', function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(req, res) {
    var shopList;
    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return (0, _util.getShopList)();

          case 3:
            shopList = _context9.sent;

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
            _context9.next = 10;
            break;

          case 7:
            _context9.prev = 7;
            _context9.t0 = _context9['catch'](0);

            res.json({
              status: 1,
              err: _context9.t0
            });

          case 10:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[0, 7]]);
  }));

  return function (_x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}());

app.post('/syncAll', function () {
  var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(req, res) {
    var data;
    return _regenerator2.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (Array.isArray(req.body)) {
              _context12.next = 3;
              break;
            }

            res.json({
              status: 1,
              err: 'params invalid, need array'
            });
            return _context12.abrupt('return');

          case 3:
            _context12.next = 5;
            return doSyncAll(req.body);

          case 5:
            data = _context12.sent;

            res.json((0, _extends3.default)({
              status: 0
            }, data));

          case 7:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, undefined);
  }));

  return function (_x18, _x19) {
    return _ref13.apply(this, arguments);
  };
}());

app.post('/syncOne', function () {
  var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(req, res) {
    return _regenerator2.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            _context13.next = 3;
            return doUpdateItem(req.body);

          case 3:
            res.json({
              status: 0
            });
            _context13.next = 9;
            break;

          case 6:
            _context13.prev = 6;
            _context13.t0 = _context13['catch'](0);

            res.json({
              status: 1,
              err: _context13.t0
            });

          case 9:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined, [[0, 6]]);
  }));

  return function (_x20, _x21) {
    return _ref14.apply(this, arguments);
  };
}());

app.post('/upload', upload.single('file'), function () {
  var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(req, res) {
    var file, output;
    return _regenerator2.default.wrap(function _callee16$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            file = req.file;
            output = [];
            _context17.prev = 2;
            return _context17.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
              var shopHash, hashData, items, l, _loop, i, _ret3, syncRes;

              return _regenerator2.default.wrap(function _callee15$(_context16) {
                while (1) {
                  switch (_context16.prev = _context16.next) {
                    case 0:
                      _context16.next = 2;
                      return (0, _util.getShopList)();

                    case 2:
                      shopHash = _context16.sent;

                      log.log('shops', (0, _keys2.default)(shopHash));
                      // 解析 excel 库存信息，返回 map[商品编码]商品
                      _context16.next = 6;
                      return (0, _util.parseExcel)(file);

                    case 6:
                      hashData = _context16.sent;
                      _context16.next = 9;
                      return (0, _util.getItems)();

                    case 9:
                      items = _context16.sent;

                      log.log('\u83B7\u53D6\u5546\u54C1 ' + items.length + ' \u4E2A.');
                      l = items.length;
                      _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(i) {
                        var item, excelItems, itemChangeLine, changeArr;
                        return _regenerator2.default.wrap(function _loop$(_context15) {
                          while (1) {
                            switch (_context15.prev = _context15.next) {
                              case 0:
                                log.log('\u5904\u7406 ' + i + ' \u4E2A');
                                // item 是库存中的单个商品
                                item = items[i];
                                // excelItem 是 [{itemCode,shopCode,count,price}]

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
                                  _context15.next = 8;
                                  break;
                                }

                                changeArr.push({
                                  // item,
                                  err: 'excel \u91CC\u6CA1\u627E\u5230\u5546\u54C1\u7F16\u7801 ' + item.item_no
                                });
                                return _context15.abrupt('return', 'continue');

                              case 8:
                                _context15.next = 10;
                                return _promise2.default.all(excelItems.map(function () {
                                  var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                                    var excelItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                                    var shopInYouzan, itemInShop, _itemInShop$item, _itemInShop$item$skus, skus, title, outer_id;

                                    return _regenerator2.default.wrap(function _callee14$(_context14) {
                                      while (1) {
                                        switch (_context14.prev = _context14.next) {
                                          case 0:
                                            shopInYouzan = shopHash[(excelItem.shopName || '').trim()];
                                            // log.log('shopInYouzan', shopInYouzan);

                                            if (!shopInYouzan) {
                                              _context14.next = 9;
                                              break;
                                            }

                                            _context14.next = 4;
                                            return (0, _util.yzInvoke)('youzan.multistore.goods.sku.get', {
                                              num_iid: item.item_id, // 商品 id
                                              offline_id: shopInYouzan.id // 网点 id
                                            });

                                          case 4:
                                            itemInShop = _context14.sent;
                                            _itemInShop$item = itemInShop.item, _itemInShop$item$skus = _itemInShop$item.skus, skus = _itemInShop$item$skus === undefined ? [] : _itemInShop$item$skus, title = _itemInShop$item.title, outer_id = _itemInShop$item.outer_id; // 规格列表

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
                                    }, _callee14, undefined);
                                  }));

                                  return function () {
                                    return _ref16.apply(this, arguments);
                                  };
                                }()));

                              case 10:
                                output.push((0, _extends3.default)({}, itemChangeLine, {
                                  changeArr: changeArr
                                }));

                              case 11:
                              case 'end':
                                return _context15.stop();
                            }
                          }
                        }, _loop, undefined);
                      });
                      i = 0;

                    case 14:
                      if (!(i < l)) {
                        _context16.next = 22;
                        break;
                      }

                      return _context16.delegateYield(_loop(i), 't0', 16);

                    case 16:
                      _ret3 = _context16.t0;

                      if (!(_ret3 === 'continue')) {
                        _context16.next = 19;
                        break;
                      }

                      return _context16.abrupt('continue', 19);

                    case 19:
                      i += 1;
                      _context16.next = 14;
                      break;

                    case 22:
                      _context16.next = 24;
                      return doSyncAll(output);

                    case 24:
                      syncRes = _context16.sent;

                      res.json((0, _extends3.default)({
                        status: 0
                      }, syncRes));

                    case 26:
                    case 'end':
                      return _context16.stop();
                  }
                }
              }, _callee15, undefined);
            })(), 't0', 4);

          case 4:
            _context17.next = 9;
            break;

          case 6:
            _context17.prev = 6;
            _context17.t1 = _context17['catch'](2);

            res.send({
              status: 1,
              err: _context17.t1
            });

          case 9:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee16, undefined, [[2, 6]]);
  }));

  return function (_x22, _x23) {
    return _ref15.apply(this, arguments);
  };
}());

var server = app.listen(3001, function () {
  var address = server.address();
  log.log('InventorySycn listening at http://%s:%s', address.address, address.port);
});