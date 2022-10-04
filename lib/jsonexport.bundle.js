(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsonexport = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* jshint node:true */
  'use strict';

  module.exports = "\n";
  
},{}],2:[function(require,module,exports){
/* jshint node:true */
'use strict';

// Escape the textDelimiters contained in the field
/*(https://tools.ietf.org/html/rfc4180)
   7.  If double-quotes are used to enclose fields, then a double-quote
   appearing inside a field must be escaped by preceding it with
   another double quote.
   For example: "aaa","b""bb","ccc"
*/

module.exports = function escapedDelimiters(textDelimiter, rowDelimiter, forceTextDelimiter) {
  var endOfLine = '\n';

  if (typeof textDelimiter !== 'string') {
    throw new TypeError('Invalid param "textDelimiter", must be a string.');
  }

  if (typeof rowDelimiter !== 'string') {
    throw new TypeError('Invalid param "rowDelimiter", must be a string.');
  }

  var textDelimiterRegex = new RegExp("\\" + textDelimiter, 'g');
  var escapedDelimiter = textDelimiter + textDelimiter;

  var enclosingCondition = textDelimiter === '"' ? function (value) {
    return value.indexOf(rowDelimiter) >= 0 || value.indexOf(endOfLine) >= 0 || value.indexOf('"') >= 0;
  } : function (value) {
    return value.indexOf(rowDelimiter) >= 0 || value.indexOf(endOfLine) >= 0;
  };

  return function (value) {
    if (forceTextDelimiter) value = "" + value;

    if (!value.replace) return value;
    // Escape the textDelimiters contained in the field
    value = value.replace(textDelimiterRegex, escapedDelimiter);

    // Escape the whole field if it contains a rowDelimiter or a linebreak or double quote
    if (forceTextDelimiter || enclosingCondition(value)) {
      value = textDelimiter + value + textDelimiter;
    }

    return value;
  };
};
},{}],3:[function(require,module,exports){
'use strict';

module.exports.isFunction = function (fn) {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
};

module.exports.isArray = function (arr) {
    return Array.isArray(arr);
};

module.exports.isObject = function (obj) {
    return obj instanceof Object;
};

module.exports.isString = function (str) {
    return typeof str === 'string';
};

module.exports.isNumber = function (num) {
    return typeof num === 'number';
};

module.exports.isBoolean = function (bool) {
    return typeof bool === 'boolean';
};

module.exports.isDate = function (date) {
    return date instanceof Date;
};
},{}],4:[function(require,module,exports){
'use strict';

var EOL = require('./eol');
var helper = require('./helper');

module.exports = function joinRows(rows, join) {
  if (!rows || !helper.isArray(rows)) {
    throw new TypeError('Invalid params "rows" for joinRows.' + ' Must be an array of string.');
  }
  //Merge all rows in a single output with the correct End of Line string
  var r = rows.join(join || EOL || '\n');
  return r;
};
},{"./eol":1,"./helper":3}],5:[function(require,module,exports){
/* jshint node:true */
  'use strict';

  var Stream = function (_Transform) {
    throw new Error("jsonexport called without third argument as a callback and is required")
  }

  module.exports = Stream;
  
},{}],6:[function(require,module,exports){
/* jshint node:true */
'use strict';
/**
 * Module dependencies.
 */
//const _ = require('underscore');

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Parser = require('./parser/csv');
var Stream = require('./core/stream');
var helper = require('./core/helper');
var EOL = require('./core/eol');

/**
 * Main function that converts json to csv
 *
 * @param {Object|Array} json
 * @param {Object} [options]
 * @param {Function} callback(err, csv) - Callback function
 *      if error, returning error in call back.
 *      if csv is created successfully, returning csv output to callback.
 */
module.exports = function () {
  var DEFAULT_OPTIONS = {
    headers: [], //              Array
    rename: [], //               Array
    headerPathString: '.', //    String
    rowDelimiter: ',', //        String
    textDelimiter: '"', //       String
    arrayPathString: ';', //     String
    undefinedString: '', //      String
    endOfLine: EOL || '\n', //   String
    mainPathItem: null, //       String
    booleanTrueString: null, //  String
    booleanFalseString: null, // String
    includeHeaders: true, //     Boolean
    fillGaps: false, //          Boolean
    verticalOutput: true, //     Boolean
    forceTextDelimiter: false //Boolean
  };
  // argument parsing
  var json = void 0,
      userOptions = void 0,
      callback = void 0;
  if (arguments.length === 3) {
    var _arguments = Array.prototype.slice.call(arguments);

    json = _arguments[0];
    userOptions = _arguments[1];
    callback = _arguments[2];
  } else if (arguments.length === 2) {
    var any = void 0;

    var _arguments2 = Array.prototype.slice.call(arguments);

    json = _arguments2[0];
    any = _arguments2[1];

    if (typeof any === 'function') {
      callback = any;
    } else if ((typeof any === 'undefined' ? 'undefined' : _typeof(any)) === 'object') {
      userOptions = any;
    }
  } else if (arguments.length === 1) {
    var _arguments3 = Array.prototype.slice.call(arguments),
        _any = _arguments3[0];

    if ((typeof _any === 'undefined' ? 'undefined' : _typeof(_any)) === 'object') {
      var defaultKeys = Object.keys(DEFAULT_OPTIONS);
      var objectKeys = Object.keys(_any);
      var isOptions = objectKeys.every(function (key) {
        return defaultKeys.includes(key);
      });
      if (objectKeys.length > 0 && isOptions) {
        userOptions = _any;
      } else {
        json = _any;
      }
    } else {
      json = _any;
    }
  } else {
    return new Stream(new Parser(DEFAULT_OPTIONS));
  }
  var options = Object.assign({}, DEFAULT_OPTIONS, userOptions);
  var parser = new Parser(options);
  // if no json is provided Stream API will be used
  if (!json) {
    return new Stream(parser);
  }
  // always return an promise
  return new Promise(function (resolve, reject) {
    parser.parse(json, function (err, result) {
      if (callback) return callback(err, result);
      if (err) return reject(err);
      if (reject) return resolve(result);
    });
  });
};
},{"./core/eol":1,"./core/helper":3,"./core/stream":5,"./parser/csv":7}],7:[function(require,module,exports){
/* jshint node:true */
'use strict';

/**
 * Module dependencies.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var joinRows = require('../core/join-rows');
var Handler = require('./handler');
var helper = require('../core/helper');

var Parser = function () {
  function Parser(options) {
    _classCallCheck(this, Parser);

    this._options = options || {};
    this._handler = new Handler(this._options);
    this._headers = this._options.headers || [];
    this._escape = require('../core/escape-delimiters')(this._options.textDelimiter, this._options.rowDelimiter, this._options.forceTextDelimiter);
  }

  /**
   * Generates a CSV file with optional headers based on the passed JSON,
   * with can be an Object or Array.
   *
   * @param {Object|Array} json
   * @param {Function} done(err,csv) - Callback function
   *      if error, returning error in call back.
   *      if csv is created successfully, returning csv output to callback.
   */


  _createClass(Parser, [{
    key: 'parse',
    value: function parse(json, done, stream) {
      if (helper.isArray(json)) return done(null, this._parseArray(json, stream));else if (helper.isObject(json)) return done(null, this._parseObject(json));
      return done(new Error('Unable to parse the JSON object, its not an Array or Object.'));
    }
  }, {
    key: '_checkRows',
    value: function _checkRows(rows) {
      var lastRow = null;
      var finalRows = [];
      var fillGaps = function fillGaps(col, index) {
        return col === '' || col === undefined ? lastRow[index] : col;
      };
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var row = _step.value;

          var missing = this._headers.length - row.length;
          if (missing > 0) row = row.concat(Array(missing).join(".").split("."));
          if (lastRow && this._options.fillGaps) row = row.map(fillGaps);
          finalRows.push(row.join(this._options.rowDelimiter));
          lastRow = row;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return finalRows;
    }
  }, {
    key: '_parseArray',
    value: function _parseArray(json, stream) {
      var self = this;
      this._headers = this._headers || [];
      var fileRows = [];
      var outputFile = void 0;
      var fillRows = void 0;

      var getHeaderIndex = function getHeaderIndex(header) {
        var index = self._headers.indexOf(header);
        if (index === -1) {
          self._headers.push(header);
          index = self._headers.indexOf(header);
        }
        return index;
      };

      //Generate the csv output
      fillRows = function fillRows(result) {
        var rows = [];
        var fillAndPush = function fillAndPush(row) {
          return rows.push(row.map(function (col) {
            return col != null ? col : '';
          }));
        };
        // initialize the array with empty strings to handle 'unpopular' headers
        var newRow = function newRow() {
          return new Array(self._headers.length).fill(null);
        };
        var emptyRowIndexByHeader = {};
        var currentRow = newRow();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = result[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var element = _step2.value;

            var elementHeaderIndex = getHeaderIndex(element.item);
            if (currentRow[elementHeaderIndex] != undefined) {
              fillAndPush(currentRow);
              currentRow = newRow();
            }
            emptyRowIndexByHeader[elementHeaderIndex] = emptyRowIndexByHeader[elementHeaderIndex] || 0;
            // make sure there isn't a empty row for this header
            if (self._options.fillTopRow && emptyRowIndexByHeader[elementHeaderIndex] < rows.length) {
              rows[emptyRowIndexByHeader[elementHeaderIndex]][elementHeaderIndex] = self._escape(element.value);
              emptyRowIndexByHeader[elementHeaderIndex] += 1;
              continue;
            }
            currentRow[elementHeaderIndex] = self._escape(element.value);
            emptyRowIndexByHeader[elementHeaderIndex] += 1;
          }
          // push last row
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (currentRow.length > 0) {
          fillAndPush(currentRow);
        }
        fileRows = fileRows.concat(self._checkRows(rows));
      };
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = json[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var item = _step3.value;

          //Call checkType to list all items inside this object
          //Items are returned as a object {item: 'Prop Value, Item Name', value: 'Prop Data Value'}
          var itemResult = self._handler.check(item, self._options.mainPathItem, item, json);
          fillRows(itemResult);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (!stream && self._options.includeHeaders) {
        //Add the headers to the first line
        fileRows.unshift(this.headers);
      }

      return joinRows(fileRows, self._options.endOfLine);
    }
  }, {
    key: '_parseObject',
    value: function _parseObject(json) {
      var self = this;
      var fileRows = [];
      var parseResult = [];
      var outputFile = void 0;
      var fillRows = void 0;
      var horizontalRows = [[], []];

      fillRows = function fillRows(result) {
        var value = result.value || result.value === 0 ? result.value.toString() : self._options.undefinedString;
        value = self._escape(value);

        //Type header;value
        if (self._options.verticalOutput) {
          var row = [result.item, value];
          fileRows.push(row.join(self._options.rowDelimiter));
        } else {
          horizontalRows[0].push(result.item);
          horizontalRows[1].push(value);
        }
      };
      for (var prop in json) {
        var prefix = "";
        if (this._options.mainPathItem) prefix = this._options.mainPathItem + this._options.headerPathString;
        parseResult = this._handler.check(json[prop], prefix + prop, prop, json);

        parseResult.forEach(fillRows);
      }
      if (!this._options.verticalOutput) {
        fileRows.push(horizontalRows[0].join(this._options.rowDelimiter));
        fileRows.push(horizontalRows[1].join(this._options.rowDelimiter));
      }
      return joinRows(fileRows, this._options.endOfLine);
    }
  }, {
    key: 'headers',
    get: function get() {
      var _this = this;

      var headers = this._headers;

      if (this._options.rename && this._options.rename.length > 0) headers = headers.map(function (header) {
        return _this._options.rename[_this._options.headers.indexOf(header)] || header;
      });

      if (this._options.forceTextDelimiter) {
        headers = headers.map(function (header) {
          return '' + _this._options.textDelimiter + header + _this._options.textDelimiter;
        });
      }

      if (this._options.mapHeaders) headers = headers.map(this._options.mapHeaders);

      return headers.join(this._options.rowDelimiter);
    }
  }]);

  return Parser;
}();

module.exports = Parser;
},{"../core/escape-delimiters":2,"../core/helper":3,"../core/join-rows":4,"./handler":8}],8:[function(require,module,exports){
(function (global){(function (){
/* jshint node:true */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helper = require('../core/helper');

var Handler = function () {
  function Handler(options) {
    _classCallCheck(this, Handler);

    this._options = options;

    // an object of {typeName:(value,index,parent)=>any}
    this._options.typeHandlers = this._options.typeHandlers || {};
  }

  /**
   * Check if results needing mapping to alternate value
   *
   * @returns [{item, value}] result
   */


  _createClass(Handler, [{
    key: '_setHeaders',
    value: function _setHeaders(result, item) {
      var self = this;
      if (!item) return result;
      return result.map(function (element) {
        element.item = element.item ? item + self._options.headerPathString + element.item : item;
        return element;
      });
    }
  }, {
    key: 'castValue',
    value: function castValue(element, item, index, parent) {
      //cast by matching constructor
      var types = this._options.typeHandlers;
      for (var type in types) {
        if (isInstanceOfTypeName(element, type)) {
          element = types[type].call(types, element, index, parent);
          break; //first match we move on
        }
      }

      return element;
    }
  }, {
    key: 'checkComplex',
    value: function checkComplex(element, item) {
      //Check if element is a Date
      if (helper.isDate(element)) {
        return [{
          item: item,
          value: (this._options.handleDate || this._handleDate)(element, item)
        }];
      }
      //Check if element is an Array
      else if (helper.isArray(element)) {
          var resultArray = this._handleArray(element, item);
          return this._setHeaders(resultArray, item);
        }
        //Check if element is a Object
        else if (helper.isObject(element)) {
            var resultObject = this._handleObject(element);
            return this._setHeaders(resultObject, item);
          }

      return [{
        item: item,
        value: ''
      }];
    }

    /**
     * Check the element type of the element call the correct handle function
     *
     * @param element Element that will be checked
     * @param item Used to make the headers/path breadcrumb
     * @returns [{item, value}] result
     */

  }, {
    key: 'check',
    value: function check(element, item, index, parent) {
      element = this.castValue(element, item, index, parent);
      // try simple value by highier performance switch
      switch (typeof element === 'undefined' ? 'undefined' : _typeof(element)) {
        case 'string':
          return [{
            item: item,
            value: this._handleString(element, item)
          }];

        case 'number':
          return [{
            item: item,
            value: this._handleNumber(element, item)
          }];

        case 'boolean':
          return [{
            item: item,
            value: this._handleBoolean.bind(this)(element, item)
          }];
      }

      return this.checkComplex(element, item);
    }

    /**
     * Handle all Objects
     *
     * @param {Object} obj
     * @returns [{item, value}] result
     */

  }, {
    key: '_handleObject',
    value: function _handleObject(obj) {
      var result = [];
      //Look every object props
      for (var prop in obj) {
        var propData = obj[prop];
        //Check the propData type
        var resultCheckType = this.check(propData, prop, prop, obj);
        //Append to results aka merge results aka array-append-array
        result = result.concat(resultCheckType);
      }
      return result;
    }

    /**
     * Handle all Arrays, merges arrays with primitive types in a single value
     *
     * @param {Array} array
     * @returns [{item, value}] result
     */

  }, {
    key: '_handleArray',
    value: function _handleArray(array) {
      var self = this;
      var result = [];
      var firstElementWithoutItem;
      for (var aIndex = 0; aIndex < array.length; ++aIndex) {
        var element = array[aIndex];
        //Check the propData type
        var resultCheckType = self.check(element, null, aIndex, array);
        //Check for results without itens, merge all itens with the first occurrence
        if (resultCheckType.length === 0) continue;
        var firstResult = resultCheckType[0];
        if (!firstResult.item && firstElementWithoutItem !== undefined) {
          firstElementWithoutItem.value += self._options.arrayPathString + firstResult.value;
          continue;
        } else if (resultCheckType.length > 0 && !firstResult.item && firstElementWithoutItem === undefined) {
          firstElementWithoutItem = firstResult;
        }
        //Append to results
        result = result.concat(resultCheckType);
      }
      return result;
    }
    /**
     * Handle all Boolean variables, can be replaced with options.handleBoolean
     *
     * @param {Boolean} boolean
     * @returns {String} result
     */

  }, {
    key: '_handleBoolean',
    value: function _handleBoolean(boolean) {
      var result;
      //Check for booolean options
      if (boolean) {
        result = this._options.booleanTrueString || 'true';
      } else {
        result = this._options.booleanFalseString || 'false';
      }
      return result;
    }
    /**
     * Handle all String variables, can be replaced with options.handleString
     *
     * @param {String} string
     * @returns {String} string
     */

  }, {
    key: '_handleString',
    value: function _handleString(string) {
      return string;
    }
    /**
     * Handle all Number variables, can be replaced with options.handleNumber
     *
     * @param {Number} number
     * @returns {Number} number
     */

  }, {
    key: '_handleNumber',
    value: function _handleNumber(number) {
      return number;
    }
    /**
     * Handle all Date variables, can be replaced with options.handleDate
     *
     * @param {Date} number
     * @returns {string} result
     */

  }, {
    key: '_handleDate',
    value: function _handleDate(date) {
      return date.toLocaleDateString();
    }
  }]);

  return Handler;
}();

module.exports = Handler;

var globalScope = typeof window === "undefined" ? global : window;
function isInstanceOfTypeName(element, typeName) {
  if (element instanceof globalScope[typeName]) {
    return true; //Buffer and complex objects
  }

  //literals in javascript cannot be checked by instance of
  switch (typeof element === 'undefined' ? 'undefined' : _typeof(element)) {
    case 'string':
      return typeName === "String";
    case 'boolean':
      return typeName === "Boolean";
    case 'number':
      return typeName === "Number";
  }

  return false;
}
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core/helper":3}]},{},[6])(6)
});
