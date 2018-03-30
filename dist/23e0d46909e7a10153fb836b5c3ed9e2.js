// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({10:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var BLAME_FUNCTION_INDEX = 3; // [current, parent, *error*, caller to blame, …]

function warnDeprecation(reason) {
  // eslint-disable-line max-statements
  if (undefined !== 'none') {
    var stack = new Error('').stack;
    var offender = void 0;
    if (stack) {
      var lines = stack.split('\n');
      offender = lines[BLAME_FUNCTION_INDEX];
    }

    if (offender) {
      console.warn(reason + '\n    Blame: ' + offender.trim());
    } else {
      console.warn(reason);
    }
  }
}

module.exports = warnDeprecation;
},{}],11:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var keys = Object.keys;
var symbols = Object.getOwnPropertySymbols;
var defineProperty = Object.defineProperty;
var property = Object.getOwnPropertyDescriptor;

/*
 * Extends an objects with own enumerable key/value pairs from other sources.
 *
 * This is used to define objects for the ADTs througout this file, and there
 * are some important differences from Object.assign:
 *
 *   - This code is only concerned with own enumerable property *names*.
 *   - Additionally this code copies all own symbols (important for tags).
 *
 * When copying, this function copies **whole property descriptors**, which
 * means getters/setters are not executed during the copying. The only
 * exception is when the property name is `prototype`, which is not
 * configurable in functions by default.
 *
 * This code only special cases `prototype` because any other non-configurable
 * property is considered an error, and should crash the program so it can be
 * fixed.
 */
function extend(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    keys(source).forEach(function (key) {
      if (key === 'prototype') {
        target[key] = source[key];
      } else {
        defineProperty(target, key, property(source, key));
      }
    });
    symbols(source).forEach(function (symbol) {
      defineProperty(target, symbol, property(source, symbol));
    });
  });
  return target;
}

module.exports = extend;
},{}],6:[function(require,module,exports) {
'use strict';

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var warnDeprecation = require('../../helpers/warn-deprecation');
var extend = require('../../helpers/extend');

// --[ Constants and Aliases ]------------------------------------------
var TYPE = Symbol.for('@@folktale:adt:type');
var TAG = Symbol.for('@@folktale:adt:tag');
var META = Symbol.for('@@meta:magical');

var keys = Object.keys;

// --[ Helpers ]--------------------------------------------------------

//
// Returns an array of own enumerable values in an object.
//
function values(object) {
  return keys(object).map(function (key) {
    return object[key];
  });
}

//
// Transforms own enumerable key/value pairs.
//
function mapObject(object, transform) {
  return keys(object).reduce(function (result, key) {
    result[key] = transform(key, object[key]);
    return result;
  }, {});
}

// --[ Variant implementation ]-----------------------------------------

//
// Defines the variants given a set of patterns and an ADT namespace.
//
function defineVariants(typeId, patterns, adt) {
  return mapObject(patterns, function (name, constructor) {
    var _constructor, _ref, _extend, _mutatorMap, _tag, _type, _constructor2, _extend2, _mutatorMap2;

    // ---[ Variant Internals ]-----------------------------------------
    function InternalConstructor() {}
    InternalConstructor.prototype = Object.create(adt);

    extend(InternalConstructor.prototype, (_extend = {}, _defineProperty(_extend, TAG, name), _constructor = 'constructor', _mutatorMap = {}, _mutatorMap[_constructor] = _mutatorMap[_constructor] || {}, _mutatorMap[_constructor].get = function () {
      return constructor;
    }, _ref = 'is' + name, _mutatorMap[_ref] = _mutatorMap[_ref] || {}, _mutatorMap[_ref].get = function () {
      warnDeprecation('.is' + name + ' is deprecated. Use ' + name + '.hasInstance(value)\ninstead to check if a value belongs to the ADT variant.');
      return true;
    }, _defineProperty(_extend, 'matchWith', function matchWith(pattern) {
      return pattern[name](this);
    }), _defineEnumerableProperties(_extend, _mutatorMap), _extend));

    function makeInstance() {
      var result = new InternalConstructor(); // eslint-disable-line prefer-const
      extend(result, constructor.apply(undefined, arguments) || {});
      return result;
    }

    extend(makeInstance, (_extend2 = {}, _defineProperty(_extend2, META, constructor[META]), _tag = 'tag', _mutatorMap2 = {}, _mutatorMap2[_tag] = _mutatorMap2[_tag] || {}, _mutatorMap2[_tag].get = function () {
      return name;
    }, _type = 'type', _mutatorMap2[_type] = _mutatorMap2[_type] || {}, _mutatorMap2[_type].get = function () {
      return typeId;
    }, _constructor2 = 'constructor', _mutatorMap2[_constructor2] = _mutatorMap2[_constructor2] || {}, _mutatorMap2[_constructor2].get = function () {
      return constructor;
    }, _defineProperty(_extend2, 'prototype', InternalConstructor.prototype), _defineProperty(_extend2, 'hasInstance', function hasInstance(value) {
      return Boolean(value) && adt.hasInstance(value) && value[TAG] === name;
    }), _defineEnumerableProperties(_extend2, _mutatorMap2), _extend2));

    return makeInstance;
  });
}

// --[ ADT Implementation ]--------------------------------------------

/*~
 * authors:
 *   - Quildreen Motta
 * 
 * stability: experimental
 * type: |
 *   (String, Object (Array String)) => Union
 */
var union = function union(typeId, patterns) {
  var _extend3;

  var UnionNamespace = Object.create(Union);
  var variants = defineVariants(typeId, patterns, UnionNamespace);

  extend(UnionNamespace, variants, (_extend3 = {}, _defineProperty(_extend3, TYPE, typeId), _defineProperty(_extend3, 'variants', values(variants)), _defineProperty(_extend3, 'hasInstance', function hasInstance(value) {
    return Boolean(value) && value[TYPE] === this[TYPE];
  }), _extend3));

  return UnionNamespace;
};

/*~ ~belongsTo : union */
var Union = {
  /*~
   * type: |
   *   Union . (...(Variant, Union) => Any) => Union
   */
  derive: function derive() {
    var _this = this;

    for (var _len = arguments.length, derivations = Array(_len), _key = 0; _key < _len; _key++) {
      derivations[_key] = arguments[_key];
    }

    derivations.forEach(function (derivation) {
      _this.variants.forEach(function (variant) {
        return derivation(variant, _this);
      });
    });
    return this;
  }
};

// --[ Exports ]--------------------------------------------------------
union.Union = Union;
union.typeSymbol = TYPE;
union.tagSymbol = TAG;

module.exports = union;
},{"../../helpers/warn-deprecation":10,"../../helpers/extend":11}],16:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../adt/union/union'),
    typeSymbol = _require.typeSymbol;

module.exports = function (type) {
  return function (method, value) {
    var typeName = type[typeSymbol];
    if (undefined !== 'none' && !type.isPrototypeOf(value)) {
      console.warn(typeName + '.' + method + ' expects a value of the same type, but was given ' + value + '.');

      if (undefined !== 'minimal') {
        console.warn('\nThis could mean that you\'ve provided the wrong value to the method, in\nwhich case this is a bug in your program, and you should try to track\ndown why the wrong value is getting here.\n\nBut this could also mean that you have more than one ' + typeName + ' library\ninstantiated in your program. This is not **necessarily** a bug, it\ncould happen for several reasons:\n\n 1) You\'re loading the library in Node, and Node\'s cache didn\'t give\n    you back the same instance you had previously requested.\n\n 2) You have more than one Code Realm in your program, and objects\n    created from the same library, in different realms, are interacting.\n\n 3) You have a version conflict of folktale libraries, and objects\n    created from different versions of the library are interacting.\n\nIf your situation fits the cases (1) or (2), you are okay, as long as\nthe objects originate from the same version of the library. Folktale\ndoes not rely on reference checking, only structural checking. However\nyou\'ll want to watch out if you\'re modifying the ' + typeName + '\'s prototype,\nbecause you\'ll have more than one of them, and you\'ll want to make\nsure you do the same change in all of them \u2014 ideally you shouldn\'t\nbe modifying the object, though.\n\nIf your situation fits the case (3), you are *probably* okay if the\nversion difference isn\'t a major one. However, at this point the\nbehaviour of your program using ' + typeName + ' is undefined, and you should\ntry looking into why the version conflict is happening.\n\nParametric modules can help ensuring your program only has a single\ninstance of the folktale library. Check out the Folktale Architecture\ndocumentation for more information.\n      ');
      }
    }
  };
};
},{"../adt/union/union":6}],15:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

module.exports = {
  equals: 'fantasy-land/equals',
  concat: 'fantasy-land/concat',
  empty: 'fantasy-land/empty',
  map: 'fantasy-land/map',
  ap: 'fantasy-land/ap',
  of: 'fantasy-land/of',
  reduce: 'fantasy-land/reduce',
  traverse: 'fantasy-land/traverse',
  chain: 'fantasy-land/chain',
  chainRec: 'fantasy-land/chainRec',
  extend: 'fantasy-land/extend',
  extract: 'fantasy-land/extract',
  bimap: 'fantasy-land/bimap',
  promap: 'fantasy-land/promap'
};
},{}],24:[function(require,module,exports) {
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 *
 * type: |
 *   (Number, (Any...) => 'a) => Any... => 'a or ((Any...) => 'a)
 */
var curry = function curry(arity, fn) {
  var curried = function curried(oldArgs) {
    return function () {
      for (var _len = arguments.length, newArgs = Array(_len), _key = 0; _key < _len; _key++) {
        newArgs[_key] = arguments[_key];
      }

      var allArgs = oldArgs.concat(newArgs);
      var argCount = allArgs.length;

      return argCount < arity ? curried(allArgs) : /* otherwise */fn.apply(undefined, _toConsumableArray(allArgs));
    };
  };

  return curried([]);
};

// --[ Exports ]-------------------------------------------------------
module.exports = curry;
},{}],25:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var deprecated = require('./warn-deprecation');

module.exports = function (methodName) {
  return function (result) {
    deprecated('Type.' + methodName + '() is being deprecated in favour of Type[\'fantasy-land/' + methodName + '\'](). \n    Your data structure is using the old-style fantasy-land methods,\n    and these won\'t be supported in Folktale 3');
    return result;
  };
};
},{"./warn-deprecation":10}],26:[function(require,module,exports) {
"use strict";

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

module.exports = function (methodName) {
  return function (object) {
    throw new TypeError(object + " does not have a method '" + methodName + "'.");
  };
};
},{}],17:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../helpers/fantasy-land'),
    flEquals = _require.equals;

var curry = require('../core/lambda/curry');
var warn = require('../helpers/warn-deprecated-method')('equals');
var unsupported = require('../helpers/unsupported-method')('equals');

var isNew = function isNew(a) {
  return typeof a[flEquals] === 'function';
};
var isOld = function isOld(a) {
  return typeof a.equals === 'function';
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a, S a) => Boolean
 *   where S is Setoid
 */
var equals = function equals(setoidLeft, setoidRight) {
  return isNew(setoidLeft) ? setoidLeft[flEquals](setoidRight) : isOld(setoidLeft) ? warn(setoidLeft.equals(setoidRight)) : /*otherwise*/unsupported(setoidLeft);
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a) => (S a) => Boolean
 *   where S is Setoid
 */
equals.curried = curry(2, function (setoidRight, setoidLeft) {
  return (// eslint-disable-line no-magic-numbers
    equals(setoidLeft, setoidRight)
  );
});

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a).(S a) => Boolean
 *   where S is Setoid
 */
equals.infix = function (aSetoid) {
  return equals(this, aSetoid);
};

module.exports = equals;
},{"../helpers/fantasy-land":15,"../core/lambda/curry":24,"../helpers/warn-deprecated-method":25,"../helpers/unsupported-method":26}],14:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------


var aliases = {
  equals: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => Boolean
     *   where 'S is Setoid
     */
    'fantasy-land/equals': function fantasyLandEquals(that) {
      return this.equals(that);
    }
  },

  concat: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => 'S 'a
     *   where 'S is Semigroup
     */
    'fantasy-land/concat': function fantasyLandConcat(that) {
      return this.concat(that);
    }
  },

  empty: {
    /*~
     * module: null
     * type: |
     *   ('M).() => 'M a
     *   where 'M is Monoid
     */
    'fantasy-land/empty': function fantasyLandEmpty() {
      return this.empty();
    }
  },

  map: {
    /*~
     * module: null
     * type: |
     *   ('F 'a).(('a) => 'b) => 'F 'b
     *   where 'F is Functor
     */
    'fantasy-land/map': function fantasyLandMap(transformation) {
      return this.map(transformation);
    }
  },

  apply: {
    /*~
     * module: null
     * type: |
     *   ('F ('a) => b).('F 'a) => 'F 'b
     *   where 'F is Apply
     */
    ap: function ap(that) {
      return this.apply(that);
    },


    /*~
     * module: null
     * type: |
     *   ('F 'a).('F ('a) => 'b) => 'F 'b
     *   where 'F is Apply
     */
    'fantasy-land/ap': function fantasyLandAp(that) {
      return that.apply(this);
    }
  },

  of: {
    /*~
     * module: null
     * type: |
     *   forall F, a:
     *     (F).(a) => F a
     *   where F is Applicative 
     */
    'fantasy-land/of': function fantasyLandOf(value) {
      return this.of(value);
    }
  },

  reduce: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b:
     *     (F a).((b, a) => b, b) => b
     *   where F is Foldable  
     */
    'fantasy-land/reduce': function fantasyLandReduce(combinator, initial) {
      return this.reduce(combinator, initial);
    }
  },

  traverse: {
    /*~
     * module: null
     * type: |
     *   forall F, T, a, b:
     *     (T a).((a) => F b, (c) => F c) => F (T b)
     *   where F is Apply, T is Traversable
     */
    'fantasy-land/traverse': function fantasyLandTraverse(transformation, lift) {
      return this.traverse(transformation, lift);
    }
  },

  chain: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b:
     *     (M a).((a) => M b) => M b
     *   where M is Chain
     */
    'fantasy-land/chain': function fantasyLandChain(transformation) {
      return this.chain(transformation);
    }
  },

  chainRecursively: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    chainRec: function chainRec(step, initial) {
      return this.chainRecursively(step, initial);
    },


    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    'fantasy-land/chainRec': function fantasyLandChainRec(step, initial) {
      return this.chainRecursively(step, initial);
    }
  },

  extend: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).((W a) => b) => W b
     *   where W is Extend
     */
    'fantasy-land/extend': function fantasyLandExtend(transformation) {
      return this.extend(transformation);
    }
  },

  extract: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).() => a
     *   where W is Comonad
     */
    'fantasy-land/extract': function fantasyLandExtract() {
      return this.extract();
    }
  },

  bimap: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b, c, d:
     *     (F a b).((a) => c, (b) => d) => F c d
     *   where F is Bifunctor
     */
    'fantasy-land/bimap': function fantasyLandBimap(f, g) {
      return this.bimap(f, g);
    }
  },

  promap: {
    /*~
     * module: null
     * type: |
     *   forall P, a, b, c, d:
     *     (P a b).((c) => a, (b) => d) => P c d
     */
    'fantasy-land/promap': function fantasyLandPromap(f, g) {
      return this.promap(f, g);
    }
  }
};

var provideAliases = function provideAliases(structure) {
  Object.keys(aliases).forEach(function (method) {
    if (typeof structure[method] === 'function') {
      Object.keys(aliases[method]).forEach(function (alias) {
        structure[alias] = aliases[method][alias];
      });
    }
  });
};

module.exports = provideAliases;
},{}],22:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var mm = Symbol.for('@@meta:magical');

var copyDocumentation = function copyDocumentation(source, target) {
  var extensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (undefined !== 'false') {
    target[mm] = Object.assign({}, source[mm] || {}, extensions);
  }
};

module.exports = copyDocumentation;
},{}],7:[function(require,module,exports) {
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var assertType = require('../../../helpers/assert-type');
var flEquals = require('../../../fantasy-land/equals');
var fl = require('../../../helpers/fantasy-land');
var provideAliases = require('../../../helpers/provide-fantasy-land-aliases');
var copyDocs = require('../../../helpers/copy-documentation');

var _require = require('../union'),
    tagSymbol = _require.tagSymbol,
    typeSymbol = _require.typeSymbol;

var toString = Object.prototype.toString;
var prototypeOf = Object.getPrototypeOf;

// --[ Helpers ]--------------------------------------------------------

/*~
 * type: (Any) => Boolean
 */
var isSetoid = function isSetoid(value) {
  return value != null && (typeof value[fl.equals] === 'function' || typeof value.equals === 'function');
};

/*~
 * type: (Variant, Variant) => Boolean
 */
var sameType = function sameType(a, b) {
  return a[typeSymbol] === b[typeSymbol] && a[tagSymbol] === b[tagSymbol];
};

var isPlainObject = function isPlainObject(object) {
  if (Object(object) !== object) return false;

  return !prototypeOf(object) || !object.toString || toString.call(object) === object.toString();
};

var deepEquals = function deepEquals(a, b) {
  if (a === b) return true;

  var leftSetoid = isSetoid(a);
  var rightSetoid = isSetoid(b);
  if (leftSetoid) {
    if (rightSetoid) return flEquals(a, b);else return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every(function (x, i) {
      return deepEquals(x, b[i]);
    });
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    var setB = new Set(keysB);
    return keysA.length === keysB.length && prototypeOf(a) === prototypeOf(b) && keysA.every(function (k) {
      return setB.has(k) && a[k] === b[k];
    });
  }

  return false;
};

// --[ Implementation ]------------------------------------------------
/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (('a, 'a) => Boolean) => (Variant, Union) => Void
 */
var createDerivation = function createDerivation(valuesEqual) {
  /*~
   * type: ('a, 'a) => Boolean
   */
  var equals = function equals(a, b) {
    // identical objects must be equal
    if (a === b) return true;

    // we require both values to be setoids if one of them is
    var leftSetoid = isSetoid(a);
    var rightSetoid = isSetoid(b);
    if (leftSetoid) {
      if (rightSetoid) return flEquals(a, b);else return false;
    }

    // fall back to the provided equality
    return valuesEqual(a, b);
  };

  /*~
   * type: (Object Any, Object Any, Array String) => Boolean
   */
  var compositesEqual = function compositesEqual(a, b, keys) {
    for (var i = 0; i < keys.length; ++i) {
      var keyA = a[keys[i]];
      var keyB = b[keys[i]];
      if (!equals(keyA, keyB)) {
        return false;
      }
    }
    return true;
  };

  var derivation = function derivation(variant, adt) {
    /*~
     * stability: experimental
     * module: null
     * authors:
     *   - "@boris-marinov"
     *   - Quildreen Motta
     * 
     * type: |
     *   forall S, a:
     *     (S a).(S a) => Boolean
     *   where S is Setoid
     */
    variant.prototype.equals = function (value) {
      assertType(adt)(this[tagSymbol] + '#equals', value);
      return sameType(this, value) && compositesEqual(this, value, Object.keys(this));
    };
    provideAliases(variant.prototype);
    return variant;
  };
  copyDocs(createDerivation, derivation, {
    type: '(Variant, Union) => Void'
  });

  return derivation;
};

// --[ Exports ]-------------------------------------------------------

/*~~inheritsMeta: createDerivation */
module.exports = createDerivation(deepEquals);

module.exports.withCustomComparison = createDerivation;
},{"../../../helpers/assert-type":16,"../../../fantasy-land/equals":17,"../../../helpers/fantasy-land":15,"../../../helpers/provide-fantasy-land-aliases":14,"../../../helpers/copy-documentation":22,"../union":6}],4:[function(require,module,exports) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var __metamagical_withMeta = function metamagical_withMeta(object, meta) {
  var parent = Object.getPrototypeOf(object);var oldMeta = object[Symbol.for('@@meta:magical')] || {};if (parent && parent[Symbol.for('@@meta:magical')] === oldMeta) {
    oldMeta = {};
  }Object.keys(meta).forEach(function (key) {
    if (/^~/.test(key)) {
      oldMeta[key.slice(1)] = meta[key];
    } else {
      oldMeta[key] = meta[key];
    }
  });object[Symbol.for('@@meta:magical')] = oldMeta;return object;
}; /* const task = require('folktale/concurrency/task')
   
   const resultTask = task.do(function* () {
     const a = yield task.of(1)
     const b = yield task.of(2)
   
     return task.of((a + b) * (yield task.of(3)))
   })
   
   const value = resultTask.run().promise()
   .then(value => {
     console.log(value)
   }) */

var _union = require('folktale/adt/union/union');

var _union2 = _interopRequireDefault(_union);

var _equality = require('folktale/adt/union/derivations/equality');

var _equality2 = _interopRequireDefault(_equality);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*~ type: (Number, Number) => Number */
var Id = __metamagical_withMeta((0, _union2.default)('Id', {
  id: function id(value) {
    return { value: value };
  }
}), {
  'name': 'Id',
  'source': 'union(\'Id\', { id(value) { return { value } } })',
  'location': {
    'filename': 'forktale-example-do.js',
    'start': {
      'line': 20,
      'column': 0
    },
    'end': {
      'line': 20,
      'column': 58
    }
  },
  'module': 'forktail\\forktale-example-do',
  'licence': 'MIT',
  'authors': ['Accio'],
  'npmPackage': 'forktail',
  'type': '(Number, Number) => Number'
});

var CheckType = (0, _union2.default)('CheckType', {
  Left: function Left(value) {
    return 'This ' + value + ' is not right type.';
  },
  Right: function Right(value) {
    return { value: value };
  }
}).derive(_equality2.default);

Id.sum = function (a, b) {
  return console.log(typeof a === 'undefined' ? 'undefined' : _typeof(a), typeof b === 'undefined' ? 'undefined' : _typeof(b));
};

var prop = function prop(key, object) {
  return object[key];
};

console.log(Id[Symbol.for('@@folktale:adt:type')], prop('type', Id[Symbol.for('@@meta:magical')]), Id.id(1), Id.sum(1, 2), Id.sum(1, "2"));
},{"folktale/adt/union/union":6,"folktale/adt/union/derivations/equality":7}],30:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '53178' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[30,4])
//# sourceMappingURL=/dist/23e0d46909e7a10153fb836b5c3ed9e2.map