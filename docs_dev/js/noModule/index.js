(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var fails$m = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$l = fails$m;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$l(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global$f =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var fails$k = fails$m;

	var functionBindNative = !fails$k(function () {
	  // eslint-disable-next-line es/no-function-prototype-bind -- safe
	  var test = (function () { /* empty */ }).bind();
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return typeof test != 'function' || test.hasOwnProperty('prototype');
	});

	var NATIVE_BIND$3 = functionBindNative;

	var FunctionPrototype$2 = Function.prototype;
	var bind$3 = FunctionPrototype$2.bind;
	var call$f = FunctionPrototype$2.call;
	var uncurryThis$m = NATIVE_BIND$3 && bind$3.bind(call$f, call$f);

	var functionUncurryThis = NATIVE_BIND$3 ? function (fn) {
	  return fn && uncurryThis$m(fn);
	} : function (fn) {
	  return fn && function () {
	    return call$f.apply(fn, arguments);
	  };
	};

	var documentAll$2 = typeof document == 'object' && document.all;

	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
	var IS_HTMLDDA = typeof documentAll$2 == 'undefined' && documentAll$2 !== undefined;

	var documentAll_1 = {
	  all: documentAll$2,
	  IS_HTMLDDA: IS_HTMLDDA
	};

	var $documentAll$1 = documentAll_1;

	var documentAll$1 = $documentAll$1.all;

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	var isCallable$k = $documentAll$1.IS_HTMLDDA ? function (argument) {
	  return typeof argument == 'function' || argument === documentAll$1;
	} : function (argument) {
	  return typeof argument == 'function';
	};

	var fails$j = fails$m;
	var isCallable$j = isCallable$k;

	var replacement = /#|\.prototype\./;

	var isForced$2 = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : isCallable$j(detection) ? fails$j(detection)
	    : !!detection;
	};

	var normalize = isForced$2.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced$2.data = {};
	var NATIVE = isForced$2.NATIVE = 'N';
	var POLYFILL = isForced$2.POLYFILL = 'P';

	var isForced_1 = isForced$2;

	var isCallable$i = isCallable$k;
	var $documentAll = documentAll_1;

	var documentAll = $documentAll.all;

	var isObject$c = $documentAll.IS_HTMLDDA ? function (it) {
	  return typeof it == 'object' ? it !== null : isCallable$i(it) || it === documentAll;
	} : function (it) {
	  return typeof it == 'object' ? it !== null : isCallable$i(it);
	};

	var isObject$b = isObject$c;

	var $String$3 = String;
	var $TypeError$a = TypeError;

	// `Assert: Type(argument) is Object`
	var anObject$d = function (argument) {
	  if (isObject$b(argument)) return argument;
	  throw $TypeError$a($String$3(argument) + ' is not an object');
	};

	var isCallable$h = isCallable$k;

	var $String$2 = String;
	var $TypeError$9 = TypeError;

	var aPossiblePrototype$1 = function (argument) {
	  if (typeof argument == 'object' || isCallable$h(argument)) return argument;
	  throw $TypeError$9("Can't set " + $String$2(argument) + ' as a prototype');
	};

	/* eslint-disable no-proto -- safe */

	var uncurryThis$l = functionUncurryThis;
	var anObject$c = anObject$d;
	var aPossiblePrototype = aPossiblePrototype$1;

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    setter = uncurryThis$l(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
	    setter(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject$c(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var isCallable$g = isCallable$k;
	var isObject$a = isObject$c;
	var setPrototypeOf$1 = objectSetPrototypeOf;

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired$1 = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    setPrototypeOf$1 &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    isCallable$g(NewTarget = dummy.constructor) &&
	    NewTarget !== Wrapper &&
	    isObject$a(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) setPrototypeOf$1($this, NewTargetPrototype);
	  return $this;
	};

	var objectDefineProperty = {};

	var global$e = global$f;
	var isObject$9 = isObject$c;

	var document$1 = global$e.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$9(document$1) && isObject$9(document$1.createElement);

	var documentCreateElement$2 = function (it) {
	  return EXISTS$1 ? document$1.createElement(it) : {};
	};

	var DESCRIPTORS$a = descriptors;
	var fails$i = fails$m;
	var createElement = documentCreateElement$2;

	// Thanks to IE8 for its funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$a && !fails$i(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(createElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var DESCRIPTORS$9 = descriptors;
	var fails$h = fails$m;

	// V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334
	var v8PrototypeDefineBug = DESCRIPTORS$9 && fails$h(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
	    value: 42,
	    writable: false
	  }).prototype != 42;
	});

	var NATIVE_BIND$2 = functionBindNative;

	var call$e = Function.prototype.call;

	var functionCall = NATIVE_BIND$2 ? call$e.bind(call$e) : function () {
	  return call$e.apply(call$e, arguments);
	};

	var global$d = global$f;
	var isCallable$f = isCallable$k;

	var aFunction = function (argument) {
	  return isCallable$f(argument) ? argument : undefined;
	};

	var getBuiltIn$7 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(global$d[namespace]) : global$d[namespace] && global$d[namespace][method];
	};

	var uncurryThis$k = functionUncurryThis;

	var objectIsPrototypeOf = uncurryThis$k({}.isPrototypeOf);

	var getBuiltIn$6 = getBuiltIn$7;

	var engineUserAgent = getBuiltIn$6('navigator', 'userAgent') || '';

	var global$c = global$f;
	var userAgent = engineUserAgent;

	var process = global$c.process;
	var Deno = global$c.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us
	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	var engineV8Version = version;

	/* eslint-disable es/no-symbol -- required for testing */

	var V8_VERSION$2 = engineV8Version;
	var fails$g = fails$m;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$g(function () {
	  var symbol = Symbol();
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION$2 && V8_VERSION$2 < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */

	var NATIVE_SYMBOL$2 = symbolConstructorDetection;

	var useSymbolAsUid = NATIVE_SYMBOL$2
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var getBuiltIn$5 = getBuiltIn$7;
	var isCallable$e = isCallable$k;
	var isPrototypeOf$2 = objectIsPrototypeOf;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

	var $Object$4 = Object;

	var isSymbol$3 = USE_SYMBOL_AS_UID$1 ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn$5('Symbol');
	  return isCallable$e($Symbol) && isPrototypeOf$2($Symbol.prototype, $Object$4(it));
	};

	var $String$1 = String;

	var tryToString$2 = function (argument) {
	  try {
	    return $String$1(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var isCallable$d = isCallable$k;
	var tryToString$1 = tryToString$2;

	var $TypeError$8 = TypeError;

	// `Assert: IsCallable(argument) is true`
	var aCallable$3 = function (argument) {
	  if (isCallable$d(argument)) return argument;
	  throw $TypeError$8(tryToString$1(argument) + ' is not a function');
	};

	// we can't use just `it == null` since of `document.all` special case
	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
	var isNullOrUndefined$5 = function (it) {
	  return it === null || it === undefined;
	};

	var aCallable$2 = aCallable$3;
	var isNullOrUndefined$4 = isNullOrUndefined$5;

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod$5 = function (V, P) {
	  var func = V[P];
	  return isNullOrUndefined$4(func) ? undefined : aCallable$2(func);
	};

	var call$d = functionCall;
	var isCallable$c = isCallable$k;
	var isObject$8 = isObject$c;

	var $TypeError$7 = TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive$1 = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable$c(fn = input.toString) && !isObject$8(val = call$d(fn, input))) return val;
	  if (isCallable$c(fn = input.valueOf) && !isObject$8(val = call$d(fn, input))) return val;
	  if (pref !== 'string' && isCallable$c(fn = input.toString) && !isObject$8(val = call$d(fn, input))) return val;
	  throw $TypeError$7("Can't convert object to primitive value");
	};

	var shared$4 = {exports: {}};

	var global$b = global$f;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$4 = Object.defineProperty;

	var defineGlobalProperty$3 = function (key, value) {
	  try {
	    defineProperty$4(global$b, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    global$b[key] = value;
	  } return value;
	};

	var global$a = global$f;
	var defineGlobalProperty$2 = defineGlobalProperty$3;

	var SHARED = '__core-js_shared__';
	var store$3 = global$a[SHARED] || defineGlobalProperty$2(SHARED, {});

	var sharedStore = store$3;

	var store$2 = sharedStore;

	(shared$4.exports = function (key, value) {
	  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.25.3',
	  mode: 'global',
	  copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
	  license: 'https://github.com/zloirock/core-js/blob/v3.25.3/LICENSE',
	  source: 'https://github.com/zloirock/core-js'
	});

	var isNullOrUndefined$3 = isNullOrUndefined$5;

	var $TypeError$6 = TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$5 = function (it) {
	  if (isNullOrUndefined$3(it)) throw $TypeError$6("Can't call method on " + it);
	  return it;
	};

	var requireObjectCoercible$4 = requireObjectCoercible$5;

	var $Object$3 = Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$6 = function (argument) {
	  return $Object$3(requireObjectCoercible$4(argument));
	};

	var uncurryThis$j = functionUncurryThis;
	var toObject$5 = toObject$6;

	var hasOwnProperty = uncurryThis$j({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es/no-object-hasown -- safe
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty(toObject$5(it), key);
	};

	var uncurryThis$i = functionUncurryThis;

	var id = 0;
	var postfix = Math.random();
	var toString$9 = uncurryThis$i(1.0.toString);

	var uid$2 = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$9(++id + postfix, 36);
	};

	var global$9 = global$f;
	var shared$3 = shared$4.exports;
	var hasOwn$a = hasOwnProperty_1;
	var uid$1 = uid$2;
	var NATIVE_SYMBOL$1 = symbolConstructorDetection;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var WellKnownSymbolsStore = shared$3('wks');
	var Symbol$1 = global$9.Symbol;
	var symbolFor = Symbol$1 && Symbol$1['for'];
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

	var wellKnownSymbol$i = function (name) {
	  if (!hasOwn$a(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL$1 || typeof WellKnownSymbolsStore[name] == 'string')) {
	    var description = 'Symbol.' + name;
	    if (NATIVE_SYMBOL$1 && hasOwn$a(Symbol$1, name)) {
	      WellKnownSymbolsStore[name] = Symbol$1[name];
	    } else if (USE_SYMBOL_AS_UID && symbolFor) {
	      WellKnownSymbolsStore[name] = symbolFor(description);
	    } else {
	      WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
	    }
	  } return WellKnownSymbolsStore[name];
	};

	var call$c = functionCall;
	var isObject$7 = isObject$c;
	var isSymbol$2 = isSymbol$3;
	var getMethod$4 = getMethod$5;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol$h = wellKnownSymbol$i;

	var $TypeError$5 = TypeError;
	var TO_PRIMITIVE = wellKnownSymbol$h('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive$1 = function (input, pref) {
	  if (!isObject$7(input) || isSymbol$2(input)) return input;
	  var exoticToPrim = getMethod$4(input, TO_PRIMITIVE);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = call$c(exoticToPrim, input, pref);
	    if (!isObject$7(result) || isSymbol$2(result)) return result;
	    throw $TypeError$5("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol$1 = isSymbol$3;

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey$3 = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol$1(key) ? key : key + '';
	};

	var DESCRIPTORS$8 = descriptors;
	var IE8_DOM_DEFINE$1 = ie8DomDefine;
	var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
	var anObject$b = anObject$d;
	var toPropertyKey$2 = toPropertyKey$3;

	var $TypeError$4 = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE$1 = 'configurable';
	var WRITABLE = 'writable';

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$8 ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
	  anObject$b(O);
	  P = toPropertyKey$2(P);
	  anObject$b(Attributes);
	  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
	    var current = $getOwnPropertyDescriptor$1(O, P);
	    if (current && current[WRITABLE]) {
	      O[P] = Attributes.value;
	      Attributes = {
	        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
	        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
	        writable: false
	      };
	    }
	  } return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject$b(O);
	  P = toPropertyKey$2(P);
	  anObject$b(Attributes);
	  if (IE8_DOM_DEFINE$1) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw $TypeError$4('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var createPropertyDescriptor$4 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var DESCRIPTORS$7 = descriptors;
	var definePropertyModule$5 = objectDefineProperty;
	var createPropertyDescriptor$3 = createPropertyDescriptor$4;

	var createNonEnumerableProperty$6 = DESCRIPTORS$7 ? function (object, key, value) {
	  return definePropertyModule$5.f(object, key, createPropertyDescriptor$3(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var objectGetOwnPropertyNames = {};

	var uncurryThis$h = functionUncurryThis;

	var toString$8 = uncurryThis$h({}.toString);
	var stringSlice$5 = uncurryThis$h(''.slice);

	var classofRaw$1 = function (it) {
	  return stringSlice$5(toString$8(it), 8, -1);
	};

	var uncurryThis$g = functionUncurryThis;
	var fails$f = fails$m;
	var classof$9 = classofRaw$1;

	var $Object$2 = Object;
	var split = uncurryThis$g(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$f(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !$Object$2('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof$9(it) == 'String' ? split(it, '') : $Object$2(it);
	} : $Object$2;

	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject$2 = indexedObject;
	var requireObjectCoercible$3 = requireObjectCoercible$5;

	var toIndexedObject$6 = function (it) {
	  return IndexedObject$2(requireObjectCoercible$3(it));
	};

	var ceil = Math.ceil;
	var floor$1 = Math.floor;

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	// eslint-disable-next-line es/no-math-trunc -- safe
	var mathTrunc = Math.trunc || function trunc(x) {
	  var n = +x;
	  return (n > 0 ? floor$1 : ceil)(n);
	};

	var trunc = mathTrunc;

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity$4 = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return number !== number || number === 0 ? 0 : trunc(number);
	};

	var toIntegerOrInfinity$3 = toIntegerOrInfinity$4;

	var max$2 = Math.max;
	var min$2 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex$2 = function (index, length) {
	  var integer = toIntegerOrInfinity$3(index);
	  return integer < 0 ? max$2(integer + length, 0) : min$2(integer, length);
	};

	var toIntegerOrInfinity$2 = toIntegerOrInfinity$4;

	var min$1 = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$3 = function (argument) {
	  return argument > 0 ? min$1(toIntegerOrInfinity$2(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength$2 = toLength$3;

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike$5 = function (obj) {
	  return toLength$2(obj.length);
	};

	var toIndexedObject$5 = toIndexedObject$6;
	var toAbsoluteIndex$1 = toAbsoluteIndex$2;
	var lengthOfArrayLike$4 = lengthOfArrayLike$5;

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$2 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$5($this);
	    var length = lengthOfArrayLike$4(O);
	    var index = toAbsoluteIndex$1(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod$2(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod$2(false)
	};

	var hiddenKeys$4 = {};

	var uncurryThis$f = functionUncurryThis;
	var hasOwn$9 = hasOwnProperty_1;
	var toIndexedObject$4 = toIndexedObject$6;
	var indexOf$1 = arrayIncludes.indexOf;
	var hiddenKeys$3 = hiddenKeys$4;

	var push$2 = uncurryThis$f([].push);

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject$4(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwn$9(hiddenKeys$3, key) && hasOwn$9(O, key) && push$2(result, key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwn$9(O, key = names[i++])) {
	    ~indexOf$1(result, key) || push$2(result, key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys$3 = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var internalObjectKeys$1 = objectKeysInternal;
	var enumBugKeys$2 = enumBugKeys$3;

	var hiddenKeys$2 = enumBugKeys$2.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys$1(O, hiddenKeys$2);
	};

	var isObject$6 = isObject$c;
	var classof$8 = classofRaw$1;
	var wellKnownSymbol$g = wellKnownSymbol$i;

	var MATCH$1 = wellKnownSymbol$g('match');

	// `IsRegExp` abstract operation
	// https://tc39.es/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject$6(it) && ((isRegExp = it[MATCH$1]) !== undefined ? !!isRegExp : classof$8(it) == 'RegExp');
	};

	var wellKnownSymbol$f = wellKnownSymbol$i;

	var TO_STRING_TAG$2 = wellKnownSymbol$f('toStringTag');
	var test = {};

	test[TO_STRING_TAG$2] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
	var isCallable$b = isCallable$k;
	var classofRaw = classofRaw$1;
	var wellKnownSymbol$e = wellKnownSymbol$i;

	var TO_STRING_TAG$1 = wellKnownSymbol$e('toStringTag');
	var $Object$1 = Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$7 = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = $Object$1(it), TO_STRING_TAG$1)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && isCallable$b(O.callee) ? 'Arguments' : result;
	};

	var classof$6 = classof$7;

	var $String = String;

	var toString$7 = function (argument) {
	  if (classof$6(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
	  return $String(argument);
	};

	var anObject$a = anObject$d;

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags$1 = function () {
	  var that = anObject$a(this);
	  var result = '';
	  if (that.hasIndices) result += 'd';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.unicodeSets) result += 'v';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var call$b = functionCall;
	var hasOwn$8 = hasOwnProperty_1;
	var isPrototypeOf$1 = objectIsPrototypeOf;
	var regExpFlags = regexpFlags$1;

	var RegExpPrototype$4 = RegExp.prototype;

	var regexpGetFlags = function (R) {
	  var flags = R.flags;
	  return flags === undefined && !('flags' in RegExpPrototype$4) && !hasOwn$8(R, 'flags') && isPrototypeOf$1(RegExpPrototype$4, R)
	    ? call$b(regExpFlags, R) : flags;
	};

	var fails$e = fails$m;
	var global$8 = global$f;

	// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	var $RegExp$2 = global$8.RegExp;

	var UNSUPPORTED_Y$2 = fails$e(function () {
	  var re = $RegExp$2('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	// UC Browser bug
	// https://github.com/zloirock/core-js/issues/1008
	var MISSED_STICKY$2 = UNSUPPORTED_Y$2 || fails$e(function () {
	  return !$RegExp$2('a', 'y').sticky;
	});

	var BROKEN_CARET = UNSUPPORTED_Y$2 || fails$e(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = $RegExp$2('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
	  BROKEN_CARET: BROKEN_CARET,
	  MISSED_STICKY: MISSED_STICKY$2,
	  UNSUPPORTED_Y: UNSUPPORTED_Y$2
	};

	var defineProperty$3 = objectDefineProperty.f;

	var proxyAccessor$1 = function (Target, Source, key) {
	  key in Target || defineProperty$3(Target, key, {
	    configurable: true,
	    get: function () { return Source[key]; },
	    set: function (it) { Source[key] = it; }
	  });
	};

	var makeBuiltIn$3 = {exports: {}};

	var DESCRIPTORS$6 = descriptors;
	var hasOwn$7 = hasOwnProperty_1;

	var FunctionPrototype$1 = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS$6 && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn$7(FunctionPrototype$1, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS$6 || (DESCRIPTORS$6 && getDescriptor(FunctionPrototype$1, 'name').configurable));

	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var uncurryThis$e = functionUncurryThis;
	var isCallable$a = isCallable$k;
	var store$1 = sharedStore;

	var functionToString = uncurryThis$e(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable$a(store$1.inspectSource)) {
	  store$1.inspectSource = function (it) {
	    return functionToString(it);
	  };
	}

	var inspectSource$2 = store$1.inspectSource;

	var global$7 = global$f;
	var isCallable$9 = isCallable$k;

	var WeakMap$1 = global$7.WeakMap;

	var weakMapBasicDetection = isCallable$9(WeakMap$1) && /native code/.test(String(WeakMap$1));

	var shared$2 = shared$4.exports;
	var uid = uid$2;

	var keys$1 = shared$2('keys');

	var sharedKey$3 = function (key) {
	  return keys$1[key] || (keys$1[key] = uid(key));
	};

	var NATIVE_WEAK_MAP = weakMapBasicDetection;
	var global$6 = global$f;
	var uncurryThis$d = functionUncurryThis;
	var isObject$5 = isObject$c;
	var createNonEnumerableProperty$5 = createNonEnumerableProperty$6;
	var hasOwn$6 = hasOwnProperty_1;
	var shared$1 = sharedStore;
	var sharedKey$2 = sharedKey$3;
	var hiddenKeys$1 = hiddenKeys$4;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError$1 = global$6.TypeError;
	var WeakMap = global$6.WeakMap;
	var set, get, has;

	var enforce = function (it) {
	  return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject$5(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError$1('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared$1.state) {
	  var store = shared$1.state || (shared$1.state = new WeakMap());
	  var wmget = uncurryThis$d(store.get);
	  var wmhas = uncurryThis$d(store.has);
	  var wmset = uncurryThis$d(store.set);
	  set = function (it, metadata) {
	    if (wmhas(store, it)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    wmset(store, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget(store, it) || {};
	  };
	  has = function (it) {
	    return wmhas(store, it);
	  };
	} else {
	  var STATE = sharedKey$2('state');
	  hiddenKeys$1[STATE] = true;
	  set = function (it, metadata) {
	    if (hasOwn$6(it, STATE)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$5(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return hasOwn$6(it, STATE) ? it[STATE] : {};
	  };
	  has = function (it) {
	    return hasOwn$6(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var fails$d = fails$m;
	var isCallable$8 = isCallable$k;
	var hasOwn$5 = hasOwnProperty_1;
	var DESCRIPTORS$5 = descriptors;
	var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
	var inspectSource$1 = inspectSource$2;
	var InternalStateModule$1 = internalState;

	var enforceInternalState$1 = InternalStateModule$1.enforce;
	var getInternalState$3 = InternalStateModule$1.get;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$2 = Object.defineProperty;

	var CONFIGURABLE_LENGTH = DESCRIPTORS$5 && !fails$d(function () {
	  return defineProperty$2(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
	});

	var TEMPLATE = String(String).split('String');

	var makeBuiltIn$2 = makeBuiltIn$3.exports = function (value, name, options) {
	  if (String(name).slice(0, 7) === 'Symbol(') {
	    name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
	  }
	  if (options && options.getter) name = 'get ' + name;
	  if (options && options.setter) name = 'set ' + name;
	  if (!hasOwn$5(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name)) {
	    if (DESCRIPTORS$5) defineProperty$2(value, 'name', { value: name, configurable: true });
	    else value.name = name;
	  }
	  if (CONFIGURABLE_LENGTH && options && hasOwn$5(options, 'arity') && value.length !== options.arity) {
	    defineProperty$2(value, 'length', { value: options.arity });
	  }
	  try {
	    if (options && hasOwn$5(options, 'constructor') && options.constructor) {
	      if (DESCRIPTORS$5) defineProperty$2(value, 'prototype', { writable: false });
	    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
	    } else if (value.prototype) value.prototype = undefined;
	  } catch (error) { /* empty */ }
	  var state = enforceInternalState$1(value);
	  if (!hasOwn$5(state, 'source')) {
	    state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
	  } return value;
	};

	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	// eslint-disable-next-line no-extend-native -- required
	Function.prototype.toString = makeBuiltIn$2(function toString() {
	  return isCallable$8(this) && getInternalState$3(this).source || inspectSource$1(this);
	}, 'toString');

	var isCallable$7 = isCallable$k;
	var definePropertyModule$4 = objectDefineProperty;
	var makeBuiltIn$1 = makeBuiltIn$3.exports;
	var defineGlobalProperty$1 = defineGlobalProperty$3;

	var defineBuiltIn$7 = function (O, key, value, options) {
	  if (!options) options = {};
	  var simple = options.enumerable;
	  var name = options.name !== undefined ? options.name : key;
	  if (isCallable$7(value)) makeBuiltIn$1(value, name, options);
	  if (options.global) {
	    if (simple) O[key] = value;
	    else defineGlobalProperty$1(key, value);
	  } else {
	    try {
	      if (!options.unsafe) delete O[key];
	      else if (O[key]) simple = true;
	    } catch (error) { /* empty */ }
	    if (simple) O[key] = value;
	    else definePropertyModule$4.f(O, key, {
	      value: value,
	      enumerable: false,
	      configurable: !options.nonConfigurable,
	      writable: !options.nonWritable
	    });
	  } return O;
	};

	var getBuiltIn$4 = getBuiltIn$7;
	var definePropertyModule$3 = objectDefineProperty;
	var wellKnownSymbol$d = wellKnownSymbol$i;
	var DESCRIPTORS$4 = descriptors;

	var SPECIES$4 = wellKnownSymbol$d('species');

	var setSpecies$1 = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn$4(CONSTRUCTOR_NAME);
	  var defineProperty = definePropertyModule$3.f;

	  if (DESCRIPTORS$4 && Constructor && !Constructor[SPECIES$4]) {
	    defineProperty(Constructor, SPECIES$4, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var fails$c = fails$m;
	var global$5 = global$f;

	// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
	var $RegExp$1 = global$5.RegExp;

	var regexpUnsupportedDotAll = fails$c(function () {
	  var re = $RegExp$1('.', 's');
	  return !(re.dotAll && re.exec('\n') && re.flags === 's');
	});

	var fails$b = fails$m;
	var global$4 = global$f;

	// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
	var $RegExp = global$4.RegExp;

	var regexpUnsupportedNcg = fails$b(function () {
	  var re = $RegExp('(?<a>b)', 'g');
	  return re.exec('b').groups.a !== 'b' ||
	    'b'.replace(re, '$<a>c') !== 'bc';
	});

	var DESCRIPTORS$3 = descriptors;
	var global$3 = global$f;
	var uncurryThis$c = functionUncurryThis;
	var isForced$1 = isForced_1;
	var inheritIfRequired = inheritIfRequired$1;
	var createNonEnumerableProperty$4 = createNonEnumerableProperty$6;
	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var isPrototypeOf = objectIsPrototypeOf;
	var isRegExp = isRegexp;
	var toString$6 = toString$7;
	var getRegExpFlags$1 = regexpGetFlags;
	var stickyHelpers$1 = regexpStickyHelpers;
	var proxyAccessor = proxyAccessor$1;
	var defineBuiltIn$6 = defineBuiltIn$7;
	var fails$a = fails$m;
	var hasOwn$4 = hasOwnProperty_1;
	var enforceInternalState = internalState.enforce;
	var setSpecies = setSpecies$1;
	var wellKnownSymbol$c = wellKnownSymbol$i;
	var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
	var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

	var MATCH = wellKnownSymbol$c('match');
	var NativeRegExp = global$3.RegExp;
	var RegExpPrototype$3 = NativeRegExp.prototype;
	var SyntaxError = global$3.SyntaxError;
	var exec$3 = uncurryThis$c(RegExpPrototype$3.exec);
	var charAt$6 = uncurryThis$c(''.charAt);
	var replace$3 = uncurryThis$c(''.replace);
	var stringIndexOf$1 = uncurryThis$c(''.indexOf);
	var stringSlice$4 = uncurryThis$c(''.slice);
	// TODO: Use only proper RegExpIdentifierName
	var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var MISSED_STICKY$1 = stickyHelpers$1.MISSED_STICKY;
	var UNSUPPORTED_Y$1 = stickyHelpers$1.UNSUPPORTED_Y;

	var BASE_FORCED = DESCRIPTORS$3 &&
	  (!CORRECT_NEW || MISSED_STICKY$1 || UNSUPPORTED_DOT_ALL$1 || UNSUPPORTED_NCG$1 || fails$a(function () {
	    re2[MATCH] = false;
	    // RegExp constructor can alter flags and IsRegExp works correct with @@match
	    return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
	  }));

	var handleDotAll = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var brackets = false;
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt$6(string, index);
	    if (chr === '\\') {
	      result += chr + charAt$6(string, ++index);
	      continue;
	    }
	    if (!brackets && chr === '.') {
	      result += '[\\s\\S]';
	    } else {
	      if (chr === '[') {
	        brackets = true;
	      } else if (chr === ']') {
	        brackets = false;
	      } result += chr;
	    }
	  } return result;
	};

	var handleNCG = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var named = [];
	  var names = {};
	  var brackets = false;
	  var ncg = false;
	  var groupid = 0;
	  var groupname = '';
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt$6(string, index);
	    if (chr === '\\') {
	      chr = chr + charAt$6(string, ++index);
	    } else if (chr === ']') {
	      brackets = false;
	    } else if (!brackets) switch (true) {
	      case chr === '[':
	        brackets = true;
	        break;
	      case chr === '(':
	        if (exec$3(IS_NCG, stringSlice$4(string, index + 1))) {
	          index += 2;
	          ncg = true;
	        }
	        result += chr;
	        groupid++;
	        continue;
	      case chr === '>' && ncg:
	        if (groupname === '' || hasOwn$4(names, groupname)) {
	          throw new SyntaxError('Invalid capture group name');
	        }
	        names[groupname] = true;
	        named[named.length] = [groupname, groupid];
	        ncg = false;
	        groupname = '';
	        continue;
	    }
	    if (ncg) groupname += chr;
	    else result += chr;
	  } return [result, named];
	};

	// `RegExp` constructor
	// https://tc39.es/ecma262/#sec-regexp-constructor
	if (isForced$1('RegExp', BASE_FORCED)) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = isPrototypeOf(RegExpPrototype$3, this);
	    var patternIsRegExp = isRegExp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var groups = [];
	    var rawPattern = pattern;
	    var rawFlags, dotAll, sticky, handled, result, state;

	    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
	      return pattern;
	    }

	    if (patternIsRegExp || isPrototypeOf(RegExpPrototype$3, pattern)) {
	      pattern = pattern.source;
	      if (flagsAreUndefined) flags = getRegExpFlags$1(rawPattern);
	    }

	    pattern = pattern === undefined ? '' : toString$6(pattern);
	    flags = flags === undefined ? '' : toString$6(flags);
	    rawPattern = pattern;

	    if (UNSUPPORTED_DOT_ALL$1 && 'dotAll' in re1) {
	      dotAll = !!flags && stringIndexOf$1(flags, 's') > -1;
	      if (dotAll) flags = replace$3(flags, /s/g, '');
	    }

	    rawFlags = flags;

	    if (MISSED_STICKY$1 && 'sticky' in re1) {
	      sticky = !!flags && stringIndexOf$1(flags, 'y') > -1;
	      if (sticky && UNSUPPORTED_Y$1) flags = replace$3(flags, /y/g, '');
	    }

	    if (UNSUPPORTED_NCG$1) {
	      handled = handleNCG(pattern);
	      pattern = handled[0];
	      groups = handled[1];
	    }

	    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$3, RegExpWrapper);

	    if (dotAll || sticky || groups.length) {
	      state = enforceInternalState(result);
	      if (dotAll) {
	        state.dotAll = true;
	        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
	      }
	      if (sticky) state.sticky = true;
	      if (groups.length) state.groups = groups;
	    }

	    if (pattern !== rawPattern) try {
	      // fails in old engines, but we have no alternatives for unsupported regex syntax
	      createNonEnumerableProperty$4(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
	    } catch (error) { /* empty */ }

	    return result;
	  };

	  for (var keys = getOwnPropertyNames(NativeRegExp), index = 0; keys.length > index;) {
	    proxyAccessor(RegExpWrapper, NativeRegExp, keys[index++]);
	  }

	  RegExpPrototype$3.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype$3;
	  defineBuiltIn$6(global$3, 'RegExp', RegExpWrapper, { constructor: true });
	}

	// https://tc39.es/ecma262/#sec-get-regexp-@@species
	setSpecies('RegExp');

	var objectGetOwnPropertyDescriptor = {};

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$1(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;

	var DESCRIPTORS$2 = descriptors;
	var call$a = functionCall;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var createPropertyDescriptor$2 = createPropertyDescriptor$4;
	var toIndexedObject$3 = toIndexedObject$6;
	var toPropertyKey$1 = toPropertyKey$3;
	var hasOwn$3 = hasOwnProperty_1;
	var IE8_DOM_DEFINE = ie8DomDefine;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$2 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$3(O);
	  P = toPropertyKey$1(P);
	  if (IE8_DOM_DEFINE) try {
	    return $getOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwn$3(O, P)) return createPropertyDescriptor$2(!call$a(propertyIsEnumerableModule.f, O, P), O[P]);
	};

	var objectGetOwnPropertySymbols = {};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var getBuiltIn$3 = getBuiltIn$7;
	var uncurryThis$b = functionUncurryThis;
	var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var anObject$9 = anObject$d;

	var concat$1 = uncurryThis$b([].concat);

	// all object keys, includes non-enumerable and symbols
	var ownKeys$1 = getBuiltIn$3('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule.f(anObject$9(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  return getOwnPropertySymbols ? concat$1(keys, getOwnPropertySymbols(it)) : keys;
	};

	var hasOwn$2 = hasOwnProperty_1;
	var ownKeys = ownKeys$1;
	var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
	var definePropertyModule$2 = objectDefineProperty;

	var copyConstructorProperties$1 = function (target, source, exceptions) {
	  var keys = ownKeys(source);
	  var defineProperty = definePropertyModule$2.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwn$2(target, key) && !(exceptions && hasOwn$2(exceptions, key))) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};

	var global$2 = global$f;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var createNonEnumerableProperty$3 = createNonEnumerableProperty$6;
	var defineBuiltIn$5 = defineBuiltIn$7;
	var defineGlobalProperty = defineGlobalProperty$3;
	var copyConstructorProperties = copyConstructorProperties$1;
	var isForced = isForced_1;

	/*
	  options.target         - name of the target object
	  options.global         - target is the global object
	  options.stat           - export as static methods of target
	  options.proto          - export as prototype methods of target
	  options.real           - real prototype method for the `pure` version
	  options.forced         - export even if the native feature is available
	  options.bind           - bind methods to the target, required for the `pure` version
	  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
	  options.sham           - add a flag to not completely full polyfills
	  options.enumerable     - export as enumerable property
	  options.dontCallGetSet - prevent calling a getter on target
	  options.name           - the .name of the function if it does not match the key
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global$2;
	  } else if (STATIC) {
	    target = global$2[TARGET] || defineGlobalProperty(TARGET, {});
	  } else {
	    target = (global$2[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.dontCallGetSet) {
	      descriptor = getOwnPropertyDescriptor(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty$3(sourceProperty, 'sham', true);
	    }
	    defineBuiltIn$5(target, key, sourceProperty, options);
	  }
	};

	var objectDefineProperties = {};

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys$1 = enumBugKeys$3;

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$1 = Object.keys || function keys(O) {
	  return internalObjectKeys(O, enumBugKeys$1);
	};

	var DESCRIPTORS$1 = descriptors;
	var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
	var definePropertyModule$1 = objectDefineProperty;
	var anObject$8 = anObject$d;
	var toIndexedObject$2 = toIndexedObject$6;
	var objectKeys = objectKeys$1;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	objectDefineProperties.f = DESCRIPTORS$1 && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject$8(O);
	  var props = toIndexedObject$2(Properties);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule$1.f(O, key = keys[index++], props[key]);
	  return O;
	};

	var getBuiltIn$2 = getBuiltIn$7;

	var html$1 = getBuiltIn$2('document', 'documentElement');

	/* global ActiveXObject -- old IE, WSH */

	var anObject$7 = anObject$d;
	var definePropertiesModule = objectDefineProperties;
	var enumBugKeys = enumBugKeys$3;
	var hiddenKeys = hiddenKeys$4;
	var html = html$1;
	var documentCreateElement$1 = documentCreateElement$2;
	var sharedKey$1 = sharedKey$3;

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey$1('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement$1('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	// eslint-disable-next-line es/no-object-create -- safe
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject$7(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
	};

	/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
	/* eslint-disable regexp/no-useless-quantifier -- testing */
	var call$9 = functionCall;
	var uncurryThis$a = functionUncurryThis;
	var toString$5 = toString$7;
	var regexpFlags = regexpFlags$1;
	var stickyHelpers = regexpStickyHelpers;
	var shared = shared$4.exports;
	var create$1 = objectCreate;
	var getInternalState$2 = internalState.get;
	var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
	var UNSUPPORTED_NCG = regexpUnsupportedNcg;

	var nativeReplace = shared('native-string-replace', String.prototype.replace);
	var nativeExec = RegExp.prototype.exec;
	var patchedExec = nativeExec;
	var charAt$5 = uncurryThis$a(''.charAt);
	var indexOf = uncurryThis$a(''.indexOf);
	var replace$2 = uncurryThis$a(''.replace);
	var stringSlice$3 = uncurryThis$a(''.slice);

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  call$9(nativeExec, re1, 'a');
	  call$9(nativeExec, re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

	if (PATCH) {
	  patchedExec = function exec(string) {
	    var re = this;
	    var state = getInternalState$2(re);
	    var str = toString$5(string);
	    var raw = state.raw;
	    var result, reCopy, lastIndex, match, i, object, group;

	    if (raw) {
	      raw.lastIndex = re.lastIndex;
	      result = call$9(patchedExec, raw, str);
	      re.lastIndex = raw.lastIndex;
	      return result;
	    }

	    var groups = state.groups;
	    var sticky = UNSUPPORTED_Y && re.sticky;
	    var flags = call$9(regexpFlags, re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = replace$2(flags, 'y', '');
	      if (indexOf(flags, 'g') === -1) {
	        flags += 'g';
	      }

	      strCopy = stringSlice$3(str, re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$5(str, re.lastIndex - 1) !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = call$9(nativeExec, sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = stringSlice$3(match.input, charsAdded);
	        match[0] = stringSlice$3(match[0], charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
	      call$9(nativeReplace, match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    if (match && groups) {
	      match.groups = object = create$1(null);
	      for (i = 0; i < groups.length; i++) {
	        group = groups[i];
	        object[group[0]] = match[group[1]];
	      }
	    }

	    return match;
	  };
	}

	var regexpExec$2 = patchedExec;

	var $$8 = _export;
	var exec$2 = regexpExec$2;

	// `RegExp.prototype.exec` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.exec
	$$8({ target: 'RegExp', proto: true, forced: /./.exec !== exec$2 }, {
	  exec: exec$2
	});

	var makeBuiltIn = makeBuiltIn$3.exports;
	var defineProperty$1 = objectDefineProperty;

	var defineBuiltInAccessor$1 = function (target, name, descriptor) {
	  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
	  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
	  return defineProperty$1.f(target, name, descriptor);
	};

	var DESCRIPTORS = descriptors;
	var MISSED_STICKY = regexpStickyHelpers.MISSED_STICKY;
	var classof$5 = classofRaw$1;
	var defineBuiltInAccessor = defineBuiltInAccessor$1;
	var getInternalState$1 = internalState.get;

	var RegExpPrototype$2 = RegExp.prototype;
	var $TypeError$3 = TypeError;

	// `RegExp.prototype.sticky` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
	if (DESCRIPTORS && MISSED_STICKY) {
	  defineBuiltInAccessor(RegExpPrototype$2, 'sticky', {
	    configurable: true,
	    get: function sticky() {
	      if (this === RegExpPrototype$2) return undefined;
	      // We can't use InternalStateModule.getterFor because
	      // we don't add metadata for regexps created by a literal.
	      if (classof$5(this) === 'RegExp') {
	        return !!getInternalState$1(this).sticky;
	      }
	      throw $TypeError$3('Incompatible receiver, RegExp required');
	    }
	  });
	}

	var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
	var defineBuiltIn$4 = defineBuiltIn$7;
	var anObject$6 = anObject$d;
	var $toString = toString$7;
	var fails$9 = fails$m;
	var getRegExpFlags = regexpGetFlags;

	var TO_STRING = 'toString';
	var RegExpPrototype$1 = RegExp.prototype;
	var nativeToString = RegExpPrototype$1[TO_STRING];

	var NOT_GENERIC = fails$9(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name != TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  defineBuiltIn$4(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject$6(this);
	    var pattern = $toString(R.source);
	    var flags = $toString(getRegExpFlags(R));
	    return '/' + pattern + '/' + flags;
	  }, { unsafe: true });
	}

	var fails$8 = fails$m;

	var arrayMethodIsStrict$2 = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails$8(function () {
	    // eslint-disable-next-line no-useless-call -- required for testing
	    method.call(null, argument || function () { return 1; }, 1);
	  });
	};

	var $$7 = _export;
	var uncurryThis$9 = functionUncurryThis;
	var IndexedObject$1 = indexedObject;
	var toIndexedObject$1 = toIndexedObject$6;
	var arrayMethodIsStrict$1 = arrayMethodIsStrict$2;

	var nativeJoin = uncurryThis$9([].join);

	var ES3_STRINGS = IndexedObject$1 != Object;
	var STRICT_METHOD$1 = arrayMethodIsStrict$1('join', ',');

	// `Array.prototype.join` method
	// https://tc39.es/ecma262/#sec-array.prototype.join
	$$7({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$1 }, {
	  join: function join(separator) {
	    return nativeJoin(toIndexedObject$1(this), separator === undefined ? ',' : separator);
	  }
	});

	var uncurryThis$8 = functionUncurryThis;
	var aCallable$1 = aCallable$3;
	var NATIVE_BIND$1 = functionBindNative;

	var bind$2 = uncurryThis$8(uncurryThis$8.bind);

	// optional / simple context binding
	var functionBindContext = function (fn, that) {
	  aCallable$1(fn);
	  return that === undefined ? fn : NATIVE_BIND$1 ? bind$2(fn, that) : function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var classof$4 = classofRaw$1;

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray$4 = Array.isArray || function isArray(argument) {
	  return classof$4(argument) == 'Array';
	};

	var uncurryThis$7 = functionUncurryThis;
	var fails$7 = fails$m;
	var isCallable$6 = isCallable$k;
	var classof$3 = classof$7;
	var getBuiltIn$1 = getBuiltIn$7;
	var inspectSource = inspectSource$2;

	var noop = function () { /* empty */ };
	var empty = [];
	var construct = getBuiltIn$1('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec$1 = uncurryThis$7(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

	var isConstructorModern = function isConstructor(argument) {
	  if (!isCallable$6(argument)) return false;
	  try {
	    construct(noop, empty, argument);
	    return true;
	  } catch (error) {
	    return false;
	  }
	};

	var isConstructorLegacy = function isConstructor(argument) {
	  if (!isCallable$6(argument)) return false;
	  switch (classof$3(argument)) {
	    case 'AsyncFunction':
	    case 'GeneratorFunction':
	    case 'AsyncGeneratorFunction': return false;
	  }
	  try {
	    // we can't check .prototype since constructors produced by .bind haven't it
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    return INCORRECT_TO_STRING || !!exec$1(constructorRegExp, inspectSource(argument));
	  } catch (error) {
	    return true;
	  }
	};

	isConstructorLegacy.sham = true;

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	var isConstructor$3 = !construct || fails$7(function () {
	  var called;
	  return isConstructorModern(isConstructorModern.call)
	    || !isConstructorModern(Object)
	    || !isConstructorModern(function () { called = true; })
	    || called;
	}) ? isConstructorLegacy : isConstructorModern;

	var isArray$3 = isArray$4;
	var isConstructor$2 = isConstructor$3;
	var isObject$4 = isObject$c;
	var wellKnownSymbol$b = wellKnownSymbol$i;

	var SPECIES$3 = wellKnownSymbol$b('species');
	var $Array$2 = Array;

	// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesConstructor$1 = function (originalArray) {
	  var C;
	  if (isArray$3(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (isConstructor$2(C) && (C === $Array$2 || isArray$3(C.prototype))) C = undefined;
	    else if (isObject$4(C)) {
	      C = C[SPECIES$3];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? $Array$2 : C;
	};

	var arraySpeciesConstructor = arraySpeciesConstructor$1;

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate$2 = function (originalArray, length) {
	  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};

	var bind$1 = functionBindContext;
	var uncurryThis$6 = functionUncurryThis;
	var IndexedObject = indexedObject;
	var toObject$4 = toObject$6;
	var lengthOfArrayLike$3 = lengthOfArrayLike$5;
	var arraySpeciesCreate$1 = arraySpeciesCreate$2;

	var push$1 = uncurryThis$6([].push);

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var IS_FILTER_REJECT = TYPE == 7;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject$4($this);
	    var self = IndexedObject(O);
	    var boundFunction = bind$1(callbackfn, that);
	    var length = lengthOfArrayLike$3(self);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate$1;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push$1(target, value);      // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push$1(target, value);      // filterReject
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6),
	  // `Array.prototype.filterReject` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterReject: createMethod$1(7)
	};

	var fails$6 = fails$m;
	var wellKnownSymbol$a = wellKnownSymbol$i;
	var V8_VERSION$1 = engineV8Version;

	var SPECIES$2 = wellKnownSymbol$a('species');

	var arrayMethodHasSpeciesSupport$4 = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return V8_VERSION$1 >= 51 || !fails$6(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$2] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var $$6 = _export;
	var $filter = arrayIteration.filter;
	var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$4;

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$3('filter');

	// `Array.prototype.filter` method
	// https://tc39.es/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	$$6({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
	var classof$2 = classof$7;

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
	  return '[object ' + classof$2(this) + ']';
	};

	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var defineBuiltIn$3 = defineBuiltIn$7;
	var toString$4 = objectToString;

	// `Object.prototype.toString` method
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	if (!TO_STRING_TAG_SUPPORT) {
	  defineBuiltIn$3(Object.prototype, 'toString', toString$4, { unsafe: true });
	}

	var call$8 = functionCall;
	var anObject$5 = anObject$d;
	var getMethod$3 = getMethod$5;

	var iteratorClose$1 = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject$5(iterator);
	  try {
	    innerResult = getMethod$3(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = call$8(innerResult, iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject$5(innerResult);
	  return value;
	};

	var anObject$4 = anObject$d;
	var iteratorClose = iteratorClose$1;

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject$4(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose(iterator, 'throw', error);
	  }
	};

	var iterators = {};

	var wellKnownSymbol$9 = wellKnownSymbol$i;
	var Iterators$3 = iterators;

	var ITERATOR$4 = wellKnownSymbol$9('iterator');
	var ArrayPrototype = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod$1 = function (it) {
	  return it !== undefined && (Iterators$3.Array === it || ArrayPrototype[ITERATOR$4] === it);
	};

	var toPropertyKey = toPropertyKey$3;
	var definePropertyModule = objectDefineProperty;
	var createPropertyDescriptor$1 = createPropertyDescriptor$4;

	var createProperty$3 = function (object, key, value) {
	  var propertyKey = toPropertyKey(key);
	  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor$1(0, value));
	  else object[propertyKey] = value;
	};

	var classof$1 = classof$7;
	var getMethod$2 = getMethod$5;
	var isNullOrUndefined$2 = isNullOrUndefined$5;
	var Iterators$2 = iterators;
	var wellKnownSymbol$8 = wellKnownSymbol$i;

	var ITERATOR$3 = wellKnownSymbol$8('iterator');

	var getIteratorMethod$2 = function (it) {
	  if (!isNullOrUndefined$2(it)) return getMethod$2(it, ITERATOR$3)
	    || getMethod$2(it, '@@iterator')
	    || Iterators$2[classof$1(it)];
	};

	var call$7 = functionCall;
	var aCallable = aCallable$3;
	var anObject$3 = anObject$d;
	var tryToString = tryToString$2;
	var getIteratorMethod$1 = getIteratorMethod$2;

	var $TypeError$2 = TypeError;

	var getIterator$1 = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$1(argument) : usingIterator;
	  if (aCallable(iteratorMethod)) return anObject$3(call$7(iteratorMethod, argument));
	  throw $TypeError$2(tryToString(argument) + ' is not iterable');
	};

	var bind = functionBindContext;
	var call$6 = functionCall;
	var toObject$3 = toObject$6;
	var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
	var isArrayIteratorMethod = isArrayIteratorMethod$1;
	var isConstructor$1 = isConstructor$3;
	var lengthOfArrayLike$2 = lengthOfArrayLike$5;
	var createProperty$2 = createProperty$3;
	var getIterator = getIterator$1;
	var getIteratorMethod = getIteratorMethod$2;

	var $Array$1 = Array;

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject$3(arrayLike);
	  var IS_CONSTRUCTOR = isConstructor$1(this);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod && !(this === $Array$1 && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    result = IS_CONSTRUCTOR ? new this() : [];
	    for (;!(step = call$6(next, iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty$2(result, index, value);
	    }
	  } else {
	    length = lengthOfArrayLike$2(O);
	    result = IS_CONSTRUCTOR ? new this(length) : $Array$1(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty$2(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var wellKnownSymbol$7 = wellKnownSymbol$i;

	var ITERATOR$2 = wellKnownSymbol$7('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  };
	  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration$1 = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var $$5 = _export;
	var from = arrayFrom;
	var checkCorrectnessOfIteration = checkCorrectnessOfIteration$1;

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  // eslint-disable-next-line es/no-array-from -- required for testing
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	$$5({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: from
	});

	var uncurryThis$5 = functionUncurryThis;
	var toIntegerOrInfinity$1 = toIntegerOrInfinity$4;
	var toString$3 = toString$7;
	var requireObjectCoercible$2 = requireObjectCoercible$5;

	var charAt$4 = uncurryThis$5(''.charAt);
	var charCodeAt$1 = uncurryThis$5(''.charCodeAt);
	var stringSlice$2 = uncurryThis$5(''.slice);

	var createMethod = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = toString$3(requireObjectCoercible$2($this));
	    var position = toIntegerOrInfinity$1(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = charCodeAt$1(S, position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = charCodeAt$1(S, position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING
	          ? charAt$4(S, position)
	          : first
	        : CONVERT_TO_STRING
	          ? stringSlice$2(S, position, position + 2)
	          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod(true)
	};

	var fails$5 = fails$m;

	var correctPrototypeGetter = !fails$5(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var hasOwn$1 = hasOwnProperty_1;
	var isCallable$5 = isCallable$k;
	var toObject$2 = toObject$6;
	var sharedKey = sharedKey$3;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var IE_PROTO = sharedKey('IE_PROTO');
	var $Object = Object;
	var ObjectPrototype = $Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
	  var object = toObject$2(O);
	  if (hasOwn$1(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable$5(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof $Object ? ObjectPrototype : null;
	};

	var fails$4 = fails$m;
	var isCallable$4 = isCallable$k;
	var isObject$3 = isObject$c;
	var getPrototypeOf$1 = objectGetPrototypeOf;
	var defineBuiltIn$2 = defineBuiltIn$7;
	var wellKnownSymbol$6 = wellKnownSymbol$i;

	var ITERATOR$1 = wellKnownSymbol$6('iterator');
	var BUGGY_SAFARI_ITERATORS$1 = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = !isObject$3(IteratorPrototype$2) || fails$4(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$2[ITERATOR$1].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable$4(IteratorPrototype$2[ITERATOR$1])) {
	  defineBuiltIn$2(IteratorPrototype$2, ITERATOR$1, function () {
	    return this;
	  });
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$2,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
	};

	var defineProperty = objectDefineProperty.f;
	var hasOwn = hasOwnProperty_1;
	var wellKnownSymbol$5 = wellKnownSymbol$i;

	var TO_STRING_TAG = wellKnownSymbol$5('toStringTag');

	var setToStringTag$2 = function (target, TAG, STATIC) {
	  if (target && !STATIC) target = target.prototype;
	  if (target && !hasOwn(target, TO_STRING_TAG)) {
	    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
	var create = objectCreate;
	var createPropertyDescriptor = createPropertyDescriptor$4;
	var setToStringTag$1 = setToStringTag$2;
	var Iterators$1 = iterators;

	var returnThis$1 = function () { return this; };

	var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = create(IteratorPrototype$1, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
	  setToStringTag$1(IteratorConstructor, TO_STRING_TAG, false);
	  Iterators$1[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var $$4 = _export;
	var call$5 = functionCall;
	var FunctionName = functionName;
	var isCallable$3 = isCallable$k;
	var createIteratorConstructor = iteratorCreateConstructor;
	var getPrototypeOf = objectGetPrototypeOf;
	var setPrototypeOf = objectSetPrototypeOf;
	var setToStringTag = setToStringTag$2;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$6;
	var defineBuiltIn$1 = defineBuiltIn$7;
	var wellKnownSymbol$4 = wellKnownSymbol$i;
	var Iterators = iterators;
	var IteratorsCore = iteratorsCore;

	var PROPER_FUNCTION_NAME = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR = wellKnownSymbol$4('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
	        if (setPrototypeOf) {
	          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
	        } else if (!isCallable$3(CurrentIteratorPrototype[ITERATOR])) {
	          defineBuiltIn$1(CurrentIteratorPrototype, ITERATOR, returnThis);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	  if (PROPER_FUNCTION_NAME && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    if (CONFIGURABLE_FUNCTION_NAME) {
	      createNonEnumerableProperty$2(IterablePrototype, 'name', VALUES);
	    } else {
	      INCORRECT_VALUES_NAME = true;
	      defaultIterator = function values() { return call$5(nativeIterator, this); };
	    }
	  }

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        defineBuiltIn$1(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else $$4({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  // define iterator
	  if (IterablePrototype[ITERATOR] !== defaultIterator) {
	    defineBuiltIn$1(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
	  }
	  Iterators[NAME] = defaultIterator;

	  return methods;
	};

	// `CreateIterResultObject` abstract operation
	// https://tc39.es/ecma262/#sec-createiterresultobject
	var createIterResultObject$1 = function (value, done) {
	  return { value: value, done: done };
	};

	var charAt$3 = stringMultibyte.charAt;
	var toString$2 = toString$7;
	var InternalStateModule = internalState;
	var defineIterator = iteratorDefine;
	var createIterResultObject = createIterResultObject$1;

	var STRING_ITERATOR = 'String Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState(this, {
	    type: STRING_ITERATOR,
	    string: toString$2(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt$3(string, index);
	  state.index += point.length;
	  return createIterResultObject(point, false);
	});

	//Called on window load event
	function main() {
	  var w = window,
	      d = document,
	      html = d.querySelector('html');
	  /**
	   * Add the class selected to the menu item according to the loaded page
	   */

	  try {
	    Array.from(d.querySelectorAll('aside ul.menu a')).filter(function (a) {
	      return w.location.toString().indexOf(a.href) != -1;
	    })[0].classList.add('selected');
	  } catch (e) {}
	  /*
	    .loaded class is added to html.
	    It hides the loader, 
	    reveals the body by transitioning its opacity from 0 to 1
	    and blocks animation on body elements.
	    The class is removed at the end of the transition.
	  */


	  html.addEventListener('transitionend', function clean() {
	    html.classList.remove('loading');
	    html.classList.remove('loaded');
	    html.removeEventListener('transitionend', clean);
	  });
	  html.classList.add('loaded');
	  w.addEventListener('scroll', function (_) {
	    if (d.documentElement.scrollTop > 400) {
	      d.querySelector('.up').classList.add('show');
	    } else {
	      d.querySelector('.up').classList.remove('show');
	    }
	  });
	  d.querySelector('.up').addEventListener('click', function (_) {
	    w.scrollTo(0, 0);
	  });
	}

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
	var documentCreateElement = documentCreateElement$2;

	var classList = documentCreateElement('span').classList;
	var DOMTokenListPrototype$1 = classList && classList.constructor && classList.constructor.prototype;

	var domTokenListPrototype = DOMTokenListPrototype$1 === Object.prototype ? undefined : DOMTokenListPrototype$1;

	var $forEach = arrayIteration.forEach;
	var arrayMethodIsStrict = arrayMethodIsStrict$2;

	var STRICT_METHOD = arrayMethodIsStrict('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	} : [].forEach;

	var global$1 = global$f;
	var DOMIterables = domIterables;
	var DOMTokenListPrototype = domTokenListPrototype;
	var forEach = arrayForEach;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$6;

	var handlePrototype = function (CollectionPrototype) {
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
	    createNonEnumerableProperty$1(CollectionPrototype, 'forEach', forEach);
	  } catch (error) {
	    CollectionPrototype.forEach = forEach;
	  }
	};

	for (var COLLECTION_NAME in DOMIterables) {
	  if (DOMIterables[COLLECTION_NAME]) {
	    handlePrototype(global$1[COLLECTION_NAME] && global$1[COLLECTION_NAME].prototype);
	  }
	}

	handlePrototype(DOMTokenListPrototype);

	var $TypeError$1 = TypeError;
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

	var doesNotExceedSafeInteger$1 = function (it) {
	  if (it > MAX_SAFE_INTEGER) throw $TypeError$1('Maximum allowed index exceeded');
	  return it;
	};

	var $$3 = _export;
	var fails$3 = fails$m;
	var isArray$2 = isArray$4;
	var isObject$2 = isObject$c;
	var toObject$1 = toObject$6;
	var lengthOfArrayLike$1 = lengthOfArrayLike$5;
	var doesNotExceedSafeInteger = doesNotExceedSafeInteger$1;
	var createProperty$1 = createProperty$3;
	var arraySpeciesCreate = arraySpeciesCreate$2;
	var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$4;
	var wellKnownSymbol$3 = wellKnownSymbol$i;
	var V8_VERSION = engineV8Version;

	var IS_CONCAT_SPREADABLE = wellKnownSymbol$3('isConcatSpreadable');

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails$3(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$2('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject$2(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray$2(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	$$3({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  concat: function concat(arg) {
	    var O = toObject$1(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = lengthOfArrayLike$1(E);
	        doesNotExceedSafeInteger(n + len);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty$1(A, n, E[k]);
	      } else {
	        doesNotExceedSafeInteger(n + 1);
	        createProperty$1(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var uncurryThis$4 = functionUncurryThis;

	var arraySlice$1 = uncurryThis$4([].slice);

	var $$2 = _export;
	var isArray$1 = isArray$4;
	var isConstructor = isConstructor$3;
	var isObject$1 = isObject$c;
	var toAbsoluteIndex = toAbsoluteIndex$2;
	var lengthOfArrayLike = lengthOfArrayLike$5;
	var toIndexedObject = toIndexedObject$6;
	var createProperty = createProperty$3;
	var wellKnownSymbol$2 = wellKnownSymbol$i;
	var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$4;
	var nativeSlice = arraySlice$1;

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

	var SPECIES$1 = wellKnownSymbol$2('species');
	var $Array = Array;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	$$2({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = lengthOfArrayLike(O);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray$1(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (isConstructor(Constructor) && (Constructor === $Array || isArray$1(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject$1(Constructor)) {
	        Constructor = Constructor[SPECIES$1];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === $Array || Constructor === undefined) {
	        return nativeSlice(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? $Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	//Called on  window load event
	function aside() {
	  var w = window,
	      d = document,
	      b = d.body,
	      needSubMenu = d.querySelectorAll('.content h2[id]').length > 1,
	      menuButton = d.querySelector('#menu-btn');
	  var init = false,
	      windowWith,
	      windowHeight;
	  w.addEventListener('resize', onWindowResize);

	  function onWindowResize() {
	    windowWith = w.visualViewport ? w.visualViewport.width : w.innerWidth || d.documentElement.clientWidth || b.clientWidth;
	    windowHeight = w.visualViewport ? w.visualViewport.height : w.innerHeight || d.documentElement.clientHeight || b.clientHeight;
	  }

	  onWindowResize(); //Hide the menu if window width is less than 1200px

	  menuButton.checked = windowWith < 1200; //We toggle the menu-is-closed class to the body when menu is opened/closed

	  menuButton.addEventListener('change', function (e) {
	    menuButton.checked ? b.classList.add('menu-is-closed') : b.classList.remove('menu-is-closed');
	  });
	  menuButton.dispatchEvent(new CustomEvent('change')); //Building the subMenu if necessary.
	  //subMenu lists all the h2 with an id found in the content.
	  //Each found h2 generates a line with a class whose name is equal to the h2 id.
	  //The line contains a anchor pointing to the h2.
	  //The anchor content is equal to the h2 content.

	  if (needSubMenu) {
	    //https://stackoverflow.com/a/49071358
	    var goToHash = function goToHash() {
	      var event;

	      if (typeof MouseEvent === 'function') {
	        event = new MouseEvent('click', {
	          bubbles: true
	        });
	      } else {
	        //IE11 & co
	        event = document.createEvent('Event');
	        event.initEvent('click', true, true);
	      }

	      d.querySelector(".sub-menu li.".concat(targetHash, " a")).dispatchEvent(event);
	    };

	    var waitForInternalScrollEnd = function waitForInternalScrollEnd() {
	      var pos = d.querySelector(".content h2[id=".concat(targetHash, "]")).getBoundingClientRect().top;

	      if (pos >= -1 && pos <= 1) {
	        internalScroll = false;

	        if (!init) {
	          d.querySelector('html').classList.add('smooth-scroll');
	          init = true;
	        }
	      } else {
	        if (!init && pos == lastPos) goToHash(); //IE11

	        w.requestAnimationFrame(waitForInternalScrollEnd);
	      }

	      lastPos = pos;
	    };

	    var onOptimizedScroll = function onOptimizedScroll() {
	      if (!internalScroll) {
	        var myH2 = Array.from(d.querySelectorAll('.content h2[id]')).filter(function (h) {
	          return h.getBoundingClientRect().top <= 1;
	        }).slice(-1)[0];

	        if (myH2 && myHash() != myH2.getAttribute('id')) {
	          var location = w.location.toString().split('#')[0];
	          history.replaceState(null, null, location + '#' + myH2.getAttribute('id'));
	          updateHashSubMenu();
	        }
	      }
	    };

	    var updateHashSubMenu = function updateHashSubMenu() {
	      var hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : myHash();

	      if (d.querySelector('.sub-menu .active')) {
	        d.querySelector('.sub-menu .active').classList.remove('active');
	      }

	      d.querySelector(".sub-menu .".concat(hash)).classList.add('active');
	      var r = d.querySelector(".sub-menu .".concat(hash)).getBoundingClientRect(),
	          aside = d.querySelector('.aside'),
	          margin = 20,
	          top = r.height + r.top + aside.scrollTop + margin - windowHeight;
	      if (r.top > windowHeight || r.top < 60) aside.scrollTop = top;
	    };

	    if (history.scrollRestoration) {
	      history.scrollRestoration = 'manual';
	    }

	    var myHash = function myHash() {
	      return w.location.hash.substring(1);
	    };

	    var lastPos = 0,
	        internalScroll = false,
	        userScroll = false,
	        targetHash = myHash(); //If there is no hash, hash is set to the first anchor found in the content

	    if (!targetHash) targetHash = d.querySelector('.content h2[id]').getAttribute('id');
	    var subMenuHtml = '<ul class="sub-menu">';
	    Array.from(d.querySelectorAll('.content h2')).forEach(function (h) {
	      subMenuHtml += "<li class=\"".concat(h.getAttribute('id'), "\"><a href=\"#").concat(h.getAttribute('id'), "\">").concat(h.innerHTML, "</a></li>");
	    });
	    subMenuHtml += '</ul>';
	    d.querySelector('aside .aside').insertAdjacentHTML('beforeend', subMenuHtml);
	    Array.from(d.querySelectorAll('.sub-menu li')).forEach(function (l) {
	      l.addEventListener('click', function () {
	        if (this.classList.contains('active')) {
	          return;
	        } else {
	          internalScroll = true;
	          targetHash = this.getAttribute('class');
	          updateHashSubMenu(targetHash);
	          waitForInternalScrollEnd();
	          if (windowWith < 600) menuButton.checked = true;
	        }
	      });
	    });
	    goToHash();
	    w.addEventListener('scroll', function (_) {
	      if (userScroll || internalScroll) return;
	      userScroll = true;
	      requestAnimationFrame(function () {
	        w.dispatchEvent(new CustomEvent('amst__scroll'));
	        userScroll = false;
	      });
	    });
	    w.addEventListener('amst__scroll', onOptimizedScroll);
	  }
	}

	//Called on  window load event
	//Insert a COPY button in each code container with a copy class
	//Copy code to clipboard when button is clicked
	function code() {
	  var w = window,
	      d = document;
	  Array.from(d.querySelectorAll('div.code.copy')).forEach(function (div) {
	    div.insertAdjacentHTML('afterbegin', '<div class="icon-copy"><div class="background"></div><div class="foreground"></div></div>');
	    div.querySelector('.icon-copy').addEventListener('click', function (_) {
	      if (!navigator.clipboard) {
	        try {
	          var range = d.createRange();
	          range.selectNode(div.querySelector('code'));
	          w.getSelection().removeAllRanges(); // clear current selection

	          w.getSelection().addRange(range); // to select text

	          d.execCommand("copy");
	          w.getSelection().removeAllRanges(); // to deselect

	          done();
	        } catch (e) {
	          error();
	        }
	      } else {
	        navigator.clipboard.writeText(div.querySelector('code').innerText).then(done, error);
	      }

	      function done() {
	        div.querySelector('.icon-copy').classList.add('clicked');
	        setTimeout(function (_) {
	          return div.querySelector('.icon-copy').classList.remove('clicked');
	        }, 2000);
	      }

	      function error() {
	        alert("Sorry but I'm unable to copy!!!");
	      }
	    });
	  });
	}

	var $$1 = _export;
	var $map = arrayIteration.map;
	var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$4;

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

	// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	$$1({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var NATIVE_BIND = functionBindNative;

	var FunctionPrototype = Function.prototype;
	var apply$2 = FunctionPrototype.apply;
	var call$4 = FunctionPrototype.call;

	// eslint-disable-next-line es/no-reflect -- safe
	var functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call$4.bind(apply$2) : function () {
	  return call$4.apply(apply$2, arguments);
	});

	// TODO: Remove from `core-js@4` since it's moved to entry points

	var uncurryThis$3 = functionUncurryThis;
	var defineBuiltIn = defineBuiltIn$7;
	var regexpExec$1 = regexpExec$2;
	var fails$2 = fails$m;
	var wellKnownSymbol$1 = wellKnownSymbol$i;
	var createNonEnumerableProperty = createNonEnumerableProperty$6;

	var SPECIES = wellKnownSymbol$1('species');
	var RegExpPrototype = RegExp.prototype;

	var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
	  var SYMBOL = wellKnownSymbol$1(KEY);

	  var DELEGATES_TO_SYMBOL = !fails$2(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$2(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    FORCED
	  ) {
	    var uncurriedNativeRegExpMethod = uncurryThis$3(/./[SYMBOL]);
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      var uncurriedNativeMethod = uncurryThis$3(nativeMethod);
	      var $exec = regexp.exec;
	      if ($exec === regexpExec$1 || $exec === RegExpPrototype.exec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
	        }
	        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
	      }
	      return { done: false };
	    });

	    defineBuiltIn(String.prototype, KEY, methods[0]);
	    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
	  }

	  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
	};

	var charAt$2 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.es/ecma262/#sec-advancestringindex
	var advanceStringIndex$2 = function (S, index, unicode) {
	  return index + (unicode ? charAt$2(S, index).length : 1);
	};

	var uncurryThis$2 = functionUncurryThis;
	var toObject = toObject$6;

	var floor = Math.floor;
	var charAt$1 = uncurryThis$2(''.charAt);
	var replace$1 = uncurryThis$2(''.replace);
	var stringSlice$1 = uncurryThis$2(''.slice);
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

	// `GetSubstitution` abstract operation
	// https://tc39.es/ecma262/#sec-getsubstitution
	var getSubstitution$1 = function (matched, str, position, captures, namedCaptures, replacement) {
	  var tailPos = position + matched.length;
	  var m = captures.length;
	  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	  if (namedCaptures !== undefined) {
	    namedCaptures = toObject(namedCaptures);
	    symbols = SUBSTITUTION_SYMBOLS;
	  }
	  return replace$1(replacement, symbols, function (match, ch) {
	    var capture;
	    switch (charAt$1(ch, 0)) {
	      case '$': return '$';
	      case '&': return matched;
	      case '`': return stringSlice$1(str, 0, position);
	      case "'": return stringSlice$1(str, tailPos);
	      case '<':
	        capture = namedCaptures[stringSlice$1(ch, 1, -1)];
	        break;
	      default: // \d\d?
	        var n = +ch;
	        if (n === 0) return match;
	        if (n > m) {
	          var f = floor(n / 10);
	          if (f === 0) return match;
	          if (f <= m) return captures[f - 1] === undefined ? charAt$1(ch, 1) : captures[f - 1] + charAt$1(ch, 1);
	          return match;
	        }
	        capture = captures[n - 1];
	    }
	    return capture === undefined ? '' : capture;
	  });
	};

	var call$3 = functionCall;
	var anObject$2 = anObject$d;
	var isCallable$2 = isCallable$k;
	var classof = classofRaw$1;
	var regexpExec = regexpExec$2;

	var $TypeError = TypeError;

	// `RegExpExec` abstract operation
	// https://tc39.es/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (isCallable$2(exec)) {
	    var result = call$3(exec, R, S);
	    if (result !== null) anObject$2(result);
	    return result;
	  }
	  if (classof(R) === 'RegExp') return call$3(regexpExec, R, S);
	  throw $TypeError('RegExp#exec called on incompatible receiver');
	};

	var apply$1 = functionApply;
	var call$2 = functionCall;
	var uncurryThis$1 = functionUncurryThis;
	var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
	var fails$1 = fails$m;
	var anObject$1 = anObject$d;
	var isCallable$1 = isCallable$k;
	var isNullOrUndefined$1 = isNullOrUndefined$5;
	var toIntegerOrInfinity = toIntegerOrInfinity$4;
	var toLength$1 = toLength$3;
	var toString$1 = toString$7;
	var requireObjectCoercible$1 = requireObjectCoercible$5;
	var advanceStringIndex$1 = advanceStringIndex$2;
	var getMethod$1 = getMethod$5;
	var getSubstitution = getSubstitution$1;
	var regExpExec$1 = regexpExecAbstract;
	var wellKnownSymbol = wellKnownSymbol$i;

	var REPLACE = wellKnownSymbol('replace');
	var max = Math.max;
	var min = Math.min;
	var concat = uncurryThis$1([].concat);
	var push = uncurryThis$1([].push);
	var stringIndexOf = uncurryThis$1(''.indexOf);
	var stringSlice = uncurryThis$1(''.slice);

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$1(function () {
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
	  return ''.replace(re, '$<a>') !== '7';
	});

	// @@replace logic
	fixRegExpWellKnownSymbolLogic$1('replace', function (_, nativeReplace, maybeCallNative) {
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.es/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible$1(this);
	      var replacer = isNullOrUndefined$1(searchValue) ? undefined : getMethod$1(searchValue, REPLACE);
	      return replacer
	        ? call$2(replacer, searchValue, O, replaceValue)
	        : call$2(nativeReplace, toString$1(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
	    function (string, replaceValue) {
	      var rx = anObject$1(this);
	      var S = toString$1(string);

	      if (
	        typeof replaceValue == 'string' &&
	        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
	        stringIndexOf(replaceValue, '$<') === -1
	      ) {
	        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
	        if (res.done) return res.value;
	      }

	      var functionalReplace = isCallable$1(replaceValue);
	      if (!functionalReplace) replaceValue = toString$1(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regExpExec$1(rx, S);
	        if (result === null) break;

	        push(results, result);
	        if (!global) break;

	        var matchStr = toString$1(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$1(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = toString$1(result[0]);
	        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = concat([matched], captures, position, S);
	          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
	          var replacement = toString$1(apply$1(replaceValue, undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + stringSlice(S, nextSourcePosition);
	    }
	  ];
	}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

	var $ = _export;
	var getBuiltIn = getBuiltIn$7;
	var apply = functionApply;
	var call$1 = functionCall;
	var uncurryThis = functionUncurryThis;
	var fails = fails$m;
	var isArray = isArray$4;
	var isCallable = isCallable$k;
	var isObject = isObject$c;
	var isSymbol = isSymbol$3;
	var arraySlice = arraySlice$1;
	var NATIVE_SYMBOL = symbolConstructorDetection;

	var $stringify = getBuiltIn('JSON', 'stringify');
	var exec = uncurryThis(/./.exec);
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var replace = uncurryThis(''.replace);
	var numberToString = uncurryThis(1.0.toString);

	var tester = /[\uD800-\uDFFF]/g;
	var low = /^[\uD800-\uDBFF]$/;
	var hi = /^[\uDC00-\uDFFF]$/;

	var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
	  var symbol = getBuiltIn('Symbol')();
	  // MS Edge converts symbol values to JSON as {}
	  return $stringify([symbol]) != '[null]'
	    // WebKit converts symbol values to JSON as null
	    || $stringify({ a: symbol }) != '{}'
	    // V8 throws on boxed symbols
	    || $stringify(Object(symbol)) != '{}';
	});

	// https://github.com/tc39/proposal-well-formed-stringify
	var ILL_FORMED_UNICODE = fails(function () {
	  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
	    || $stringify('\uDEAD') !== '"\\udead"';
	});

	var stringifyWithSymbolsFix = function (it, replacer) {
	  var args = arraySlice(arguments);
	  var $replacer = replacer;
	  if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	  if (!isArray(replacer)) replacer = function (key, value) {
	    if (isCallable($replacer)) value = call$1($replacer, this, key, value);
	    if (!isSymbol(value)) return value;
	  };
	  args[1] = replacer;
	  return apply($stringify, null, args);
	};

	var fixIllFormed = function (match, offset, string) {
	  var prev = charAt(string, offset - 1);
	  var next = charAt(string, offset + 1);
	  if ((exec(low, match) && !exec(hi, next)) || (exec(hi, match) && !exec(low, prev))) {
	    return '\\u' + numberToString(charCodeAt(match, 0), 16);
	  } return match;
	};

	if ($stringify) {
	  // `JSON.stringify` method
	  // https://tc39.es/ecma262/#sec-json.stringify
	  $({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
	    // eslint-disable-next-line no-unused-vars -- required for `.length`
	    stringify: function stringify(it, replacer, space) {
	      var args = arraySlice(arguments);
	      var result = apply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
	      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
	    }
	  });
	}

	var call = functionCall;
	var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
	var anObject = anObject$d;
	var isNullOrUndefined = isNullOrUndefined$5;
	var toLength = toLength$3;
	var toString = toString$7;
	var requireObjectCoercible = requireObjectCoercible$5;
	var getMethod = getMethod$5;
	var advanceStringIndex = advanceStringIndex$2;
	var regExpExec = regexpExecAbstract;

	// @@match logic
	fixRegExpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.es/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, MATCH);
	      return matcher ? call(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
	    function (string) {
	      var rx = anObject(this);
	      var S = toString(string);
	      var res = maybeCallNative(nativeMatch, rx, S);

	      if (res.done) return res.value;

	      if (!rx.global) return regExpExec(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regExpExec(rx, S)) !== null) {
	        var matchStr = toString(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var prismCore = {exports: {}};

	(function (module) {
	  /// <reference lib="WebWorker"/>
	  var _self = typeof window !== 'undefined' ? window // if in browser
	  : typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self // if in worker
	  : {} // if in node js
	  ;
	  /**
	   * Prism: Lightweight, robust, elegant syntax highlighting
	   *
	   * @license MIT <https://opensource.org/licenses/MIT>
	   * @author Lea Verou <https://lea.verou.me>
	   * @namespace
	   * @public
	   */


	  var Prism = function (_self) {
	    // Private helper vars
	    var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
	    var uniqueId = 0; // The grammar object for plaintext

	    var plainTextGrammar = {};
	    var _ = {
	      /**
	       * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
	       * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
	       * additional languages or plugins yourself.
	       *
	       * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
	       *
	       * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
	       * empty Prism object into the global scope before loading the Prism script like this:
	       *
	       * ```js
	       * window.Prism = window.Prism || {};
	       * Prism.manual = true;
	       * // add a new <script> to load Prism's script
	       * ```
	       *
	       * @default false
	       * @type {boolean}
	       * @memberof Prism
	       * @public
	       */
	      manual: _self.Prism && _self.Prism.manual,

	      /**
	       * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
	       * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
	       * own worker, you don't want it to do this.
	       *
	       * By setting this value to `true`, Prism will not add its own listeners to the worker.
	       *
	       * You obviously have to change this value before Prism executes. To do this, you can add an
	       * empty Prism object into the global scope before loading the Prism script like this:
	       *
	       * ```js
	       * window.Prism = window.Prism || {};
	       * Prism.disableWorkerMessageHandler = true;
	       * // Load Prism's script
	       * ```
	       *
	       * @default false
	       * @type {boolean}
	       * @memberof Prism
	       * @public
	       */
	      disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

	      /**
	       * A namespace for utility methods.
	       *
	       * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
	       * change or disappear at any time.
	       *
	       * @namespace
	       * @memberof Prism
	       */
	      util: {
	        encode: function encode(tokens) {
	          if (tokens instanceof Token) {
	            return new Token(tokens.type, encode(tokens.content), tokens.alias);
	          } else if (Array.isArray(tokens)) {
	            return tokens.map(encode);
	          } else {
	            return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
	          }
	        },

	        /**
	         * Returns the name of the type of the given value.
	         *
	         * @param {any} o
	         * @returns {string}
	         * @example
	         * type(null)      === 'Null'
	         * type(undefined) === 'Undefined'
	         * type(123)       === 'Number'
	         * type('foo')     === 'String'
	         * type(true)      === 'Boolean'
	         * type([1, 2])    === 'Array'
	         * type({})        === 'Object'
	         * type(String)    === 'Function'
	         * type(/abc+/)    === 'RegExp'
	         */
	        type: function type(o) {
	          return Object.prototype.toString.call(o).slice(8, -1);
	        },

	        /**
	         * Returns a unique number for the given object. Later calls will still return the same number.
	         *
	         * @param {Object} obj
	         * @returns {number}
	         */
	        objId: function objId(obj) {
	          if (!obj['__id']) {
	            Object.defineProperty(obj, '__id', {
	              value: ++uniqueId
	            });
	          }

	          return obj['__id'];
	        },

	        /**
	         * Creates a deep clone of the given object.
	         *
	         * The main intended use of this function is to clone language definitions.
	         *
	         * @param {T} o
	         * @param {Record<number, any>} [visited]
	         * @returns {T}
	         * @template T
	         */
	        clone: function deepClone(o, visited) {
	          visited = visited || {};
	          var clone;
	          var id;

	          switch (_.util.type(o)) {
	            case 'Object':
	              id = _.util.objId(o);

	              if (visited[id]) {
	                return visited[id];
	              }

	              clone =
	              /** @type {Record<string, any>} */
	              {};
	              visited[id] = clone;

	              for (var key in o) {
	                if (o.hasOwnProperty(key)) {
	                  clone[key] = deepClone(o[key], visited);
	                }
	              }

	              return (
	                /** @type {any} */
	                clone
	              );

	            case 'Array':
	              id = _.util.objId(o);

	              if (visited[id]) {
	                return visited[id];
	              }

	              clone = [];
	              visited[id] = clone;

	              /** @type {Array} */

	              /** @type {any} */
	              o.forEach(function (v, i) {
	                clone[i] = deepClone(v, visited);
	              });
	              return (
	                /** @type {any} */
	                clone
	              );

	            default:
	              return o;
	          }
	        },

	        /**
	         * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
	         *
	         * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
	         *
	         * @param {Element} element
	         * @returns {string}
	         */
	        getLanguage: function getLanguage(element) {
	          while (element) {
	            var m = lang.exec(element.className);

	            if (m) {
	              return m[1].toLowerCase();
	            }

	            element = element.parentElement;
	          }

	          return 'none';
	        },

	        /**
	         * Sets the Prism `language-xxxx` class of the given element.
	         *
	         * @param {Element} element
	         * @param {string} language
	         * @returns {void}
	         */
	        setLanguage: function setLanguage(element, language) {
	          // remove all `language-xxxx` classes
	          // (this might leave behind a leading space)
	          element.className = element.className.replace(RegExp(lang, 'gi'), ''); // add the new `language-xxxx` class
	          // (using `classList` will automatically clean up spaces for us)

	          element.classList.add('language-' + language);
	        },

	        /**
	         * Returns the script element that is currently executing.
	         *
	         * This does __not__ work for line script element.
	         *
	         * @returns {HTMLScriptElement | null}
	         */
	        currentScript: function currentScript() {
	          if (typeof document === 'undefined') {
	            return null;
	          }

	          if ('currentScript' in document && 1 < 2
	          /* hack to trip TS' flow analysis */
	          ) {
	            return (
	              /** @type {any} */
	              document.currentScript
	            );
	          } // IE11 workaround
	          // we'll get the src of the current script by parsing IE11's error stack trace
	          // this will not work for inline scripts


	          try {
	            throw new Error();
	          } catch (err) {
	            // Get file src url from stack. Specifically works with the format of stack traces in IE.
	            // A stack will look like this:
	            //
	            // Error
	            //    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
	            //    at Global code (http://localhost/components/prism-core.js:606:1)
	            var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];

	            if (src) {
	              var scripts = document.getElementsByTagName('script');

	              for (var i in scripts) {
	                if (scripts[i].src == src) {
	                  return scripts[i];
	                }
	              }
	            }

	            return null;
	          }
	        },

	        /**
	         * Returns whether a given class is active for `element`.
	         *
	         * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
	         * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
	         * given class is just the given class with a `no-` prefix.
	         *
	         * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
	         * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
	         * ancestors have the given class or the negated version of it, then the default activation will be returned.
	         *
	         * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
	         * version of it, the class is considered active.
	         *
	         * @param {Element} element
	         * @param {string} className
	         * @param {boolean} [defaultActivation=false]
	         * @returns {boolean}
	         */
	        isActive: function isActive(element, className, defaultActivation) {
	          var no = 'no-' + className;

	          while (element) {
	            var classList = element.classList;

	            if (classList.contains(className)) {
	              return true;
	            }

	            if (classList.contains(no)) {
	              return false;
	            }

	            element = element.parentElement;
	          }

	          return !!defaultActivation;
	        }
	      },

	      /**
	       * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
	       *
	       * @namespace
	       * @memberof Prism
	       * @public
	       */
	      languages: {
	        /**
	         * The grammar for plain, unformatted text.
	         */
	        plain: plainTextGrammar,
	        plaintext: plainTextGrammar,
	        text: plainTextGrammar,
	        txt: plainTextGrammar,

	        /**
	         * Creates a deep copy of the language with the given id and appends the given tokens.
	         *
	         * If a token in `redef` also appears in the copied language, then the existing token in the copied language
	         * will be overwritten at its original position.
	         *
	         * ## Best practices
	         *
	         * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
	         * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
	         * understand the language definition because, normally, the order of tokens matters in Prism grammars.
	         *
	         * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
	         * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
	         *
	         * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
	         * @param {Grammar} redef The new tokens to append.
	         * @returns {Grammar} The new language created.
	         * @public
	         * @example
	         * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
	         *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
	         *     // at its original position
	         *     'comment': { ... },
	         *     // CSS doesn't have a 'color' token, so this token will be appended
	         *     'color': /\b(?:red|green|blue)\b/
	         * });
	         */
	        extend: function extend(id, redef) {
	          var lang = _.util.clone(_.languages[id]);

	          for (var key in redef) {
	            lang[key] = redef[key];
	          }

	          return lang;
	        },

	        /**
	         * Inserts tokens _before_ another token in a language definition or any other grammar.
	         *
	         * ## Usage
	         *
	         * This helper method makes it easy to modify existing languages. For example, the CSS language definition
	         * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
	         * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
	         * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
	         * this:
	         *
	         * ```js
	         * Prism.languages.markup.style = {
	         *     // token
	         * };
	         * ```
	         *
	         * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
	         * before existing tokens. For the CSS example above, you would use it like this:
	         *
	         * ```js
	         * Prism.languages.insertBefore('markup', 'cdata', {
	         *     'style': {
	         *         // token
	         *     }
	         * });
	         * ```
	         *
	         * ## Special cases
	         *
	         * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
	         * will be ignored.
	         *
	         * This behavior can be used to insert tokens after `before`:
	         *
	         * ```js
	         * Prism.languages.insertBefore('markup', 'comment', {
	         *     'comment': Prism.languages.markup.comment,
	         *     // tokens after 'comment'
	         * });
	         * ```
	         *
	         * ## Limitations
	         *
	         * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
	         * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
	         * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
	         * deleting properties which is necessary to insert at arbitrary positions.
	         *
	         * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
	         * Instead, it will create a new object and replace all references to the target object with the new one. This
	         * can be done without temporarily deleting properties, so the iteration order is well-defined.
	         *
	         * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
	         * you hold the target object in a variable, then the value of the variable will not change.
	         *
	         * ```js
	         * var oldMarkup = Prism.languages.markup;
	         * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
	         *
	         * assert(oldMarkup !== Prism.languages.markup);
	         * assert(newMarkup === Prism.languages.markup);
	         * ```
	         *
	         * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
	         * object to be modified.
	         * @param {string} before The key to insert before.
	         * @param {Grammar} insert An object containing the key-value pairs to be inserted.
	         * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
	         * object to be modified.
	         *
	         * Defaults to `Prism.languages`.
	         * @returns {Grammar} The new grammar object.
	         * @public
	         */
	        insertBefore: function insertBefore(inside, before, insert, root) {
	          root = root ||
	          /** @type {any} */
	          _.languages;
	          var grammar = root[inside];
	          /** @type {Grammar} */

	          var ret = {};

	          for (var token in grammar) {
	            if (grammar.hasOwnProperty(token)) {
	              if (token == before) {
	                for (var newToken in insert) {
	                  if (insert.hasOwnProperty(newToken)) {
	                    ret[newToken] = insert[newToken];
	                  }
	                }
	              } // Do not insert token which also occur in insert. See #1525


	              if (!insert.hasOwnProperty(token)) {
	                ret[token] = grammar[token];
	              }
	            }
	          }

	          var old = root[inside];
	          root[inside] = ret; // Update references in other language definitions

	          _.languages.DFS(_.languages, function (key, value) {
	            if (value === old && key != inside) {
	              this[key] = ret;
	            }
	          });

	          return ret;
	        },
	        // Traverse a language definition with Depth First Search
	        DFS: function DFS(o, callback, type, visited) {
	          visited = visited || {};
	          var objId = _.util.objId;

	          for (var i in o) {
	            if (o.hasOwnProperty(i)) {
	              callback.call(o, i, o[i], type || i);
	              var property = o[i];

	              var propertyType = _.util.type(property);

	              if (propertyType === 'Object' && !visited[objId(property)]) {
	                visited[objId(property)] = true;
	                DFS(property, callback, null, visited);
	              } else if (propertyType === 'Array' && !visited[objId(property)]) {
	                visited[objId(property)] = true;
	                DFS(property, callback, i, visited);
	              }
	            }
	          }
	        }
	      },
	      plugins: {},

	      /**
	       * This is the most high-level function in Prism’s API.
	       * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
	       * each one of them.
	       *
	       * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
	       *
	       * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
	       * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
	       * @memberof Prism
	       * @public
	       */
	      highlightAll: function highlightAll(async, callback) {
	        _.highlightAllUnder(document, async, callback);
	      },

	      /**
	       * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
	       * {@link Prism.highlightElement} on each one of them.
	       *
	       * The following hooks will be run:
	       * 1. `before-highlightall`
	       * 2. `before-all-elements-highlight`
	       * 3. All hooks of {@link Prism.highlightElement} for each element.
	       *
	       * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
	       * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
	       * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
	       * @memberof Prism
	       * @public
	       */
	      highlightAllUnder: function highlightAllUnder(container, async, callback) {
	        var env = {
	          callback: callback,
	          container: container,
	          selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
	        };

	        _.hooks.run('before-highlightall', env);

	        env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

	        _.hooks.run('before-all-elements-highlight', env);

	        for (var i = 0, element; element = env.elements[i++];) {
	          _.highlightElement(element, async === true, env.callback);
	        }
	      },

	      /**
	       * Highlights the code inside a single element.
	       *
	       * The following hooks will be run:
	       * 1. `before-sanity-check`
	       * 2. `before-highlight`
	       * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
	       * 4. `before-insert`
	       * 5. `after-highlight`
	       * 6. `complete`
	       *
	       * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
	       * the element's language.
	       *
	       * @param {Element} element The element containing the code.
	       * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
	       * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
	       * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
	       * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
	       *
	       * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
	       * asynchronous highlighting to work. You can build your own bundle on the
	       * [Download page](https://prismjs.com/download.html).
	       * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
	       * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
	       * @memberof Prism
	       * @public
	       */
	      highlightElement: function highlightElement(element, async, callback) {
	        // Find language
	        var language = _.util.getLanguage(element);

	        var grammar = _.languages[language]; // Set language on the element, if not present

	        _.util.setLanguage(element, language); // Set language on the parent, for styling


	        var parent = element.parentElement;

	        if (parent && parent.nodeName.toLowerCase() === 'pre') {
	          _.util.setLanguage(parent, language);
	        }

	        var code = element.textContent;
	        var env = {
	          element: element,
	          language: language,
	          grammar: grammar,
	          code: code
	        };

	        function insertHighlightedCode(highlightedCode) {
	          env.highlightedCode = highlightedCode;

	          _.hooks.run('before-insert', env);

	          env.element.innerHTML = env.highlightedCode;

	          _.hooks.run('after-highlight', env);

	          _.hooks.run('complete', env);

	          callback && callback.call(env.element);
	        }

	        _.hooks.run('before-sanity-check', env); // plugins may change/add the parent/element


	        parent = env.element.parentElement;

	        if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
	          parent.setAttribute('tabindex', '0');
	        }

	        if (!env.code) {
	          _.hooks.run('complete', env);

	          callback && callback.call(env.element);
	          return;
	        }

	        _.hooks.run('before-highlight', env);

	        if (!env.grammar) {
	          insertHighlightedCode(_.util.encode(env.code));
	          return;
	        }

	        if (async && _self.Worker) {
	          var worker = new Worker(_.filename);

	          worker.onmessage = function (evt) {
	            insertHighlightedCode(evt.data);
	          };

	          worker.postMessage(JSON.stringify({
	            language: env.language,
	            code: env.code,
	            immediateClose: true
	          }));
	        } else {
	          insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
	        }
	      },

	      /**
	       * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
	       * and the language definitions to use, and returns a string with the HTML produced.
	       *
	       * The following hooks will be run:
	       * 1. `before-tokenize`
	       * 2. `after-tokenize`
	       * 3. `wrap`: On each {@link Token}.
	       *
	       * @param {string} text A string with the code to be highlighted.
	       * @param {Grammar} grammar An object containing the tokens to use.
	       *
	       * Usually a language definition like `Prism.languages.markup`.
	       * @param {string} language The name of the language definition passed to `grammar`.
	       * @returns {string} The highlighted HTML.
	       * @memberof Prism
	       * @public
	       * @example
	       * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
	       */
	      highlight: function highlight(text, grammar, language) {
	        var env = {
	          code: text,
	          grammar: grammar,
	          language: language
	        };

	        _.hooks.run('before-tokenize', env);

	        if (!env.grammar) {
	          throw new Error('The language "' + env.language + '" has no grammar.');
	        }

	        env.tokens = _.tokenize(env.code, env.grammar);

	        _.hooks.run('after-tokenize', env);

	        return Token.stringify(_.util.encode(env.tokens), env.language);
	      },

	      /**
	       * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
	       * and the language definitions to use, and returns an array with the tokenized code.
	       *
	       * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
	       *
	       * This method could be useful in other contexts as well, as a very crude parser.
	       *
	       * @param {string} text A string with the code to be highlighted.
	       * @param {Grammar} grammar An object containing the tokens to use.
	       *
	       * Usually a language definition like `Prism.languages.markup`.
	       * @returns {TokenStream} An array of strings and tokens, a token stream.
	       * @memberof Prism
	       * @public
	       * @example
	       * let code = `var foo = 0;`;
	       * let tokens = Prism.tokenize(code, Prism.languages.javascript);
	       * tokens.forEach(token => {
	       *     if (token instanceof Prism.Token && token.type === 'number') {
	       *         console.log(`Found numeric literal: ${token.content}`);
	       *     }
	       * });
	       */
	      tokenize: function tokenize(text, grammar) {
	        var rest = grammar.rest;

	        if (rest) {
	          for (var token in rest) {
	            grammar[token] = rest[token];
	          }

	          delete grammar.rest;
	        }

	        var tokenList = new LinkedList();
	        addAfter(tokenList, tokenList.head, text);
	        matchGrammar(text, tokenList, grammar, tokenList.head, 0);
	        return toArray(tokenList);
	      },

	      /**
	       * @namespace
	       * @memberof Prism
	       * @public
	       */
	      hooks: {
	        all: {},

	        /**
	         * Adds the given callback to the list of callbacks for the given hook.
	         *
	         * The callback will be invoked when the hook it is registered for is run.
	         * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
	         *
	         * One callback function can be registered to multiple hooks and the same hook multiple times.
	         *
	         * @param {string} name The name of the hook.
	         * @param {HookCallback} callback The callback function which is given environment variables.
	         * @public
	         */
	        add: function add(name, callback) {
	          var hooks = _.hooks.all;
	          hooks[name] = hooks[name] || [];
	          hooks[name].push(callback);
	        },

	        /**
	         * Runs a hook invoking all registered callbacks with the given environment variables.
	         *
	         * Callbacks will be invoked synchronously and in the order in which they were registered.
	         *
	         * @param {string} name The name of the hook.
	         * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
	         * @public
	         */
	        run: function run(name, env) {
	          var callbacks = _.hooks.all[name];

	          if (!callbacks || !callbacks.length) {
	            return;
	          }

	          for (var i = 0, callback; callback = callbacks[i++];) {
	            callback(env);
	          }
	        }
	      },
	      Token: Token
	    };
	    _self.Prism = _; // Typescript note:
	    // The following can be used to import the Token type in JSDoc:
	    //
	    //   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

	    /**
	     * Creates a new token.
	     *
	     * @param {string} type See {@link Token#type type}
	     * @param {string | TokenStream} content See {@link Token#content content}
	     * @param {string|string[]} [alias] The alias(es) of the token.
	     * @param {string} [matchedStr=""] A copy of the full string this token was created from.
	     * @class
	     * @global
	     * @public
	     */

	    function Token(type, content, alias, matchedStr) {
	      /**
	       * The type of the token.
	       *
	       * This is usually the key of a pattern in a {@link Grammar}.
	       *
	       * @type {string}
	       * @see GrammarToken
	       * @public
	       */
	      this.type = type;
	      /**
	       * The strings or tokens contained by this token.
	       *
	       * This will be a token stream if the pattern matched also defined an `inside` grammar.
	       *
	       * @type {string | TokenStream}
	       * @public
	       */

	      this.content = content;
	      /**
	       * The alias(es) of the token.
	       *
	       * @type {string|string[]}
	       * @see GrammarToken
	       * @public
	       */

	      this.alias = alias; // Copy of the full string this token was created from

	      this.length = (matchedStr || '').length | 0;
	    }
	    /**
	     * A token stream is an array of strings and {@link Token Token} objects.
	     *
	     * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
	     * them.
	     *
	     * 1. No adjacent strings.
	     * 2. No empty strings.
	     *
	     *    The only exception here is the token stream that only contains the empty string and nothing else.
	     *
	     * @typedef {Array<string | Token>} TokenStream
	     * @global
	     * @public
	     */

	    /**
	     * Converts the given token or token stream to an HTML representation.
	     *
	     * The following hooks will be run:
	     * 1. `wrap`: On each {@link Token}.
	     *
	     * @param {string | Token | TokenStream} o The token or token stream to be converted.
	     * @param {string} language The name of current language.
	     * @returns {string} The HTML representation of the token or token stream.
	     * @memberof Token
	     * @static
	     */


	    Token.stringify = function stringify(o, language) {
	      if (typeof o == 'string') {
	        return o;
	      }

	      if (Array.isArray(o)) {
	        var s = '';
	        o.forEach(function (e) {
	          s += stringify(e, language);
	        });
	        return s;
	      }

	      var env = {
	        type: o.type,
	        content: stringify(o.content, language),
	        tag: 'span',
	        classes: ['token', o.type],
	        attributes: {},
	        language: language
	      };
	      var aliases = o.alias;

	      if (aliases) {
	        if (Array.isArray(aliases)) {
	          Array.prototype.push.apply(env.classes, aliases);
	        } else {
	          env.classes.push(aliases);
	        }
	      }

	      _.hooks.run('wrap', env);

	      var attributes = '';

	      for (var name in env.attributes) {
	        attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	      }

	      return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
	    };
	    /**
	     * @param {RegExp} pattern
	     * @param {number} pos
	     * @param {string} text
	     * @param {boolean} lookbehind
	     * @returns {RegExpExecArray | null}
	     */


	    function matchPattern(pattern, pos, text, lookbehind) {
	      pattern.lastIndex = pos;
	      var match = pattern.exec(text);

	      if (match && lookbehind && match[1]) {
	        // change the match to remove the text matched by the Prism lookbehind group
	        var lookbehindLength = match[1].length;
	        match.index += lookbehindLength;
	        match[0] = match[0].slice(lookbehindLength);
	      }

	      return match;
	    }
	    /**
	     * @param {string} text
	     * @param {LinkedList<string | Token>} tokenList
	     * @param {any} grammar
	     * @param {LinkedListNode<string | Token>} startNode
	     * @param {number} startPos
	     * @param {RematchOptions} [rematch]
	     * @returns {void}
	     * @private
	     *
	     * @typedef RematchOptions
	     * @property {string} cause
	     * @property {number} reach
	     */


	    function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
	      for (var token in grammar) {
	        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
	          continue;
	        }

	        var patterns = grammar[token];
	        patterns = Array.isArray(patterns) ? patterns : [patterns];

	        for (var j = 0; j < patterns.length; ++j) {
	          if (rematch && rematch.cause == token + ',' + j) {
	            return;
	          }

	          var patternObj = patterns[j];
	          var inside = patternObj.inside;
	          var lookbehind = !!patternObj.lookbehind;
	          var greedy = !!patternObj.greedy;
	          var alias = patternObj.alias;

	          if (greedy && !patternObj.pattern.global) {
	            // Without the global flag, lastIndex won't work
	            var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
	            patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
	          }
	          /** @type {RegExp} */


	          var pattern = patternObj.pattern || patternObj;

	          for ( // iterate the token list and keep track of the current token/string position
	          var currentNode = startNode.next, pos = startPos; currentNode !== tokenList.tail; pos += currentNode.value.length, currentNode = currentNode.next) {
	            if (rematch && pos >= rematch.reach) {
	              break;
	            }

	            var str = currentNode.value;

	            if (tokenList.length > text.length) {
	              // Something went terribly wrong, ABORT, ABORT!
	              return;
	            }

	            if (str instanceof Token) {
	              continue;
	            }

	            var removeCount = 1; // this is the to parameter of removeBetween

	            var match;

	            if (greedy) {
	              match = matchPattern(pattern, pos, text, lookbehind);

	              if (!match || match.index >= text.length) {
	                break;
	              }

	              var from = match.index;
	              var to = match.index + match[0].length;
	              var p = pos; // find the node that contains the match

	              p += currentNode.value.length;

	              while (from >= p) {
	                currentNode = currentNode.next;
	                p += currentNode.value.length;
	              } // adjust pos (and p)


	              p -= currentNode.value.length;
	              pos = p; // the current node is a Token, then the match starts inside another Token, which is invalid

	              if (currentNode.value instanceof Token) {
	                continue;
	              } // find the last node which is affected by this match


	              for (var k = currentNode; k !== tokenList.tail && (p < to || typeof k.value === 'string'); k = k.next) {
	                removeCount++;
	                p += k.value.length;
	              }

	              removeCount--; // replace with the new match

	              str = text.slice(pos, p);
	              match.index -= pos;
	            } else {
	              match = matchPattern(pattern, 0, str, lookbehind);

	              if (!match) {
	                continue;
	              }
	            } // eslint-disable-next-line no-redeclare


	            var from = match.index;
	            var matchStr = match[0];
	            var before = str.slice(0, from);
	            var after = str.slice(from + matchStr.length);
	            var reach = pos + str.length;

	            if (rematch && reach > rematch.reach) {
	              rematch.reach = reach;
	            }

	            var removeFrom = currentNode.prev;

	            if (before) {
	              removeFrom = addAfter(tokenList, removeFrom, before);
	              pos += before.length;
	            }

	            removeRange(tokenList, removeFrom, removeCount);
	            var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
	            currentNode = addAfter(tokenList, removeFrom, wrapped);

	            if (after) {
	              addAfter(tokenList, currentNode, after);
	            }

	            if (removeCount > 1) {
	              // at least one Token object was removed, so we have to do some rematching
	              // this can only happen if the current pattern is greedy

	              /** @type {RematchOptions} */
	              var nestedRematch = {
	                cause: token + ',' + j,
	                reach: reach
	              };
	              matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch); // the reach might have been extended because of the rematching

	              if (rematch && nestedRematch.reach > rematch.reach) {
	                rematch.reach = nestedRematch.reach;
	              }
	            }
	          }
	        }
	      }
	    }
	    /**
	     * @typedef LinkedListNode
	     * @property {T} value
	     * @property {LinkedListNode<T> | null} prev The previous node.
	     * @property {LinkedListNode<T> | null} next The next node.
	     * @template T
	     * @private
	     */

	    /**
	     * @template T
	     * @private
	     */


	    function LinkedList() {
	      /** @type {LinkedListNode<T>} */
	      var head = {
	        value: null,
	        prev: null,
	        next: null
	      };
	      /** @type {LinkedListNode<T>} */

	      var tail = {
	        value: null,
	        prev: head,
	        next: null
	      };
	      head.next = tail;
	      /** @type {LinkedListNode<T>} */

	      this.head = head;
	      /** @type {LinkedListNode<T>} */

	      this.tail = tail;
	      this.length = 0;
	    }
	    /**
	     * Adds a new node with the given value to the list.
	     *
	     * @param {LinkedList<T>} list
	     * @param {LinkedListNode<T>} node
	     * @param {T} value
	     * @returns {LinkedListNode<T>} The added node.
	     * @template T
	     */


	    function addAfter(list, node, value) {
	      // assumes that node != list.tail && values.length >= 0
	      var next = node.next;
	      var newNode = {
	        value: value,
	        prev: node,
	        next: next
	      };
	      node.next = newNode;
	      next.prev = newNode;
	      list.length++;
	      return newNode;
	    }
	    /**
	     * Removes `count` nodes after the given node. The given node will not be removed.
	     *
	     * @param {LinkedList<T>} list
	     * @param {LinkedListNode<T>} node
	     * @param {number} count
	     * @template T
	     */


	    function removeRange(list, node, count) {
	      var next = node.next;

	      for (var i = 0; i < count && next !== list.tail; i++) {
	        next = next.next;
	      }

	      node.next = next;
	      next.prev = node;
	      list.length -= i;
	    }
	    /**
	     * @param {LinkedList<T>} list
	     * @returns {T[]}
	     * @template T
	     */


	    function toArray(list) {
	      var array = [];
	      var node = list.head.next;

	      while (node !== list.tail) {
	        array.push(node.value);
	        node = node.next;
	      }

	      return array;
	    }

	    if (!_self.document) {
	      if (!_self.addEventListener) {
	        // in Node.js
	        return _;
	      }

	      if (!_.disableWorkerMessageHandler) {
	        // In worker
	        _self.addEventListener('message', function (evt) {
	          var message = JSON.parse(evt.data);
	          var lang = message.language;
	          var code = message.code;
	          var immediateClose = message.immediateClose;

	          _self.postMessage(_.highlight(code, _.languages[lang], lang));

	          if (immediateClose) {
	            _self.close();
	          }
	        }, false);
	      }

	      return _;
	    } // Get current script and highlight


	    var script = _.util.currentScript();

	    if (script) {
	      _.filename = script.src;

	      if (script.hasAttribute('data-manual')) {
	        _.manual = true;
	      }
	    }

	    function highlightAutomaticallyCallback() {
	      if (!_.manual) {
	        _.highlightAll();
	      }
	    }

	    if (!_.manual) {
	      // If the document state is "loading", then we'll use DOMContentLoaded.
	      // If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
	      // DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
	      // might take longer one animation frame to execute which can create a race condition where only some plugins have
	      // been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
	      // See https://github.com/PrismJS/prism/issues/2102
	      var readyState = document.readyState;

	      if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
	        document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
	      } else {
	        if (window.requestAnimationFrame) {
	          window.requestAnimationFrame(highlightAutomaticallyCallback);
	        } else {
	          window.setTimeout(highlightAutomaticallyCallback, 16);
	        }
	      }
	    }

	    return _;
	  }(_self);

	  if (module.exports) {
	    module.exports = Prism;
	  } // hack for components to work correctly in node.js


	  if (typeof commonjsGlobal !== 'undefined') {
	    commonjsGlobal.Prism = Prism;
	  } // some additional documentation/types

	  /**
	   * The expansion of a simple `RegExp` literal to support additional properties.
	   *
	   * @typedef GrammarToken
	   * @property {RegExp} pattern The regular expression of the token.
	   * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
	   * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
	   * @property {boolean} [greedy=false] Whether the token is greedy.
	   * @property {string|string[]} [alias] An optional alias or list of aliases.
	   * @property {Grammar} [inside] The nested grammar of this token.
	   *
	   * The `inside` grammar will be used to tokenize the text value of each token of this kind.
	   *
	   * This can be used to make nested and even recursive language definitions.
	   *
	   * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
	   * each another.
	   * @global
	   * @public
	   */

	  /**
	   * @typedef Grammar
	   * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
	   * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
	   * @global
	   * @public
	   */

	  /**
	   * A function which will invoked after an element was successfully highlighted.
	   *
	   * @callback HighlightCallback
	   * @param {Element} element The element successfully highlighted.
	   * @returns {void}
	   * @global
	   * @public
	   */

	  /**
	   * @callback HookCallback
	   * @param {Object<string, any>} env The environment variables of the hook.
	   * @returns {void}
	   * @global
	   * @public
	   */

	})(prismCore);

	var Prism$1 = prismCore.exports;

	Prism.languages.markup = {
	  'comment': {
	    pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
	    greedy: true
	  },
	  'prolog': {
	    pattern: /<\?[\s\S]+?\?>/,
	    greedy: true
	  },
	  'doctype': {
	    // https://www.w3.org/TR/xml/#NT-doctypedecl
	    pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
	    greedy: true,
	    inside: {
	      'internal-subset': {
	        pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
	        lookbehind: true,
	        greedy: true,
	        inside: null // see below

	      },
	      'string': {
	        pattern: /"[^"]*"|'[^']*'/,
	        greedy: true
	      },
	      'punctuation': /^<!|>$|[[\]]/,
	      'doctype-tag': /^DOCTYPE/i,
	      'name': /[^\s<>'"]+/
	    }
	  },
	  'cdata': {
	    pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
	    greedy: true
	  },
	  'tag': {
	    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
	    greedy: true,
	    inside: {
	      'tag': {
	        pattern: /^<\/?[^\s>\/]+/,
	        inside: {
	          'punctuation': /^<\/?/,
	          'namespace': /^[^\s>\/:]+:/
	        }
	      },
	      'special-attr': [],
	      'attr-value': {
	        pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
	        inside: {
	          'punctuation': [{
	            pattern: /^=/,
	            alias: 'attr-equals'
	          }, {
	            pattern: /^(\s*)["']|["']$/,
	            lookbehind: true
	          }]
	        }
	      },
	      'punctuation': /\/?>/,
	      'attr-name': {
	        pattern: /[^\s>\/]+/,
	        inside: {
	          'namespace': /^[^\s>\/:]+:/
	        }
	      }
	    }
	  },
	  'entity': [{
	    pattern: /&[\da-z]{1,8};/i,
	    alias: 'named-entity'
	  }, /&#x?[\da-f]{1,8};/i]
	};
	Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] = Prism.languages.markup['entity'];
	Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup; // Plugin to make entity title show the real entity, idea by Roman Komarov

	Prism.hooks.add('wrap', function (env) {
	  if (env.type === 'entity') {
	    env.attributes['title'] = env.content.replace(/&amp;/, '&');
	  }
	});
	Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	  /**
	   * Adds an inlined language to markup.
	   *
	   * An example of an inlined language is CSS with `<style>` tags.
	   *
	   * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	   * case insensitive.
	   * @param {string} lang The language key.
	   * @example
	   * addInlined('style', 'css');
	   */
	  value: function addInlined(tagName, lang) {
	    var includedCdataInside = {};
	    includedCdataInside['language-' + lang] = {
	      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
	      lookbehind: true,
	      inside: Prism.languages[lang]
	    };
	    includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;
	    var inside = {
	      'included-cdata': {
	        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
	        inside: includedCdataInside
	      }
	    };
	    inside['language-' + lang] = {
	      pattern: /[\s\S]+/,
	      inside: Prism.languages[lang]
	    };
	    var def = {};
	    def[tagName] = {
	      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () {
	        return tagName;
	      }), 'i'),
	      lookbehind: true,
	      greedy: true,
	      inside: inside
	    };
	    Prism.languages.insertBefore('markup', 'cdata', def);
	  }
	});
	Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
	  /**
	   * Adds an pattern to highlight languages embedded in HTML attributes.
	   *
	   * An example of an inlined language is CSS with `style` attributes.
	   *
	   * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
	   * case insensitive.
	   * @param {string} lang The language key.
	   * @example
	   * addAttribute('style', 'css');
	   */
	  value: function value(attrName, lang) {
	    Prism.languages.markup.tag.inside['special-attr'].push({
	      pattern: RegExp(/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source, 'i'),
	      lookbehind: true,
	      inside: {
	        'attr-name': /^[^\s=]+/,
	        'attr-value': {
	          pattern: /=[\s\S]+/,
	          inside: {
	            'value': {
	              pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
	              lookbehind: true,
	              alias: [lang, 'language-' + lang],
	              inside: Prism.languages[lang]
	            },
	            'punctuation': [{
	              pattern: /^=/,
	              alias: 'attr-equals'
	            }, /"|'/]
	          }
	        }
	      }
	    });
	  }
	});
	Prism.languages.html = Prism.languages.markup;
	Prism.languages.mathml = Prism.languages.markup;
	Prism.languages.svg = Prism.languages.markup;
	Prism.languages.xml = Prism.languages.extend('markup', {});
	Prism.languages.ssml = Prism.languages.xml;
	Prism.languages.atom = Prism.languages.xml;
	Prism.languages.rss = Prism.languages.xml;

	Prism.languages.clike = {
	  'comment': [{
	    pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
	    lookbehind: true,
	    greedy: true
	  }, {
	    pattern: /(^|[^\\:])\/\/.*/,
	    lookbehind: true,
	    greedy: true
	  }],
	  'string': {
	    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	    greedy: true
	  },
	  'class-name': {
	    pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
	    lookbehind: true,
	    inside: {
	      'punctuation': /[.\\]/
	    }
	  },
	  'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
	  'boolean': /\b(?:false|true)\b/,
	  'function': /\b\w+(?=\()/,
	  'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	  'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	  'punctuation': /[{}[\];(),.:]/
	};

	Prism.languages.javascript = Prism.languages.extend('clike', {
	  'class-name': [Prism.languages.clike['class-name'], {
	    pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
	    lookbehind: true
	  }],
	  'keyword': [{
	    pattern: /((?:^|\})\s*)catch\b/,
	    lookbehind: true
	  }, {
	    pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
	    lookbehind: true
	  }],
	  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	  'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	  'number': {
	    pattern: RegExp(/(^|[^\w$])/.source + '(?:' + ( // constant
	    /NaN|Infinity/.source + '|' + // binary integer
	    /0[bB][01]+(?:_[01]+)*n?/.source + '|' + // octal integer
	    /0[oO][0-7]+(?:_[0-7]+)*n?/.source + '|' + // hexadecimal integer
	    /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + '|' + // decimal bigint
	    /\d+(?:_\d+)*n/.source + '|' + // decimal number (integer or float) but no bigint
	    /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source) + ')' + /(?![\w$])/.source),
	    lookbehind: true
	  },
	  'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
	});
	Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;
	Prism.languages.insertBefore('javascript', 'keyword', {
	  'regex': {
	    pattern: RegExp( // lookbehind
	    // eslint-disable-next-line regexp/no-dupe-characters-character-class
	    /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + // Regex pattern:
	    // There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
	    // classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
	    // with the only syntax, so we have to define 2 different regex patterns.
	    /\//.source + '(?:' + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + '|' + // `v` flag syntax. This supports 3 levels of nested character classes.
	    /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ')' + // lookahead
	    /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),
	    lookbehind: true,
	    greedy: true,
	    inside: {
	      'regex-source': {
	        pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
	        lookbehind: true,
	        alias: 'language-regex',
	        inside: Prism.languages.regex
	      },
	      'regex-delimiter': /^\/|\/$/,
	      'regex-flags': /^[a-z]+$/
	    }
	  },
	  // This must be declared before keyword because we use "function" inside the look-forward
	  'function-variable': {
	    pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
	    alias: 'function'
	  },
	  'parameter': [{
	    pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
	    lookbehind: true,
	    inside: Prism.languages.javascript
	  }, {
	    pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
	    lookbehind: true,
	    inside: Prism.languages.javascript
	  }, {
	    pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
	    lookbehind: true,
	    inside: Prism.languages.javascript
	  }, {
	    pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
	    lookbehind: true,
	    inside: Prism.languages.javascript
	  }],
	  'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
	});
	Prism.languages.insertBefore('javascript', 'string', {
	  'hashbang': {
	    pattern: /^#!.*/,
	    greedy: true,
	    alias: 'comment'
	  },
	  'template-string': {
	    pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
	    greedy: true,
	    inside: {
	      'template-punctuation': {
	        pattern: /^`|`$/,
	        alias: 'string'
	      },
	      'interpolation': {
	        pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
	        lookbehind: true,
	        inside: {
	          'interpolation-punctuation': {
	            pattern: /^\$\{|\}$/,
	            alias: 'punctuation'
	          },
	          rest: Prism.languages.javascript
	        }
	      },
	      'string': /[\s\S]+/
	    }
	  },
	  'string-property': {
	    pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
	    lookbehind: true,
	    greedy: true,
	    alias: 'property'
	  }
	});
	Prism.languages.insertBefore('javascript', 'operator', {
	  'literal-property': {
	    pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
	    lookbehind: true,
	    alias: 'property'
	  }
	});

	if (Prism.languages.markup) {
	  Prism.languages.markup.tag.addInlined('script', 'javascript'); // add attribute support for all DOM events.
	  // https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events

	  Prism.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, 'javascript');
	}

	Prism.languages.js = Prism.languages.javascript;

	(function (Prism) {
	  Prism.languages.insertBefore('javascript', 'function-variable', {
	    'method-variable': {
	      pattern: RegExp('(\\.\\s*)' + Prism.languages.javascript['function-variable'].pattern.source),
	      lookbehind: true,
	      alias: ['function-variable', 'method', 'function', 'property-access']
	    }
	  });
	  Prism.languages.insertBefore('javascript', 'function', {
	    'method': {
	      pattern: RegExp('(\\.\\s*)' + Prism.languages.javascript['function'].source),
	      lookbehind: true,
	      alias: ['function', 'property-access']
	    }
	  });
	  Prism.languages.insertBefore('javascript', 'constant', {
	    'known-class-name': [{
	      // standard built-ins
	      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
	      pattern: /\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/,
	      alias: 'class-name'
	    }, {
	      // errors
	      pattern: /\b(?:[A-Z]\w*)Error\b/,
	      alias: 'class-name'
	    }]
	  });
	  /**
	   * Replaces the `<ID>` placeholder in the given pattern with a pattern for general JS identifiers.
	   *
	   * @param {string} source
	   * @param {string} [flags]
	   * @returns {RegExp}
	   */

	  function withId(source, flags) {
	    return RegExp(source.replace(/<ID>/g, function () {
	      return /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/.source;
	    }), flags);
	  }

	  Prism.languages.insertBefore('javascript', 'keyword', {
	    'imports': {
	      // https://tc39.es/ecma262/#sec-imports
	      pattern: withId(/(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/.source),
	      lookbehind: true,
	      inside: Prism.languages.javascript
	    },
	    'exports': {
	      // https://tc39.es/ecma262/#sec-exports
	      pattern: withId(/(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/.source),
	      lookbehind: true,
	      inside: Prism.languages.javascript
	    }
	  });
	  Prism.languages.javascript['keyword'].unshift({
	    pattern: /\b(?:as|default|export|from|import)\b/,
	    alias: 'module'
	  }, {
	    pattern: /\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,
	    alias: 'control-flow'
	  }, {
	    pattern: /\bnull\b/,
	    alias: ['null', 'nil']
	  }, {
	    pattern: /\bundefined\b/,
	    alias: 'nil'
	  });
	  Prism.languages.insertBefore('javascript', 'operator', {
	    'spread': {
	      pattern: /\.{3}/,
	      alias: 'operator'
	    },
	    'arrow': {
	      pattern: /=>/,
	      alias: 'operator'
	    }
	  });
	  Prism.languages.insertBefore('javascript', 'punctuation', {
	    'property-access': {
	      pattern: withId(/(\.\s*)#?<ID>/.source),
	      lookbehind: true
	    },
	    'maybe-class-name': {
	      pattern: /(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,
	      lookbehind: true
	    },
	    'dom': {
	      // this contains only a few commonly used DOM variables
	      pattern: /\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/,
	      alias: 'variable'
	    },
	    'console': {
	      pattern: /\bconsole(?=\s*\.)/,
	      alias: 'class-name'
	    }
	  }); // add 'maybe-class-name' to tokens which might be a class name

	  var maybeClassNameTokens = ['function', 'function-variable', 'method', 'method-variable', 'property-access'];

	  for (var i = 0; i < maybeClassNameTokens.length; i++) {
	    var token = maybeClassNameTokens[i];
	    var value = Prism.languages.javascript[token]; // convert regex to object

	    if (Prism.util.type(value) === 'RegExp') {
	      value = Prism.languages.javascript[token] = {
	        pattern: value
	      };
	    } // keep in mind that we don't support arrays


	    var inside = value.inside || {};
	    value.inside = inside;
	    inside['maybe-class-name'] = /^[A-Z][\s\S]*/;
	  }
	})(Prism);

	// https://www.json.org/json-en.html
	Prism.languages.json = {
	  'property': {
	    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
	    lookbehind: true,
	    greedy: true
	  },
	  'string': {
	    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
	    lookbehind: true,
	    greedy: true
	  },
	  'comment': {
	    pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
	    greedy: true
	  },
	  'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	  'punctuation': /[{}[\],]/,
	  'operator': /:/,
	  'boolean': /\b(?:false|true)\b/,
	  'null': {
	    pattern: /\bnull\b/,
	    alias: 'keyword'
	  }
	};
	Prism.languages.webmanifest = Prism.languages.json;

	window.addEventListener('error', function (e) {
	  console.log(e);
	  var nameModule = window.location.origin + '/js/index.js',
	      nameNoModule = window.location.origin + '/js/noModule/index.js';
	  if (e.filename == nameModule || e.filename == nameNoModule) window.location.href = './error.html';
	}); //Prevent the 'from:' string to be interpreted as a keyword by Prism
	//'from:' is used as option by the plugins posthtml and postcss

	var myStrings = ['from'];
	Prism$1.languages.insertBefore('javascript', 'constant', {
	  'my-strings': {
	    pattern: new RegExp("\\b(?:" + myStrings.join("|") + ")\\b(?=:)")
	  }
	}); //Set all the used variables names as custom keywords for Prism
	//This has to be done before DOM load

	if (window.location.pathname == '/index.html') {
	  var myVars = ['src', 'dev', 'prod', 'dest', 'babelModule', 'babelNoModule', 'moduleExport', 'noModuleExport', 'polyfillExport'];
	  Prism$1.languages.insertBefore('javascript', 'constant', {
	    'my-vars': {
	      pattern: new RegExp("\\b(?:" + myVars.join("|") + ")\\b(?=}?)(?!:)")
	    }
	  });
	} //Prevent Prism to run at startup
	//because we want to add our keywords
	//before it proceeds
	// Prism.manual = true


	window.addEventListener("load", function () {
	  main();
	  aside();
	  code();
	}, false);

})();
