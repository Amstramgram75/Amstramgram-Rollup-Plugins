
if (typeof window.CustomEvent !== "function") {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
  window.CustomEvent = CustomEvent;
}

if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

//Adapted from https://github.com/lifaon74/regexp-polyfill
(function () {
  var NativeRegExp = window.RegExp;

  // https://github.com/commenthol/named-regexp-groups/blob/master/src/index.js
  // https://github.com/slevithan/xregexp/blob/master/src/xregexp.js
  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp
  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String
  var R_NAME = /([a-zA-Z_$][a-zA-Z_$0-9]{0,50})/;
  var R_NAME_REPLACE = new NativeRegExp('\\$<' + R_NAME.source + '>', 'g');
  var R_NAMED_BACKREF = new NativeRegExp('^[?:]&' + R_NAME.source);
  var R_GROUP = new NativeRegExp('^[?:]<' + R_NAME.source + '>([^]*)');
  var R_GROUPS = /([\\]?[()])/g;
  var R_EMPTY_GROUPS = /([^\\]|^)\(\)/g;

  function generate(input, flags) {
    var pattern;

    if (input instanceof NativeRegExp) {
      if (flags === void 0) {
        flags = input.flags;
      }
      pattern = input.source;
    } else {
      pattern = String(input);
    }

    var output = {
      groups: {},
      named: {},
      flags: (flags === void 0) ? '' : String(flags),
      source: '',
      originalSource: pattern
    };

    var store = {
      count: 0,     // counter for unnamed matching group
      groups: [''], // store for named pattern
      names: []     // store for names of capture groups
    };

    var index = 0;
    var groups = pattern.split(R_GROUPS);
    output.source = groups.map(function (part, i) {
      var name;
      var block;
      var isGroup = false;

      switch (part) {
        case '(':
          store.groups.push('');
          store.names.push('');
          break;
        case ')':
          block = store.groups.pop();
          name = store.names.pop();
          if (name) {
            output.named[name] = block.substr(1);
          }
          break;
        default:
          // is it a real group, not a cluster (?:...), or assertion (?=...), (?!...)
          isGroup = groups[i - 1] === '(' && !/^\?[:!=]/.test(part);

          if (isGroup) {
            index++;
            // named capture group check
            name = R_GROUP.exec(part);
            if (name && name[1]) {
              if (!output.groups[name[1]]) {
                store.names[store.names.length - 1] = name[1];
                output.groups[name[1]] = index;
              } else {
                output.groups[store.count++] = index;
              }
              part = name[2] || '';
              if (groups[i + 1] === ')' && !name[2]) {
                part = '[^]+';
              }
            } else {
              // is not a cluster, assertion or named capture group
              output.groups[store.count++] = index;
            }
            // named backreference check
            name = R_NAMED_BACKREF.exec(part);
            if (name && name[1]) {
              part = output.named[name[1]] || '';
            }
          }
          break;
      }

      store.groups = store.groups.map(function (group) {
        return (group + part);
      });

      return part;
    })
      .join('')
      .replace(R_EMPTY_GROUPS, '$1'); // remove any empty groups

    // console.log(output);
    return output;
  }

  var RegExp = function (pattern, flags) {
    if (this instanceof RegExp) {
      var data = generate(pattern, flags);
      var regexp = new NativeRegExp(data.source, data.flags);
      Object.defineProperty(this, '_regexp', { value: regexp });
      Object.defineProperty(this, '_data', { value: data });
    } else {
      return new RegExp(pattern, flags);
    }
  };

  RegExp.toString = function () {
    return 'function RegExp() { [polyfilled code] }';
  }
  RegExp.prototype = {};

  Object.defineProperty(RegExp.prototype, 'lastIndex', {
    enumerable: true,
    get: function () {
      return this._regexp.lastIndex;
    },
    set: function (value) {
      this._regexp.lastIndex = value;
    }
  });

  Object.defineProperty(RegExp.prototype, 'flags', {
    enumerable: true,
    get: function () {
      return this._data.flags;
    }
  });

  Object.defineProperty(RegExp.prototype, 'source', {
    enumerable: true,
    get: function () {
      return this._data.originalSource;
    }
  });

  RegExp.prototype.toString = function () {
    return '/' + this.source + '/' + this.flags;
  };

  RegExp.prototype.exec = function (input) {
    var match = this._regexp.exec(input);
    if (match) {
      match.groups = {};
      var groups = this._data.groups;
      Object.keys(groups).forEach(function (name) {
        match.groups[name] = match[groups[name]];
      });
    }
    return match;
  };

  RegExp.prototype.test = function (input) {
    return this._regexp.test(input);
  };

  RegExp.prototype.constructor = NativeRegExp;

  window.RegExp = RegExp;

  var replace = String.prototype.replace;
  String.prototype.replace = function (regexp, replacement) {
    if (regexp instanceof RegExp) {
      var convertedReplacement;
      switch (typeof replacement) {
        case 'string':
          convertedReplacement = replace.call(replacement, R_NAME_REPLACE, function (match, name) {
            return (name in regexp._data.groups) ? ('$' + regexp._data.groups[name]) : '';
          });
          break;
        case 'function':
          convertedReplacement = replacement.bind(regexp);
          break;
        default:
          return String(replacement);
      }
      return replace.call(this, regexp._regexp, convertedReplacement);
    } else {
      return replace.call(this, regexp, replacement);
    }
  };
})();
