'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var commander = require('commander');
var recast = require('recast');
var ramda = require('ramda');
var fs = require('fs');
var diff = require('diff');
var core = require('@babel/core');
var chalk = _interopDefault(require('chalk'));
var signale = _interopDefault(require('signale'));

function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

// TODO: handle empty List(), Map()
// TODO: handle space in literal string on get
var _types$builders = recast.types.builders,
  identifier = _types$builders.identifier,
  stringLiteral = _types$builders.stringLiteral,
  callExpression = _types$builders.callExpression,
  memberExpression = _types$builders.memberExpression,
  objectExpression = _types$builders.objectExpression,
  arrayExpression = _types$builders.arrayExpression,
  importDeclaration = _types$builders.importDeclaration,
  importSpecifier = _types$builders.importSpecifier;
var functionsToImport = /*#__PURE__*/new Set();
var transformers = {
  visitCallExpression: function visitCallExpression(path) {
    var _path$value$callee$pr, _calleeNode$object, _calleeNode$object2, _path$value, _path$value$callee;
    var functionCallName = (_path$value$callee$pr = path.value.callee.property) == null ? void 0 : _path$value$callee$pr.name;
    var calleeNode = path.node.callee;
    var avoidThisExpr =
    //@ts-ignore
    !['R', 'this'].includes(calleeNode == null ? void 0 : (_calleeNode$object = calleeNode.object) == null ? void 0 : _calleeNode$object.name) && (calleeNode == null ? void 0 : (_calleeNode$object2 = calleeNode.object) == null ? void 0 : _calleeNode$object2.type) !== 'ThisExpression';
    var isSupported = Object.keys(transformersMap).includes(functionCallName);
    if (isSupported && avoidThisExpr) {
      var _transformersMap$func = transformersMap[functionCallName],
        ramdaFn = _transformersMap$func.ramdaFn,
        transformation = _transformersMap$func.transformation;
      transformation({
        path: path,
        callee: calleeNode.object,
        args: path.node.arguments
      });
      functionsToImport.add(ramdaFn);
    }
    if (['fromJS', 'toJS', 'fromArray', 'List', 'Map'].includes((_path$value = path.value) == null ? void 0 : (_path$value$callee = _path$value.callee) == null ? void 0 : _path$value$callee.name)) {
      var _path$value2;
      unwrapCaller({
        path: path,
        callee: (_path$value2 = path.value) == null ? void 0 : _path$value2.callee,
        args: path.node.arguments
      });
    }
    this.traverse(path);
  }
};
var importTransformer = {
  visitImportDeclaration: function visitImportDeclaration(path) {
    addImport(path);
    this.traverse(path);
  }
};
var getterSetter = function getterSetter(newFn, isGetter) {
  if (isGetter === void 0) {
    isGetter = true;
  }
  return function (_ref) {
    var path = _ref.path,
      callee = _ref.callee,
      args = _ref.args;
    var propName = args[0];
    if (callee.type === 'ThisExpression') return;
    var hasDefaultValue = args.length > 1 && isGetter;
    var functionName = identifier("" + newFn + (hasDefaultValue ? 'Or' : ''));
    var newArgs = hasDefaultValue ? args.reverse() : args;
    var expr = isGetter && propName.type === 'StringLiteral' ? memberExpression(callee, identifier(propName.value)) : callExpression(functionName, [].concat(newArgs, [callee]));
    path.replace(expr);
  };
};
var getIn = function getIn(_ref2) {
  var path = _ref2.path,
    args = _ref2.args,
    callee = _ref2.callee;
  var propsArray = args[0],
    defValue = args.slice(1);
  var allLiteral = function allLiteral(x) {
    return x.every(ramda.propEq('type', 'StringLiteral'));
  };
  if (!ramda.isEmpty(defValue)) {
    var _expr = callExpression(identifier('pathOr'), [defValue[0], propsArray, callee]);
    path.replace(_expr);
    return;
  }
  var elements = propsArray.elements;
  var expr = propsArray.type === 'ArrayExpression' && allLiteral(elements) ? ramda.pluck('value', elements).map(identifier).reduce(function (acc, curr) {
    return memberExpression.from({
      object: acc,
      property: curr,
      optional: true
    });
  }, callee) : callExpression(identifier('path'), [propsArray, callee]);
  path.replace(expr);
};
var callerToArg = function callerToArg(newFn) {
  return function (_ref3) {
    var path = _ref3.path,
      callee = _ref3.callee;
    path.replace(callExpression(identifier(newFn), [callee]));
  };
};
var callerAsLastArg = function callerAsLastArg(newFn) {
  return function (_ref4) {
    var path = _ref4.path,
      callee = _ref4.callee,
      args = _ref4.args;
    path.replace(callExpression(identifier(newFn), [].concat(args, [callee])));
  };
};
var callerAsFirstArg = function callerAsFirstArg(newFn) {
  return function (_ref5) {
    var path = _ref5.path,
      callee = _ref5.callee,
      args = _ref5.args;
    path.replace(callExpression(identifier(newFn), [callee].concat(args)));
  };
};
var unwrapCaller = function unwrapCaller(_ref6) {
  var path = _ref6.path,
    callee = _ref6.callee,
    args = _ref6.args;
  var expr = ramda.isEmpty(args) ?
  //@ts-ignore
  {
    Map: objectExpression([]),
    List: arrayExpression([])
  }[callee.name] : args[0];
  path.replace(expr);
};
var nameAndTransform = function nameAndTransform(ts, immutableRamdamap) {
  return ramda.fromPairs(Object.entries(immutableRamdamap).map(function (_ref7) {
    var immutableFn = _ref7[0],
      ramdaFn = _ref7[1];
    return [immutableFn, {
      ramdaFn: ramdaFn,
      transformation: ts(ramdaFn)
    }];
  }));
};
var transformersMap = /*#__PURE__*/_extends({}, /*#__PURE__*/nameAndTransform(callerAsLastArg, {
  Map: 'fromPairs',
  filterNot: 'reject',
  zip: 'zip',
  updateIn: 'modifyPath',
  groupBy: 'groupBy',
  update: 'modify',
  findLast: 'findLast',
  "delete": 'dissoc',
  deleteIn: 'dissocPath',
  valueSeq: 'values'
}), /*#__PURE__*/nameAndTransform(callerToArg, {
  keySeq: 'keys',
  flatten: 'flatten',
  isEmpty: 'isEmpty',
  flip: 'invertObj'
}), /*#__PURE__*/nameAndTransform(callerAsFirstArg, {
  merge: 'mergeRight'
}), {
  getIn: {
    ramdaFn: 'pathOr',
    transformation: getIn
  },
  get: {
    ramdaFn: 'prop',
    transformation: /*#__PURE__*/getterSetter('prop')
  },
  set: {
    ramdaFn: 'assoc',
    transformation: /*#__PURE__*/getterSetter('assoc', false)
  },
  setIn: {
    ramdaFn: 'assocPath',
    transformation: /*#__PURE__*/getterSetter('assocPath', false)
  },
  sortBy: {
    ramdaFn: 'sort',
    transformation: function transformation(_ref8) {
      var path = _ref8.path,
        callee = _ref8.callee,
        args = _ref8.args;
      path.replace(callExpression(identifier("sort"), [callExpression(identifier('ascend'), args), callee]));
      functionsToImport.add('ascend');
    }
  },
  toJS: {
    ramdaFn: '',
    transformation: function transformation(_ref9) {
      var path = _ref9.path,
        callee = _ref9.callee;
      path.replace(callee);
    }
  }
});
function addImport(path) {
  var _path$value$specifier;
  if (path.value.source.value !== 'ramda') return;
  var imports = (_path$value$specifier = path.value.specifiers) != null ? _path$value$specifier : [];
  var importsIdentifiers = imports.map(function (s) {
    var _s$imported;
    return s == null ? void 0 : (_s$imported = s.imported) == null ? void 0 : _s$imported.name;
  });
  var newImportsIdentifiers = ramda.difference(Array.from(functionsToImport), importsIdentifiers);
  var newImports = newImportsIdentifiers.filter(Boolean).map(function (f) {
    return importSpecifier(identifier(f));
  });
  var importExpr = importDeclaration([].concat(imports, newImports), stringLiteral('ramda'));
  path.replace(importExpr);
}

var parseFile = /*#__PURE__*/function () {
  var _ref = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(path) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", fs.promises.readFile(path, 'utf-8').then(function (src) {
              return {
                src: src,
                ast: recast.parse(src, {
                  parser: {
                    parse: function parse(source) {
                      return core.parseSync(source, {
                        plugins: [["@babel/plugin-syntax-typescript", {
                          isTSX: true
                        }]],
                        overrides: [{
                          test: ["**/*.ts", "**/*.tsx"],
                          plugins: [["@babel/plugin-syntax-typescript", {
                            isTSX: true
                          }]]
                        }],
                        filename: path,
                        parserOpts: {
                          tokens: true
                        }
                      });
                    }
                  }
                })
              };
            })["catch"](function (err) {
              signale.error("unable to parse " + path);
              signale.error(err);
            }));
          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return function parseFile(_x) {
    return _ref.apply(this, arguments);
  };
}();
var transformSource = /*#__PURE__*/function () {
  var _ref2 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(path) {
    var code, src, ast, newSrc;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return parseFile(path);
          case 2:
            code = _context2.sent;
            if (code) {
              _context2.next = 5;
              break;
            }
            return _context2.abrupt("return");
          case 5:
            src = code.src, ast = code.ast;
            recast.visit(ast, transformers);
            recast.visit(ast, importTransformer);
            newSrc = recast.print(ast).code;
            return _context2.abrupt("return", src === newSrc ? false : {
              src: src,
              newSrc: newSrc
            });
          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return function transformSource(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var printDiff = /*#__PURE__*/function () {
  var _ref3 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(path) {
    var code;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return transformSource(path);
          case 2:
            code = _context3.sent;
            if (code) {
              _context3.next = 5;
              break;
            }
            return _context3.abrupt("return");
          case 5:
            diff.diffLines(code.src, code.newSrc).forEach(function (part) {
              var color = part.added ? 'green' : part.removed ? 'red' : null;
              if (color) console.log(chalk[color](part.value));
            });
          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return function printDiff(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var rewriteSource = /*#__PURE__*/function () {
  var _ref4 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(path) {
    var code, newFh;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return transformSource(path);
          case 2:
            code = _context4.sent;
            if (code) {
              _context4.next = 5;
              break;
            }
            return _context4.abrupt("return");
          case 5:
            _context4.next = 7;
            return fs.promises.open(path, 'w');
          case 7:
            newFh = _context4.sent;
            newFh.writeFile(code.newSrc);
            signale.success(path + " written");
          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return function rewriteSource(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

commander.program.option('--dry');
var args = /*#__PURE__*/commander.program.parse(process.argv);
args.args.forEach(commander.program.opts().dry ? printDiff : rewriteSource);
//# sourceMappingURL=immutable-to-ramda.cjs.development.js.map
