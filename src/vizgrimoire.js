(function() {
    var root = this;
    var previousUnderscore = root._;
    var breaker = {};
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    var slice = ArrayProto.slice,
        unshift = ArrayProto.unshift,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
        nativeReduceRight = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;
    var _ = function(obj) {
        return new wrapper(obj)
    };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = _;
        _._ = _
    } else {
        root["_"] = _
    }
    _.VERSION = "1.1.7";
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context)
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return
            }
        } else {
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return
                }
            }
        }
    };
    _.map = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list)
        });
        return results
    };
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = memo !== void 0;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator)
        }
        each(obj, function(value, index, list) {
            if (!initial) {
                memo = value;
                initial = true
            } else {
                memo = iterator.call(context, memo, value, index, list)
            }
        });
        if (!initial) throw new TypeError("Reduce of empty array with no initial value");
        return memo
    };
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator)
        }
        var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
        return _.reduce(reversed, iterator, memo, context)
    };
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true
            }
        });
        return result
    };
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) results[results.length] = value
        });
        return results
    };
    _.reject = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        each(obj, function(value, index, list) {
            if (!iterator.call(context, value, index, list)) results[results.length] = value
        });
        return results
    };
    _.every = _.all = function(obj, iterator, context) {
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker
        });
        return result
    };
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator = iterator || _.identity;
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
            if (result |= iterator.call(context, value, index, list)) return breaker
        });
        return !!result
    };
    _.include = _.contains = function(obj, target) {
        var found = false;
        if (obj == null) return found;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        any(obj, function(value) {
            if (found = value === target) return true
        });
        return found
    };
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        return _.map(obj, function(value) {
            return (method.call ? method || value : value[method]).apply(value, args)
        })
    };
    _.pluck = function(obj, key) {
        return _.map(obj, function(value) {
            return value[key]
        })
    };
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
        var result = {
            computed: -Infinity
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            })
        });
        return result.value
    };
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
        var result = {
            computed: Infinity
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            })
        });
        return result.value
    };
    _.sortBy = function(obj, iterator, context) {
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                criteria: iterator.call(context, value, index, list)
            }
        }).sort(function(left, right) {
            var a = left.criteria,
                b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0
        }), "value")
    };
    _.groupBy = function(obj, iterator) {
        var result = {};
        each(obj, function(value, index) {
            var key = iterator(value, index);
            (result[key] || (result[key] = [])).push(value)
        });
        return result
    };
    _.sortedIndex = function(array, obj, iterator) {
        iterator || (iterator = _.identity);
        var low = 0,
            high = array.length;
        while (low < high) {
            var mid = low + high >> 1;
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid
        }
        return low
    };
    _.toArray = function(iterable) {
        if (!iterable) return [];
        if (iterable.toArray) return iterable.toArray();
        if (_.isArray(iterable)) return slice.call(iterable);
        if (_.isArguments(iterable)) return slice.call(iterable);
        return _.values(iterable)
    };
    _.size = function(obj) {
        return _.toArray(obj).length
    };
    _.first = _.head = function(array, n, guard) {
        return n != null && !guard ? slice.call(array, 0, n) : array[0]
    };
    _.rest = _.tail = function(array, index, guard) {
        return slice.call(array, index == null || guard ? 1 : index)
    };
    _.last = function(array) {
        return array[array.length - 1]
    };
    _.compact = function(array) {
        return _.filter(array, function(value) {
            return !!value
        })
    };
    _.flatten = function(array) {
        return _.reduce(array, function(memo, value) {
            if (_.isArray(value)) return memo.concat(_.flatten(value));
            memo[memo.length] = value;
            return memo
        }, [])
    };
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1))
    };
    _.uniq = _.unique = function(array, isSorted) {
        return _.reduce(array, function(memo, el, i) {
            if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
            return memo
        }, [])
    };
    _.union = function() {
        return _.uniq(_.flatten(arguments))
    };
    _.intersection = _.intersect = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0
            })
        })
    };
    _.difference = function(array, other) {
        return _.filter(array, function(value) {
            return !_.include(other, value)
        })
    };
    _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, "length"));
        var results = new Array(length);
        for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
        return results
    };
    _.indexOf = function(array, item, isSorted) {
        if (array == null) return -1;
        var i, l;
        if (isSorted) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
        for (i = 0, l = array.length; i < l; i++)
            if (array[i] === item) return i;
        return -1
    };
    _.lastIndexOf = function(array, item) {
        if (array == null) return -1;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
        var i = array.length;
        while (i--)
            if (array[i] === item) return i;
        return -1
    };
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (idx < len) {
            range[idx++] = start;
            start += step
        }
        return range
    };
    _.bind = function(func, obj) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(obj, args.concat(slice.call(arguments)))
        }
    };
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length == 0) funcs = _.functions(obj);
        each(funcs, function(f) {
            obj[f] = _.bind(obj[f], obj)
        });
        return obj
    };
    _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return hasOwnProperty.call(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments)
        }
    };
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(func, args)
        }, wait)
    };
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)))
    };
    var limit = function(func, wait, debounce) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var throttler = function() {
                timeout = null;
                func.apply(context, args)
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait)
        }
    };
    _.throttle = function(func, wait) {
        return limit(func, wait, false)
    };
    _.debounce = function(func, wait) {
        return limit(func, wait, true)
    };
    _.once = function(func) {
        var ran = false,
            memo;
        return function() {
            if (ran) return memo;
            ran = true;
            return memo = func.apply(this, arguments)
        }
    };
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [func].concat(slice.call(arguments));
            return wrapper.apply(this, args)
        }
    };
    _.compose = function() {
        var funcs = slice.call(arguments);
        return function() {
            var args = slice.call(arguments);
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)]
            }
            return args[0]
        }
    };
    _.after = function(times, func) {
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments)
            }
        }
    };
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError("Invalid object");
        var keys = [];
        for (var key in obj)
            if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
        return keys
    };
    _.values = function(obj) {
        return _.map(obj, _.identity)
    };
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key)
        }
        return names.sort()
    };
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            for (var prop in source) {
                if (source[prop] !== void 0) obj[prop] = source[prop]
            }
        });
        return obj
    };
    _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            for (var prop in source) {
                if (obj[prop] == null) obj[prop] = source[prop]
            }
        });
        return obj
    };
    _.clone = function(obj) {
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
    };
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj
    };
    _.isEqual = function(a, b) {
        if (a === b) return true;
        var atype = typeof a,
            btype = typeof b;
        if (atype != btype) return false;
        if (a == b) return true;
        if (!a && b || a && !b) return false;
        if (a._chain) a = a._wrapped;
        if (b._chain) b = b._wrapped;
        if (a.isEqual) return a.isEqual(b);
        if (b.isEqual) return b.isEqual(a);
        if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
        if (_.isNaN(a) && _.isNaN(b)) return false;
        if (_.isRegExp(a) && _.isRegExp(b)) return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
        if (atype !== "object") return false;
        if (a.length && a.length !== b.length) return false;
        var aKeys = _.keys(a),
            bKeys = _.keys(b);
        if (aKeys.length != bKeys.length) return false;
        for (var key in a)
            if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
        return true
    };
    _.isEmpty = function(obj) {
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj)
            if (hasOwnProperty.call(obj, key)) return false;
        return true
    };
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType == 1)
    };
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === "[object Array]"
    };
    _.isObject = function(obj) {
        return obj === Object(obj)
    };
    _.isArguments = function(obj) {
        return !!(obj && hasOwnProperty.call(obj, "callee"))
    };
    _.isFunction = function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply)
    };
    _.isString = function(obj) {
        return !!(obj === "" || obj && obj.charCodeAt && obj.substr)
    };
    _.isNumber = function(obj) {
        return !!(obj === 0 || obj && obj.toExponential && obj.toFixed)
    };
    _.isNaN = function(obj) {
        return obj !== obj
    };
    _.isBoolean = function(obj) {
        return obj === true || obj === false
    };
    _.isDate = function(obj) {
        return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear)
    };
    _.isRegExp = function(obj) {
        return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
    };
    _.isNull = function(obj) {
        return obj === null
    };
    _.isUndefined = function(obj) {
        return obj === void 0
    };
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this
    };
    _.identity = function(value) {
        return value
    };
    _.times = function(n, iterator, context) {
        for (var i = 0; i < n; i++) iterator.call(context, i)
    };
    _.mixin = function(obj) {
        each(_.functions(obj), function(name) {
            addToWrapper(name, _[name] = obj[name])
        })
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = idCounter++;
        return prefix ? prefix + id : id
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g
    };
    _.template = function(str, data) {
        var c = _.templateSettings;
        var tmpl = "var __p=[],print=function(){__p.push.apply(__p,arguments);};" + "with(obj||{}){__p.push('" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(c.interpolate, function(match, code) {
            return "'," + code.replace(/\\'/g, "'") + ",'"
        }).replace(c.evaluate || null, function(match, code) {
            return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, " ") + "__p.push('"
        }).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "');}return __p.join('');";
        var func = new Function("obj", tmpl);
        return data ? func(data) : func
    };
    var wrapper = function(obj) {
        this._wrapped = obj
    };
    _.prototype = wrapper.prototype;
    var result = function(obj, chain) {
        return chain ? _(obj).chain() : obj
    };
    var addToWrapper = function(name, func) {
        wrapper.prototype[name] = function() {
            var args = slice.call(arguments);
            unshift.call(args, this._wrapped);
            return result(func.apply(_, args), this._chain)
        }
    };
    _.mixin(_);
    each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function() {
            method.apply(this._wrapped, arguments);
            return result(this._wrapped, this._chain)
        }
    });
    each(["concat", "join", "slice"], function(name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function() {
            return result(method.apply(this._wrapped, arguments), this._chain)
        }
    });
    wrapper.prototype.chain = function() {
        this._chain = true;
        return this
    };
    wrapper.prototype.value = function() {
        return this._wrapped
    }
})();
! function(name, context, definition) {
    if (typeof module !== "undefined") module.exports = definition(name, context);
    else if (typeof define === "function" && typeof define.amd === "object") define(definition);
    else context[name] = definition(name, context)
}("bean", this, function(name, context) {
    var win = window,
        old = context[name],
        overOut = /over|out/,
        namespaceRegex = /[^\.]*(?=\..*)\.|.*/,
        nameRegex = /\..*/,
        addEvent = "addEventListener",
        attachEvent = "attachEvent",
        removeEvent = "removeEventListener",
        detachEvent = "detachEvent",
        doc = document || {},
        root = doc.documentElement || {},
        W3C_MODEL = root[addEvent],
        eventSupport = W3C_MODEL ? addEvent : attachEvent,
        slice = Array.prototype.slice,
        mouseTypeRegex = /click|mouse|menu|drag|drop/i,
        touchTypeRegex = /^touch|^gesture/i,
        ONE = {
            one: 1
        },
        nativeEvents = function(hash, events, i) {
            for (i = 0; i < events.length; i++) hash[events[i]] = 1;
            return hash
        }({}, ("click dblclick mouseup mousedown contextmenu " + "mousewheel DOMMouseScroll " + "mouseover mouseout mousemove selectstart selectend " + "keydown keypress keyup " + "orientationchange " + "focus blur change reset select submit " + "load unload beforeunload resize move DOMContentLoaded readystatechange " + "error abort scroll " + (W3C_MODEL ? "show " + "input invalid " + "touchstart touchmove touchend touchcancel " + "gesturestart gesturechange gestureend " + "message readystatechange pageshow pagehide popstate " + "hashchange offline online " + "afterprint beforeprint " + "dragstart dragenter dragover dragleave drag drop dragend " + "loadstart progress suspend emptied stalled loadmetadata " + "loadeddata canplay canplaythrough playing waiting seeking " + "seeked ended durationchange timeupdate play pause ratechange " + "volumechange cuechange " + "checking noupdate downloading cached updateready obsolete " + "" : "")).split(" ")),
        customEvents = function() {
            function isDescendant(parent, node) {
                while ((node = node.parentNode) !== null) {
                    if (node === parent) return true
                }
                return false
            }

            function check(event) {
                var related = event.relatedTarget;
                if (!related) return related === null;
                return related !== this && related.prefix !== "xul" && !/document/.test(this.toString()) && !isDescendant(this, related)
            }
            return {
                mouseenter: {
                    base: "mouseover",
                    condition: check
                },
                mouseleave: {
                    base: "mouseout",
                    condition: check
                },
                mousewheel: {
                    base: /Firefox/.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel"
                }
            }
        }(),
        fixEvent = function() {
            var commonProps = "altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which".split(" "),
                mouseProps = commonProps.concat("button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" ")),
                keyProps = commonProps.concat("char charCode key keyCode".split(" ")),
                touchProps = commonProps.concat("touches targetTouches changedTouches scale rotation".split(" ")),
                preventDefault = "preventDefault",
                createPreventDefault = function(event) {
                    return function() {
                        if (event[preventDefault]) event[preventDefault]();
                        else event.returnValue = false
                    }
                },
                stopPropagation = "stopPropagation",
                createStopPropagation = function(event) {
                    return function() {
                        if (event[stopPropagation]) event[stopPropagation]();
                        else event.cancelBubble = true
                    }
                },
                createStop = function(synEvent) {
                    return function() {
                        synEvent[preventDefault]();
                        synEvent[stopPropagation]();
                        synEvent.stopped = true
                    }
                },
                copyProps = function(event, result, props) {
                    var i, p;
                    for (i = props.length; i--;) {
                        p = props[i];
                        if (!(p in result) && p in event) result[p] = event[p]
                    }
                };
            return function(event, isNative) {
                var result = {
                    originalEvent: event,
                    isNative: isNative
                };
                if (!event) return result;
                var props, type = event.type,
                    target = event.target || event.srcElement;
                result[preventDefault] = createPreventDefault(event);
                result[stopPropagation] = createStopPropagation(event);
                result.stop = createStop(result);
                result.target = target && target.nodeType === 3 ? target.parentNode : target;
                if (isNative) {
                    if (type.indexOf("key") !== -1) {
                        props = keyProps;
                        result.keyCode = event.which || event.keyCode
                    } else if (mouseTypeRegex.test(type)) {
                        props = mouseProps;
                        result.rightClick = event.which === 3 || event.button === 2;
                        result.pos = {
                            x: 0,
                            y: 0
                        };
                        if (event.pageX || event.pageY) {
                            result.clientX = event.pageX;
                            result.clientY = event.pageY
                        } else if (event.clientX || event.clientY) {
                            result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft;
                            result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                        }
                        if (overOut.test(type)) result.relatedTarget = event.relatedTarget || event[(type === "mouseover" ? "from" : "to") + "Element"]
                    } else if (touchTypeRegex.test(type)) {
                        props = touchProps
                    }
                    copyProps(event, result, props || commonProps)
                }
                return result
            }
        }(),
        targetElement = function(element, isNative) {
            return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        },
        RegEntry = function() {
            function entry(element, type, handler, original, namespaces) {
                this.element = element;
                this.type = type;
                this.handler = handler;
                this.original = original;
                this.namespaces = namespaces;
                this.custom = customEvents[type];
                this.isNative = nativeEvents[type] && element[eventSupport];
                this.eventType = W3C_MODEL || this.isNative ? type : "propertychange";
                this.customType = !W3C_MODEL && !this.isNative && type;
                this.target = targetElement(element, this.isNative);
                this.eventSupport = this.target[eventSupport]
            }
            entry.prototype = {
                inNamespaces: function(checkNamespaces) {
                    var i, j;
                    if (!checkNamespaces) return true;
                    if (!this.namespaces) return false;
                    for (i = checkNamespaces.length; i--;) {
                        for (j = this.namespaces.length; j--;) {
                            if (checkNamespaces[i] === this.namespaces[j]) return true
                        }
                    }
                    return false
                },
                matches: function(checkElement, checkOriginal, checkHandler) {
                    return this.element === checkElement && (!checkOriginal || this.original === checkOriginal) && (!checkHandler || this.handler === checkHandler)
                }
            };
            return entry
        }(),
        registry = function() {
            var map = {},
                forAll = function(element, type, original, handler, fn) {
                    if (!type || type === "*") {
                        for (var t in map) {
                            if (t.charAt(0) === "$") forAll(element, t.substr(1), original, handler, fn)
                        }
                    } else {
                        var i = 0,
                            l, list = map["$" + type],
                            all = element === "*";
                        if (!list) return;
                        for (l = list.length; i < l; i++) {
                            if (all || list[i].matches(element, original, handler))
                                if (!fn(list[i], list, i, type)) return
                        }
                    }
                },
                has = function(element, type, original) {
                    var i, list = map["$" + type];
                    if (list) {
                        for (i = list.length; i--;) {
                            if (list[i].matches(element, original, null)) return true
                        }
                    }
                    return false
                },
                get = function(element, type, original) {
                    var entries = [];
                    forAll(element, type, original, null, function(entry) {
                        return entries.push(entry)
                    });
                    return entries
                },
                put = function(entry) {
                    (map["$" + entry.type] || (map["$" + entry.type] = [])).push(entry);
                    return entry
                },
                del = function(entry) {
                    forAll(entry.element, entry.type, null, entry.handler, function(entry, list, i) {
                        list.splice(i, 1);
                        if (list.length === 0) delete map["$" + entry.type];
                        return false
                    })
                },
                entries = function() {
                    var t, entries = [];
                    for (t in map) {
                        if (t.charAt(0) === "$") entries = entries.concat(map[t])
                    }
                    return entries
                };
            return {
                has: has,
                get: get,
                put: put,
                del: del,
                entries: entries
            }
        }(),
        listener = W3C_MODEL ? function(element, type, fn, add) {
            element[add ? addEvent : removeEvent](type, fn, false)
        } : function(element, type, fn, add, custom) {
            if (custom && add && element["_on" + custom] === null) element["_on" + custom] = 0;
            element[add ? attachEvent : detachEvent]("on" + type, fn)
        },
        nativeHandler = function(element, fn, args) {
            return function(event) {
                event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true);
                return fn.apply(element, [event].concat(args))
            }
        },
        customHandler = function(element, fn, type, condition, args, isNative) {
            return function(event) {
                if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === "_on" + type || !event) {
                    if (event) event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative);
                    fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
                }
            }
        },
        once = function(rm, element, type, fn, originalFn) {
            return function() {
                rm(element, type, originalFn);
                fn.apply(this, arguments)
            }
        },
        removeListener = function(element, orgType, handler, namespaces) {
            var i, l, entry, type = orgType && orgType.replace(nameRegex, ""),
                handlers = registry.get(element, type, handler);
            for (i = 0, l = handlers.length; i < l; i++) {
                if (handlers[i].inNamespaces(namespaces)) {
                    if ((entry = handlers[i]).eventSupport) listener(entry.target, entry.eventType, entry.handler, false, entry.type);
                    registry.del(entry)
                }
            }
        },
        addListener = function(element, orgType, fn, originalFn, args) {
            var entry, type = orgType.replace(nameRegex, ""),
                namespaces = orgType.replace(namespaceRegex, "").split(".");
            if (registry.has(element, type, fn)) return element;
            if (type === "unload") fn = once(removeListener, element, type, fn, originalFn);
            if (customEvents[type]) {
                if (customEvents[type].condition) fn = customHandler(element, fn, type, customEvents[type].condition, true);
                type = customEvents[type].base || type
            }
            entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces));
            entry.handler = entry.isNative ? nativeHandler(element, entry.handler, args) : customHandler(element, entry.handler, type, false, args, false);
            if (entry.eventSupport) listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
        },
        del = function(selector, fn, $) {
            return function(e) {
                var target, i, array = typeof selector === "string" ? $(selector, this) : selector;
                for (target = e.target; target && target !== this; target = target.parentNode) {
                    for (i = array.length; i--;) {
                        if (array[i] === target) {
                            return fn.apply(target, arguments)
                        }
                    }
                }
            }
        },
        remove = function(element, typeSpec, fn) {
            var k, m, type, namespaces, i, rm = removeListener,
                isString = typeSpec && typeof typeSpec === "string";
            if (isString && typeSpec.indexOf(" ") > 0) {
                typeSpec = typeSpec.split(" ");
                for (i = typeSpec.length; i--;) remove(element, typeSpec[i], fn);
                return element
            }
            type = isString && typeSpec.replace(nameRegex, "");
            if (type && customEvents[type]) type = customEvents[type].type;
            if (!typeSpec || isString) {
                if (namespaces = isString && typeSpec.replace(namespaceRegex, "")) namespaces = namespaces.split(".");
                rm(element, type, fn, namespaces)
            } else if (typeof typeSpec === "function") {
                rm(element, null, typeSpec)
            } else {
                for (k in typeSpec) {
                    if (typeSpec.hasOwnProperty(k)) remove(element, k, typeSpec[k])
                }
            }
            return element
        },
        add = function(element, events, fn, delfn, $) {
            var type, types, i, args, originalFn = fn,
                isDel = fn && typeof fn === "string";
            if (events && !fn && typeof events === "object") {
                for (type in events) {
                    if (events.hasOwnProperty(type)) add.apply(this, [element, type, events[type]])
                }
            } else {
                args = arguments.length > 3 ? slice.call(arguments, 3) : [];
                types = (isDel ? fn : events).split(" ");
                isDel && (fn = del(events, originalFn = delfn, $)) && (args = slice.call(args, 1));
                this === ONE && (fn = once(remove, element, events, fn, originalFn));
                for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
            }
            return element
        },
        one = function() {
            return add.apply(ONE, arguments)
        },
        fireListener = W3C_MODEL ? function(isNative, type, element) {
            var evt = doc.createEvent(isNative ? "HTMLEvents" : "UIEvents");
            evt[isNative ? "initEvent" : "initUIEvent"](type, true, true, win, 1);
            element.dispatchEvent(evt)
        } : function(isNative, type, element) {
            element = targetElement(element, isNative);
            isNative ? element.fireEvent("on" + type, doc.createEventObject()) : element["_on" + type]++
        },
        fire = function(element, type, args) {
            var i, j, l, names, handlers, types = type.split(" ");
            for (i = types.length; i--;) {
                type = types[i].replace(nameRegex, "");
                if (names = types[i].replace(namespaceRegex, "")) names = names.split(".");
                if (!names && !args && element[eventSupport]) {
                    fireListener(nativeEvents[type], type, element)
                } else {
                    handlers = registry.get(element, type);
                    args = [false].concat(args);
                    for (j = 0, l = handlers.length; j < l; j++) {
                        if (handlers[j].inNamespaces(names)) handlers[j].handler.apply(element, args)
                    }
                }
            }
            return element
        },
        clone = function(element, from, type) {
            var i = 0,
                handlers = registry.get(from, type),
                l = handlers.length;
            for (; i < l; i++) handlers[i].original && add(element, handlers[i].type, handlers[i].original);
            return element
        },
        bean = {
            add: add,
            one: one,
            remove: remove,
            clone: clone,
            fire: fire,
            noConflict: function() {
                context[name] = old;
                return this
            }
        };
    if (win[attachEvent]) {
        var cleanup = function() {
            var i, entries = registry.entries();
            for (i in entries) {
                if (entries[i].type && entries[i].type !== "unload") remove(entries[i].element, entries[i].type)
            }
            win[detachEvent]("onunload", cleanup);
            win.CollectGarbage && win.CollectGarbage()
        };
        win[attachEvent]("onunload", cleanup)
    }
    return bean
});
(function() {
    var global = this,
        previousFlotr = this.Flotr,
        Flotr;
    Flotr = {
        _: _,
        bean: bean,
        isIphone: /iphone/i.test(navigator.userAgent),
        isIE: navigator.appVersion.indexOf("MSIE") != -1 ? parseFloat(navigator.appVersion.split("MSIE")[1]) : false,
        graphTypes: {},
        plugins: {},
        addType: function(name, graphType) {
            Flotr.graphTypes[name] = graphType;
            Flotr.defaultOptions[name] = graphType.options || {};
            //Flotr.defaultOptions.defaultType = 'bars';
            //Flotr.defaultOptions.defaultType = 'whiskers';
            //Flotr.defaultOptions.defaultType = 'markers';
            //Flotr.defaultOptions.defaultType = 'points';
            //Flotr.defaultOptions.defaultType = 'radar';
            //Flotr.defaultOptions.defaultType = 'lines';
            Flotr.defaultOptions.defaultType = Flotr.defaultOptions.defaultType || name
        },
        addPlugin: function(name, plugin) {
            Flotr.plugins[name] = plugin;
            Flotr.defaultOptions[name] = plugin.options || {}
        },
        draw: function(el, data, options, GraphKlass) {
            GraphKlass = GraphKlass || Flotr.Graph;
            return new GraphKlass(el, data, options)
        },
        merge: function(src, dest) {
            var i, v, result = dest || {};
            for (i in src) {
                v = src[i];
                if (v && typeof v === "object") {
                    if (v.constructor === Array) {
                        result[i] = this._.clone(v)
                    } else if (v.constructor !== RegExp && !this._.isElement(v) && !v.jquery) {
                        result[i] = Flotr.merge(v, dest ? dest[i] : undefined)
                    } else {
                        result[i] = v
                    }
                } else {
                    result[i] = v
                }
            }
            return result
        },
        clone: function(object) {
            return Flotr.merge(object, {})
        },
        getTickSize: function(noTicks, min, max, decimals) {
            var delta = (max - min) / noTicks,
                magn = Flotr.getMagnitude(delta),
                tickSize = 10,
                norm = delta / magn;
            if (norm < 1.5) tickSize = 1;
            else if (norm < 2.25) tickSize = 2;
            else if (norm < 3) tickSize = decimals === 0 ? 2 : 2.5;
            else if (norm < 7.5) tickSize = 5;
            return tickSize * magn
        },
        defaultTickFormatter: function(val, axisOpts) {
            return val + ""
        },
        defaultTrackFormatter: function(obj) {
            return "(" + obj.x + ", " + obj.y + ")"
        },
        engineeringNotation: function(value, precision, base) {
            var sizes = ["Y", "Z", "E", "P", "T", "G", "M", "k", ""],
                fractionSizes = ["y", "z", "a", "f", "p", "n", "µ", "m", ""],
                total = sizes.length;
            base = base || 1e3;
            precision = Math.pow(10, precision || 2);
            if (value === 0) return 0;
            if (value > 1) {
                while (total-- && value >= base) value /= base
            } else {
                sizes = fractionSizes;
                total = sizes.length;
                while (total-- && value < 1) value *= base
            }
            return Math.round(value * precision) / precision + sizes[total]
        },
        getMagnitude: function(x) {
            return Math.pow(10, Math.floor(Math.log(x) / Math.LN10))
        },
        toPixel: function(val) {
            return Math.floor(val) + .5
        },
        toRad: function(angle) {
            return -angle * (Math.PI / 180)
        },
        floorInBase: function(n, base) {
            return base * Math.floor(n / base)
        },
        drawText: function(ctx, text, x, y, style) {
            if (!ctx.fillText) {
                ctx.drawText(text, x, y, style);
                return
            }
            style = this._.extend({
                size: Flotr.defaultOptions.fontSize,
                color: "#000000",
                textAlign: "left",
                textBaseline: "bottom",
                weight: 1,
                angle: 0
            }, style);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(style.angle);
            ctx.fillStyle = style.color;
            ctx.font = (style.weight > 1 ? "bold " : "") + style.size * 1.3 + "px sans-serif";
            ctx.textAlign = style.textAlign;
            ctx.textBaseline = style.textBaseline;
            ctx.fillText(text, 0, 0);
            ctx.restore()
        },
        getBestTextAlign: function(angle, style) {
            style = style || {
                textAlign: "center",
                textBaseline: "middle"
            };
            angle += Flotr.getTextAngleFromAlign(style);
            if (Math.abs(Math.cos(angle)) > .01) style.textAlign = Math.cos(angle) > 0 ? "right" : "left";
            if (Math.abs(Math.sin(angle)) > .01) style.textBaseline = Math.sin(angle) > 0 ? "top" : "bottom";
            return style
        },
        alignTable: {
            "right middle": 0,
            "right top": Math.PI / 4,
            "center top": Math.PI / 2,
            "left top": 3 * (Math.PI / 4),
            "left middle": Math.PI,
            "left bottom": -3 * (Math.PI / 4),
            "center bottom": -Math.PI / 2,
            "right bottom": -Math.PI / 4,
            "center middle": 0
        },
        getTextAngleFromAlign: function(style) {
            return Flotr.alignTable[style.textAlign + " " + style.textBaseline] || 0
        },
        noConflict: function() {
            global.Flotr = previousFlotr;
            return this
        }
    };
    global.Flotr = Flotr
})();
Flotr.defaultOptions = {
    colors: ["#00A8F0", "#C0D800", "#CB4B4B", "#4DA74D", "#9440ED"],
    //colors: ["#CB4B4B", "#4DA74D", "#9440ED"],
    // fooooooooooo
    //colors: ["black", "green", "purple", "blue"],
    ieBackgroundColor: "#FFFFFF",
    title: null,
    subtitle: null,
    shadowSize: 4,
    defaultType: null,
    HtmlText: true,
    fontColor: "#545454",
    fontSize: 7.5,
    resolution: 1,
    parseFloat: true,
    preventDefault: true,
    xaxis: {
        ticks: null,
        minorTicks: null,
        showLabels: true,
        showMinorLabels: false,
        labelsAngle: 0,
        title: null,
        titleAngle: 0,
        noTicks: 5,
        minorTickFreq: null,
        tickFormatter: Flotr.defaultTickFormatter,
        tickDecimals: null,
        min: null,
        max: null,
        autoscale: false,
        autoscaleMargin: 0,
        color: null,
        mode: "normal",
        timeFormat: null,
        timeMode: "UTC",
        timeUnit: "millisecond",
        scaling: "linear",
        base: Math.E,
        titleAlign: "center",
        margin: true
    },
    x2axis: {},
    yaxis: {
        ticks: null,
        minorTicks: null,
        showLabels: true,
        showMinorLabels: false,
        labelsAngle: 0,
        title: null,
        titleAngle: 90,
        noTicks: 5,
        minorTickFreq: null,
        tickFormatter: Flotr.defaultTickFormatter,
        tickDecimals: null,
        min: null,
        max: null,
        autoscale: false,
        autoscaleMargin: 0,
        color: null,
        scaling: "linear",
        base: Math.E,
        titleAlign: "center",
        margin: true
    },
    y2axis: {
        titleAngle: 270
    },
    grid: {
        color: "#545454",
        backgroundColor: null,
        backgroundImage: null,
        watermarkAlpha: .4,
        tickColor: "#DDDDDD",
        labelMargin: 3,
        verticalLines: true,
        minorVerticalLines: null,
        horizontalLines: true,
        minorHorizontalLines: null,
        outlineWidth: 1,
        outline: "nsew",
        circular: false
    },
    mouse: {
        track: false,
        trackAll: false,
        position: "se",
        relative: false,
        trackFormatter: Flotr.defaultTrackFormatter,
        margin: 5,
        lineColor: "#FF3F19",
        trackDecimals: 1,
        sensibility: 2,
        trackY: true,
        radius: 3,
        fillColor: null,
        fillOpacity: .4
    }
};
(function() {
    var _ = Flotr._;

    function Color(r, g, b, a) {
        this.rgba = ["r", "g", "b", "a"];
        var x = 4;
        while (-1 < --x) {
            this[this.rgba[x]] = arguments[x] || (x == 3 ? 1 : 0)
        }
        this.normalize()
    }
    var COLOR_NAMES = {
        aqua: [0, 255, 255],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        black: [0, 0, 0],
        blue: [0, 0, 255],
        brown: [165, 42, 42],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgrey: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkviolet: [148, 0, 211],
        fuchsia: [255, 0, 255],
        gold: [255, 215, 0],
        green: [0, 128, 0],
        indigo: [75, 0, 130],
        khaki: [240, 230, 140],
        lightblue: [173, 216, 230],
        lightcyan: [224, 255, 255],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        navy: [0, 0, 128],
        olive: [128, 128, 0],
        orange: [255, 165, 0],
        pink: [255, 192, 203],
        purple: [128, 0, 128],
        violet: [128, 0, 128],
        red: [255, 0, 0],
        silver: [192, 192, 192],
        white: [255, 255, 255],
        yellow: [255, 255, 0]
    };
    Color.prototype = {
        scale: function(rf, gf, bf, af) {
            var x = 4;
            while (-1 < --x) {
                if (!_.isUndefined(arguments[x])) this[this.rgba[x]] *= arguments[x]
            }
            return this.normalize()
        },
        alpha: function(alpha) {
            if (!_.isUndefined(alpha) && !_.isNull(alpha)) {
                this.a = alpha
            }
            return this.normalize()
        },
        clone: function() {
            return new Color(this.r, this.b, this.g, this.a)
        },
        limit: function(val, minVal, maxVal) {
            return Math.max(Math.min(val, maxVal), minVal)
        },
        normalize: function() {
            var limit = this.limit;
            this.r = limit(parseInt(this.r, 10), 0, 255);
            this.g = limit(parseInt(this.g, 10), 0, 255);
            this.b = limit(parseInt(this.b, 10), 0, 255);
            this.a = limit(this.a, 0, 1);
            return this
        },
        distance: function(color) {
            if (!color) return;
            color = new Color.parse(color);
            var dist = 0,
                x = 3;
            while (-1 < --x) {
                dist += Math.abs(this[this.rgba[x]] - color[this.rgba[x]])
            }
            return dist
        },
        toString: function() {
            return this.a >= 1 ? "rgb(" + [this.r, this.g, this.b].join(",") + ")" : "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")"
        },
        contrast: function() {
            var test = 1 - (.299 * this.r + .587 * this.g + .114 * this.b) / 255;
            return test < .5 ? "#000000" : "#ffffff"
        }
    };
    _.extend(Color, {
        parse: function(color) {
            if (color instanceof Color) return color;
            var result;
            if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) return new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
            if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) return new Color(parseInt(result[1], 10), parseInt(result[2], 10), parseInt(result[3], 10));
            if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) return new Color(parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16));
            if (result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(color)) return new Color(parseInt(result[1], 10), parseInt(result[2], 10), parseInt(result[3], 10), parseFloat(result[4]));
            if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color)) return new Color(parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55);
            if (result = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(color)) return new Color(parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55, parseFloat(result[4]));
            var name = (color + "").replace(/^\s*([\S\s]*?)\s*$/, "$1").toLowerCase();
            if (name == "transparent") {
                return new Color(255, 255, 255, 0)
            }
            return (result = COLOR_NAMES[name]) ? new Color(result[0], result[1], result[2]) : new Color(0, 0, 0, 0)
        },
        processColor: function(color, options) {
            var opacity = options.opacity;
            if (!color) return "rgba(0, 0, 0, 0)";
            if (color instanceof Color) return color.alpha(opacity).toString();
            if (_.isString(color)) return Color.parse(color).alpha(opacity).toString();
            var grad = color.colors ? color : {
                colors: color
            };
            if (!options.ctx) {
                if (!_.isArray(grad.colors)) return "rgba(0, 0, 0, 0)";
                return Color.parse(_.isArray(grad.colors[0]) ? grad.colors[0][1] : grad.colors[0]).alpha(opacity).toString()
            }
            grad = _.extend({
                start: "top",
                end: "bottom"
            }, grad);
            if (/top/i.test(grad.start)) options.x1 = 0;
            if (/left/i.test(grad.start)) options.y1 = 0;
            if (/bottom/i.test(grad.end)) options.x2 = 0;
            if (/right/i.test(grad.end)) options.y2 = 0;
            var i, c, stop, gradient = options.ctx.createLinearGradient(options.x1, options.y1, options.x2, options.y2);
            for (i = 0; i < grad.colors.length; i++) {
                c = grad.colors[i];
                if (_.isArray(c)) {
                    stop = c[0];
                    c = c[1]
                } else stop = i / (grad.colors.length - 1);
                gradient.addColorStop(stop, Color.parse(c).alpha(opacity))
            }
            return gradient
        }
    });
    Flotr.Color = Color
})();
Flotr.Date = {
    set: function(date, name, mode, value) {
        mode = mode || "UTC";
        name = "set" + (mode === "UTC" ? "UTC" : "") + name;
        date[name](value)
    },
    get: function(date, name, mode) {
        mode = mode || "UTC";
        name = "get" + (mode === "UTC" ? "UTC" : "") + name;
        return date[name]()
    },
    format: function(d, format, mode) {
        if (!d) return;
        var get = this.get,
            tokens = {
                h: get(d, "Hours", mode).toString(),
                H: leftPad(get(d, "Hours", mode)),
                M: leftPad(get(d, "Minutes", mode)),
                S: leftPad(get(d, "Seconds", mode)),
                s: get(d, "Milliseconds", mode),
                d: get(d, "Date", mode).toString(),
                m: (get(d, "Month", mode) + 1).toString(),
                y: get(d, "FullYear", mode).toString(),
                b: Flotr.Date.monthNames[get(d, "Month", mode)]
            };

        function leftPad(n) {
            n += "";
            return n.length == 1 ? "0" + n : n
        }
        var r = [],
            c, escape = false;
        for (var i = 0; i < format.length; ++i) {
            c = format.charAt(i);
            if (escape) {
                r.push(tokens[c] || c);
                escape = false
            } else if (c == "%") escape = true;
            else r.push(c)
        }
        return r.join("")
    },
    getFormat: function(time, span) {
        var tu = Flotr.Date.timeUnits;
        if (time < tu.second) return "%h:%M:%S.%s";
        else if (time < tu.minute) return "%h:%M:%S";
        else if (time < tu.day) return span < 2 * tu.day ? "%h:%M" : "%b %d %h:%M";
        else if (time < tu.month) return "%b %d";
        else if (time < tu.year) return span < tu.year ? "%b" : "%b %y";
        else return "%y"
    },
    formatter: function(v, axis) {
        var options = axis.options,
            scale = Flotr.Date.timeUnits[options.timeUnit],
            d = new Date(v * scale);
        if (axis.options.timeFormat) return Flotr.Date.format(d, options.timeFormat, options.timeMode);
        var span = (axis.max - axis.min) * scale,
            t = axis.tickSize * Flotr.Date.timeUnits[axis.tickUnit];
        return Flotr.Date.format(d, Flotr.Date.getFormat(t, span), options.timeMode)
    },
    generator: function(axis) {
        var set = this.set,
            get = this.get,
            timeUnits = this.timeUnits,
            spec = this.spec,
            options = axis.options,
            mode = options.timeMode,
            scale = timeUnits[options.timeUnit],
            min = axis.min * scale,
            max = axis.max * scale,
            delta = (max - min) / options.noTicks,
            ticks = [],
            tickSize = axis.tickSize,
            tickUnit, formatter, i;
        formatter = options.tickFormatter === Flotr.defaultTickFormatter ? this.formatter : options.tickFormatter;
        for (i = 0; i < spec.length - 1; ++i) {
            var d = spec[i][0] * timeUnits[spec[i][1]];
            if (delta < (d + spec[i + 1][0] * timeUnits[spec[i + 1][1]]) / 2 && d >= tickSize) break
        }
        tickSize = spec[i][0];
        tickUnit = spec[i][1];
        if (tickUnit == "year") {
            tickSize = Flotr.getTickSize(options.noTicks * timeUnits.year, min, max, 0);
            if (tickSize == .5) {
                tickUnit = "month";
                tickSize = 6
            }
        }
        axis.tickUnit = tickUnit;
        axis.tickSize = tickSize;
        var step = tickSize * timeUnits[tickUnit];
        d = new Date(min);

        function setTick(name) {
            set(d, name, mode, Flotr.floorInBase(get(d, name, mode), tickSize))
        }
        switch (tickUnit) {
            case "millisecond":
                setTick("Milliseconds");
                break;
            case "second":
                setTick("Seconds");
                break;
            case "minute":
                setTick("Minutes");
                break;
            case "hour":
                setTick("Hours");
                break;
            case "month":
                setTick("Month");
                break;
            case "year":
                setTick("FullYear");
                break
        }
        if (step >= timeUnits.second) set(d, "Milliseconds", mode, 0);
        if (step >= timeUnits.minute) set(d, "Seconds", mode, 0);
        if (step >= timeUnits.hour) set(d, "Minutes", mode, 0);
        if (step >= timeUnits.day) set(d, "Hours", mode, 0);
        if (step >= timeUnits.day * 4) set(d, "Date", mode, 1);
        if (step >= timeUnits.year) set(d, "Month", mode, 0);
        var carry = 0,
            v = NaN,
            prev;
        do {
            prev = v;
            v = d.getTime();
            ticks.push({
                v: v / scale,
                label: formatter(v / scale, axis)
            });
            if (tickUnit == "month") {
                if (tickSize < 1) {
                    set(d, "Date", mode, 1);
                    var start = d.getTime();
                    set(d, "Month", mode, get(d, "Month", mode) + 1);
                    var end = d.getTime();
                    d.setTime(v + carry * timeUnits.hour + (end - start) * tickSize);
                    carry = get(d, "Hours", mode);
                    set(d, "Hours", mode, 0)
                } else set(d, "Month", mode, get(d, "Month", mode) + tickSize)
            } else if (tickUnit == "year") {
                set(d, "FullYear", mode, get(d, "FullYear", mode) + tickSize)
            } else d.setTime(v + step)
        } while (v < max && v != prev);
        return ticks
    },
    timeUnits: {
        millisecond: 1,
        second: 1e3,
        minute: 1e3 * 60,
        hour: 1e3 * 60 * 60,
        day: 1e3 * 60 * 60 * 24,
        month: 1e3 * 60 * 60 * 24 * 30,
        year: 1e3 * 60 * 60 * 24 * 365.2425
    },
    spec: [
        [1, "millisecond"],
        [20, "millisecond"],
        [50, "millisecond"],
        [100, "millisecond"],
        [200, "millisecond"],
        [500, "millisecond"],
        [1, "second"],
        [2, "second"],
        [5, "second"],
        [10, "second"],
        [30, "second"],
        [1, "minute"],
        [2, "minute"],
        [5, "minute"],
        [10, "minute"],
        [30, "minute"],
        [1, "hour"],
        [2, "hour"],
        [4, "hour"],
        [8, "hour"],
        [12, "hour"],
        [1, "day"],
        [2, "day"],
        [3, "day"],
        [.25, "month"],
        [.5, "month"],
        [1, "month"],
        [2, "month"],
        [3, "month"],
        [6, "month"],
        [1, "year"]
    ],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};
(function() {
    var _ = Flotr._;

    function getEl(el) {
        return el && el.jquery ? el[0] : el
    }
    Flotr.DOM = {
        addClass: function(element, name) {
            element = getEl(element);
            var classList = element.className ? element.className : "";
            if (_.include(classList.split(/\s+/g), name)) return;
            element.className = (classList ? classList + " " : "") + name
        },
        create: function(tag) {
            return document.createElement(tag)
        },
        node: function(html) {
            var div = Flotr.DOM.create("div"),
                n;
            div.innerHTML = html;
            n = div.children[0];
            div.innerHTML = "";
            return n
        },
        empty: function(element) {
            element = getEl(element);
            element.innerHTML = ""
        },
        remove: function(element) {
            element = getEl(element);
            element.parentNode.removeChild(element)
        },
        hide: function(element) {
            element = getEl(element);
            Flotr.DOM.setStyles(element, {
                display: "none"
            })
        },
        insert: function(element, child) {
            element = getEl(element);
            if (_.isString(child)) element.innerHTML += child;
            else if (_.isElement(child)) element.appendChild(child)
        },
        opacity: function(element, opacity) {
            element = getEl(element);
            element.style.opacity = opacity
        },
        position: function(element, p) {
            element = getEl(element);
            if (!element.offsetParent) return {
                left: element.offsetLeft || 0,
                top: element.offsetTop || 0
            };
            p = this.position(element.offsetParent);
            p.left += element.offsetLeft;
            p.top += element.offsetTop;
            return p
        },
        removeClass: function(element, name) {
            var classList = element.className ? element.className : "";
            element = getEl(element);
            element.className = _.filter(classList.split(/\s+/g), function(c) {
                if (c != name) return true
            }).join(" ")
        },
        setStyles: function(element, o) {
            element = getEl(element);
            _.each(o, function(value, key) {
                element.style[key] = value
            })
        },
        show: function(element) {
            element = getEl(element);
            Flotr.DOM.setStyles(element, {
                display: ""
            })
        },
        size: function(element) {
            element = getEl(element);
            return {
                height: element.offsetHeight,
                width: element.offsetWidth
            }
        }
    }
})();
(function() {
    var F = Flotr,
        bean = F.bean;
    F.EventAdapter = {
        observe: function(object, name, callback) {
            bean.add(object, name, callback);
            return this
        },
        fire: function(object, name, args) {
            bean.fire(object, name, args);
            if (typeof Prototype != "undefined") Event.fire(object, name, args);
            return this
        },
        stopObserving: function(object, name, callback) {
            bean.remove(object, name, callback);
            return this
        },
        eventPointer: function(e) {
            if (!F._.isUndefined(e.touches) && e.touches.length > 0) {
                return {
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY
                }
            } else if (!F._.isUndefined(e.changedTouches) && e.changedTouches.length > 0) {
                return {
                    x: e.changedTouches[0].pageX,
                    y: e.changedTouches[0].pageY
                }
            } else if (e.pageX || e.pageY) {
                return {
                    x: e.pageX,
                    y: e.pageY
                }
            } else if (e.clientX || e.clientY) {
                var d = document,
                    b = d.body,
                    de = d.documentElement;
                return {
                    x: e.clientX + b.scrollLeft + de.scrollLeft,
                    y: e.clientY + b.scrollTop + de.scrollTop
                }
            }
        }
    }
})();
(function() {
    var D = Flotr.DOM,
        E = Flotr.EventAdapter,
        _ = Flotr._,
        flotr = Flotr;
    Graph = function(el, data, options) {
        this._setEl(el);
        this._initMembers();
        this._initPlugins();
        E.fire(this.el, "flotr:beforeinit", [this]);
        this.data = data;
        this.series = flotr.Series.getSeries(data);
        this._initOptions(options);
        this._initGraphTypes();
        this._initCanvas();
        this._text = new flotr.Text({
            element: this.el,
            ctx: this.ctx,
            html: this.options.HtmlText,
            textEnabled: this.textEnabled
        });
        E.fire(this.el, "flotr:afterconstruct", [this]);
        this._initEvents();
        this.findDataRanges();
        this.calculateSpacing();
        this.draw(_.bind(function() {
            E.fire(this.el, "flotr:afterinit", [this])
        }, this))
    };

    function observe(object, name, callback) {
        E.observe.apply(this, arguments);
        this._handles.push(arguments);
        return this
    }
    Graph.prototype = {
        destroy: function() {
            E.fire(this.el, "flotr:destroy");
            _.each(this._handles, function(handle) {
                E.stopObserving.apply(this, handle)
            });
            this._handles = [];
            this.el.graph = null
        },
        observe: observe,
        _observe: observe,
        processColor: function(color, options) {
            var o = {
                x1: 0,
                y1: 0,
                x2: this.plotWidth,
                y2: this.plotHeight,
                opacity: 1,
                ctx: this.ctx
            };
            _.extend(o, options);
            return flotr.Color.processColor(color, o)
        },
        findDataRanges: function() {
            var a = this.axes,
                xaxis, yaxis, range;
            _.each(this.series, function(series) {
                range = series.getRange();
                if (range) {
                    xaxis = series.xaxis;
                    yaxis = series.yaxis;
                    xaxis.datamin = Math.min(range.xmin, xaxis.datamin);
                    xaxis.datamax = Math.max(range.xmax, xaxis.datamax);
                    yaxis.datamin = Math.min(range.ymin, yaxis.datamin);
                    yaxis.datamax = Math.max(range.ymax, yaxis.datamax);
                    xaxis.used = xaxis.used || range.xused;
                    yaxis.used = yaxis.used || range.yused
                }
            }, this);
            if (!a.x.used && !a.x2.used) a.x.used = true;
            if (!a.y.used && !a.y2.used) a.y.used = true;
            _.each(a, function(axis) {
                axis.calculateRange()
            });
            var types = _.keys(flotr.graphTypes),
                drawn = false;
            _.each(this.series, function(series) {
                if (series.hide) return;
                _.each(types, function(type) {
                    if (series[type] && series[type].show) {
                        this.extendRange(type, series);
                        drawn = true
                    }
                }, this);
                if (!drawn) {
                    this.extendRange(this.options.defaultType, series)
                }
            }, this)
        },
        extendRange: function(type, series) {
            if (this[type].extendRange) this[type].extendRange(series, series.data, series[type], this[type]);
            if (this[type].extendYRange) this[type].extendYRange(series.yaxis, series.data, series[type], this[type]);
            if (this[type].extendXRange) this[type].extendXRange(series.xaxis, series.data, series[type], this[type])
        },
        calculateSpacing: function() {
            var a = this.axes,
                options = this.options,
                series = this.series,
                margin = options.grid.labelMargin,
                T = this._text,
                x = a.x,
                x2 = a.x2,
                y = a.y,
                y2 = a.y2,
                maxOutset = options.grid.outlineWidth,
                i, j, l, dim;
            _.each(a, function(axis) {
                axis.calculateTicks();
                axis.calculateTextDimensions(T, options)
            });
            dim = T.dimensions(options.title, {
                size: options.fontSize * 1.5
            }, "font-size:1em;font-weight:bold;", "flotr-title");
            this.titleHeight = dim.height;
            dim = T.dimensions(options.subtitle, {
                size: options.fontSize
            }, "font-size:smaller;", "flotr-subtitle");
            this.subtitleHeight = dim.height;
            for (j = 0; j < options.length; ++j) {
                if (series[j].points.show) {
                    maxOutset = Math.max(maxOutset, series[j].points.radius + series[j].points.lineWidth / 2)
                }
            }
            var p = this.plotOffset;
            if (x.options.margin === false) {
                p.bottom = 0;
                p.top = 0
            } else if (x.options.margin === true) {
                p.bottom += (options.grid.circular ? 0 : x.used && x.options.showLabels ? x.maxLabel.height + margin : 0) + (x.used && x.options.title ? x.titleSize.height + margin : 0) + maxOutset;
                p.top += (options.grid.circular ? 0 : x2.used && x2.options.showLabels ? x2.maxLabel.height + margin : 0) + (x2.used && x2.options.title ? x2.titleSize.height + margin : 0) + this.subtitleHeight + this.titleHeight + maxOutset
            } else {
                p.bottom = x.options.margin;
                p.top = x.options.margin
            }
            if (y.options.margin === false) {
                p.left = 0;
                p.right = 0
            } else if (y.options.margin === true) {
                p.left += (options.grid.circular ? 0 : y.used && y.options.showLabels ? y.maxLabel.width + margin : 0) + (y.used && y.options.title ? y.titleSize.width + margin : 0) + maxOutset;
                p.right += (options.grid.circular ? 0 : y2.used && y2.options.showLabels ? y2.maxLabel.width + margin : 0) + (y2.used && y2.options.title ? y2.titleSize.width + margin : 0) + maxOutset
            } else {
                p.left = y.options.margin;
                p.right = y.options.margin
            }
            p.top = Math.floor(p.top);
            this.plotWidth = this.canvasWidth - p.left - p.right;
            this.plotHeight = this.canvasHeight - p.bottom - p.top;
            x.length = x2.length = this.plotWidth;
            y.length = y2.length = this.plotHeight;
            y.offset = y2.offset = this.plotHeight;
            x.setScale();
            x2.setScale();
            y.setScale();
            y2.setScale()
        },
        draw: function(after) {
            var context = this.ctx,
                i;
            E.fire(this.el, "flotr:beforedraw", [this.series, this]);
            if (this.series.length) {
                context.save();
                context.translate(this.plotOffset.left, this.plotOffset.top);
                for (i = 0; i < this.series.length; i++) {
                    if (!this.series[i].hide) this.drawSeries(this.series[i])
                }
                context.restore();
                this.clip()
            }
            E.fire(this.el, "flotr:afterdraw", [this.series, this]);
            if (after) after()
        },
        drawSeries: function(series) {
            function drawChart(series, typeKey) {
                var options = this.getOptions(series, typeKey);
                this[typeKey].draw(options)
            }
            var drawn = false;
            series = series || this.series;
            _.each(flotr.graphTypes, function(type, typeKey) {
                if (series[typeKey] && series[typeKey].show && this[typeKey]) {
                    drawn = true;
                    drawChart.call(this, series, typeKey)
                }
            }, this);
            if (!drawn) drawChart.call(this, series, this.options.defaultType)
        },
        getOptions: function(series, typeKey) {
            var type = series[typeKey],
                graphType = this[typeKey],
                xaxis = series.xaxis,
                yaxis = series.yaxis,
                options = {
                    context: this.ctx,
                    width: this.plotWidth,
                    height: this.plotHeight,
                    fontSize: this.options.fontSize,
                    fontColor: this.options.fontColor,
                    textEnabled: this.textEnabled,
                    htmlText: this.options.HtmlText,
                    text: this._text,
                    element: this.el,
                    data: series.data,
                    color: series.color,
                    shadowSize: series.shadowSize,
                    xScale: xaxis.d2p,
                    yScale: yaxis.d2p,
                    xInverse: xaxis.p2d,
                    yInverse: yaxis.p2d
                };
            options = flotr.merge(type, options);
            options.fillStyle = this.processColor(type.fillColor || series.color, {
                opacity: type.fillOpacity
            });
            return options
        },
        getEventPosition: function(e) {
            var d = document,
                b = d.body,
                de = d.documentElement,
                axes = this.axes,
                plotOffset = this.plotOffset,
                lastMousePos = this.lastMousePos,
                pointer = E.eventPointer(e),
                dx = pointer.x - lastMousePos.pageX,
                dy = pointer.y - lastMousePos.pageY,
                r, rx, ry;
            if ("ontouchstart" in this.el) {
                r = D.position(this.overlay);
                rx = pointer.x - r.left - plotOffset.left;
                ry = pointer.y - r.top - plotOffset.top
            } else {
                r = this.overlay.getBoundingClientRect();
                rx = e.clientX - r.left - plotOffset.left - b.scrollLeft - de.scrollLeft;
                ry = e.clientY - r.top - plotOffset.top - b.scrollTop - de.scrollTop
            }
            return {
                x: axes.x.p2d(rx),
                x2: axes.x2.p2d(rx),
                y: axes.y.p2d(ry),
                y2: axes.y2.p2d(ry),
                relX: rx,
                relY: ry,
                dX: dx,
                dY: dy,
                absX: pointer.x,
                absY: pointer.y,
                pageX: pointer.x,
                pageY: pointer.y
            }
        },
        clickHandler: function(event) {
            if (this.ignoreClick) {
                this.ignoreClick = false;
                return this.ignoreClick
            }
            E.fire(this.el, "flotr:click", [this.getEventPosition(event), this])
        },
        mouseMoveHandler: function(event) {
            if (this.mouseDownMoveHandler) return;
            var pos = this.getEventPosition(event);
            E.fire(this.el, "flotr:mousemove", [event, pos, this]);
            this.lastMousePos = pos
        },
        mouseDownHandler: function(event) {
            if (this.mouseUpHandler) return;
            this.mouseUpHandler = _.bind(function(e) {
                E.stopObserving(document, "mouseup", this.mouseUpHandler);
                E.stopObserving(document, "mousemove", this.mouseDownMoveHandler);
                this.mouseDownMoveHandler = null;
                this.mouseUpHandler = null;
                E.fire(this.el, "flotr:mouseup", [e, this])
            }, this);
            this.mouseDownMoveHandler = _.bind(function(e) {
                var pos = this.getEventPosition(e);
                E.fire(this.el, "flotr:mousemove", [event, pos, this]);
                this.lastMousePos = pos
            }, this);
            E.observe(document, "mouseup", this.mouseUpHandler);
            E.observe(document, "mousemove", this.mouseDownMoveHandler);
            E.fire(this.el, "flotr:mousedown", [event, this]);
            this.ignoreClick = false
        },
        drawTooltip: function(content, x, y, options) {
            var mt = this.getMouseTrack(),
                style = "opacity:0.7;background-color:#000;color:#fff;display:none;position:absolute;padding:2px 8px;-moz-border-radius:4px;border-radius:4px;white-space:nowrap;",
                p = options.position,
                m = options.margin,
                plotOffset = this.plotOffset;
            if (x !== null && y !== null) {
                if (!options.relative) {
                    if (p.charAt(0) == "n") style += "top:" + (m + plotOffset.top) + "px;bottom:auto;";
                    else if (p.charAt(0) == "s") style += "bottom:" + (m + plotOffset.bottom) + "px;top:auto;";
                    if (p.charAt(1) == "e") style += "right:" + (m + plotOffset.right) + "px;left:auto;";
                    else if (p.charAt(1) == "w") style += "left:" + (m + plotOffset.left) + "px;right:auto;"
                } else {
                    if (p.charAt(0) == "n") style += "bottom:" + (m - plotOffset.top - y + this.canvasHeight) + "px;top:auto;";
                    else if (p.charAt(0) == "s") style += "top:" + (m + plotOffset.top + y) + "px;bottom:auto;";
                    if (p.charAt(1) == "e") style += "left:" + (m + plotOffset.left + x) + "px;right:auto;";
                    else if (p.charAt(1) == "w") style += "right:" + (m - plotOffset.left - x + this.canvasWidth) + "px;left:auto;"
                }
                mt.style.cssText = style;
                D.empty(mt);
                D.insert(mt, content);
                D.show(mt)
            } else {
                D.hide(mt)
            }
        },
        clip: function(ctx) {
            var o = this.plotOffset,
                w = this.canvasWidth,
                h = this.canvasHeight;
            ctx = ctx || this.ctx;
            if (flotr.isIE && flotr.isIE < 9 && !flotr.isFlashCanvas) {
                if (ctx === this.octx) {
                    return
                }
                ctx.save();
                ctx.fillStyle = this.processColor(this.options.ieBackgroundColor);
                ctx.fillRect(0, 0, w, o.top);
                ctx.fillRect(0, 0, o.left, h);
                ctx.fillRect(0, h - o.bottom, w, o.bottom);
                ctx.fillRect(w - o.right, 0, o.right, h);
                ctx.restore()
            } else {
                ctx.clearRect(0, 0, w, o.top);
                ctx.clearRect(0, 0, o.left, h);
                ctx.clearRect(0, h - o.bottom, w, o.bottom);
                ctx.clearRect(w - o.right, 0, o.right, h)
            }
        },
        _initMembers: function() {
            this._handles = [];
            this.lastMousePos = {
                pageX: null,
                pageY: null
            };
            this.plotOffset = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
            this.ignoreClick = true;
            this.prevHit = null
        },
        _initGraphTypes: function() {
            _.each(flotr.graphTypes, function(handler, graphType) {
                this[graphType] = flotr.clone(handler)
            }, this)
        },
        _initEvents: function() {
            var el = this.el,
                touchendHandler, movement, touchend;
            if ("ontouchstart" in el) {
                touchendHandler = _.bind(function(e) {
                    touchend = true;
                    E.stopObserving(document, "touchend", touchendHandler);
                    E.fire(el, "flotr:mouseup", [event, this]);
                    this.multitouches = null;
                    if (!movement) {
                        this.clickHandler(e)
                    }
                }, this);
                this.observe(this.overlay, "touchstart", _.bind(function(e) {
                    movement = false;
                    touchend = false;
                    this.ignoreClick = false;
                    if (e.touches && e.touches.length > 1) {
                        this.multitouches = e.touches
                    }
                    E.fire(el, "flotr:mousedown", [event, this]);
                    this.observe(document, "touchend", touchendHandler)
                }, this));
                this.observe(this.overlay, "touchmove", _.bind(function(e) {
                    var pos = this.getEventPosition(e);
                    if (this.options.preventDefault) {
                        e.preventDefault()
                    }
                    movement = true;
                    if (this.multitouches || e.touches && e.touches.length > 1) {
                        this.multitouches = e.touches
                    } else {
                        if (!touchend) {
                            E.fire(el, "flotr:mousemove", [event, pos, this])
                        }
                    }
                    this.lastMousePos = pos
                }, this))
            } else {
                this.observe(this.overlay, "mousedown", _.bind(this.mouseDownHandler, this)).observe(el, "mousemove", _.bind(this.mouseMoveHandler, this)).observe(this.overlay, "click", _.bind(this.clickHandler, this)).observe(el, "mouseout", function(e) {
                    E.fire(el, "flotr:mouseout", e)
                })
            }
        },
        _initCanvas: function() {
            var el = this.el,
                o = this.options,
                children = el.children,
                removedChildren = [],
                child, i, size, style;
            for (i = children.length; i--;) {
                child = children[i];
                if (!this.canvas && child.className === "flotr-canvas") {
                    this.canvas = child
                } else if (!this.overlay && child.className === "flotr-overlay") {
                    this.overlay = child
                } else {
                    removedChildren.push(child)
                }
            }
            for (i = removedChildren.length; i--;) {
                el.removeChild(removedChildren[i])
            }
            D.setStyles(el, {
                position: "relative"
            });
            size = {};
            size.width = el.clientWidth;
            size.height = el.clientHeight;
            if (size.width <= 0 || size.height <= 0 || o.resolution <= 0) {
                throw "Invalid dimensions for plot, width = " + size.width + ", height = " + size.height + ", resolution = " + o.resolution
            }
            this.canvas = getCanvas(this.canvas, "canvas");
            this.overlay = getCanvas(this.overlay, "overlay");
            this.ctx = getContext(this.canvas);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.octx = getContext(this.overlay);
            this.octx.clearRect(0, 0, this.overlay.width, this.overlay.height);
            this.canvasHeight = size.height;
            this.canvasWidth = size.width;
            this.textEnabled = !!this.ctx.drawText || !!this.ctx.fillText;

            function getCanvas(canvas, name) {
                if (!canvas) {
                    canvas = D.create("canvas");
                    if (typeof FlashCanvas != "undefined" && typeof canvas.getContext === "function") {
                        FlashCanvas.initElement(canvas);
                        this.isFlashCanvas = true
                    }
                    canvas.className = "flotr-" + name;
                    canvas.style.cssText = "position:absolute;left:0px;top:0px;";
                    D.insert(el, canvas)
                }
                _.each(size, function(size, attribute) {
                    D.show(canvas);
                    if (name == "canvas" && canvas.getAttribute(attribute) === size) {
                        return
                    }
                    canvas.setAttribute(attribute, size * o.resolution);
                    canvas.style[attribute] = size + "px"
                });
                canvas.context_ = null;
                return canvas
            }

            function getContext(canvas) {
                if (window.G_vmlCanvasManager) window.G_vmlCanvasManager.initElement(canvas);
                var context = canvas.getContext("2d");
                if (!window.G_vmlCanvasManager) context.scale(o.resolution, o.resolution);
                return context
            }
        },
        _initPlugins: function() {
            _.each(flotr.plugins, function(plugin, name) {
                _.each(plugin.callbacks, function(fn, c) {
                    this.observe(this.el, c, _.bind(fn, this))
                }, this);
                this[name] = flotr.clone(plugin);
                _.each(this[name], function(fn, p) {
                    if (_.isFunction(fn)) this[name][p] = _.bind(fn, this)
                }, this)
            }, this)
        },
        _initOptions: function(opts) {
            var options = flotr.clone(flotr.defaultOptions);
            options.x2axis = _.extend(_.clone(options.xaxis), options.x2axis);
            options.y2axis = _.extend(_.clone(options.yaxis), options.y2axis);
            this.options = flotr.merge(opts || {}, options);
            if (this.options.grid.minorVerticalLines === null && this.options.xaxis.scaling === "logarithmic") {
                this.options.grid.minorVerticalLines = true
            }
            if (this.options.grid.minorHorizontalLines === null && this.options.yaxis.scaling === "logarithmic") {
                this.options.grid.minorHorizontalLines = true
            }
            E.fire(this.el, "flotr:afterinitoptions", [this]);
            this.axes = flotr.Axis.getAxes(this.options);
            var assignedColors = [],
                colors = [],
                ln = this.series.length,
                neededColors = this.series.length,
                oc = this.options.colors,
                usedColors = [],
                variation = 0,
                c, i, j, s;
            for (i = neededColors - 1; i > -1; --i) {
                c = this.series[i].color;
                if (c) {
                    --neededColors;
                    if (_.isNumber(c)) assignedColors.push(c);
                    else usedColors.push(flotr.Color.parse(c))
                }
            }
            for (i = assignedColors.length - 1; i > -1; --i) neededColors = Math.max(neededColors, assignedColors[i] + 1);
            for (i = 0; colors.length < neededColors;) {
                c = oc.length == i ? new flotr.Color(100, 100, 100) : flotr.Color.parse(oc[i]);
                var sign = variation % 2 == 1 ? -1 : 1,
                    factor = 1 + sign * Math.ceil(variation / 2) * .2;
                c.scale(factor, factor, factor);
                colors.push(c);
                if (++i >= oc.length) {
                    i = 0;
                    ++variation
                }
            }
            for (i = 0, j = 0; i < ln; ++i) {
                s = this.series[i];
                if (!s.color) {
                    s.color = colors[j++].toString()
                } else if (_.isNumber(s.color)) {
                    s.color = colors[s.color].toString()
                }
                if (!s.xaxis) s.xaxis = this.axes.x;
                if (s.xaxis == 1) s.xaxis = this.axes.x;
                else if (s.xaxis == 2) s.xaxis = this.axes.x2;
                if (!s.yaxis) s.yaxis = this.axes.y;
                if (s.yaxis == 1) s.yaxis = this.axes.y;
                else if (s.yaxis == 2) s.yaxis = this.axes.y2;
                for (var t in flotr.graphTypes) {
                    s[t] = _.extend(_.clone(this.options[t]), s[t])
                }
                s.mouse = _.extend(_.clone(this.options.mouse), s.mouse);
                if (_.isUndefined(s.shadowSize)) s.shadowSize = this.options.shadowSize
            }
        },
        _setEl: function(el) {
            if (!el) throw "The target container doesn't exist";
            else if (el.graph instanceof Graph) el.graph.destroy();
            else if (!el.clientWidth) throw "The target container must be visible";
            el.graph = this;
            this.el = el
        }
    };
    Flotr.Graph = Graph
})();
(function() {
    var _ = Flotr._,
        LOGARITHMIC = "logarithmic";

    function Axis(o) {
        this.orientation = 1;
        this.offset = 0;
        this.datamin = Number.MAX_VALUE;
        this.datamax = -Number.MAX_VALUE;
        _.extend(this, o)
    }
    Axis.prototype = {
        setScale: function() {
            var length = this.length,
                max = this.max,
                min = this.min,
                offset = this.offset,
                orientation = this.orientation,
                options = this.options,
                logarithmic = options.scaling === LOGARITHMIC,
                scale;
            if (logarithmic) {
                scale = length / (log(max, options.base) - log(min, options.base))
            } else {
                scale = length / (max - min)
            }
            this.scale = scale;
            if (logarithmic) {
                this.d2p = function(dataValue) {
                    return offset + orientation * (log(dataValue, options.base) - log(min, options.base)) * scale
                };
                this.p2d = function(pointValue) {
                    return exp((offset + orientation * pointValue) / scale + log(min, options.base), options.base)
                }
            } else {
                this.d2p = function(dataValue) {
                    return offset + orientation * (dataValue - min) * scale
                };
                this.p2d = function(pointValue) {
                    return (offset + orientation * pointValue) / scale + min
                }
            }
        },
        calculateTicks: function() {
            var options = this.options;
            this.ticks = [];
            this.minorTicks = [];
            if (options.ticks) {
                this._cleanUserTicks(options.ticks, this.ticks);
                this._cleanUserTicks(options.minorTicks || [], this.minorTicks)
            } else {
                if (options.mode == "time") {
                    this._calculateTimeTicks()
                } else if (options.scaling === "logarithmic") {
                    this._calculateLogTicks()
                } else {
                    this._calculateTicks()
                }
            }
            _.each(this.ticks, function(tick) {
                tick.label += ""
            });
            _.each(this.minorTicks, function(tick) {
                tick.label += ""
            })
        },
        calculateRange: function() {
            if (!this.used) return;
            var axis = this,
                o = axis.options,
                min = o.min !== null ? o.min : axis.datamin,
                max = o.max !== null ? o.max : axis.datamax,
                margin = o.autoscaleMargin;
            if (o.scaling == "logarithmic") {
                if (min <= 0) min = axis.datamin;
                if (max <= 0) max = min
            }
            if (max == min) {
                var widen = max ? .01 : 1;
                if (o.min === null) min -= widen;
                if (o.max === null) max += widen
            }
            if (o.scaling === "logarithmic") {
                if (min < 0) min = max / o.base;
                var maxexp = Math.log(max);
                if (o.base != Math.E) maxexp /= Math.log(o.base);
                maxexp = Math.ceil(maxexp);
                var minexp = Math.log(min);
                if (o.base != Math.E) minexp /= Math.log(o.base);
                minexp = Math.ceil(minexp);
                axis.tickSize = Flotr.getTickSize(o.noTicks, minexp, maxexp, o.tickDecimals === null ? 0 : o.tickDecimals);
                if (o.minorTickFreq === null) {
                    if (maxexp - minexp > 10) o.minorTickFreq = 0;
                    else if (maxexp - minexp > 5) o.minorTickFreq = 2;
                    else o.minorTickFreq = 5
                }
            } else {
                axis.tickSize = Flotr.getTickSize(o.noTicks, min, max, o.tickDecimals)
            }
            axis.min = min;
            axis.max = max;
            if (o.min === null && o.autoscale) {
                axis.min -= axis.tickSize * margin;
                if (axis.min < 0 && axis.datamin >= 0) axis.min = 0;
                axis.min = axis.tickSize * Math.floor(axis.min / axis.tickSize)
            }
            if (o.max === null && o.autoscale) {
                axis.max += axis.tickSize * margin;
                if (axis.max > 0 && axis.datamax <= 0 && axis.datamax != axis.datamin) axis.max = 0;
                axis.max = axis.tickSize * Math.ceil(axis.max / axis.tickSize)
            }
            if (axis.min == axis.max) axis.max = axis.min + 1
        },
        calculateTextDimensions: function(T, options) {
            var maxLabel = "",
                length, i;
            if (this.options.showLabels) {
                for (i = 0; i < this.ticks.length; ++i) {
                    length = this.ticks[i].label.length;
                    if (length > maxLabel.length) {
                        maxLabel = this.ticks[i].label
                    }
                }
            }
            this.maxLabel = T.dimensions(maxLabel, {
                size: options.fontSize,
                angle: Flotr.toRad(this.options.labelsAngle)
            }, "font-size:smaller;", "flotr-grid-label");
            this.titleSize = T.dimensions(this.options.title, {
                size: options.fontSize * 1.2,
                angle: Flotr.toRad(this.options.titleAngle)
            }, "font-weight:bold;", "flotr-axis-title")
        },
        _cleanUserTicks: function(ticks, axisTicks) {
            var axis = this,
                options = this.options,
                v, i, label, tick;
            if (_.isFunction(ticks)) ticks = ticks({
                min: axis.min,
                max: axis.max
            });
            for (i = 0; i < ticks.length; ++i) {
                tick = ticks[i];
                if (typeof tick === "object") {
                    v = tick[0];
                    label = tick.length > 1 ? tick[1] : options.tickFormatter(v, {
                        min: axis.min,
                        max: axis.max
                    })
                } else {
                    v = tick;
                    label = options.tickFormatter(v, {
                        min: this.min,
                        max: this.max
                    })
                }
                axisTicks[i] = {
                    v: v,
                    label: label
                }
            }
        },
        _calculateTimeTicks: function() {
            this.ticks = Flotr.Date.generator(this)
        },
        _calculateLogTicks: function() {
            var axis = this,
                o = axis.options,
                v, decadeStart;
            var max = Math.log(axis.max);
            if (o.base != Math.E) max /= Math.log(o.base);
            max = Math.ceil(max);
            var min = Math.log(axis.min);
            if (o.base != Math.E) min /= Math.log(o.base);
            min = Math.ceil(min);
            for (i = min; i < max; i += axis.tickSize) {
                decadeStart = o.base == Math.E ? Math.exp(i) : Math.pow(o.base, i);
                var decadeEnd = decadeStart * (o.base == Math.E ? Math.exp(axis.tickSize) : Math.pow(o.base, axis.tickSize));
                var stepSize = (decadeEnd - decadeStart) / o.minorTickFreq;
                axis.ticks.push({
                    v: decadeStart,
                    label: o.tickFormatter(decadeStart, {
                        min: axis.min,
                        max: axis.max
                    })
                });
                for (v = decadeStart + stepSize; v < decadeEnd; v += stepSize) axis.minorTicks.push({
                    v: v,
                    label: o.tickFormatter(v, {
                        min: axis.min,
                        max: axis.max
                    })
                })
            }
            decadeStart = o.base == Math.E ? Math.exp(i) : Math.pow(o.base, i);
            axis.ticks.push({
                v: decadeStart,
                label: o.tickFormatter(decadeStart, {
                    min: axis.min,
                    max: axis.max
                })
            })
        },
        _calculateTicks: function() {
            var axis = this,
                o = axis.options,
                tickSize = axis.tickSize,
                min = axis.min,
                max = axis.max,
                start = tickSize * Math.ceil(min / tickSize),
                decimals, minorTickSize, v, v2, i, j;
            if (o.minorTickFreq) minorTickSize = tickSize / o.minorTickFreq;
            for (i = 0;
                (v = v2 = start + i * tickSize) <= max; ++i) {
                decimals = o.tickDecimals;
                if (decimals === null) decimals = 1 - Math.floor(Math.log(tickSize) / Math.LN10);
                if (decimals < 0) decimals = 0;
                v = v.toFixed(decimals);
                axis.ticks.push({
                    v: v,
                    label: o.tickFormatter(v, {
                        min: axis.min,
                        max: axis.max
                    })
                });
                if (o.minorTickFreq) {
                    for (j = 0; j < o.minorTickFreq && i * tickSize + j * minorTickSize < max; ++j) {
                        v = v2 + j * minorTickSize;
                        axis.minorTicks.push({
                            v: v,
                            label: o.tickFormatter(v, {
                                min: axis.min,
                                max: axis.max
                            })
                        })
                    }
                }
            }
        }
    };
    _.extend(Axis, {
        getAxes: function(options) {
            return {
                x: new Axis({
                    options: options.xaxis,
                    n: 1,
                    length: this.plotWidth
                }),
                x2: new Axis({
                    options: options.x2axis,
                    n: 2,
                    length: this.plotWidth
                }),
                y: new Axis({
                    options: options.yaxis,
                    n: 1,
                    length: this.plotHeight,
                    offset: this.plotHeight,
                    orientation: -1
                }),
                y2: new Axis({
                    options: options.y2axis,
                    n: 2,
                    length: this.plotHeight,
                    offset: this.plotHeight,
                    orientation: -1
                })
            }
        }
    });

    function log(value, base) {
        value = Math.log(Math.max(value, Number.MIN_VALUE));
        if (base !== Math.E) value /= Math.log(base);
        return value
    }

    function exp(value, base) {
        return base === Math.E ? Math.exp(value) : Math.pow(base, value)
    }
    Flotr.Axis = Axis
})();
(function() {
    var _ = Flotr._;

    function Series(o) {
        _.extend(this, o)
    }
    Series.prototype = {
        getRange: function() {
            var data = this.data,
                length = data.length,
                xmin = Number.MAX_VALUE,
                ymin = Number.MAX_VALUE,
                xmax = -Number.MAX_VALUE,
                ymax = -Number.MAX_VALUE,
                xused = false,
                yused = false,
                x, y, i;
            if (length < 0 || this.hide) return false;
            for (i = 0; i < length; i++) {
                x = data[i][0];
                y = data[i][1];
                if (x !== null) {
                    if (x < xmin) {
                        xmin = x;
                        xused = true
                    }
                    if (x > xmax) {
                        xmax = x;
                        xused = true
                    }
                }
                if (y !== null) {
                    if (y < ymin) {
                        ymin = y;
                        yused = true
                    }
                    if (y > ymax) {
                        ymax = y;
                        yused = true
                    }
                }
            }
            return {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
                xused: xused,
                yused: yused
            }
        }
    };
    _.extend(Series, {
        getSeries: function(data) {
            return _.map(data, function(s) {
                var series;
                if (s.data) {
                    series = new Series;
                    _.extend(series, s)
                } else {
                    series = new Series({
                        data: s
                    })
                }
                return series
            })
        }
    });
    Flotr.Series = Series
})();
(function() {
    var F = Flotr,
        D = F.DOM,
        _ = F._,
        Text = function(o) {
            this.o = o
        };
    Text.prototype = {
        dimensions: function(text, canvasStyle, htmlStyle, className) {
            if (!text) return {
                width: 0,
                height: 0
            };
            return this.o.html ? this.html(text, this.o.element, htmlStyle, className) : this.canvas(text, canvasStyle)
        },
        canvas: function(text, style) {
            if (!this.o.textEnabled) return;
            style = style || {};
            var metrics = this.measureText(text, style),
                width = metrics.width,
                height = style.size || F.defaultOptions.fontSize,
                angle = style.angle || 0,
                cosAngle = Math.cos(angle),
                sinAngle = Math.sin(angle),
                widthPadding = 2,
                heightPadding = 6,
                bounds;
            bounds = {
                width: Math.abs(cosAngle * width) + Math.abs(sinAngle * height) + widthPadding,
                height: Math.abs(sinAngle * width) + Math.abs(cosAngle * height) + heightPadding
            };
            return bounds
        },
        html: function(text, element, style, className) {
            var div = D.create("div");
            D.setStyles(div, {
                position: "absolute",
                top: "-100000px"
            });
            D.insert(div, '<div style="' + style + '" class="' + className + ' flotr-dummy-div">' + text + "</div>");
            D.insert(this.o.element, div);
            return D.size(div)
        },
        measureText: function(text, style) {
            var context = this.o.ctx,
                metrics;
            if (!context.fillText || F.isIphone && context.measure) {
                return {
                    width: context.measure(text, style)
                }
            }
            style = _.extend({
                size: F.defaultOptions.fontSize,
                weight: 1,
                angle: 0
            }, style);
            context.save();
            context.font = (style.weight > 1 ? "bold " : "") + style.size * 1.3 + "px sans-serif";
            metrics = context.measureText(text);
            context.restore();
            return metrics
        }
    };
    Flotr.Text = Text
})();
Flotr.addType("lines", {
    options: {
        show: false,
        lineWidth: 2,
        fill: false,
        fillBorder: false,
        fillColor: null,
        fillOpacity: .4,
        steps: false,
        stacked: false
    },
    stack: {
        values: []
    },
    draw: function(options) {
        var context = options.context,
            lineWidth = options.lineWidth,
            shadowSize = options.shadowSize,
            offset;
        context.save();
        context.lineJoin = "round";
        if (shadowSize && false) {
            context.lineWidth = shadowSize / 2;
            offset = lineWidth / 2 + context.lineWidth / 2;
            context.strokeStyle = "rgba(0,0,0,0.1)";
            this.plot(options, offset + shadowSize / 2, false);
            context.strokeStyle = "rgba(0,0,0,0.2)";
            this.plot(options, offset, false)
        }
        context.lineWidth = lineWidth;
        context.strokeStyle = options.color;
        this.plot(options, 0, true);
        context.restore()
    },
    plot: function(options, shadowOffset, incStack) {
        var context = options.context,
            width = options.width,
            height = options.height,
            xScale = options.xScale,
            yScale = options.yScale,
            data = options.data,
            stack = options.stacked ? this.stack : false,
            length = data.length - 1,
            prevx = null,
            prevy = null,
            zero = yScale(0),
            start = null,
            x1, x2, y1, y2, stack1, stack2, i;
        if (length < 1) return;
        context.beginPath();
        for (i = 0; i < length; ++i) {
            if (data[i][1] === null || data[i + 1][1] === null) {
                if (options.fill) {
                    if (i > 0 && data[i][1]) {
                        context.stroke();
                        fill();
                        start = null;
                        context.closePath();
                        context.beginPath()
                    }
                }
                continue
            }
            x1 = xScale(data[i][0]);
            x2 = xScale(data[i + 1][0]);
            if (start === null) start = data[i];
            if (stack) {
                stack1 = stack.values[i] || 0;
                stack2 = stack.values[i + 1] || 0;
                y1 = yScale(data[i][1] + stack1);
                y2 = yScale(data[i + 1][1] + stack2)
            } else {
                y1 = yScale(data[i][1]);
                y2 = yScale(data[i + 1][1])
            }
            if (y1 > height && y2 > height || y1 < 0 && y2 < 0 || x1 < 0 && x2 < 0 || x1 > width && x2 > width) continue;
            if (prevx != x1 || prevy != y1 + shadowOffset) context.moveTo(x1, y1 + shadowOffset);
            prevx = x2;
            prevy = y2 + shadowOffset;
            if (options.steps) {
                context.lineTo(prevx + shadowOffset / 2, y1 + shadowOffset);
                context.lineTo(prevx + shadowOffset / 2, prevy)
            } else {
                context.lineTo(prevx, prevy)
            }
        }
        if (!options.fill || options.fill && !options.fillBorder) context.stroke();
        fill();
        if (stack) {
            for (i = 0; i < length; ++i) {
                stack1 = stack.values[i] || 0;
                stack2 = stack.values[i + 1] || 0;
                if (incStack) {
                    stack.values[i] = data[i][1] + stack1;
                    if (i == length - 1) stack.values[i + 1] = data[i + 1][1] + stack2
                }
            }
        }

        function drawPathRev(data) {
            var j = null;
            for (j = length - 1; j >= 0; --j) {
                if (!options.fill) return;
                if (!data[j]) return;
                if (data[j][1] === null) {
                    data[j][1] = 0
                }
                x = xScale(data[j][0]);
                y = yScale(data[j][1]);
                if (y < 0) y = 0;
                if (y > height || x > width || y < 0 || x < 0) return;
                context.lineTo(x, y);
                context.stroke()
            }
        }

        function stackToPlot(values) {
            var stack_data = [];
            var x_offset = data[0][0];
            for (i = 0; i < values.length; ++i) {
                stack_data.push([i + x_offset, values[i]])
            }
            return stack_data
        }

        function fill() {
            if (!shadowOffset && options.fill && start) {
                if (options.fillBorder) {
                    context.stroke()
                }
                x1 = xScale(start[0]);
                context.fillStyle = options.fillStyle;
                if (!stack || stack.values.length === 0) {
                    context.lineTo(x2, zero);
                    context.lineTo(x1, zero);
                    context.lineTo(x1, yScale(start[1]))
                } else {
                    var stack_plot = stackToPlot(stack.values);
                    stack_x1 = xScale(stack_plot[0][0]);
                    stack_y2 = yScale(stack_plot[stack_plot.length - 1][1]);
                    context.lineTo(x2, stack_y2);
                    drawPathRev(stack_plot);
                    context.lineTo(stack_x1, yScale(data[0][1]))
                }
                context.fill()
            }
        }
    },
    extendYRange: function(axis, data, options, lines) {
        var o = axis.options;
        if (options.stacked && (!o.max && o.max !== 0 || !o.min && o.min !== 0)) {
            var newmax = axis.max,
                newmin = axis.min,
                positiveSums = lines.positiveSums || {},
                negativeSums = lines.negativeSums || {},
                x, j;
            for (j = 0; j < data.length; j++) {
                x = data[j][0] + "";
                if (data[j][1] > 0) {
                    positiveSums[x] = (positiveSums[x] || 0) + data[j][1];
                    newmax = Math.max(newmax, positiveSums[x])
                } else {
                    negativeSums[x] = (negativeSums[x] || 0) + data[j][1];
                    newmin = Math.min(newmin, negativeSums[x])
                }
            }
            lines.negativeSums = negativeSums;
            lines.positiveSums = positiveSums;
            axis.max = newmax;
            axis.min = newmin
        }
        if (options.steps) {
            this.hit = function(options) {
                var data = options.data,
                    args = options.args,
                    yScale = options.yScale,
                    mouse = args[0],
                    length = data.length,
                    n = args[1],
                    x = options.xInverse(mouse.relX),
                    relY = mouse.relY,
                    i;
                for (i = 0; i < length - 1; i++) {
                    if (x >= data[i][0] && x <= data[i + 1][0]) {
                        if (Math.abs(yScale(data[i][1]) - relY) < 8) {
                            n.x = data[i][0];
                            n.y = data[i][1];
                            n.index = i;
                            n.seriesIndex = options.index
                        }
                        break
                    }
                }
            };
            this.drawHit = function(options) {
                var context = options.context,
                    args = options.args,
                    data = options.data,
                    xScale = options.xScale,
                    index = args.index,
                    x = xScale(args.x),
                    y = options.yScale(args.y),
                    x2;
                if (data.length - 1 > index) {
                    x2 = options.xScale(data[index + 1][0]);
                    context.save();
                    context.strokeStyle = options.color;
                    context.lineWidth = options.lineWidth;
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x2, y);
                    context.stroke();
                    context.closePath();
                    context.restore()
                }
            };
            this.clearHit = function(options) {
                var context = options.context,
                    args = options.args,
                    data = options.data,
                    xScale = options.xScale,
                    width = options.lineWidth,
                    index = args.index,
                    x = xScale(args.x),
                    y = options.yScale(args.y),
                    x2;
                if (data.length - 1 > index) {
                    x2 = options.xScale(data[index + 1][0]);
                    context.clearRect(x - width, y - width, x2 - x + 2 * width, 2 * width)
                }
            }
        }
    }
});
Flotr.addType("bars", {
    options: {
        show: false,
        lineWidth: 2,
        barWidth: 1,
        fill: true,
        fillColor: null,
        fillOpacity: .4,
        horizontal: false,
        stacked: false,
        centered: true,
        topPadding: .1,
        grouped: false
    },
    stack: {
        positive: [],
        negative: [],
        _positive: [],
        _negative: []
    },
    draw: function(options) {
        var context = options.context;
        this.current += 1;
        context.save();
        context.lineJoin = "miter";
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;
        if (options.fill) context.fillStyle = options.fillStyle;
        this.plot(options);
        context.restore()
    },
    plot: function(options) {
        var data = options.data,
            context = options.context,
            shadowSize = options.shadowSize,
            i, geometry, left, top, width, height;
        if (data.length < 1) return;
        this.translate(context, options.horizontal);
        for (i = 0; i < data.length; i++) {
            geometry = this.getBarGeometry(data[i][0], data[i][1], options);
            if (geometry === null) continue;
            left = geometry.left;
            top = geometry.top;
            width = geometry.width;
            height = geometry.height;
            if (options.fill) context.fillRect(left, top, width, height);
            if (shadowSize) {
                context.save();
                context.fillStyle = "rgba(0,0,0,0.05)";
                context.fillRect(left + shadowSize, top + shadowSize, width, height);
                context.restore()
            }
            if (options.lineWidth) {
                context.strokeRect(left, top, width, height)
            }
        }
    },
    translate: function(context, horizontal) {
        if (horizontal) {
            context.rotate(-Math.PI / 2);
            context.scale(-1, 1)
        }
    },
    getBarGeometry: function(x, y, options) {
        var horizontal = options.horizontal,
            barWidth = options.barWidth,
            centered = options.centered,
            stack = options.stacked ? this.stack : false,
            lineWidth = options.lineWidth,
            bisection = centered ? barWidth / 2 : 0,
            xScale = horizontal ? options.yScale : options.xScale,
            yScale = horizontal ? options.xScale : options.yScale,
            xValue = horizontal ? y : x,
            yValue = horizontal ? x : y,
            stackOffset = 0,
            stackValue, left, right, top, bottom;
        if (options.grouped) {
            this.current / this.groups;
            xValue = xValue - bisection;
            barWidth = barWidth / this.groups;
            bisection = barWidth / 2;
            xValue = xValue + barWidth * this.current - bisection
        }
        if (stack) {
            stackValue = yValue > 0 ? stack.positive : stack.negative;
            stackOffset = stackValue[xValue] || stackOffset;
            stackValue[xValue] = stackOffset + yValue
        }
        left = xScale(xValue - bisection);
        right = xScale(xValue + barWidth - bisection);
        top = yScale(yValue + stackOffset);
        bottom = yScale(stackOffset);
        if (bottom < 0) bottom = 0;
        return x === null || y === null ? null : {
            x: xValue,
            y: yValue,
            xScale: xScale,
            yScale: yScale,
            top: top,
            left: Math.min(left, right) - lineWidth / 2,
            width: Math.abs(right - left) - lineWidth,
            height: bottom - top
        }
    },
    hit: function(options) {
        var data = options.data,
            args = options.args,
            mouse = args[0],
            n = args[1],
            x = options.xInverse(mouse.relX),
            y = options.yInverse(mouse.relY),
            hitGeometry = this.getBarGeometry(x, y, options),
            width = hitGeometry.width / 2,
            left = hitGeometry.left,
            height = hitGeometry.y,
            geometry, i;
        for (i = data.length; i--;) {
            geometry = this.getBarGeometry(data[i][0], data[i][1], options);
            if ((height > 0 && height < geometry.y || height < 0 && height > geometry.y) && Math.abs(left - geometry.left) < width) {
                n.x = data[i][0];
                n.y = data[i][1];
                n.index = i;
                n.seriesIndex = options.index
            }
        }
    },
    drawHit: function(options) {
        var context = options.context,
            args = options.args,
            geometry = this.getBarGeometry(args.x, args.y, options),
            left = geometry.left,
            top = geometry.top,
            width = geometry.width,
            height = geometry.height;
        context.save();
        context.strokeStyle = options.color;
        context.lineWidth = options.lineWidth;
        this.translate(context, options.horizontal);
        context.beginPath();
        context.moveTo(left, top + height);
        context.lineTo(left, top);
        context.lineTo(left + width, top);
        context.lineTo(left + width, top + height);
        if (options.fill) {
            context.fillStyle = options.fillStyle;
            context.fill()
        }
        context.stroke();
        context.closePath();
        context.restore()
    },
    clearHit: function(options) {
        var context = options.context,
            args = options.args,
            geometry = this.getBarGeometry(args.x, args.y, options),
            left = geometry.left,
            width = geometry.width,
            top = geometry.top,
            height = geometry.height,
            lineWidth = 2 * options.lineWidth;
        context.save();
        this.translate(context, options.horizontal);
        context.clearRect(left - lineWidth, Math.min(top, top + height) - lineWidth, width + 2 * lineWidth, Math.abs(height) + 2 * lineWidth);
        context.restore()
    },
    extendXRange: function(axis, data, options, bars) {
        this._extendRange(axis, data, options, bars);
        this.groups = this.groups + 1 || 1;
        this.current = 0
    },
    extendYRange: function(axis, data, options, bars) {
        this._extendRange(axis, data, options, bars)
    },
    _extendRange: function(axis, data, options, bars) {
        var max = axis.options.max;
        if (_.isNumber(max) || _.isString(max)) return;
        var newmin = axis.min,
            newmax = axis.max,
            horizontal = options.horizontal,
            orientation = axis.orientation,
            positiveSums = this.positiveSums || {},
            negativeSums = this.negativeSums || {},
            value, datum, index, j;
        if (orientation == 1 && !horizontal || orientation == -1 && horizontal) {
            if (options.centered) {
                newmax = Math.max(axis.datamax + options.barWidth, newmax);
                newmin = Math.min(axis.datamin - options.barWidth, newmin)
            }
        }
        if (options.stacked && (orientation == 1 && horizontal || orientation == -1 && !horizontal)) {
            for (j = data.length; j--;) {
                value = data[j][orientation == 1 ? 1 : 0] + "";
                datum = data[j][orientation == 1 ? 0 : 1];
                if (datum > 0) {
                    positiveSums[value] = (positiveSums[value] || 0) + datum;
                    newmax = Math.max(newmax, positiveSums[value])
                } else {
                    negativeSums[value] = (negativeSums[value] || 0) + datum;
                    newmin = Math.min(newmin, negativeSums[value])
                }
            }
        }
        if (orientation == 1 && horizontal || orientation == -1 && !horizontal) {
            if (options.topPadding && (axis.max === axis.datamax || options.stacked && this.stackMax !== newmax)) {
                newmax += options.topPadding * (newmax - newmin)
            }
        }
        this.stackMin = newmin;
        this.stackMax = newmax;
        this.negativeSums = negativeSums;
        this.positiveSums = positiveSums;
        axis.max = newmax;
        axis.min = newmin
    }
});
Flotr.addType("bubbles", {
    options: {
        show: false,
        lineWidth: 2,
        fill: true,
        fillOpacity: .4,
        baseRadius: 2
    },
    draw: function(options) {
        var context = options.context,
            shadowSize = options.shadowSize;
        context.save();
        context.lineWidth = options.lineWidth;
        context.fillStyle = "rgba(0,0,0,0.05)";
        context.strokeStyle = "rgba(0,0,0,0.05)";
        this.plot(options, shadowSize / 2);
        context.strokeStyle = "rgba(0,0,0,0.1)";
        this.plot(options, shadowSize / 4);
        context.strokeStyle = options.color;
        context.fillStyle = options.fillStyle;
        this.plot(options);
        context.restore()
    },
    plot: function(options, offset) {
        var data = options.data,
            context = options.context,
            geometry, i, x, y, z;
        offset = offset || 0;
        for (i = 0; i < data.length; ++i) {
            geometry = this.getGeometry(data[i], options);
            context.beginPath();
            context.arc(geometry.x + offset, geometry.y + offset, geometry.z, 0, 2 * Math.PI, true);
            context.stroke();
            if (options.fill) context.fill();
            context.closePath()
        }
    },
    getGeometry: function(point, options) {
        return {
            x: options.xScale(point[0]),
            y: options.yScale(point[1]),
            z: point[2] * options.baseRadius
        }
    },
    hit: function(options) {
        var data = options.data,
            args = options.args,
            mouse = args[0],
            n = args[1],
            relX = mouse.relX,
            relY = mouse.relY,
            distance, geometry, dx, dy;
        n.best = n.best || Number.MAX_VALUE;
        for (i = data.length; i--;) {
            geometry = this.getGeometry(data[i], options);
            dx = geometry.x - relX;
            dy = geometry.y - relY;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < geometry.z && geometry.z < n.best) {
                n.x = data[i][0];
                n.y = data[i][1];
                n.index = i;
                n.seriesIndex = options.index;
                n.best = geometry.z
            }
        }
    },
    drawHit: function(options) {
        var context = options.context,
            geometry = this.getGeometry(options.data[options.args.index], options);
        context.save();
        context.lineWidth = options.lineWidth;
        context.fillStyle = options.fillStyle;
        context.strokeStyle = options.color;
        context.beginPath();
        context.arc(geometry.x, geometry.y, geometry.z, 0, 2 * Math.PI, true);
        context.fill();
        context.stroke();
        context.closePath();
        context.restore()
    },
    clearHit: function(options) {
        var context = options.context,
            geometry = this.getGeometry(options.data[options.args.index], options),
            offset = geometry.z + options.lineWidth;
        context.save();
        context.clearRect(geometry.x - offset, geometry.y - offset, 2 * offset, 2 * offset);
        context.restore()
    }
});
(function() {
    Flotr.defaultMarkerFormatter = function(obj) {
        return Math.round(obj.y * 100) / 100 + ""
    };
    Flotr.addType("markers", {
        options: {
            show: false,
            lineWidth: 1,
            color: "#000000",
            fill: false,
            fillColor: "#FFFFFF",
            fillOpacity: .4,
            stroke: false,
            position: "ct",
            verticalMargin: 0,
            labelFormatter: Flotr.defaultMarkerFormatter,
            fontSize: Flotr.defaultOptions.fontSize,
            stacked: false,
            stackingType: "b",
            horizontal: false
        },
        stack: {
            positive: [],
            negative: [],
            values: []
        },
        draw: function(options) {
            var data = options.data,
                context = options.context,
                stack = options.stacked ? options.stack : false,
                stackType = options.stackingType,
                stackOffsetNeg, stackOffsetPos, stackOffset, i, x, y, label;
            context.save();
            context.lineJoin = "round";
            context.lineWidth = options.lineWidth;
            context.strokeStyle = "rgba(0,0,0,0.5)";
            context.fillStyle = options.fillStyle;

            function stackPos(a, b) {
                stackOffsetPos = stack.negative[a] || 0;
                stackOffsetNeg = stack.positive[a] || 0;
                if (b > 0) {
                    stack.positive[a] = stackOffsetPos + b;
                    return stackOffsetPos + b
                } else {
                    stack.negative[a] = stackOffsetNeg + b;
                    return stackOffsetNeg + b
                }
            }
            for (i = 0; i < data.length; ++i) {
                x = data[i][0];
                y = data[i][1];
                if (stack) {
                    if (stackType == "b") {
                        if (options.horizontal) y = stackPos(y, x);
                        else x = stackPos(x, y)
                    } else if (stackType == "a") {
                        stackOffset = stack.values[x] || 0;
                        stack.values[x] = stackOffset + y;
                        y = stackOffset + y
                    }
                }
                label = options.labelFormatter({
                    x: x,
                    y: y,
                    index: i,
                    data: data
                });
                this.plot(options.xScale(x), options.yScale(y), label, options)
            }
            context.restore()
        },
        plot: function(x, y, label, options) {
            var context = options.context;
            if (isImage(label) && !label.complete) {
                throw "Marker image not loaded."
            } else {
                this._plot(x, y, label, options)
            }
        },
        _plot: function(x, y, label, options) {
            var context = options.context,
                margin = 2,
                left = x,
                top = y,
                dim;
            if (isImage(label)) dim = {
                height: label.height,
                width: label.width
            };
            else dim = options.text.canvas(label);
            dim.width = Math.floor(dim.width + margin * 2);
            dim.height = Math.floor(dim.height + margin * 2);
            if (options.position.indexOf("c") != -1) left -= dim.width / 2 + margin;
            else if (options.position.indexOf("l") != -1) left -= dim.width;
            if (options.position.indexOf("m") != -1) top -= dim.height / 2 + margin;
            else if (options.position.indexOf("t") != -1) top -= dim.height + options.verticalMargin;
            else top += options.verticalMargin;
            left = Math.floor(left) + .5;
            top = Math.floor(top) + .5;
            if (options.fill) context.fillRect(left, top, dim.width, dim.height);
            if (options.stroke) context.strokeRect(left, top, dim.width, dim.height);
            if (isImage(label)) context.drawImage(label, parseInt(left + margin, 10), parseInt(top + margin, 10));
            else Flotr.drawText(context, label, left + margin, top + margin, {
                textBaseline: "top",
                textAlign: "left",
                size: options.fontSize,
                color: options.color
            })
        }
    });

    function isImage(i) {
        return typeof i === "object" && i.constructor && (Image ? true : i.constructor === Image)
    }
})();
(function() {
    var _ = Flotr._;
    Flotr.defaultPieLabelFormatter = function(total, value) {
        return (100 * value / total).toFixed(2) + "%"
    };
    Flotr.addType("pie", {
        options: {
            show: false,
            lineWidth: 1,
            fill: true,
            fillColor: null,
            fillOpacity: .6,
            explode: 6,
            sizeRatio: .6,
            startAngle: Math.PI / 4,
            labelFormatter: Flotr.defaultPieLabelFormatter,
            pie3D: false,
            pie3DviewAngle: Math.PI / 2 * .8,
            pie3DspliceThickness: 20,
            epsilon: .1
        },
        draw: function(options) {
            var data = options.data,
                context = options.context,
                canvas = context.canvas,
                lineWidth = options.lineWidth,
                shadowSize = options.shadowSize,
                sizeRatio = options.sizeRatio,
                height = options.height,
                width = options.width,
                explode = options.explode,
                color = options.color,
                fill = options.fill,
                fillStyle = options.fillStyle,
                radius = Math.min(canvas.width, canvas.height) * sizeRatio / 2,
                value = data[0][1],
                html = [],
                vScale = 1,
                measure = Math.PI * 2 * value / this.total,
                startAngle = this.startAngle || 2 * Math.PI * options.startAngle,
                endAngle = startAngle + measure,
                bisection = startAngle + measure / 2,
                label = options.labelFormatter(this.total, value),
                explodeCoeff = explode + radius + 4,
                distX = Math.cos(bisection) * explodeCoeff,
                distY = Math.sin(bisection) * explodeCoeff,
                textAlign = distX < 0 ? "right" : "left",
                textBaseline = distY > 0 ? "top" : "bottom",
                style, x, y;
            context.save();
            context.translate(width / 2, height / 2);
            context.scale(1, vScale);
            x = Math.cos(bisection) * explode;
            y = Math.sin(bisection) * explode;
            if (shadowSize > 0) {
                this.plotSlice(x + shadowSize, y + shadowSize, radius, startAngle, endAngle, context);
                if (fill) {
                    context.fillStyle = "rgba(0,0,0,0.1)";
                    context.fill()
                }
            }
            this.plotSlice(x, y, radius, startAngle, endAngle, context);
            if (fill) {
                context.fillStyle = fillStyle;
                context.fill()
            }
            context.lineWidth = lineWidth;
            context.strokeStyle = color;
            context.stroke();
            style = {
                size: options.fontSize * 1.2,
                color: options.fontColor,
                weight: 1.5
            };
            if (label) {
                if (options.htmlText || !options.textEnabled) {
                    divStyle = "position:absolute;" + textBaseline + ":" + (height / 2 + (textBaseline === "top" ? distY : -distY)) + "px;";
                    divStyle += textAlign + ":" + (width / 2 + (textAlign === "right" ? -distX : distX)) + "px;";
                    html.push('<div style="', divStyle, '" class="flotr-grid-label">', label, "</div>")
                } else {
                    style.textAlign = textAlign;
                    style.textBaseline = textBaseline;
                    Flotr.drawText(context, label, distX, distY, style)
                }
            }
            if (options.htmlText || !options.textEnabled) {
                var div = Flotr.DOM.node('<div style="color:' + options.fontColor + '" class="flotr-labels"></div>');
                Flotr.DOM.insert(div, html.join(""));
                Flotr.DOM.insert(options.element, div)
            }
            context.restore();
            this.startAngle = endAngle;
            this.slices = this.slices || [];
            this.slices.push({
                radius: Math.min(canvas.width, canvas.height) * sizeRatio / 2,
                x: x,
                y: y,
                explode: explode,
                start: startAngle,
                end: endAngle
            })
        },
        plotSlice: function(x, y, radius, startAngle, endAngle, context) {
            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, radius, startAngle, endAngle, false);
            context.lineTo(x, y);
            context.closePath()
        },
        hit: function(options) {
            var data = options.data[0],
                args = options.args,
                index = options.index,
                mouse = args[0],
                n = args[1],
                slice = this.slices[index],
                x = mouse.relX - options.width / 2,
                y = mouse.relY - options.height / 2,
                r = Math.sqrt(x * x + y * y),
                theta = Math.atan(y / x),
                circle = Math.PI * 2,
                explode = slice.explode || options.explode,
                start = slice.start % circle,
                end = slice.end % circle,
                epsilon = options.epsilon;
            if (x < 0) {
                theta += Math.PI
            } else if (x > 0 && y < 0) {
                theta += circle
            }
            if (r < slice.radius + explode && r > explode) {
                if (theta > start && theta < end || start > end && (theta < end || theta > start) || start === end && (slice.start === slice.end && Math.abs(theta - start) < epsilon || slice.start !== slice.end && Math.abs(theta - start) > epsilon)) {
                    n.x = data[0];
                    n.y = data[1];
                    n.sAngle = start;
                    n.eAngle = end;
                    n.index = 0;
                    n.seriesIndex = index;
                    n.fraction = data[1] / this.total
                }
            }
        },
        drawHit: function(options) {
            var context = options.context,
                slice = this.slices[options.args.seriesIndex];
            context.save();
            context.translate(options.width / 2, options.height / 2);
            this.plotSlice(slice.x, slice.y, slice.radius, slice.start, slice.end, context);
            context.stroke();
            context.restore()
        },
        clearHit: function(options) {
            var context = options.context,
                slice = this.slices[options.args.seriesIndex],
                padding = 2 * options.lineWidth,
                radius = slice.radius + padding;
            context.save();
            context.translate(options.width / 2, options.height / 2);
            context.clearRect(slice.x - radius, slice.y - radius, 2 * radius + padding, 2 * radius + padding);
            context.restore()
        },
        extendYRange: function(axis, data) {
            this.total = (this.total || 0) + data[0][1]
        }
    })
})();
Flotr.addType("points", {
    options: {
        show: false,
        radius: 3,
        lineWidth: 2,
        fill: true,
        fillColor: "#FFFFFF",
        fillOpacity: 1,
        hitRadius: null
    },
    draw: function(options) {
        var context = options.context,
            lineWidth = options.lineWidth,
            shadowSize = options.shadowSize;
        context.save();
        if (shadowSize > 0) {
            context.lineWidth = shadowSize / 2;
            context.strokeStyle = "rgba(0,0,0,0.1)";
            this.plot(options, shadowSize / 2 + context.lineWidth / 2);
            context.strokeStyle = "rgba(0,0,0,0.2)";
            this.plot(options, context.lineWidth / 2)
        }
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;
        if (options.fill) context.fillStyle = options.fillStyle;
        this.plot(options);
        context.restore()
    },
    plot: function(options, offset) {
        var data = options.data,
            context = options.context,
            xScale = options.xScale,
            yScale = options.yScale,
            i, x, y;
        for (i = data.length - 1; i > -1; --i) {
            y = data[i][1];
            if (y === null) continue;
            x = xScale(data[i][0]);
            y = yScale(y);
            if (x < 0 || x > options.width || y < 0 || y > options.height) continue;
            context.beginPath();
            if (offset) {
                context.arc(x, y + offset, options.radius, 0, Math.PI, false)
            } else {
                context.arc(x, y, options.radius, 0, 2 * Math.PI, true);
                if (options.fill) context.fill()
            }
            context.stroke();
            context.closePath()
        }
    }
});
Flotr.addType("radar", {
    options: {
        show: false,
        lineWidth: 2,
        fill: true,
        fillOpacity: .4,
        radiusRatio: .9,
        sensibility: 2
    },
    draw: function(options) {
        var context = options.context,
            shadowSize = options.shadowSize;
        context.save();
        context.translate(options.width / 2, options.height / 2);
        context.lineWidth = options.lineWidth;
        context.fillStyle = "rgba(0,0,0,0.05)";
        context.strokeStyle = "rgba(0,0,0,0.05)";
        this.plot(options, shadowSize / 2);
        context.strokeStyle = "rgba(0,0,0,0.1)";
        this.plot(options, shadowSize / 4);
        context.strokeStyle = options.color;
        context.fillStyle = options.fillStyle;
        this.plot(options);
        context.restore()
    },
    plot: function(options, offset) {
        var data = options.data,
            context = options.context,
            radius = Math.min(options.height, options.width) * options.radiusRatio / 2,
            step = 2 * Math.PI / data.length,
            angle = -Math.PI / 2,
            i, ratio;
        offset = offset || 0;
        context.beginPath();
        for (i = 0; i < data.length; ++i) {
            ratio = data[i][1] / this.max;
            context[i === 0 ? "moveTo" : "lineTo"](Math.cos(i * step + angle) * radius * ratio + offset, Math.sin(i * step + angle) * radius * ratio + offset)
        }
        context.closePath();
        if (options.fill) context.fill();
        context.stroke()
    },
    getGeometry: function(point, options) {
        var radius = Math.min(options.height, options.width) * options.radiusRatio / 2,
            step = 2 * Math.PI / options.data.length,
            angle = -Math.PI / 2,
            ratio = point[1] / this.max;
        return {
            x: Math.cos(point[0] * step + angle) * radius * ratio + options.width / 2,
            y: Math.sin(point[0] * step + angle) * radius * ratio + options.height / 2
        }
    },
    hit: function(options) {
        var args = options.args,
            mouse = args[0],
            n = args[1],
            relX = mouse.relX,
            relY = mouse.relY,
            distance, geometry, dx, dy;
        for (var i = 0; i < n.series.length; i++) {
            var serie = n.series[i];
            var data = serie.data;
            for (var j = data.length; j--;) {
                geometry = this.getGeometry(data[j], options);
                dx = geometry.x - relX;
                dy = geometry.y - relY;
                distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < options.sensibility * 2) {
                    n.x = data[j][0];
                    n.y = data[j][1];
                    n.index = j;
                    n.seriesIndex = i;
                    return n
                }
            }
        }
    },
    drawHit: function(options) {
        var step = 2 * Math.PI / options.data.length;
        var angle = -Math.PI / 2;
        var radius = Math.min(options.height, options.width) * options.radiusRatio / 2;
        var s = options.args.series;
        var point_radius = s.points.hitRadius || s.points.radius || s.mouse.radius;
        var context = options.context;
        context.translate(options.width / 2, options.height / 2);
        var j = options.args.index;
        var ratio = options.data[j][1] / this.max;
        var x = Math.cos(j * step + angle) * radius * ratio;
        var y = Math.sin(j * step + angle) * radius * ratio;
        context.beginPath();
        context.arc(x, y, point_radius, 0, 2 * Math.PI, true);
        context.closePath();
        context.stroke()
    },
    clearHit: function(options) {
        var step = 2 * Math.PI / options.data.length;
        var angle = -Math.PI / 2;
        var radius = Math.min(options.height, options.width) * options.radiusRatio / 2;
        var context = options.context;
        var s = options.args.series,
            lw = s.points ? s.points.lineWidth : 1;
        offset = (s.points.hitRadius || s.points.radius || s.mouse.radius) + lw;
        context.translate(options.width / 2, options.height / 2);
        var j = options.args.index;
        var ratio = options.data[j][1] / this.max;
        var x = Math.cos(j * step + angle) * radius * ratio;
        var y = Math.sin(j * step + angle) * radius * ratio;
        context.clearRect(x - offset, y - offset, offset * 2, offset * 2)
    },
    extendYRange: function(axis, data) {
        this.max = Math.max(axis.max, this.max || -Number.MAX_VALUE)
    }
});
(function() {
    function isLeftClick(e, type) {
        return e.which ? e.which === 1 : e.button === 0 || e.button === 1
    }

    function boundX(x, graph) {
        return Math.min(Math.max(0, x), graph.plotWidth - 1)
    }

    function boundY(y, graph) {
        return Math.min(Math.max(0, y), graph.plotHeight)
    }
    var D = Flotr.DOM,
        E = Flotr.EventAdapter,
        _ = Flotr._;
    Flotr.addPlugin("selection", {
        options: {
            pinchOnly: null,
            mode: null,
            color: "#B6D9FF",
            fps: 20
        },
        callbacks: {
            "flotr:mouseup": function(event) {
                var options = this.options.selection,
                    selection = this.selection,
                    pointer = this.getEventPosition(event);
                if (!options || !options.mode) return;
                if (selection.interval) clearInterval(selection.interval);
                if (this.multitouches) {
                    selection.updateSelection()
                } else if (!options.pinchOnly) {
                    selection.setSelectionPos(selection.selection.second, pointer)
                }
                selection.clearSelection();
                if (selection.selecting && selection.selectionIsSane()) {
                    selection.drawSelection();
                    selection.fireSelectEvent();
                    this.ignoreClick = true
                }
            },
            "flotr:mousedown": function(event) {
                var options = this.options.selection,
                    selection = this.selection,
                    pointer = this.getEventPosition(event);
                if (!options || !options.mode) return;
                if (!options.mode || !isLeftClick(event) && _.isUndefined(event.touches)) return;
                if (!options.pinchOnly) selection.setSelectionPos(selection.selection.first, pointer);
                if (selection.interval) clearInterval(selection.interval);
                this.lastMousePos.pageX = null;
                selection.selecting = false;
                selection.interval = setInterval(_.bind(selection.updateSelection, this), 1e3 / options.fps)
            },
            "flotr:destroy": function(event) {
                clearInterval(this.selection.interval)
            }
        },
        getArea: function() {
            var s = this.selection.selection,
                a = this.axes,
                first = s.first,
                second = s.second,
                x1, x2, y1, y2;
            x1 = a.x.p2d(s.first.x);
            x2 = a.x.p2d(s.second.x);
            y1 = a.y.p2d(s.first.y);
            y2 = a.y.p2d(s.second.y);
            return {
                x1: Math.min(x1, x2),
                y1: Math.min(y1, y2),
                x2: Math.max(x1, x2),
                y2: Math.max(y1, y2),
                xfirst: x1,
                xsecond: x2,
                yfirst: y1,
                ysecond: y2
            }
        },
        selection: {
            first: {
                x: -1,
                y: -1
            },
            second: {
                x: -1,
                y: -1
            }
        },
        prevSelection: null,
        interval: null,
        fireSelectEvent: function(name) {
            var area = this.selection.getArea();
            name = name || "select";
            area.selection = this.selection.selection;
            E.fire(this.el, "flotr:" + name, [area, this])
        },
        setSelection: function(area, preventEvent) {
            var options = this.options,
                xa = this.axes.x,
                ya = this.axes.y,
                vertScale = ya.scale,
                hozScale = xa.scale,
                selX = options.selection.mode.indexOf("x") != -1,
                selY = options.selection.mode.indexOf("y") != -1,
                s = this.selection.selection;
            this.selection.clearSelection();
            s.first.y = boundY(selX && !selY ? 0 : (ya.max - area.y1) * vertScale, this);
            s.second.y = boundY(selX && !selY ? this.plotHeight - 1 : (ya.max - area.y2) * vertScale, this);
            s.first.x = boundX(selY && !selX ? 0 : (area.x1 - xa.min) * hozScale, this);
            s.second.x = boundX(selY && !selX ? this.plotWidth : (area.x2 - xa.min) * hozScale, this);
            this.selection.drawSelection();
            if (!preventEvent) this.selection.fireSelectEvent()
        },
        setSelectionPos: function(pos, pointer) {
            var mode = this.options.selection.mode,
                selection = this.selection.selection;
            if (mode.indexOf("x") == -1) {
                pos.x = pos == selection.first ? 0 : this.plotWidth
            } else {
                pos.x = boundX(pointer.relX, this)
            }
            if (mode.indexOf("y") == -1) {
                pos.y = pos == selection.first ? 0 : this.plotHeight - 1
            } else {
                pos.y = boundY(pointer.relY, this)
            }
        },
        drawSelection: function() {
            this.selection.fireSelectEvent("selecting");
            var s = this.selection.selection,
                octx = this.octx,
                options = this.options,
                plotOffset = this.plotOffset,
                prevSelection = this.selection.prevSelection;
            if (prevSelection && s.first.x == prevSelection.first.x && s.first.y == prevSelection.first.y && s.second.x == prevSelection.second.x && s.second.y == prevSelection.second.y) {
                return
            }
            octx.save();
            octx.strokeStyle = this.processColor(options.selection.color, {
                opacity: .8
            });
            octx.lineWidth = 1;
            octx.lineJoin = "miter";
            octx.fillStyle = this.processColor(options.selection.color, {
                opacity: .4
            });
            this.selection.prevSelection = {
                first: {
                    x: s.first.x,
                    y: s.first.y
                },
                second: {
                    x: s.second.x,
                    y: s.second.y
                }
            };
            var x = Math.min(s.first.x, s.second.x),
                y = Math.min(s.first.y, s.second.y),
                w = Math.abs(s.second.x - s.first.x),
                h = Math.abs(s.second.y - s.first.y);
            octx.fillRect(x + plotOffset.left + .5, y + plotOffset.top + .5, w, h);
            octx.strokeRect(x + plotOffset.left + .5, y + plotOffset.top + .5, w, h);
            octx.restore()
        },
        updateSelection: function() {
            if (!this.lastMousePos.pageX) return;
            this.selection.selecting = true;
            if (this.multitouches) {
                this.selection.setSelectionPos(this.selection.selection.first, this.getEventPosition(this.multitouches[0]));
                this.selection.setSelectionPos(this.selection.selection.second, this.getEventPosition(this.multitouches[1]))
            } else if (this.options.selection.pinchOnly) {
                return
            } else {
                this.selection.setSelectionPos(this.selection.selection.second, this.lastMousePos)
            }
            this.selection.clearSelection();
            if (this.selection.selectionIsSane()) {
                this.selection.drawSelection()
            }
        },
        clearSelection: function() {
            if (!this.selection.prevSelection) return;
            var prevSelection = this.selection.prevSelection,
                lw = 1,
                plotOffset = this.plotOffset,
                x = Math.min(prevSelection.first.x, prevSelection.second.x),
                y = Math.min(prevSelection.first.y, prevSelection.second.y),
                w = Math.abs(prevSelection.second.x - prevSelection.first.x),
                h = Math.abs(prevSelection.second.y - prevSelection.first.y);
            this.octx.clearRect(x + plotOffset.left - lw + .5, y + plotOffset.top - lw, w + 2 * lw + .5, h + 2 * lw + .5);
            this.selection.prevSelection = null
        },
        selectionIsSane: function() {
            var s = this.selection.selection;
            return Math.abs(s.second.x - s.first.x) >= 5 || Math.abs(s.second.y - s.first.y) >= 5
        }
    })
})();
(function() {
    var D = Flotr.DOM,
        _ = Flotr._;
    Flotr.addPlugin("legend", {
        options: {
            show: true,
            noColumns: 1,
            labelFormatter: function(v) {
                return v
            },
            labelBoxBorderColor: "#CCCCCC",
            labelBoxWidth: 14,
            labelBoxHeight: 10,
            labelBoxMargin: 5,
            container: null,
            position: "nw",
            margin: 5,
            backgroundColor: "#F0F0F0",
            backgroundOpacity: .85
        },
        callbacks: {
            "flotr:afterinit": function() {
                this.legend.insertLegend()
            },
            "flotr:destroy": function() {
                var markup = this.legend.markup;
                if (markup) {
                    this.legend.markup = null;
                    D.remove(markup)
                }
            }
        },
        insertLegend: function() {
            if (!this.options.legend.show) return;
            var series = this.series,
                plotOffset = this.plotOffset,
                options = this.options,
                legend = options.legend,
                fragments = [],
                rowStarted = false,
                ctx = this.ctx,
                itemCount = _.filter(series, function(s) {
                    return s.label && !s.hide
                }).length,
                p = legend.position,
                m = legend.margin,
                opacity = legend.backgroundOpacity,
                i, label, color;
            if (itemCount) {
                var lbw = legend.labelBoxWidth,
                    lbh = legend.labelBoxHeight,
                    lbm = legend.labelBoxMargin,
                    offsetX = plotOffset.left + m,
                    offsetY = plotOffset.top + m,
                    labelMaxWidth = 0,
                    style = {
                        size: options.fontSize * 1.1,
                        color: options.grid.color
                    };
                for (i = series.length - 1; i > -1; --i) {
                    if (!series[i].label || series[i].hide) continue;
                    label = legend.labelFormatter(series[i].label);
                    labelMaxWidth = Math.max(labelMaxWidth, this._text.measureText(label, style).width)
                }
                var legendWidth = Math.round(lbw + lbm * 3 + labelMaxWidth),
                    legendHeight = Math.round(itemCount * (lbm + lbh) + lbm);
                if (!opacity && opacity !== 0) {
                    opacity = .1
                }
                if (!options.HtmlText && this.textEnabled && !legend.container) {
                    if (p.charAt(0) == "s") offsetY = plotOffset.top + this.plotHeight - (m + legendHeight);
                    if (p.charAt(0) == "c") offsetY = plotOffset.top + this.plotHeight / 2 - (m + legendHeight / 2);
                    if (p.charAt(1) == "e") offsetX = plotOffset.left + this.plotWidth - (m + legendWidth);
                    color = this.processColor(legend.backgroundColor, {
                        opacity: opacity
                    });
                    ctx.fillStyle = color;
                    ctx.fillRect(offsetX, offsetY, legendWidth, legendHeight);
                    ctx.strokeStyle = legend.labelBoxBorderColor;
                    ctx.strokeRect(Flotr.toPixel(offsetX), Flotr.toPixel(offsetY), legendWidth, legendHeight);
                    var x = offsetX + lbm;
                    var y = offsetY + lbm;
                    for (i = 0; i < series.length; i++) {
                        if (!series[i].label || series[i].hide) continue;
                        label = legend.labelFormatter(series[i].label);
                        ctx.fillStyle = series[i].color;
                        ctx.fillRect(x, y, lbw - 1, lbh - 1);
                        ctx.strokeStyle = legend.labelBoxBorderColor;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(Math.ceil(x) - 1.5, Math.ceil(y) - 1.5, lbw + 2, lbh + 2);
                        Flotr.drawText(ctx, label, x + lbw + lbm, y + lbh, style);
                        y += lbh + lbm
                    }
                } else {
                    for (i = 0; i < series.length; ++i) {
                        if (!series[i].label || series[i].hide) continue;
                        if (i % legend.noColumns === 0) {
                            fragments.push(rowStarted ? "</tr><tr>" : "<tr>");
                            rowStarted = true
                        }
                        var s = series[i],
                            boxWidth = legend.labelBoxWidth,
                            boxHeight = legend.labelBoxHeight;
                        label = legend.labelFormatter(s.label);
                        color = "background-color:" + (s.bars && s.bars.show && s.bars.fillColor && s.bars.fill ? s.bars.fillColor : s.color) + ";";
                        fragments.push('<td class="flotr-legend-color-box">', '<div style="border:1px solid ', legend.labelBoxBorderColor, ';padding:1px">', '<div style="width:', boxWidth - 1, "px;height:", boxHeight - 1, "px;border:1px solid ", series[i].color, '">', '<div style="width:', boxWidth, "px;height:", boxHeight, "px;", color, '"></div>', "</div>", "</div>", "</td>", '<td class="flotr-legend-label">', label, "</td>")
                    }
                    if (rowStarted) fragments.push("</tr>");
                    if (fragments.length > 0) {
                        var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + "</table>";
                        if (legend.container) {
                            table = D.node(table);
                            this.legend.markup = table;
                            D.insert(legend.container, table)
                        } else {
                            var styles = {
                                position: "absolute",
                                zIndex: "2",
                                border: "1px solid " + legend.labelBoxBorderColor
                            };
                            if (p.charAt(0) == "n") {
                                styles.top = m + plotOffset.top + "px";
                                styles.bottom = "auto"
                            } else if (p.charAt(0) == "c") {
                                styles.top = m + (this.plotHeight - legendHeight) / 2 + "px";
                                styles.bottom = "auto"
                            } else if (p.charAt(0) == "s") {
                                styles.bottom = m + plotOffset.bottom + "px";
                                styles.top = "auto"
                            }
                            if (p.charAt(1) == "e") {
                                styles.right = m + plotOffset.right + "px";
                                styles.left = "auto"
                            } else if (p.charAt(1) == "w") {
                                styles.left = m + plotOffset.left + "px";
                                styles.right = "auto"
                            }
                            var div = D.create("div"),
                                size;
                            div.className = "flotr-legend";
                            D.setStyles(div, styles);
                            D.insert(div, table);
                            D.insert(this.el, div);
                            if (!opacity) return;
                            var c = legend.backgroundColor || options.grid.backgroundColor || "#ffffff";
                            _.extend(styles, D.size(div), {
                                backgroundColor: c,
                                zIndex: "",
                                border: ""
                            });
                            styles.width += "px";
                            styles.height += "px";
                            div = D.create("div");
                            div.className = "flotr-legend-bg";
                            D.setStyles(div, styles);
                            D.opacity(div, opacity);
                            D.insert(div, " ");
                            D.insert(this.el, div)
                        }
                    }
                }
            }
        }
    })
})();
(function() {
    var D = Flotr.DOM,
        _ = Flotr._,
        flotr = Flotr,
        S_MOUSETRACK = "opacity:0.7;background-color:#000;color:#fff;position:absolute;padding:2px 8px;-moz-border-radius:4px;border-radius:4px;white-space:nowrap;";
    Flotr.addPlugin("hit", {
        callbacks: {
            "flotr:mousemove": function(e, pos) {
                this.hit.track(pos)
            },
            "flotr:click": function(pos) {
                var hit = this.hit.track(pos);
                if (hit && !_.isUndefined(hit.index)) pos.hit = hit
            },
            "flotr:mouseout": function(e) {
                if (e.relatedTarget !== this.mouseTrack) {
                    this.hit.clearHit()
                }
            },
            "flotr:destroy": function() {
                if (this.options.mouse.container) {
                    D.remove(this.mouseTrack)
                }
                this.mouseTrack = null
            }
        },
        track: function(pos) {
            if (this.options.mouse.track || _.any(this.series, function(s) {
                    return s.mouse && s.mouse.track
                })) {
                return this.hit.hit(pos)
            }
        },
        executeOnType: function(s, method, args) {
            var success = false,
                options;
            if (!_.isArray(s)) s = [s];

            function e(s, index) {
                _.each(_.keys(flotr.graphTypes), function(type) {
                    if (s[type] && s[type].show && this[type][method]) {
                        options = this.getOptions(s, type);
                        options.fill = !!s.mouse.fillColor;
                        options.fillStyle = this.processColor(s.mouse.fillColor || "#ffffff", {
                            opacity: s.mouse.fillOpacity
                        });
                        options.color = s.mouse.lineColor;
                        options.context = this.octx;
                        options.index = index;
                        if (args) options.args = args;
                        this[type][method].call(this[type], options);
                        success = true
                    }
                }, this)
            }
            _.each(s, e, this);
            return success
        },
        drawHit: function(n) {
            var octx = this.octx,
                s = n.series;
            if (s.mouse.lineColor) {
                octx.save();
                octx.lineWidth = s.points ? s.points.lineWidth : 1;
                octx.strokeStyle = s.mouse.lineColor;
                octx.fillStyle = this.processColor(s.mouse.fillColor || "#ffffff", {
                    opacity: s.mouse.fillOpacity
                });
                octx.translate(this.plotOffset.left, this.plotOffset.top);
                if (!this.hit.executeOnType(s, "drawHit", n)) {
                    var xa = n.xaxis,
                        ya = n.yaxis;
                    octx.beginPath();
                    octx.arc(xa.d2p(n.x), ya.d2p(n.y), s.points.hitRadius || s.points.radius || s.mouse.radius, 0, 2 * Math.PI, true);
                    octx.fill();
                    octx.stroke();
                    octx.closePath()
                }
                octx.restore();
                this.clip(octx)
            }
            this.prevHit = n
        },
        clearHit: function() {
            var prev = this.prevHit,
                octx = this.octx,
                plotOffset = this.plotOffset;
            octx.save();
            octx.translate(plotOffset.left, plotOffset.top);
            if (prev) {
                if (!this.hit.executeOnType(prev.series, "clearHit", this.prevHit)) {
                    var s = prev.series,
                        lw = s.points ? s.points.lineWidth : 1;
                    offset = (s.points.hitRadius || s.points.radius || s.mouse.radius) + lw;
                    octx.clearRect(prev.xaxis.d2p(prev.x) - offset, prev.yaxis.d2p(prev.y) - offset, offset * 2, offset * 2)
                }
                D.hide(this.mouseTrack);
                this.prevHit = null
            }
            octx.restore()
        },
        hit: function(mouse) {
            var options = this.options,
                prevHit = this.prevHit,
                closest, sensibility, dataIndex, seriesIndex, series, value, xaxis, yaxis, n;
            if (this.series.length === 0) return;
            n = {
                relX: mouse.relX,
                relY: mouse.relY,
                absX: mouse.absX,
                absY: mouse.absY,
                series: this.series
            };
            if (options.mouse.trackY && !options.mouse.trackAll && this.hit.executeOnType(this.series, "hit", [mouse, n]) && !_.isUndefined(n.seriesIndex)) {
                series = this.series[n.seriesIndex];
                n.series = series;
                n.mouse = series.mouse;
                n.xaxis = series.xaxis;
                n.yaxis = series.yaxis
            } else {
                closest = this.hit.closest(mouse);
                if (closest) {
                    closest = options.mouse.trackY ? closest.point : closest.x;
                    seriesIndex = closest.seriesIndex;
                    series = this.series[seriesIndex];
                    xaxis = series.xaxis;
                    yaxis = series.yaxis;
                    sensibility = 2 * series.mouse.sensibility;
                    if (options.mouse.trackAll || closest.distanceX < sensibility / xaxis.scale && (!options.mouse.trackY || closest.distanceY < sensibility / yaxis.scale)) {
                        n.series = series;
                        n.xaxis = series.xaxis;
                        n.yaxis = series.yaxis;
                        n.mouse = series.mouse;
                        n.x = closest.x;
                        n.y = closest.y;
                        n.dist = closest.distance;
                        n.index = closest.dataIndex;
                        n.seriesIndex = seriesIndex
                    }
                }
            }
            if (!prevHit || (prevHit.index !== n.index || prevHit.seriesIndex !== n.seriesIndex)) {
                this.hit.clearHit();
                if (n.series && n.mouse && n.mouse.track) {
                    this.hit.drawMouseTrack(n);
                    this.hit.drawHit(n);
                    Flotr.EventAdapter.fire(this.el, "flotr:hit", [n, this])
                }
            }
            return n
        },
        closest: function(mouse) {
            var series = this.series,
                options = this.options,
                relX = mouse.relX,
                relY = mouse.relY,
                compare = Number.MAX_VALUE,
                compareX = Number.MAX_VALUE,
                closest = {},
                closestX = {},
                check = false,
                serie, data, distance, distanceX, distanceY, mouseX, mouseY, x, y, i, j;

            function setClosest(o) {
                o.distance = distance;
                o.distanceX = distanceX;
                o.distanceY = distanceY;
                o.seriesIndex = i;
                o.dataIndex = j;
                o.x = x;
                o.y = y;
                check = true
            }
            for (i = 0; i < series.length; i++) {
                serie = series[i];
                data = serie.data;
                mouseX = serie.xaxis.p2d(relX);
                mouseY = serie.yaxis.p2d(relY);
                for (j = data.length; j--;) {
                    x = data[j][0];
                    y = data[j][1];
                    if (x === null || y === null) continue;
                    if (x < serie.xaxis.min || x > serie.xaxis.max) continue;
                    distanceX = Math.abs(x - mouseX);
                    distanceY = Math.abs(y - mouseY);
                    distance = distanceX * distanceX + distanceY * distanceY;
                    if (distance < compare) {
                        compare = distance;
                        setClosest(closest)
                    }
                    if (distanceX < compareX) {
                        compareX = distanceX;
                        setClosest(closestX)
                    }
                }
            }
            return check ? {
                point: closest,
                x: closestX
            } : false
        },
        drawMouseTrack: function(n) {
            var pos = "",
                s = n.series,
                p = n.mouse.position,
                m = n.mouse.margin,
                x = n.x,
                y = n.y,
                elStyle = S_MOUSETRACK,
                mouseTrack = this.mouseTrack,
                plotOffset = this.plotOffset,
                left = plotOffset.left,
                right = plotOffset.right,
                bottom = plotOffset.bottom,
                top = plotOffset.top,
                decimals = n.mouse.trackDecimals,
                options = this.options,
                container = options.mouse.container,
                oTop = 0,
                oLeft = 0,
                offset, size, content;
            if (!mouseTrack) {
                mouseTrack = D.node('<div class="flotr-mouse-value" style="' + elStyle + '"></div>');
                this.mouseTrack = mouseTrack;
                D.insert(container || this.el, mouseTrack)
            }
            if (!decimals || decimals < 0) decimals = 0;
            if (x && x.toFixed) x = x.toFixed(decimals);
            if (y && y.toFixed) y = y.toFixed(decimals);
            content = n.mouse.trackFormatter({
                x: x,
                y: y,
                series: n.series,
                index: n.index,
                nearest: n,
                fraction: n.fraction
            });
            if (_.isNull(content) || _.isUndefined(content)) {
                D.hide(mouseTrack);
                return
            } else {
                mouseTrack.innerHTML = content;
                D.show(mouseTrack)
            }
            if (container) return;
            size = D.size(mouseTrack);
            if (container) {
                offset = D.position(this.el);
                oTop = offset.top;
                oLeft = offset.left
            }
            if (!n.mouse.relative) {
                pos += "top:";
                if (p.charAt(0) == "n") pos += oTop + m + top;
                else if (p.charAt(0) == "s") pos += oTop - m + top + this.plotHeight - size.height;
                pos += "px;bottom:auto;left:";
                if (p.charAt(1) == "e") pos += oLeft - m + left + this.plotWidth - size.width;
                else if (p.charAt(1) == "w") pos += oLeft + m + left;
                pos += "px;right:auto;"
            } else if (s.pie && s.pie.show) {
                var center = {
                        x: this.plotWidth / 2,
                        y: this.plotHeight / 2
                    },
                    radius = Math.min(this.canvasWidth, this.canvasHeight) * s.pie.sizeRatio / 2,
                    bisection = n.sAngle < n.eAngle ? (n.sAngle + n.eAngle) / 2 : (n.sAngle + n.eAngle + 2 * Math.PI) / 2;
                pos += "bottom:" + (m - top - center.y - Math.sin(bisection) * radius / 2 + this.canvasHeight) + "px;top:auto;";
                pos += "left:" + (m + left + center.x + Math.cos(bisection) * radius / 2) + "px;right:auto;"
            } else {
                pos += "top:";
                if (/n/.test(p)) pos += oTop - m + top + n.yaxis.d2p(n.y) - size.height;
                else pos += oTop + m + top + n.yaxis.d2p(n.y);
                pos += "px;bottom:auto;left:";
                if (/w/.test(p)) pos += oLeft - m + left + n.xaxis.d2p(n.x) - size.width;
                else pos += oLeft + m + left + n.xaxis.d2p(n.x);
                pos += "px;right:auto;"
            }
            mouseTrack.style.cssText = elStyle + pos;
            if (n.mouse.relative) {
                if (!/[ew]/.test(p)) {
                    mouseTrack.style.left = oLeft + left + n.xaxis.d2p(n.x) - D.size(mouseTrack).width / 2 + "px"
                } else if (!/[ns]/.test(p)) {
                    mouseTrack.style.top = oTop + top + n.yaxis.d2p(n.y) - D.size(mouseTrack).height / 2 + "px"
                }
            }
        }
    })
})();
(function() {
    var D = Flotr.DOM;
    Flotr.addPlugin("labels", {
        callbacks: {
            "flotr:afterdraw": function() {
                this.labels.draw()
            }
        },
        draw: function() {
            var axis, tick, left, top, xBoxWidth, radius, sides, coeff, angle, div, i, html = "",
                noLabels = 0,
                options = this.options,
                ctx = this.ctx,
                a = this.axes,
                style = {
                    size: options.fontSize
                };
            for (i = 0; i < a.x.ticks.length; ++i) {
                if (a.x.ticks[i].label) {
                    ++noLabels
                }
            }
            xBoxWidth = this.plotWidth / noLabels;
            if (options.grid.circular) {
                ctx.save();
                ctx.translate(this.plotOffset.left + this.plotWidth / 2, this.plotOffset.top + this.plotHeight / 2);
                radius = this.plotHeight * options.radar.radiusRatio / 2 + options.fontSize;
                sides = this.axes.x.ticks.length;
                coeff = 2 * (Math.PI / sides);
                angle = -Math.PI / 2;
                drawLabelCircular(this, a.x, false);
                drawLabelCircular(this, a.x, true);
                drawLabelCircular(this, a.y, false);
                drawLabelCircular(this, a.y, true);
                ctx.restore()
            }
            if (!options.HtmlText && this.textEnabled) {
                drawLabelNoHtmlText(this, a.x, "center", "top");
                drawLabelNoHtmlText(this, a.x2, "center", "bottom");
                drawLabelNoHtmlText(this, a.y, "right", "middle");
                drawLabelNoHtmlText(this, a.y2, "left", "middle")
            } else if ((a.x.options.showLabels || a.x2.options.showLabels || a.y.options.showLabels || a.y2.options.showLabels) && !options.grid.circular) {
                html = "";
                drawLabelHtml(this, a.x);
                drawLabelHtml(this, a.x2);
                drawLabelHtml(this, a.y);
                drawLabelHtml(this, a.y2);
                ctx.stroke();
                ctx.restore();
                div = D.create("div");
                D.setStyles(div, {
                    fontSize: "smaller",
                    color: options.grid.color
                });
                div.className = "flotr-labels";
                D.insert(this.el, div);
                D.insert(div, html)
            }

            function drawLabelCircular(graph, axis, minorTicks) {
                var ticks = minorTicks ? axis.minorTicks : axis.ticks,
                    isX = axis.orientation === 1,
                    isFirst = axis.n === 1,
                    style, offset;
                style = {
                    color: axis.options.color || options.grid.color,
                    angle: Flotr.toRad(axis.options.labelsAngle),
                    textBaseline: "middle"
                };
                for (i = 0; i < ticks.length && (minorTicks ? axis.options.showMinorLabels : axis.options.showLabels); ++i) {
                    tick = ticks[i];
                    tick.label += "";
                    if (!tick.label || !tick.label.length) {
                        continue
                    }
                    x = Math.cos(i * coeff + angle) * radius;
                    y = Math.sin(i * coeff + angle) * radius;
                    style.textAlign = isX ? Math.abs(x) < .1 ? "center" : x < 0 ? "right" : "left" : "left";
                    Flotr.drawText(ctx, tick.label, isX ? x : 3, isX ? y : -(axis.ticks[i].v / axis.max) * (radius - options.fontSize), style)
                }
            }

            function drawLabelNoHtmlText(graph, axis, textAlign, textBaseline) {
                var isX = axis.orientation === 1,
                    isFirst = axis.n === 1,
                    style, offset;
                style = {
                    color: axis.options.color || options.grid.color,
                    textAlign: textAlign,
                    textBaseline: textBaseline,
                    angle: Flotr.toRad(axis.options.labelsAngle)
                };
                style = Flotr.getBestTextAlign(style.angle, style);
                for (i = 0; i < axis.ticks.length && continueShowingLabels(axis); ++i) {
                    tick = axis.ticks[i];
                    if (!tick.label || !tick.label.length) {
                        continue
                    }
                    offset = axis.d2p(tick.v);
                    if (offset < 0 || offset > (isX ? graph.plotWidth : graph.plotHeight)) {
                        continue
                    }
                    Flotr.drawText(ctx, tick.label, leftOffset(graph, isX, isFirst, offset), topOffset(graph, isX, isFirst, offset), style);
                    if (!isX && !isFirst) {
                        ctx.save();
                        ctx.strokeStyle = style.color;
                        ctx.beginPath();
                        ctx.moveTo(graph.plotOffset.left + graph.plotWidth - 8, graph.plotOffset.top + axis.d2p(tick.v));
                        ctx.lineTo(graph.plotOffset.left + graph.plotWidth, graph.plotOffset.top + axis.d2p(tick.v));
                        ctx.stroke();
                        ctx.restore()
                    }
                }

                function continueShowingLabels(axis) {
                    return axis.options.showLabels && axis.used
                }

                function leftOffset(graph, isX, isFirst, offset) {
                    return graph.plotOffset.left + (isX ? offset : isFirst ? -options.grid.labelMargin : options.grid.labelMargin + graph.plotWidth)
                }

                function topOffset(graph, isX, isFirst, offset) {
                    return graph.plotOffset.top + (isX ? options.grid.labelMargin : offset) + (isX && isFirst ? graph.plotHeight : 0)
                }
            }

            function drawLabelHtml(graph, axis) {
                var isX = axis.orientation === 1,
                    isFirst = axis.n === 1,
                    name = "",
                    left, style, top, offset = graph.plotOffset;
                if (!isX && !isFirst) {
                    ctx.save();
                    ctx.strokeStyle = axis.options.color || options.grid.color;
                    ctx.beginPath()
                }
                if (axis.options.showLabels && (isFirst ? true : axis.used)) {
                    for (i = 0; i < axis.ticks.length; ++i) {
                        tick = axis.ticks[i];
                        if (!tick.label || !tick.label.length || (isX ? offset.left : offset.top) + axis.d2p(tick.v) < 0 || (isX ? offset.left : offset.top) + axis.d2p(tick.v) > (isX ? graph.canvasWidth : graph.canvasHeight)) {
                            continue
                        }
                        top = offset.top + (isX ? (isFirst ? 1 : -1) * (graph.plotHeight + options.grid.labelMargin) : axis.d2p(tick.v) - axis.maxLabel.height / 2);
                        left = isX ? offset.left + axis.d2p(tick.v) - xBoxWidth / 2 : 0;
                        name = "";
                        if (i === 0) {
                            name = " first"
                        } else if (i === axis.ticks.length - 1) {
                            name = " last"
                        }
                        name += isX ? " flotr-grid-label-x" : " flotr-grid-label-y";
                        html += ['<div style="position:absolute; text-align:' + (isX ? "center" : "right") + "; ", "top:" + top + "px; ", (!isX && !isFirst ? "right:" : "left:") + left + "px; ", "width:" + (isX ? xBoxWidth : (isFirst ? offset.left : offset.right) - options.grid.labelMargin) + "px; ", axis.options.color ? "color:" + axis.options.color + "; " : " ", '" class="flotr-grid-label' + name + '">' + tick.label + "</div>"].join(" ");
                        if (!isX && !isFirst) {
                            ctx.moveTo(offset.left + graph.plotWidth - 8, offset.top + axis.d2p(tick.v));
                            ctx.lineTo(offset.left + graph.plotWidth, offset.top + axis.d2p(tick.v))
                        }
                    }
                }
            }
        }
    })
})();
(function() {
    var D = Flotr.DOM,
        _ = Flotr._;
    Flotr.addPlugin("legend", {
        options: {
            show: true,
            noColumns: 1,
            labelFormatter: function(v) {
                return v
            },
            labelBoxBorderColor: "#CCCCCC",
            labelBoxWidth: 14,
            labelBoxHeight: 10,
            labelBoxMargin: 5,
            container: null,
            position: "nw",
            margin: 5,
            backgroundColor: "#F0F0F0",
            backgroundOpacity: .85
        },
        callbacks: {
            "flotr:afterinit": function() {
                this.legend.insertLegend()
            },
            "flotr:destroy": function() {
                var markup = this.legend.markup;
                if (markup) {
                    this.legend.markup = null;
                    D.remove(markup)
                }
            }
        },
        insertLegend: function() {
            if (!this.options.legend.show) return;
            var series = this.series,
                plotOffset = this.plotOffset,
                options = this.options,
                legend = options.legend,
                fragments = [],
                rowStarted = false,
                ctx = this.ctx,
                itemCount = _.filter(series, function(s) {
                    return s.label && !s.hide
                }).length,
                p = legend.position,
                m = legend.margin,
                opacity = legend.backgroundOpacity,
                i, label, color;
            if (itemCount) {
                var lbw = legend.labelBoxWidth,
                    lbh = legend.labelBoxHeight,
                    lbm = legend.labelBoxMargin,
                    offsetX = plotOffset.left + m,
                    offsetY = plotOffset.top + m,
                    labelMaxWidth = 0,
                    style = {
                        size: options.fontSize * 1.1,
                        color: options.grid.color
                    };
                for (i = series.length - 1; i > -1; --i) {
                    if (!series[i].label || series[i].hide) continue;
                    label = legend.labelFormatter(series[i].label);
                    labelMaxWidth = Math.max(labelMaxWidth, this._text.measureText(label, style).width)
                }
                var legendWidth = Math.round(lbw + lbm * 3 + labelMaxWidth),
                    legendHeight = Math.round(itemCount * (lbm + lbh) + lbm);
                if (!opacity && opacity !== 0) {
                    opacity = .1
                }
                if (!options.HtmlText && this.textEnabled && !legend.container) {
                    if (p.charAt(0) == "s") offsetY = plotOffset.top + this.plotHeight - (m + legendHeight);
                    if (p.charAt(0) == "c") offsetY = plotOffset.top + this.plotHeight / 2 - (m + legendHeight / 2);
                    if (p.charAt(1) == "e") offsetX = plotOffset.left + this.plotWidth - (m + legendWidth);
                    color = this.processColor(legend.backgroundColor, {
                        opacity: opacity
                    });
                    ctx.fillStyle = color;
                    ctx.fillRect(offsetX, offsetY, legendWidth, legendHeight);
                    ctx.strokeStyle = legend.labelBoxBorderColor;
                    ctx.strokeRect(Flotr.toPixel(offsetX), Flotr.toPixel(offsetY), legendWidth, legendHeight);
                    var x = offsetX + lbm;
                    var y = offsetY + lbm;
                    for (i = 0; i < series.length; i++) {
                        if (!series[i].label || series[i].hide) continue;
                        label = legend.labelFormatter(series[i].label);
                        ctx.fillStyle = series[i].color;
                        ctx.fillRect(x, y, lbw - 1, lbh - 1);
                        ctx.strokeStyle = legend.labelBoxBorderColor;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(Math.ceil(x) - 1.5, Math.ceil(y) - 1.5, lbw + 2, lbh + 2);
                        Flotr.drawText(ctx, label, x + lbw + lbm, y + lbh, style);
                        y += lbh + lbm
                    }
                } else {
                    for (i = 0; i < series.length; ++i) {
                        if (!series[i].label || series[i].hide) continue;
                        if (i % legend.noColumns === 0) {
                            fragments.push(rowStarted ? "</tr><tr>" : "<tr>");
                            rowStarted = true
                        }
                        var s = series[i],
                            boxWidth = legend.labelBoxWidth,
                            boxHeight = legend.labelBoxHeight;
                        label = legend.labelFormatter(s.label);
                        color = "background-color:" + (s.bars && s.bars.show && s.bars.fillColor && s.bars.fill ? s.bars.fillColor : s.color) + ";";
                        fragments.push('<td class="flotr-legend-color-box">', '<div style="border:1px solid ', legend.labelBoxBorderColor, ';padding:1px">', '<div style="width:', boxWidth - 1, "px;height:", boxHeight - 1, "px;border:1px solid ", series[i].color, '">', '<div style="width:', boxWidth, "px;height:", boxHeight, "px;", color, '"></div>', "</div>", "</div>", "</td>", '<td class="flotr-legend-label">', label, "</td>")
                    }
                    if (rowStarted) fragments.push("</tr>");
                    if (fragments.length > 0) {
                        var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + "</table>";
                        if (legend.container) {
                            table = D.node(table);
                            this.legend.markup = table;
                            D.insert(legend.container, table)
                        } else {
                            var styles = {
                                position: "absolute",
                                zIndex: "2",
                                border: "1px solid " + legend.labelBoxBorderColor
                            };
                            if (p.charAt(0) == "n") {
                                styles.top = m + plotOffset.top + "px";
                                styles.bottom = "auto"
                            } else if (p.charAt(0) == "c") {
                                styles.top = m + (this.plotHeight - legendHeight) / 2 + "px";
                                styles.bottom = "auto"
                            } else if (p.charAt(0) == "s") {
                                styles.bottom = m + plotOffset.bottom + "px";
                                styles.top = "auto"
                            }
                            if (p.charAt(1) == "e") {
                                styles.right = m + plotOffset.right + "px";
                                styles.left = "auto"
                            } else if (p.charAt(1) == "w") {
                                styles.left = m + plotOffset.left + "px";
                                styles.right = "auto"
                            }
                            var div = D.create("div"),
                                size;
                            div.className = "flotr-legend";
                            D.setStyles(div, styles);
                            D.insert(div, table);
                            D.insert(this.el, div);
                            if (!opacity) return;
                            var c = legend.backgroundColor || options.grid.backgroundColor || "#ffffff";
                            _.extend(styles, D.size(div), {
                                backgroundColor: c,
                                zIndex: "",
                                border: ""
                            });
                            styles.width += "px";
                            styles.height += "px";
                            div = D.create("div");
                            div.className = "flotr-legend-bg";
                            D.setStyles(div, styles);
                            D.opacity(div, opacity);
                            D.insert(div, " ");
                            D.insert(this.el, div)
                        }
                    }
                }
            }
        }
    })
})();
(function() {
    var D = Flotr.DOM;
    Flotr.addPlugin("titles", {
        callbacks: {
            "flotr:afterdraw": function() {
                this.titles.drawTitles()
            }
        },
        drawTitles: function() {
            var html, options = this.options,
                margin = options.grid.labelMargin,
                ctx = this.ctx,
                a = this.axes;
            if (!options.HtmlText && this.textEnabled) {
                var style = {
                    size: options.fontSize,
                    color: options.grid.color,
                    textAlign: "center"
                };
                if (options.subtitle) {
                    Flotr.drawText(ctx, options.subtitle, this.plotOffset.left + this.plotWidth / 2, this.titleHeight + this.subtitleHeight - 2, style)
                }
                style.weight = 1.5;
                style.size *= 1.5;
                if (options.title) {
                    Flotr.drawText(ctx, options.title, this.plotOffset.left + this.plotWidth / 2, this.titleHeight - 2, style)
                }
                style.weight = 1.8;
                style.size *= .8;
                if (a.x.options.title && a.x.used) {
                    style.textAlign = a.x.options.titleAlign || "center";
                    style.textBaseline = "top";
                    style.angle = Flotr.toRad(a.x.options.titleAngle);
                    style = Flotr.getBestTextAlign(style.angle, style);
                    Flotr.drawText(ctx, a.x.options.title, this.plotOffset.left + this.plotWidth / 2, this.plotOffset.top + a.x.maxLabel.height + this.plotHeight + 2 * margin, style)
                }
                if (a.x2.options.title && a.x2.used) {
                    style.textAlign = a.x2.options.titleAlign || "center";
                    style.textBaseline = "bottom";
                    style.angle = Flotr.toRad(a.x2.options.titleAngle);
                    style = Flotr.getBestTextAlign(style.angle, style);
                    Flotr.drawText(ctx, a.x2.options.title, this.plotOffset.left + this.plotWidth / 2, this.plotOffset.top - a.x2.maxLabel.height - 2 * margin, style)
                }
                if (a.y.options.title && a.y.used) {
                    style.textAlign = a.y.options.titleAlign || "right";
                    style.textBaseline = "middle";
                    style.angle = Flotr.toRad(a.y.options.titleAngle);
                    style = Flotr.getBestTextAlign(style.angle, style);
                    Flotr.drawText(ctx, a.y.options.title, this.plotOffset.left - a.y.maxLabel.width - 2 * margin, this.plotOffset.top + this.plotHeight / 2, style)
                }
                if (a.y2.options.title && a.y2.used) {
                    style.textAlign = a.y2.options.titleAlign || "left";
                    style.textBaseline = "middle";
                    style.angle = Flotr.toRad(a.y2.options.titleAngle);
                    style = Flotr.getBestTextAlign(style.angle, style);
                    Flotr.drawText(ctx, a.y2.options.title, this.plotOffset.left + this.plotWidth + a.y2.maxLabel.width + 2 * margin, this.plotOffset.top + this.plotHeight / 2, style)
                }
            } else {
                html = [];
                if (options.title) html.push('<div style="position:absolute;top:0;left:', this.plotOffset.left, "px;font-size:1em;font-weight:bold;text-align:center;width:", this.plotWidth, 'px;" class="flotr-title">', options.title, "</div>");
                if (options.subtitle) html.push('<div style="position:absolute;top:', this.titleHeight, "px;left:", this.plotOffset.left, "px;font-size:smaller;text-align:center;width:", this.plotWidth, 'px;" class="flotr-subtitle">', options.subtitle, "</div>");
                html.push("</div>");
                html.push('<div class="flotr-axis-title" style="font-weight:bold;">');
                if (a.x.options.title && a.x.used) html.push('<div style="position:absolute;top:', this.plotOffset.top + this.plotHeight + options.grid.labelMargin + a.x.titleSize.height, "px;left:", this.plotOffset.left, "px;width:", this.plotWidth, "px;text-align:", a.x.options.titleAlign, ';" class="flotr-axis-title flotr-axis-title-x1">', a.x.options.title, "</div>");
                if (a.x2.options.title && a.x2.used) html.push('<div style="position:absolute;top:0;left:', this.plotOffset.left, "px;width:", this.plotWidth, "px;text-align:", a.x2.options.titleAlign, ';" class="flotr-axis-title flotr-axis-title-x2">', a.x2.options.title, "</div>");
                if (a.y.options.title && a.y.used) html.push('<div style="position:absolute;top:', this.plotOffset.top + this.plotHeight / 2 - a.y.titleSize.height / 2, "px;left:0;text-align:", a.y.options.titleAlign, ';" class="flotr-axis-title flotr-axis-title-y1">', a.y.options.title, "</div>");
                if (a.y2.options.title && a.y2.used) html.push('<div style="position:absolute;top:', this.plotOffset.top + this.plotHeight / 2 - a.y.titleSize.height / 2, "px;right:0;text-align:", a.y2.options.titleAlign, ';" class="flotr-axis-title flotr-axis-title-y2">', a.y2.options.title, "</div>");
                html = html.join("");
                var div = D.create("div");
                D.setStyles({
                    color: options.grid.color
                });
                div.className = "flotr-titles";
                D.insert(this.el, div);
                D.insert(div, html)
            }
        }
    })
})();
(function() {
    var D = Flotr.DOM;
    Flotr.addPlugin("handles", {
        options: {
            show: false,
            drag: true,
            scroll: true
        },
        callbacks: {
            "flotr:afterinit": init,
            "flotr:select": handleSelect,
            "flotr:mousedown": reset,
            "flotr:mousemove": mouseMoveHandler
        }
    });

    function init() {
        var options = this.options,
            handles = this.handles,
            el = this.el,
            scroll, left, right, container;
        if (!options.selection.mode || !options.handles.show || "ontouchstart" in el) return;
        handles.initialized = true;
        container = D.node('<div class="flotr-handles"></div>');
        options = options.handles;
        if (options.drag) {
            right = D.node('<div class="flotr-handles-handle flotr-handles-drag flotr-handles-right"></div>');
            left = D.node('<div class="flotr-handles-handle flotr-handles-drag flotr-handles-left"></div>');
            D.insert(container, right);
            D.insert(container, left);
            D.hide(left);
            D.hide(right);
            handles.left = left;
            handles.right = right;
            this.observe(left, "mousedown", function() {
                handles.moveHandler = leftMoveHandler
            });
            this.observe(right, "mousedown", function() {
                handles.moveHandler = rightMoveHandler
            })
        }
        if (options.scroll) {
            scroll = D.node('<div class="flotr-handles-handle flotr-handles-scroll"></div>');
            D.insert(container, scroll);
            D.hide(scroll);
            handles.scroll = scroll;
            this.observe(scroll, "mousedown", function() {
                handles.moveHandler = scrollMoveHandler
            })
        }
        this.observe(document, "mouseup", function() {
            handles.moveHandler = null
        });
        D.insert(el, container)
    }

    function handleSelect(selection) {
        if (!this.handles.initialized) return;
        var handles = this.handles,
            options = this.options.handles,
            left = handles.left,
            right = handles.right,
            scroll = handles.scroll;
        if (options) {
            if (options.drag) {
                positionDrag(this, left, selection.x1);
                positionDrag(this, right, selection.x2)
            }
            if (options.scroll) {
                positionScroll(this, scroll, selection.x1, selection.x2)
            }
        }
    }

    function positionDrag(graph, handle, x) {
        D.show(handle);
        var size = D.size(handle),
            l = Math.round(graph.axes.x.d2p(x) - size.width / 2),
            t = (graph.plotHeight - size.height) / 2;
        D.setStyles(handle, {
            left: l + "px",
            top: t + "px"
        })
    }

    function positionScroll(graph, handle, x1, x2) {
        D.show(handle);
        var size = D.size(handle),
            l = Math.round(graph.axes.x.d2p(x1)),
            t = graph.plotHeight - size.height / 2,
            w = graph.axes.x.d2p(x2) - graph.axes.x.d2p(x1);
        D.setStyles(handle, {
            left: l + "px",
            top: t + "px",
            width: w + "px"
        })
    }

    function reset() {
        if (!this.handles.initialized) return;
        var handles = this.handles;
        if (handles) {
            D.hide(handles.left);
            D.hide(handles.right);
            D.hide(handles.scroll)
        }
    }

    function mouseMoveHandler(e, position) {
        if (!this.handles.initialized) return;
        if (!this.handles.moveHandler) return;
        var delta = position.x - this.lastMousePos.x,
            selection = this.selection.selection,
            area = this.selection.getArea(),
            handles = this.handles;
        handles.moveHandler(area, delta);
        checkSwap(area, handles);
        this.selection.setSelection(area)
    }

    function checkSwap(area, handles) {
        var moveHandler = handles.moveHandler;
        if (area.x1 > area.x2) {
            if (moveHandler == leftMoveHandler) {
                moveHandler = rightMoveHandler
            } else if (moveHandler == rightMoveHandler) {
                moveHandler = leftMoveHandler
            }
            handles.moveHandler = moveHandler
        }
    }

    function leftMoveHandler(area, delta) {
        area.x1 += delta
    }

    function rightMoveHandler(area, delta) {
        area.x2 += delta
    }

    function scrollMoveHandler(area, delta) {
        area.x1 += delta;
        area.x2 += delta
    }
})();
(function() {
    var E = Flotr.EventAdapter,
        _ = Flotr._;
    Flotr.addPlugin("graphGrid", {
        callbacks: {
            "flotr:beforedraw": function() {
                this.graphGrid.drawGrid()
            },
            "flotr:afterdraw": function() {
                this.graphGrid.drawOutline()
            }
        },
        drawGrid: function() {
            var ctx = this.ctx,
                options = this.options,
                grid = options.grid,
                verticalLines = grid.verticalLines,
                horizontalLines = grid.horizontalLines,
                minorVerticalLines = grid.minorVerticalLines,
                minorHorizontalLines = grid.minorHorizontalLines,
                plotHeight = this.plotHeight,
                plotWidth = this.plotWidth,
                a, v, i, j;
            if (verticalLines || minorVerticalLines || horizontalLines || minorHorizontalLines) {
                E.fire(this.el, "flotr:beforegrid", [this.axes.x, this.axes.y, options, this])
            }
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = grid.tickColor;

            function circularHorizontalTicks(ticks) {
                for (i = 0; i < ticks.length; ++i) {
                    var ratio = ticks[i].v / a.max;
                    for (j = 0; j <= sides; ++j) {
                        ctx[j === 0 ? "moveTo" : "lineTo"](Math.cos(j * coeff + angle) * radius * ratio, Math.sin(j * coeff + angle) * radius * ratio)
                    }
                }
            }

            function drawGridLines(ticks, callback) {
                _.each(_.pluck(ticks, "v"), function(v) {
                    if (v <= a.min || v >= a.max || (v == a.min || v == a.max) && grid.outlineWidth) return;
                    callback(Math.floor(a.d2p(v)) + ctx.lineWidth / 2)
                })
            }

            function drawVerticalLines(x) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, plotHeight)
            }

            function drawHorizontalLines(y) {
                ctx.moveTo(0, y);
                ctx.lineTo(plotWidth, y)
            }
            if (grid.circular) {
                ctx.translate(this.plotOffset.left + plotWidth / 2, this.plotOffset.top + plotHeight / 2);
                var radius = Math.min(plotHeight, plotWidth) * options.radar.radiusRatio / 2,
                    sides = this.axes.x.ticks.length,
                    coeff = 2 * (Math.PI / sides),
                    angle = -Math.PI / 2;
                ctx.beginPath();
                a = this.axes.y;
                if (horizontalLines) {
                    circularHorizontalTicks(a.ticks)
                }
                if (minorHorizontalLines) {
                    circularHorizontalTicks(a.minorTicks)
                }
                if (verticalLines) {
                    _.times(sides, function(i) {
                        ctx.moveTo(0, 0);
                        ctx.lineTo(Math.cos(i * coeff + angle) * radius, Math.sin(i * coeff + angle) * radius)
                    })
                }
                ctx.stroke()
            } else {
                ctx.translate(this.plotOffset.left, this.plotOffset.top);
                if (grid.backgroundColor) {
                    ctx.fillStyle = this.processColor(grid.backgroundColor, {
                        x1: 0,
                        y1: 0,
                        x2: plotWidth,
                        y2: plotHeight
                    });
                    ctx.fillRect(0, 0, plotWidth, plotHeight)
                }
                ctx.beginPath();
                a = this.axes.x;
                if (verticalLines) drawGridLines(a.ticks, drawVerticalLines);
                if (minorVerticalLines) drawGridLines(a.minorTicks, drawVerticalLines);
                a = this.axes.y;
                if (horizontalLines) drawGridLines(a.ticks, drawHorizontalLines);
                if (minorHorizontalLines) drawGridLines(a.minorTicks, drawHorizontalLines);
                ctx.stroke()
            }
            ctx.restore();
            if (verticalLines || minorVerticalLines || horizontalLines || minorHorizontalLines) {
                E.fire(this.el, "flotr:aftergrid", [this.axes.x, this.axes.y, options, this])
            }
        },
        drawOutline: function() {
            var that = this,
                options = that.options,
                grid = options.grid,
                outline = grid.outline,
                ctx = that.ctx,
                backgroundImage = grid.backgroundImage,
                plotOffset = that.plotOffset,
                leftOffset = plotOffset.left,
                topOffset = plotOffset.top,
                plotWidth = that.plotWidth,
                plotHeight = that.plotHeight,
                v, img, src, left, top, globalAlpha;
            if (!grid.outlineWidth) return;
            ctx.save();
            if (grid.circular) {
                ctx.translate(leftOffset + plotWidth / 2, topOffset + plotHeight / 2);
                var radius = Math.min(plotHeight, plotWidth) * options.radar.radiusRatio / 2,
                    sides = this.axes.x.ticks.length,
                    coeff = 2 * (Math.PI / sides),
                    angle = -Math.PI / 2;
                ctx.beginPath();
                ctx.lineWidth = grid.outlineWidth;
                ctx.strokeStyle = grid.color;
                ctx.lineJoin = "round";
                for (i = 0; i <= sides; ++i) {
                    ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(i * coeff + angle) * radius, Math.sin(i * coeff + angle) * radius)
                }
                ctx.stroke()
            } else {
                ctx.translate(leftOffset, topOffset);
                var lw = grid.outlineWidth,
                    orig = .5 - lw + (lw + 1) % 2 / 2,
                    lineTo = "lineTo",
                    moveTo = "moveTo";
                ctx.lineWidth = lw;
                ctx.strokeStyle = grid.color;
                ctx.lineJoin = "miter";
                ctx.beginPath();
                ctx.moveTo(orig, orig);
                plotWidth = plotWidth - lw / 2 % 1;
                plotHeight = plotHeight + lw / 2;
                ctx[outline.indexOf("n") !== -1 ? lineTo : moveTo](plotWidth, orig);
                ctx[outline.indexOf("e") !== -1 ? lineTo : moveTo](plotWidth, plotHeight);
                ctx[outline.indexOf("s") !== -1 ? lineTo : moveTo](orig, plotHeight);
                ctx[outline.indexOf("w") !== -1 ? lineTo : moveTo](orig, orig);
                ctx.stroke();
                ctx.closePath()
            }
            ctx.restore();
            if (backgroundImage) {
                src = backgroundImage.src || backgroundImage;
                left = (parseInt(backgroundImage.left, 10) || 0) + plotOffset.left;
                top = (parseInt(backgroundImage.top, 10) || 0) + plotOffset.top;
                img = new Image;
                img.onload = function() {
                    ctx.save();
                    if (backgroundImage.alpha) ctx.globalAlpha = backgroundImage.alpha;
                    ctx.globalCompositeOperation = "destination-over";
                    ctx.drawImage(img, 0, 0, img.width, img.height, left, top, plotWidth, plotHeight);
                    ctx.restore()
                };
                img.src = src
            }
        }
    })
})();
! function(a, b) {
    typeof define == "function" ? define(b) : typeof module != "undefined" ? module.exports = b() : this[a] = b()
}("bonzo", function() {
    function x(a) {
        return new RegExp("(^|\\s+)" + a + "(\\s+|$)")
    }

    function y(a, b, c) {
        for (var d = 0, e = a.length; d < e; d++) b.call(c || a[d], a[d], d, a);
        return a
    }

    function z(a) {
        return a.replace(/-(.)/g, function(a, b) {
            return b.toUpperCase()
        })
    }

    function A(a) {
        return a && a.nodeName && a.nodeType == 1
    }

    function B(a, b, c, d) {
        for (d = 0, j = a.length; d < j; ++d)
            if (b.call(c, a[d], d, a)) return !0;
        return !1
    }

    function D(a, b, c) {
        var d = 0,
            g = b || this,
            h = [],
            i = f && typeof a == "string" && a.charAt(0) != "<" ? function(b) {
                return (b = f(a)) && (b.selected = 1) && b
            }() : a;
        return y(J(i), function(a) {
            y(g, function(b) {
                var f = !b[e] || b[e] && !b[e][e] ? function() {
                    var a = b.cloneNode(!0);
                    return g.$ && g.cloneEvents && g.$(a).cloneEvents(b), a
                }() : b;
                c(a, f), h[d] = f, d++
            })
        }, this), y(h, function(a, b) {
            g[b] = a
        }), g.length = d, g
    }

    function E(a, b, c) {
        var d = N(a),
            e = d.css("position"),
            f = d.offset(),
            g = "relative",
            h = e == g,
            i = [parseInt(d.css("left"), 10), parseInt(d.css("top"), 10)];
        e == "static" && (d.css("position", g), e = g), isNaN(i[0]) && (i[0] = h ? 0 : a.offsetLeft), isNaN(i[1]) && (i[1] = h ? 0 : a.offsetTop), b != null && (a.style.left = b - f.left + i[0] + q), c != null && (a.style.top = c - f.top + i[1] + q)
    }

    function F(a, b) {
        return x(b).test(a.className)
    }

    function G(a, b) {
        a.className = w(a.className + " " + b)
    }

    function H(a, b) {
        a.className = w(a.className.replace(x(b), " "))
    }

    function I(a) {
        this.length = 0;
        if (a) {
            a = typeof a != "string" && !a.nodeType && typeof a.length != "undefined" ? a : [a], this.length = a.length;
            for (var b = 0; b < a.length; b++) this[b] = a[b]
        }
    }

    function J(a) {
        return typeof a == "string" ? N.create(a) : A(a) ? [a] : a
    }

    function K(a, c, d) {
        var e = this[0];
        return a == null && c == null ? (L(e) ? M() : {
            x: e.scrollLeft,
            y: e.scrollTop
        })[d] : (L(e) ? b.scrollTo(a, c) : (a != null && (e.scrollLeft = a), c != null && (e.scrollTop = c)), this)
    }

    function L(a) {
        return a === b || /^(?:body|html)$/i.test(a.tagName)
    }

    function M() {
        return {
            x: b.pageXOffset || d.scrollLeft,
            y: b.pageYOffset || d.scrollTop
        }
    }

    function N(a, b) {
        return new I(a, b)
    }
    var a = this,
        b = window,
        c = b.document,
        d = c.documentElement,
        e = "parentNode",
        f = null,
        g = /^checked|value|selected$/,
        h = /select|fieldset|table|tbody|tfoot|td|tr|colgroup/i,
        i = "table",
        k = {
            thead: i,
            tbody: i,
            tfoot: i,
            tr: "tbody",
            th: "tr",
            td: "tr",
            fieldset: "form",
            option: "select"
        },
        l = /^checked|selected$/,
        m = /msie/i.test(navigator.userAgent),
        n = [],
        o = 0,
        p = /^-?[\d\.]+$/,
        q = "px",
        r = "setAttribute",
        s = "getAttribute",
        t = /(^\s*|\s*$)/g,
        u = {
            lineHeight: 1,
            zoom: 1,
            zIndex: 1,
            opacity: 1
        },
        v = function() {
            var a = ["webkitTransform", "MozTransform", "OTransform", "msTransform", "Transform"],
                b;
            for (b = 0; b < a.length; b++)
                if (a[b] in c.createElement("a").style) return a[b]
        }(),
        w = String.prototype.trim ? function(a) {
            return a.trim()
        } : function(a) {
            return a.replace(t, "")
        },
        C = c.defaultView && c.defaultView.getComputedStyle ? function(a, b) {
            b = b == "transform" ? v : b, b = b == "transform-origin" ? v + "Origin" : b;
            var d = null;
            b == "float" && (b = "cssFloat");
            var e = c.defaultView.getComputedStyle(a, "");
            return e && (d = e[z(b)]), a.style[b] || d
        } : m && d.currentStyle ? function(a, b) {
            b = z(b), b = b == "float" ? "styleFloat" : b;
            if (b == "opacity") {
                var c = 100;
                try {
                    c = a.filters["DXImageTransform.Microsoft.Alpha"].opacity
                } catch (d) {
                    try {
                        c = a.filters("alpha").opacity
                    } catch (e) {}
                }
                return c / 100
            }
            var f = a.currentStyle ? a.currentStyle[b] : null;
            return a.style[b] || f
        } : function(a, b) {
            return a.style[z(b)]
        };
    I.prototype = {
        get: function(a) {
            return this[a]
        },
        each: function(a, b) {
            return y(this, a, b)
        },
        map: function(a, b) {
            var c = [],
                d, e;
            for (e = 0; e < this.length; e++) d = a.call(this, this[e], e), b ? b(d) && c.push(d) : c.push(d);
            return c
        },
        first: function() {
            return N(this[0])
        },
        last: function() {
            return N(this[this.length - 1])
        },
        html: function(a, b) {
            function f(b) {
                while (b.firstChild) b.removeChild(b.firstChild);
                y(J(a), function(a) {
                    b.appendChild(a)
                })
            }
            var c = b ? d.textContent === null ? "innerText" : "textContent" : "innerHTML",
                e;
            return typeof a != "undefined" ? this.each(function(b) {
                (e = b.tagName.match(h)) ? f(b, e[0]): b[c] = a
            }) : this[0] ? this[0][c] : ""
        },
        text: function(a) {
            return this.html(a, 1)
        },
        addClass: function(a) {
            return this.each(function(b) {
                F(b, a) || G(b, a)
            })
        },
        removeClass: function(a) {
            return this.each(function(b) {
                F(b, a) && H(b, a)
            })
        },
        hasClass: function(a) {
            return B(this, function(b) {
                return F(b, a)
            })
        },
        toggleClass: function(a, b) {
            return this.each(function(c) {
                typeof b != "undefined" ? b ? G(c, a) : H(c, a) : F(c, a) ? H(c, a) : G(c, a)
            })
        },
        show: function(a) {
            return this.each(function(b) {
                b.style.display = a || ""
            })
        },
        hide: function(a) {
            return this.each(function(a) {
                a.style.display = "none"
            })
        },
        append: function(a) {
            return this.each(function(b) {
                y(J(a), function(a) {
                    b.appendChild(a)
                })
            })
        },
        prepend: function(a) {
            return this.each(function(b) {
                var c = b.firstChild;
                y(J(a), function(a) {
                    b.insertBefore(a, c)
                })
            })
        },
        appendTo: function(a, b) {
            return D.call(this, a, b, function(a, b) {
                a.appendChild(b)
            })
        },
        prependTo: function(a, b) {
            return D.call(this, a, b, function(a, b) {
                a.insertBefore(b, a.firstChild)
            })
        },
        next: function() {
            return this.related("nextSibling")
        },
        previous: function() {
            return this.related("previousSibling")
        },
        related: function(a) {
            return this.map(function(b) {
                b = b[a];
                while (b && b.nodeType !== 1) b = b[a];
                return b || 0
            }, function(a) {
                return a
            })
        },
        before: function(a) {
            return this.each(function(b) {
                y(N.create(a), function(a) {
                    b[e].insertBefore(a, b)
                })
            })
        },
        after: function(a) {
            return this.each(function(b) {
                y(N.create(a), function(a) {
                    b[e].insertBefore(a, b.nextSibling)
                })
            })
        },
        insertBefore: function(a, b) {
            return D.call(this, a, b, function(a, b) {
                a[e].insertBefore(b, a)
            })
        },
        insertAfter: function(a, b) {
            return D.call(this, a, b, function(a, b) {
                var c = a.nextSibling;
                c ? a[e].insertBefore(b, c) : a[e].appendChild(b)
            })
        },
        css: function(a, d, e) {
            function g(a, b, c) {
                for (var d in f) f.hasOwnProperty(d) && (c = f[d], (b = z(d)) && p.test(c) && !(b in u) && (c += q), b = b == "transform" ? v : b, b = b == "transformOrigin" ? v + "Origin" : b, a.style[b] = c)
            }
            if (d === undefined && typeof a == "string") return d = this[0], d ? d == c || d == b ? (e = d == c ? N.doc() : N.viewport(), a == "width" ? e.width : a == "height" ? e.height : "") : C(d, a) : null;
            var f = a;
            typeof a == "string" && (f = {}, f[a] = d), m && f.opacity && (f.filter = "alpha(opacity=" + f.opacity * 100 + ")", f.zoom = a.zoom || 1, delete f.opacity);
            if (d = f["float"]) m ? f.styleFloat = d : f.cssFloat = d, delete f["float"];
            return this.each(g)
        },
        offset: function(a, b) {
            if (typeof a == "number" || typeof b == "number") return this.each(function(c) {
                E(c, a, b)
            });
            var c = this[0],
                d = c.offsetWidth,
                e = c.offsetHeight,
                f = c.offsetTop,
                g = c.offsetLeft;
            while (c = c.offsetParent) f = f + c.offsetTop, g = g + c.offsetLeft;
            return {
                top: f,
                left: g,
                height: e,
                width: d
            }
        },
        attr: function(a, b) {
            var c = this[0];
            if (typeof a == "string" || a instanceof String) return typeof b == "undefined" ? g.test(a) ? l.test(a) && typeof c[a] == "string" ? !0 : c[a] : c[s](a) : this.each(function(c) {
                g.test(a) ? c[a] = b : c[r](a, b)
            });
            for (var d in a) a.hasOwnProperty(d) && this.attr(d, a[d]);
            return this
        },
        val: function(a) {
            return typeof a == "string" ? this.attr("value", a) : this[0].value
        },
        removeAttr: function(a) {
            return this.each(function(b) {
                l.test(a) ? b[a] = !1 : b.removeAttribute(a)
            })
        },
        data: function(a, b) {
            var c = this[0];
            if (typeof b == "undefined") {
                c[s]("data-node-uid") || c[r]("data-node-uid", ++o);
                var d = c[s]("data-node-uid");
                return n[d] || (n[d] = {}), n[d][a]
            }
            return this.each(function(c) {
                c[s]("data-node-uid") || c[r]("data-node-uid", ++o);
                var d = c[s]("data-node-uid"),
                    e = n[d] || (n[d] = {});
                e[a] = b
            })
        },
        remove: function() {
            return this.each(function(a) {
                a[e] && a[e].removeChild(a)
            })
        },
        empty: function() {
            return this.each(function(a) {
                while (a.firstChild) a.removeChild(a.firstChild)
            })
        },
        detach: function() {
            return this.map(function(a) {
                return a[e].removeChild(a)
            })
        },
        scrollTop: function(a) {
            return K.call(this, null, a, "y")
        },
        scrollLeft: function(a) {
            return K.call(this, a, null, "x")
        },
        toggle: function(a) {
            return this.each(function(a) {
                a.style.display = a.offsetWidth || a.offsetHeight ? "none" : "block"
            }), a && a(), this
        }
    }, N.setQueryEngine = function(a) {
        f = a, delete N.setQueryEngine
    }, N.aug = function(a, b) {
        for (var c in a) a.hasOwnProperty(c) && ((b || I.prototype)[c] = a[c])
    }, N.create = function(a) {
        return typeof a == "string" ? function() {
            var b = /^<([^\s>]+)/.exec(a),
                d = c.createElement(b && k[b[1].toLowerCase()] || "div"),
                e = [];
            d.innerHTML = a;
            var f = d.childNodes;
            d = d.firstChild, e.push(d);
            while (d = d.nextSibling) d.nodeType == 1 && e.push(d);
            return e
        }() : A(a) ? [a.cloneNode(!0)] : []
    }, N.doc = function() {
        var a = this.viewport();
        return {
            width: Math.max(c.body.scrollWidth, d.scrollWidth, a.width),
            height: Math.max(c.body.scrollHeight, d.scrollHeight, a.height)
        }
    }, N.firstChild = function(a) {
        for (var b = a.childNodes, c = 0, d = b && b.length || 0, e; c < d; c++) b[c].nodeType === 1 && (e = b[d = c]);
        return e
    }, N.viewport = function() {
        return {
            width: m ? d.clientWidth : self.innerWidth,
            height: m ? d.clientHeight : self.innerHeight
        }
    }, N.isAncestor = "compareDocumentPosition" in d ? function(a, b) {
        return (a.compareDocumentPosition(b) & 16) == 16
    } : "contains" in d ? function(a, b) {
        return a !== b && a.contains(b)
    } : function(a, b) {
        while (b = b[e])
            if (b === a) return !0;
        return !1
    };
    var O = a.bonzo;
    return N.noConflict = function() {
        return a.bonzo = O, this
    }, N
});
var envision = {
    _: Flotr._,
    bean: Flotr.bean,
    bonzo: bonzo,
    noConflict: function(root) {
        var previous = root.envision;
        return function() {
            root.envision = previous;
            return this
        }
    }(this)
};
(function() {
    var CN_FIRST = "envision-first",
        CN_LAST = "envision-last",
        T_VISUALIZATION = '<div class="envision-visualization"></div>';
    T_COMPONENT_CONTAINER = '<div class="envision-component-container"></div>';

    function Visualization(options) {
        this.options = options || {};
        this.components = [];
        this.node = null;
        this.rendered = false
    }
    Visualization.prototype = {
        render: function(element) {
            var options = this.options;
            element = element || options.element;
            if (!element) throw "No element to render within.";
            this.node = bonzo.create(T_VISUALIZATION)[0];
            bonzo(this.node).addClass(options.name || "");
            this.container = element;
            bonzo(element).append(this.node);
            bonzo(element).data("envision", this);
            _.each(this.components, function(component) {
                this._renderComponent(component)
            }, this);
            this._updateClasses();
            this.rendered = true;
            return this
        },
        add: function(component) {
            this.components.push(component);
            if (this.rendered) {
                this._renderComponent(component);
                this._updateClasses()
            }
            return this
        },
        remove: function(component) {
            var components = this.components,
                index = this.indexOf(component);
            if (index !== -1) {
                components.splice(index, 1);
                bonzo(component.container).remove();
                this._updateClasses()
            }
            return this
        },
        setPosition: function(component, newIndex) {
            var components = this.components;
            if (newIndex >= 0 && newIndex < components.length && this.remove(component)) {
                if (this.rendered) {
                    if (newIndex === components.length) this.node.appendChild(component.container);
                    else this.node.insertBefore(component.container, components[newIndex].container)
                }
                components.splice(newIndex, 0, component);
                this._updateClasses()
            }
            return this
        },
        indexOf: function(component) {
            return _.indexOf(this.components, component)
        },
        getComponent: function(index) {
            var components = this.components;
            if (index < components.length) return components[index]
        },
        isFirst: function(component) {
            return this.indexOf(component) === 0 ? true : false
        },
        isLast: function(component) {
            return this.indexOf(component) === this.components.length - 1 ? true : false
        },
        destroy: function() {
            _.each(this.components, function(component) {
                component.destroy()
            });
            bonzo(this.container).empty()
        },
        _renderComponent: function(component) {
            var container = bonzo.create(T_COMPONENT_CONTAINER)[0];
            bonzo(this.node).append(container);
            component.render(container)
        },
        _updateClasses: function() {
            var components = this.components,
                first = 0,
                last = components.length - 1,
                node;
            _.each(components, function(component, index) {
                node = bonzo(component.container);
                if (index === first) node.addClass(CN_FIRST);
                else node.removeClass(CN_FIRST);
                if (index === last) node.addClass(CN_LAST);
                else node.removeClass(CN_LAST)
            })
        }
    };
    envision.Visualization = Visualization
})();
(function() {
    var V = envision,
        CN_COMPONENT = "envision-component",
        T_COMPONENT = '<div class="' + CN_COMPONENT + '"></div>';

    function Component(options) {
        options = options || {};
        var node = bonzo.create(T_COMPONENT)[0];
        this.options = options;
        this.node = node;
        if (options.adapter) {
            this.api = options.adapter
        } else if (options.adapterConstructor) {
            this.api = new options.adapterConstructor(options.config)
        } else if (options.adapterCallback) {
            this.api = options.adapterCallback.call(null, options.config)
        } else if (options.config) {
            this.api = new V.adapters.flotr.Child(options.config || {})
        }
        this.preprocessors = []
    }
    Component.prototype = {
        render: function(element) {
            var node = this.node,
                options = this.options;
            element = element || options.element;
            if (!element) throw "No element to render within.";
            bonzo(element).addClass(options.name || "").append(this.node);
            this._setDimension("width");
            this._setDimension("height");
            this.container = element;
            this.draw(options.data, options.config)
        },
        draw: function(data, config) {
            var api = this.api,
                options = this.options,
                preprocessors = this.preprocessors,
                clientData;
            clientData = data = data || options.data;
            config = config || options.config;
            if (!options.skipPreprocess && data) {
                clientData = [];
                _.each(api.getDataArray(data), function(d, index) {
                    var preprocessor = preprocessors[index] || new V.Preprocessor,
                        isArray = _.isArray(d),
                        isFunction = _.isFunction(d),
                        unprocessed = isArray ? d : isFunction ? d : d.data,
                        processData = options.processData,
                        range = api.range(config),
                        min = range.min,
                        max = range.max,
                        resolution = this.node.clientWidth,
                        dataArray = d,
                        processed, objectData;
                    if (!isFunction && !isArray) {
                        dataArray = d.data;
                        objectData = _.extend({}, d)
                    }
                    if (isFunction) {
                        processed = data(min, max, resolution)
                    } else {
                        if (dataArray !== preprocessor.data) {
                            preprocessor.setData(dataArray)
                        } else {
                            preprocessor.reset()
                        }
                        if (processData) {
                            processData.apply(this, [{
                                preprocessor: preprocessor,
                                min: min,
                                max: max,
                                resolution: resolution
                            }]);
                            processed = preprocessor.getData()
                        } else {
                            processed = preprocessor.bound(min, max).subsampleMinMax(resolution).getData()
                        }
                    }
                    if (api.transformData) {
                        processed = api.transformData(processed)
                    }
                    if (objectData) {
                        objectData.data = processed;
                        clientData.push(objectData)
                    } else {
                        clientData.push(processed)
                    }
                }, this)
            }
            if (api) api.draw(clientData, config, this.node)
        },
        trigger: function() {
            this.api.trigger.apply(this.api, Array.prototype.concat.apply([this], arguments))
        },
        attach: function() {
            this.api.attach.apply(this.api, Array.prototype.concat.apply([this], arguments))
        },
        detach: function() {
            this.api.detach.apply(this.api, Array.prototype.concat.apply([this], arguments))
        },
        destroy: function() {
            if (this.api && this.api.destroy) this.api.destroy();
            bonzo(this.container).empty()
        },
        _setDimension: function(attribute) {
            var node = this.node,
                options = this.options;
            if (options[attribute]) {
                bonzo(node).css(attribute, options[attribute])
            } else {
                options[attribute] = node.clientWidth
            }
            this[attribute] = options[attribute]
        }
    };
    V.Component = Component
})();
(function() {
    var H = envision;

    function Interaction(options) {
        this.options = options = options || {};
        this.actions = [];
        this.actionOptions = [];
        this.followers = [];
        this.leaders = [];
        this.prevent = {};
        if (options.leader) {
            this.leader(options.leader)
        }
    }
    Interaction.prototype = {
        leader: function(component) {
            this.leaders.push(component);
            _.each(this.actions, function(action, i) {
                this._bindLeader(component, action, this.actionOptions[i])
            }, this);
            return this
        },
        follower: function(component) {
            this.followers.push(component);
            return this
        },
        group: function(components) {
            if (!_.isArray(components)) components = [components];
            _.each(components, function(component) {
                this.leader(component);
                this.follower(component)
            }, this);
            return this
        },
        add: function(action, options) {
            this.actions.push(action);
            this.actionOptions.push(options);
            _.each(this.leaders, function(leader) {
                this._bindLeader(leader, action, options)
            }, this);
            return this
        },
        _bindLeader: function(leader, action, options) {
            _.each(action.events, function(e) {
                var handler = e.handler || e,
                    consumer = e.consumer || e;
                leader.attach(handler, _.bind(function(leader, result) {
                    if (this.prevent[name]) return;
                    if (options && options.callback) {
                        options.callback.call(this, result)
                    }
                    this.prevent[name] = true;
                    try {
                        _.each(this.followers, function(follower) {
                            if (leader === follower) return;
                            follower.trigger(consumer, result)
                        }, this)
                    } catch (e) {
                        this.prevent[name] = false;
                        throw e
                    }
                    this.prevent[name] = false
                }, this))
            }, this)
        }
    };
    H.Interaction = Interaction
})();
(function() {
    function Preprocessor(options) {
        options = options || {};
        this.getData = function() {
            if (this.bounded) bound(this);
            return this.processing
        };
        this.reset = function() {
            this.processing = this.data;
            return this
        };
        this.setData = function(data) {
            var i, length;
            if (!_.isArray(data)) throw new Error("Array expected.");
            if (data.length < 2) throw new Error("Data must contain at least two dimensions.");
            length = data[0].length;
            for (i = data.length; i--;) {
                if (!_.isArray(data[i])) throw new Error("Data dimensions must be arrays.");
                if (data[i].length !== length) throw new Error("Data dimensions must contain the same number of points.")
            }
            this.processing = data;
            this.data = data;
            return this
        };
        if (options.data) this.setData(options.data)
    }

    function getStartIndex(data, min) {
        var i = _.sortedIndex(data, min);
        if (data[i] > min && i > 0) i--;
        return i
    }

    function getEndIndex(data, max) {
        return _.sortedIndex(data, max)
    }

    function bound(that) {
        delete that.bounded;
        var data = that.processing,
            length = that.length(),
            x = data[0],
            y = data[1],
            min = that.min || 0,
            max = that.max || length,
            start = getStartIndex(x, min),
            end = getEndIndex(x, max);
        that.processing = [x.slice(start, end + 1), y.slice(start, end + 1)];
        that.start = start;
        that.end = end
    }
    Preprocessor.prototype = {
        length: function() {
            return this.getData()[0].length
        },
        bound: function(min, max) {
            if (!_.isNumber(min) || !_.isNumber(max)) return this;
            this.min = min;
            this.max = max;
            this.bounded = true;
            return this
        },
        subsampleMinMax: function(resolution) {
            var bounded = this.bounded;
            delete this.bounded;
            var data = this.processing,
                length = this.length(),
                x = data[0],
                y = data[1],
                start = bounded ? getStartIndex(x, this.min) : 0,
                end = bounded ? getEndIndex(x, this.max) : length - 1,
                count = (resolution - 2) / 2,
                newX = [],
                newY = [],
                min = Number.MAX_VALUE,
                max = -Number.MAX_VALUE,
                minI = 1,
                maxI = 1,
                unit = (end - start) / count,
                position, datum, i, j;
            if (end - start + 1 > resolution) {
                newX.push(x[start]);
                newY.push(y[start]);
                position = start + unit;
                for (i = start; i < end; i++) {
                    if (i === Math.round(position)) {
                        position += unit;
                        j = Math.min(maxI, minI);
                        newX.push(x[j]);
                        newY.push(y[j]);
                        j = Math.max(maxI, minI);
                        newX.push(x[j]);
                        newY.push(y[j]);
                        minI = i;
                        min = y[minI];
                        maxI = i;
                        max = y[maxI]
                    } else {
                        if (y[i] > max) {
                            max = y[i];
                            maxI = i
                        }
                        if (y[i] < min) {
                            min = y[i];
                            minI = i
                        }
                    }
                }
                if (i < position) {
                    newX.push(x[minI]);
                    newY.push(min);
                    newX.push(x[maxI]);
                    newY.push(max)
                }
                newX.push(x[end]);
                newY.push(y[end]);
                this.processing = [newX, newY];
                this.start = start;
                this.end = end
            } else {
                this.bounded = bounded
            }
            return this
        },
        subsample: function(resolution) {
            var bounded = this.bounded;
            delete this.bounded;
            var data = this.processing,
                length = this.length(),
                x = data[0],
                y = data[1],
                start = bounded ? getStartIndex(x, this.min) : 0,
                end = bounded ? getEndIndex(x, this.max) : length - 1,
                unit = (end - start + 1) / resolution,
                newX = [],
                newY = [],
                i, index;
            if (end - start + 1 > resolution) {
                newX.push(x[start]);
                newY.push(y[start]);
                for (i = 1; i < resolution; i++) {
                    if (i * unit >= end - unit) break;
                    index = Math.round(i * unit) + start;
                    newX.push(x[index]);
                    newY.push(y[index])
                }
                newX.push(x[end]);
                newY.push(y[end]);
                this.processing = [newX, newY];
                this.start = start;
                this.end = end
            } else {
                this.bounded = bounded
            }
            return this
        },
        interpolate: function(resolution) {
            var bounded = this.bounded;
            delete this.bounded;
            var data = this.processing,
                length = this.length(),
                x = data[0],
                y = data[1],
                start = bounded ? getStartIndex(x, this.min) : 0,
                end = bounded ? getEndIndex(x, this.max) : length - 1,
                unit = (x[end] - x[start]) / resolution,
                newX = [],
                newY = [],
                i, j, delta;
            newX.push(x[start]);
            newY.push(y[start]);
            if (end - start + 1 < resolution) {
                for (i = start; i < end; i++) {
                    delta = x[i + 1] - x[i];
                    newX.push(x[i]);
                    newY.push(y[i]);
                    for (j = x[i + 0] + unit; j < x[i + 1]; j += unit) {
                        newX.push(j);
                        newY.push(cubicHermiteSpline(j, x[i - 1], y[i - 1], x[i + 0], y[i + 0], x[i + 1], y[i + 1], x[i + 2], y[i + 2]))
                    }
                }
                this.processing = [newX, newY];
                this.start = start;
                this.end = end
            }
            return this
        }
    };

    function cubicHermiteSpline(x, tk0, pk0, tk1, pk1, tk2, pk2, tk3, pk3) {
        var t = (x - tk1) / (tk2 - tk1),
            t1 = 1 - t,
            h00 = (1 + 2 * t) * t1 * t1,
            h10 = t * t1 * t1,
            h01 = t * t * (3 - 2 * t),
            h11 = t * t * (t - 1),
            mk = (pk2 - pk1) / (2 * (tk2 - tk1)) + (typeof pk0 === "undefined" ? 0 : (pk1 - pk0) / (2 * (tk1 - tk0))),
            mk1 = (typeof pk3 === "undefined" ? 0 : (pk3 - pk2) / (2 * (tk3 - tk2))) + (pk2 - pk1) / (2 * (tk2 - tk1)),
            px = h00 * pk1 + h10 * (tk2 - tk1) * mk + h01 * pk2 + h11 * (tk2 - tk1) * mk1;
        return px
    }
    envision.Preprocessor = Preprocessor
})();
envision.actions = envision.actions || {};
envision.actions.hit = {
    events: ["hit", "mouseout"]
};
envision.actions.selection = {
    events: [{
        handler: "select",
        consumer: "zoom"
    }, {
        handler: "click",
        consumer: "reset"
    }]
};
envision.actions.zoom = {
    events: [{
        handler: "select",
        consumer: "zoom"
    }, "zoom", "reset"]
};
envision.adapters = envision.adapters || {};
envision.adapters.flotr = {};
envision.adapters.defaultOptions = {
    grid: {
        outlineWidth: 0,
        labelMargin: 0,
        horizontalLines: false,
        verticalLines: false
    },
    bars: {
        show: false,
        barWidth: .5,
        fill: true,
        lineWidth: 1,
        fillOpacity: 1
    },
    lines: {
        lineWidth: 1
    },
    xaxis: {
        margin: false,
        tickDecimals: 0,
        showLabels: false
    },
    yaxis: {
        margin: false,
        showLabels: false
    },
    shadowSize: false
};
(function() {
    var V = envision,
        A = envision.adapters,
        E = Flotr.EventAdapter,
        DEFAULTS = A.defaultOptions;

    function Child(options) {
        this.options = options || {};
        this.flotr = null;
        this._flotrDefaultOptions()
    }
    Child.prototype = {
        destroy: function() {
            this.flotr.destroy()
        },
        draw: function(data, flotr, node) {
            var options = this.options;
            data = this.getDataArray(data || options.data);
            if (flotr) {
                flotr = Flotr.merge(flotr, Flotr.clone(options))
            } else {
                flotr = options
            }
            options.data = data;
            if (!flotr) throw "No graph submitted.";
            this.flotr = Flotr.draw(node, data, flotr)
        },
        range: function(flotr) {
            var axis = flotr.xaxis;
            return {
                min: axis.min,
                max: axis.max
            }
        },
        transformData: function(data) {
            var length = data[0].length,
                dimension = data.length,
                transformed = [],
                point, i, j;
            for (i = 0; i < length; i++) {
                point = [];
                for (j = 0; j < dimension; j++) {
                    point.push(data[j][i])
                }
                transformed.push(point)
            }
            return transformed
        },
        getDataArray: function(data) {
            if (data[0] && (!_.isArray(data[0]) || !data[0].length || data[0][0] && _.isArray(data[0][0]))) return data;
            else return [data]
        },
        _flotrDefaultOptions: function(options) {
            var o = options || this.options,
                i;
            for (i in DEFAULTS) {
                if (DEFAULTS.hasOwnProperty(i)) {
                    if (_.isUndefined(o[i])) {
                        o[i] = DEFAULTS[i]
                    } else {
                        _.defaults(o[i], DEFAULTS[i])
                    }
                }
            }
        },
        attach: function(component, name, callback) {
            var event = this.events[name] || {},
                handler = event.handler || false;
            name = event.name || false;
            if (handler) {
                return E.observe(component.node, name, function() {
                    var args = [component].concat(Array.prototype.slice.call(arguments)),
                        result = handler.apply(this, args);
                    return callback.apply(null, [component, result])
                })
            } else {
                return false
            }
        },
        detach: function(component, name, callback) {
            return E.stopObserve(component.node, name, handler)
        },
        trigger: function(component, name, options) {
            var event = this.events[name],
                consumer = event.consumer || false;
            return consumer ? consumer.apply(this, [component, options]) : false
        },
        events: {
            hit: {
                name: "flotr:hit",
                handler: function(component, hit) {
                    var x = hit.x,
                        y = hit.y,
                        graph = component.api.flotr,
                        options;
                    options = {
                        data: {
                            index: hit.index,
                            x: x,
                            y: y
                        },
                        x: graph.axes.x.d2p(x),
                        y: graph.axes.y.d2p(y)
                    };
                    return options
                },
                consumer: function(component, hit) {
                    var graph = component.api.flotr,
                        o;
                    o = {
                        x: hit.data.x,
                        y: hit.data.y || 1,
                        relX: hit.x,
                        relY: hit.y || 1
                    };
                    graph.hit.hit(o)
                }
            },
            select: {
                name: "flotr:selecting",
                handler: selectHandler,
                consumer: function(component, selection) {
                    var graph = component.api.flotr,
                        axes = graph.axes,
                        data = selection.data || {},
                        options = {},
                        x = selection.x,
                        y = selection.y;
                    if (!x && data.x) {
                        x = data.x;
                        options.x1 = x.min;
                        options.x2 = x.max
                    } else if (x) {
                        options.x1 = axes.x.p2d(x.min);
                        options.x2 = axes.x.p2d(x.max)
                    }
                    if (!y && data.y) {
                        y = data.y;
                        options.y1 = y.min;
                        options.y2 = y.max
                    } else if (y) {
                        options.y1 = axes.y.d2p(y.min);
                        options.y2 = axes.y.d2p(y.max)
                    }
                    graph.selection.setSelection(options)
                }
            },
            zoom: {
                name: "flotr:select",
                handler: function(component, selection) {
                    var options = selectHandler(component, selection);
                    component.trigger("zoom", options);
                    return options
                },
                consumer: function(component, selection) {
                    var x = selection.data.x,
                        y = selection.data.y,
                        options = {};
                    if (x) {
                        options.xaxis = {
                            min: x.min,
                            max: x.max
                        }
                    }
                    if (y) {
                        options.yaxis = {
                            min: y.min,
                            max: y.max
                        }
                    }
                    component.draw(null, options)
                }
            },
            mouseout: {
                name: "flotr:mouseout",
                handler: function(component) {},
                consumer: function(component) {
                    component.api.flotr.hit.clearHit()
                }
            },
            reset: {
                name: "flotr:click",
                handler: function(component) {
                    component.draw()
                },
                consumer: function(component) {
                    component.draw()
                }
            },
            click: {
                name: "flotr:click",
                handler: function(component) {
                    var min = component.api.flotr.axes.x.min,
                        max = component.api.flotr.axes.x.max;
                    return {
                        data: {
                            x: {
                                min: min,
                                max: max
                            }
                        },
                        x: {
                            min: component.api.flotr.axes.x.d2p(min),
                            max: component.api.flotr.axes.x.d2p(max)
                        }
                    }
                },
                consumer: function(component, selection) {
                    var x = selection.data.x,
                        y = selection.data.y,
                        options = {};
                    if (x) {
                        options.xaxis = {
                            min: x.min,
                            max: x.max
                        }
                    }
                    if (y) {
                        options.yaxis = {
                            min: y.min,
                            max: y.max
                        }
                    }
                    component.draw(null, options)
                }
            }
        }
    };

    function selectHandler(component, selection) {
        var mode = component.options.config.selection.mode,
            axes = component.api.flotr.axes,
            datax, datay, x, y, options;
        if (mode.indexOf("x") !== -1) {
            datax = {};
            datax.min = selection.x1;
            datax.max = selection.x2;
            x = {};
            x.min = axes.x.d2p(selection.x1);
            x.max = axes.x.d2p(selection.x2)
        }
        if (mode.indexOf("y") !== -1) {
            datay = {};
            datay.min = selection.y1;
            datay.max = selection.y2;
            y = {};
            y.min = axes.y.d2p(selection.y1);
            y.max = axes.y.d2p(selection.y2)
        }
        options = {
            data: {
                x: datax,
                y: datay
            },
            x: x,
            y: y
        };
        return options
    }
    A.flotr.Child = Child
})();
Flotr.addType("lite-lines", {
    options: {
        show: false,
        lineWidth: 2,
        fill: false,
        fillBorder: false,
        fillColor: null,
        fillOpacity: .4
    },
    draw: function(options) {
        var context = options.context,
            lineWidth = options.lineWidth,
            shadowSize = options.shadowSize,
            offset;
        context.save();
        context.lineCap = "butt";
        context.lineWidth = lineWidth;
        context.strokeStyle = options.color;
        this.plot(options);
        context.restore()
    },
    plot: function(options) {
        var context = options.context,
            xScale = options.xScale,
            yScale = options.yScale,
            data = options.data,
            length = data.length - 1,
            zero = yScale(0),
            x0, y0;
        if (length < 1) return;
        x0 = xScale(data[0][0]);
        y0 = yScale(data[0][1]);
        context.beginPath();
        context.moveTo(x0, y0);
        for (i = 0; i < length; ++i) {
            context.lineTo(xScale(data[i + 1][0]), yScale(data[i + 1][1]))
        }
        if (!options.fill || options.fill && !options.fillBorder) context.stroke();
        if (options.fill) {
            x0 = xScale(data[0][0]);
            context.fillStyle = options.fillStyle;
            context.lineTo(xScale(data[length][0]), zero);
            context.lineTo(x0, zero);
            context.lineTo(x0, yScale(data[0][1]));
            context.fill();
            if (options.fillBorder) {
                context.stroke()
            }
        }
    },
    extendYRange: function(axis, data, options, lines) {
        var o = axis.options;
        if (!o.max && o.max !== 0 || !o.min && o.min !== 0) {
            axis.max += options.lineWidth * .01;
            axis.min -= options.lineWidth * .01
        }
    }
});
Flotr.addType("whiskers", {
    options: {
        show: false,
        lineWidth: 2,
        barWidth: 1,
        fill: true,
        fillColor: null,
        fillOpacity: .4,
        horizontal: false,
        stacked: false,
        centered: true
    },
    stack: {
        positive: [],
        negative: [],
        _positive: [],
        _negative: []
    },
    draw: function(options) {
        var context = options.context;
        context.save();
        context.lineJoin = "miter";
        context.lineCap = "butt";
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;
        if (options.fill) context.fillStyle = options.fillStyle;
        this.plot(options);
        context.restore()
    },
    plot: function(options) {
        var data = options.data,
            context = options.context,
            shadowSize = options.shadowSize,
            xScale = options.xScale,
            yScale = options.yScale,
            zero = yScale(0),
            i, x;
        if (data.length < 1) return;
        context.translate(-options.lineWidth, 0);
        context.beginPath();
        for (i = 0; i < data.length; i++) {
            x = xScale(data[i][0]);
            context.moveTo(x, zero);
            context.lineTo(x, yScale(data[i][1]))
        }
        context.closePath();
        context.stroke()
    },
    drawHit: function(options) {
        var args = options.args,
            context = options.context,
            shadowSize = options.shadowSize,
            xScale = options.xScale,
            yScale = options.yScale,
            zero = yScale(0),
            x = xScale(args.x),
            y = yScale(args.y);
        context.save();
        context.translate(-options.lineWidth, 0);
        context.beginPath();
        context.moveTo(x, zero);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
        context.restore()
    },
    clearHit: function(options) {
        var args = options.args,
            context = options.context,
            shadowSize = options.shadowSize,
            xScale = options.xScale,
            yScale = options.yScale,
            lineWidth = options.lineWidth,
            zero = yScale(0),
            x = xScale(args.x),
            y = yScale(args.y);
        context.save();
        context.clearRect(x - 2 * lineWidth, y - lineWidth, 4 * lineWidth, zero - y + lineWidth);
        context.restore()
    }
});
envision.components = envision.components || {};
(function() {
    function QuadraticDrawing(options) {
        this.options = options || {}
    }
    QuadraticDrawing.prototype = {
        height: null,
        width: null,
        rendered: false,
        render: function(node) {
            var canvas = document.createElement("canvas"),
                offset = bonzo(node).offset();
            this.height = offset.height;
            this.width = offset.width;
            bonzo(canvas).attr("height", offset.height).attr("width", offset.width).css({
                position: "absolute",
                top: "0px",
                left: "0px"
            });
            node.appendChild(canvas);
            bonzo(node).css({
                position: "relative"
            });
            if (typeof FlashCanvas !== "undefined") FlashCanvas.initElement(canvas);
            this.context = canvas.getContext("2d");
            this.rendered = true
        },
        draw: function(data, options, node) {
            if (!this.rendered) this.render(node);
            var context = this.context,
                height = this.height,
                width = this.width,
                half = Math.round(height / 2) - .5,
                min, max;
            options = options || {
                min: width / 2,
                max: width / 2
            };
            min = options.min + .5;
            max = options.max + .5;
            context.clearRect(0, 0, width, height);
            if (min || max) {
                context.save();
                context.strokeStyle = this.options.strokeStyle || "#B6D9FF";
                context.fillStyle = this.options.fillStyle || "rgba(182, 217, 255, .4)";
                context.beginPath();
                if (min <= 1) {
                    context.moveTo(0, height);
                    context.lineTo(0, -.5)
                } else {
                    context.moveTo(min, height);
                    context.quadraticCurveTo(min, half, Math.max(min - half, min / 2), half);
                    context.lineTo(Math.min(half, min / 2), half);
                    context.quadraticCurveTo(0, half, .5, -.5)
                }
                context.lineTo(width - .5, -.5);
                if (max >= width - 1) {
                    context.lineTo(max, height)
                } else {
                    context.quadraticCurveTo(width, half, Math.max(width - half, width - (width - max) / 2), half);
                    context.lineTo(Math.min(max + half, width - (width - max) / 2), half);
                    context.quadraticCurveTo(max, half, max, height)
                }
                context.stroke();
                context.closePath();
                context.fill();
                context.restore()
            }
        },
        trigger: function(component, name, options) {
            if (name === "zoom") {
                this.zoom(component, options)
            } else if (name === "reset") {
                this.reset(component)
            }
        },
        zoom: function(component, options) {
            var x = options.x || {},
                min = x.min,
                max = x.max,
                api = component.api;
            component.draw(null, {
                min: min,
                max: max
            })
        },
        reset: function(component) {
            component.draw(null, {
                min: component.width / 2,
                max: component.width / 2
            })
        }
    };
    envision.components.QuadraticDrawing = QuadraticDrawing
})();
envision.templates = envision.templates || {};
(function() {
    var V = envision;

    function processData(options) {
        var resolution = options.resolution;
        options.preprocessor.bound(options.min, options.max).subsampleMinMax(resolution + Math.round(resolution / 3))
    }

    function getDefaults() {
        return {
            price: {
                name: "envision-finance-price",
                config: {
                    "lite-lines": {
                        lineWidth: 1,
                        show: true,
                        fill: true,
                        fillOpacity: .2
                    },
                    mouse: {
                        track: true,
                        trackY: false,
                        trackAll: true,
                        sensibility: 1,
                        trackDecimals: 4,
                        position: "ne"
                    },
                    yaxis: {
                        autoscale: true,
                        autoscaleMargin: .05,
                        noTicks: 4,
                        showLabels: true,
                        min: 0
                    }
                },
                processData: processData
            },
            volume: {
                name: "envision-finance-volume",
                config: {
                    whiskers: {
                        show: true,
                        lineWidth: 2
                    },
                    mouse: {
                        track: true,
                        trackY: false,
                        trackAll: true
                    },
                    yaxis: {
                        autoscale: true,
                        autoscaleMargin: .5
                    }
                },
                processData: processData
            },
            summary: {
                name: "envision-finance-summary",
                config: {
                    "lite-lines": {
                        show: true,
                        lineWidth: 1,
                        fill: true,
                        fillOpacity: .2,
                        fillBorder: true
                    },
                    xaxis: {
                        noTicks: 5,
                        showLabels: true
                    },
                    yaxis: {
                        autoscale: true,
                        autoscaleMargin: .1
                    },
                    handles: {
                        show: true
                    },
                    selection: {
                        mode: "x"
                    },
                    grid: {
                        verticalLines: false
                    }
                }
            },
            connection: {
                name: "envision-finance-connection",
                adapterConstructor: V.components.QuadraticDrawing
            }
        }
    }

    function Finance(options) {
        var data = options.data,
            defaults = getDefaults(),
            vis = new V.Visualization({
                name: "envision-finance"
            }),
            selection = new V.Interaction,
            hit = new V.Interaction,
            price, volume, connection, summary;
        if (options.defaults) {
            defaults = Flotr.merge(options.defaults, defaults)
        }
        defaults.price.data = data.price;
        defaults.volume.data = data.volume;
        defaults.summary.data = data.summary;
        defaults.price.config.mouse.trackFormatter = options.trackFormatter || function(o) {
            var index = o.index,
                value;
            if (price.api.preprocessor) {
                index += price.api.preprocessor.start
            }
            value = "Price: $" + data.price[1][index] + ", Vol: " + data.volume[1][index];
            return value
        };
        if (options.xTickFormatter) {
            defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter
        }
        defaults.price.config.yaxis.tickFormatter = options.yTickFormatter || function(n) {
            return "$" + n
        };
        price = new V.Component(defaults.price);
        volume = new V.Component(defaults.volume);
        connection = new V.Component(defaults.connection);
        summary = new V.Component(defaults.summary);
        vis.add(price).add(volume).add(connection).add(summary).render(options.container);
        selection.follower(price).follower(volume).follower(connection).leader(summary).add(V.actions.selection, options.selectionCallback ? {
            callback: options.selectionCallback
        } : null);
        hit.group([price, volume]).add(V.actions.hit);
        if (options.selection) {
            summary.trigger("select", options.selection)
        }
        this.vis = vis;
        this.selection = selection;
        this.hit = hit;
        this.price = price;
        this.volume = volume;
        this.summary = summary
    }
    V.templates.Finance = Finance
})();
(function() {
    var V = envision;

    function getDefaults() {
        return {
            detail: {
                name: "envision-timeseries-detail",
                config: {
                    "lite-lines": {
                        lineWidth: 1,
                        show: true
                    }
                }
            },
            summary: {
                name: "envision-timeseries-summary",
                config: {
                    "lite-lines": {
                        lineWidth: 1,
                        show: true
                    },
                    handles: {
                        show: true
                    },
                    selection: {
                        mode: "x"
                    },
                    yaxis: {
                        autoscale: true,
                        autoscaleMargin: .1
                    }
                }
            },
            connection: {
                name: "envision-timeseries-connection",
                adapterConstructor: V.components.QuadraticDrawing
            }
        }
    }

    function TimeSeries(options) {
        var data = options.data,
            defaults = getDefaults(),
            vis = new V.Visualization({
                name: "envision-timeseries"
            }),
            selection = new V.Interaction,
            detail, summary, connection;
        if (options.defaults) {
            defaults = Flotr.merge(options.defaults, defaults)
        }
        defaults.detail.data = data.detail;
        defaults.summary.data = data.summary;
        detail = new V.Component(defaults.detail);
        connection = new V.Component(defaults.connection);
        summary = new V.Component(defaults.summary);
        vis.add(detail).add(connection).add(summary).render(options.container);
        selection.follower(detail).follower(connection).leader(summary).add(V.actions.selection, options.selectionCallback ? {
            callback: options.selectionCallback
        } : null);
        if (options.selection) {
            summary.trigger("select", options.selection)
        }
        this.vis = vis;
        this.selection = selection;
        this.detail = detail;
        this.summary = summary
    }
    V.templates.TimeSeries = TimeSeries
})();
(function() {
    var V = envision,
        Zoom;

    function defaultsZoom() {
        return {
            name: "zoom"
        }
    }

    function defaultsSummary() {
        return {
            name: "summary",
            config: {
                handles: {
                    show: true
                },
                selection: {
                    mode: "x"
                }
            }
        }
    }

    function getDefaults(options, defaults) {
        var o = _.defaults(options, defaults);
        o.flotr = _.defaults(o.flotr, defaults.flotr);
        return o
    }
    Zoom = function(options) {
        var vis = new V.Visualization,
            zoom = new V.Component(getDefaults(options.zoom || {}, defaultsZoom())),
            summary = new V.Component(getDefaults(options.summary || {}, defaultsSummary())),
            interaction = new V.Interaction({
                leader: summary
            });
        vis.add(zoom).add(summary);
        interaction.add(V.actions.selection);
        interaction.follower(zoom);
        this.vis = vis;
        this.interaction = interaction;
        if (options.container) {
            this.render(options.container)
        }
    };
    Zoom.prototype = {
        render: function(container) {
            this.vis.render(container)
        }
    };
    V.templates.Zoom = Zoom
})();
(function() {
    function a(a) {
        return a.target
    }

    function b(a) {
        return a.source
    }

    function c(a, b) {
        try {
            for (var c in b) Object.defineProperty(a.prototype, c, {
                value: b[c],
                enumerable: !1
            })
        } catch (d) {
            a.prototype = b
        }
    }

    function d(a) {
        var b = -1,
            c = a.length,
            d = [];
        while (++b < c) d.push(a[b]);
        return d
    }

    function e(a) {
        return Array.prototype.slice.call(a)
    }

    function f() {}

    function g(a) {
        return a
    }

    function h() {
        return !0
    }

    function i(a) {
        return typeof a == "function" ? a : function() {
            return a
        }
    }

    function j(a, b, c) {
        return function() {
            var d = c.apply(b, arguments);
            return arguments.length ? a : d
        }
    }

    function k(a) {
        return a != null && !isNaN(a)
    }

    function l(a) {
        return a.length
    }

    function m(a) {
        return a.trim().replace(/\s+/g, " ")
    }

    function n(a) {
        var b = 1;
        while (a * b % 1) b *= 10;
        return b
    }

    function o(a) {
        return a.length === 1 ? function(b, c) {
            a(b == null ? c : null)
        } : a
    }

    function p(a) {
        return a.responseText
    }

    function q(a) {
        return JSON.parse(a.responseText)
    }

    function r(a) {
        var b = document.createRange();
        return b.selectNode(document.body), b.createContextualFragment(a.responseText)
    }

    function s(a) {
        return a.responseXML
    }

    function t() {}

    function u(a) {
        function b() {
            var b = c,
                d = -1,
                e = b.length,
                f;
            while (++d < e)(f = b[d].on) && f.apply(this, arguments);
            return a
        }
        var c = [],
            d = new f;
        return b.on = function(b, e) {
            var f = d.get(b),
                g;
            return arguments.length < 2 ? f && f.on : (f && (f.on = null, c = c.slice(0, g = c.indexOf(f)).concat(c.slice(g + 1)), d.remove(b)), e && c.push(d.set(b, {
                on: e
            })), a)
        }, b
    }

    function v(a, b) {
        return b - (a ? 1 + Math.floor(Math.log(a + Math.pow(10, 1 + Math.floor(Math.log(a) / Math.LN10) - b)) / Math.LN10) : 1)
    }

    function w(a) {
        return a + ""
    }

    function x(a, b) {
        var c = Math.pow(10, Math.abs(8 - b) * 3);
        return {
            scale: b > 8 ? function(a) {
                return a / c
            } : function(a) {
                return a * c
            },
            symbol: a
        }
    }

    function y(a) {
        return function(b) {
            return b <= 0 ? 0 : b >= 1 ? 1 : a(b)
        }
    }

    function z(a) {
        return function(b) {
            return 1 - a(1 - b)
        }
    }

    function A(a) {
        return function(b) {
            return .5 * (b < .5 ? a(2 * b) : 2 - a(2 - 2 * b))
        }
    }

    function B(a) {
        return a * a
    }

    function C(a) {
        return a * a * a
    }

    function D(a) {
        if (a <= 0) return 0;
        if (a >= 1) return 1;
        var b = a * a,
            c = b * a;
        return 4 * (a < .5 ? c : 3 * (a - b) + c - .75)
    }

    function E(a) {
        return function(b) {
            return Math.pow(b, a)
        }
    }

    function F(a) {
        return 1 - Math.cos(a * kd / 2)
    }

    function G(a) {
        return Math.pow(2, 10 * (a - 1))
    }

    function H(a) {
        return 1 - Math.sqrt(1 - a * a)
    }

    function I(a, b) {
        var c;
        return arguments.length < 2 && (b = .45), arguments.length ? c = b / (2 * kd) * Math.asin(1 / a) : (a = 1, c = b / 4),
            function(d) {
                return 1 + a * Math.pow(2, 10 * -d) * Math.sin((d - c) * 2 * kd / b)
            }
    }

    function J(a) {
        return a || (a = 1.70158),
            function(b) {
                return b * b * ((a + 1) * b - a)
            }
    }

    function K(a) {
        return a < 1 / 2.75 ? 7.5625 * a * a : a < 2 / 2.75 ? 7.5625 * (a -= 1.5 / 2.75) * a + .75 : a < 2.5 / 2.75 ? 7.5625 * (a -= 2.25 / 2.75) * a + .9375 : 7.5625 * (a -= 2.625 / 2.75) * a + .984375
    }

    function L() {
        d3.event.stopPropagation(), d3.event.preventDefault()
    }

    function M() {
        var a = d3.event,
            b;
        while (b = a.sourceEvent) a = b;
        return a
    }

    function N(a) {
        var b = new t,
            c = 0,
            d = arguments.length;
        while (++c < d) b[arguments[c]] = u(b);
        return b.of = function(c, d) {
            return function(e) {
                try {
                    var f = e.sourceEvent = d3.event;
                    e.target = a, d3.event = e, b[e.type].apply(c, d)
                } finally {
                    d3.event = f
                }
            }
        }, b
    }

    function O(a) {
        var b = [a.a, a.b],
            c = [a.c, a.d],
            d = Q(b),
            e = P(b, c),
            f = Q(R(c, b, -e)) || 0;
        b[0] * c[1] < c[0] * b[1] && (b[0] *= -1, b[1] *= -1, d *= -1, e *= -1), this.rotate = (d ? Math.atan2(b[1], b[0]) : Math.atan2(-c[0], c[1])) * nd, this.translate = [a.e, a.f], this.scale = [d, f], this.skew = f ? Math.atan2(e, f) * nd : 0
    }

    function P(a, b) {
        return a[0] * b[0] + a[1] * b[1]
    }

    function Q(a) {
        var b = Math.sqrt(P(a, a));
        return b && (a[0] /= b, a[1] /= b), b
    }

    function R(a, b, c) {
        return a[0] += c * b[0], a[1] += c * b[1], a
    }

    function S(a) {
        return a == "transform" ? d3.interpolateTransform : d3.interpolate
    }

    function T(a, b) {
        return b = b - (a = +a) ? 1 / (b - a) : 0,
            function(c) {
                return (c - a) * b
            }
    }

    function U(a, b) {
        return b = b - (a = +a) ? 1 / (b - a) : 0,
            function(c) {
                return Math.max(0, Math.min(1, (c - a) * b))
            }
    }

    function V() {}

    function W(a, b, c) {
        return new X(a, b, c)
    }

    function X(a, b, c) {
        this.r = a, this.g = b, this.b = c
    }

    function Y(a) {
        return a < 16 ? "0" + Math.max(0, a).toString(16) : Math.min(255, a).toString(16)
    }

    function Z(a, b, c) {
        var d = 0,
            e = 0,
            f = 0,
            g, h, i;
        g = /([a-z]+)\((.*)\)/i.exec(a);
        if (g) {
            h = g[2].split(",");
            switch (g[1]) {
                case "hsl":
                    return c(parseFloat(h[0]), parseFloat(h[1]) / 100, parseFloat(h[2]) / 100);
                case "rgb":
                    return b(bb(h[0]), bb(h[1]), bb(h[2]))
            }
        }
        return (i = Hd.get(a)) ? b(i.r, i.g, i.b) : (a != null && a.charAt(0) === "#" && (a.length === 4 ? (d = a.charAt(1), d += d, e = a.charAt(2), e += e, f = a.charAt(3), f += f) : a.length === 7 && (d = a.substring(1, 3), e = a.substring(3, 5), f = a.substring(5, 7)), d = parseInt(d, 16), e = parseInt(e, 16), f = parseInt(f, 16)), b(d, e, f))
    }

    function $(a, b, c) {
        var d = Math.min(a /= 255, b /= 255, c /= 255),
            e = Math.max(a, b, c),
            f = e - d,
            g, h, i = (e + d) / 2;
        return f ? (h = i < .5 ? f / (e + d) : f / (2 - e - d), a == e ? g = (b - c) / f + (b < c ? 6 : 0) : b == e ? g = (c - a) / f + 2 : g = (a - b) / f + 4, g *= 60) : h = g = 0, cb(g, h, i)
    }

    function _(a, b, c) {
        a = ab(a), b = ab(b), c = ab(c);
        var d = nb((.4124564 * a + .3575761 * b + .1804375 * c) / Ld),
            e = nb((.2126729 * a + .7151522 * b + .072175 * c) / Md),
            f = nb((.0193339 * a + .119192 * b + .9503041 * c) / Nd);
        return ib(116 * e - 16, 500 * (d - e), 200 * (e - f))
    }

    function ab(a) {
        return (a /= 255) <= .04045 ? a / 12.92 : Math.pow((a + .055) / 1.055, 2.4)
    }

    function bb(a) {
        var b = parseFloat(a);
        return a.charAt(a.length - 1) === "%" ? Math.round(b * 2.55) : b
    }

    function cb(a, b, c) {
        return new db(a, b, c)
    }

    function db(a, b, c) {
        this.h = a, this.s = b, this.l = c
    }

    function eb(a, b, c) {
        function d(a) {
            return a > 360 ? a -= 360 : a < 0 && (a += 360), a < 60 ? f + (g - f) * a / 60 : a < 180 ? g : a < 240 ? f + (g - f) * (240 - a) / 60 : f
        }

        function e(a) {
            return Math.round(d(a) * 255)
        }
        var f, g;
        return a %= 360, a < 0 && (a += 360), b = b < 0 ? 0 : b > 1 ? 1 : b, c = c < 0 ? 0 : c > 1 ? 1 : c, g = c <= .5 ? c * (1 + b) : c + b - c * b, f = 2 * c - g, W(e(a + 120), e(a), e(a - 120))
    }

    function fb(a, b, c) {
        return new gb(a, b, c)
    }

    function gb(a, b, c) {
        this.h = a, this.c = b, this.l = c
    }

    function hb(a, b, c) {
        return ib(c, Math.cos(a *= md) * b, Math.sin(a) * b)
    }

    function ib(a, b, c) {
        return new jb(a, b, c)
    }

    function jb(a, b, c) {
        this.l = a, this.a = b, this.b = c
    }

    function kb(a, b, c) {
        var d = (a + 16) / 116,
            e = d + b / 500,
            f = d - c / 200;
        return e = mb(e) * Ld, d = mb(d) * Md, f = mb(f) * Nd, W(ob(3.2404542 * e - 1.5371385 * d - .4985314 * f), ob(-.969266 * e + 1.8760108 * d + .041556 * f), ob(.0556434 * e - .2040259 * d + 1.0572252 * f))
    }

    function lb(a, b, c) {
        return fb(Math.atan2(c, b) / kd * 180, Math.sqrt(b * b + c * c), a)
    }

    function mb(a) {
        return a > .206893034 ? a * a * a : (a - 4 / 29) / 7.787037
    }

    function nb(a) {
        return a > .008856 ? Math.pow(a, 1 / 3) : 7.787037 * a + 4 / 29
    }

    function ob(a) {
        return Math.round(255 * (a <= .00304 ? 12.92 * a : 1.055 * Math.pow(a, 1 / 2.4) - .055))
    }

    function pb(a) {
        return qd(a, Ud), a
    }

    function qb(a) {
        return function() {
            return Pd(a, this)
        }
    }

    function rb(a) {
        return function() {
            return Qd(a, this)
        }
    }

    function sb(a, b) {
        function c() {
            this.removeAttribute(a)
        }

        function d() {
            this.removeAttributeNS(a.space, a.local)
        }

        function e() {
            this.setAttribute(a, b)
        }

        function f() {
            this.setAttributeNS(a.space, a.local, b)
        }

        function g() {
            var c = b.apply(this, arguments);
            c == null ? this.removeAttribute(a) : this.setAttribute(a, c)
        }

        function h() {
            var c = b.apply(this, arguments);
            c == null ? this.removeAttributeNS(a.space, a.local) : this.setAttributeNS(a.space, a.local, c)
        }
        return a = d3.ns.qualify(a), b == null ? a.local ? d : c : typeof b == "function" ? a.local ? h : g : a.local ? f : e
    }

    function tb(a) {
        return new RegExp("(?:^|\\s+)" + d3.requote(a) + "(?:\\s+|$)", "g")
    }

    function ub(a, b) {
        function c() {
            var c = -1;
            while (++c < e) a[c](this, b)
        }

        function d() {
            var c = -1,
                d = b.apply(this, arguments);
            while (++c < e) a[c](this, d)
        }
        a = a.trim().split(/\s+/).map(vb);
        var e = a.length;
        return typeof b == "function" ? d : c
    }

    function vb(a) {
        var b = tb(a);
        return function(c, d) {
            if (e = c.classList) return d ? e.add(a) : e.remove(a);
            var e = c.className,
                f = e.baseVal != null,
                g = f ? e.baseVal : e;
            d ? (b.lastIndex = 0, b.test(g) || (g = m(g + " " + a), f ? e.baseVal = g : c.className = g)) : g && (g = m(g.replace(b, " ")), f ? e.baseVal = g : c.className = g)
        }
    }

    function wb(a, b, c) {
        function d() {
            this.style.removeProperty(a)
        }

        function e() {
            this.style.setProperty(a, b, c)
        }

        function f() {
            var d = b.apply(this, arguments);
            d == null ? this.style.removeProperty(a) : this.style.setProperty(a, d, c)
        }
        return b == null ? d : typeof b == "function" ? f : e
    }

    function xb(a, b) {
        function c() {
            delete this[a]
        }

        function d() {
            this[a] = b
        }

        function e() {
            var c = b.apply(this, arguments);
            c == null ? delete this[a] : this[a] = c
        }
        return b == null ? c : typeof b == "function" ? e : d
    }

    function yb(a) {
        return {
            __data__: a
        }
    }

    function zb(a) {
        return function() {
            return Td(this, a)
        }
    }

    function Ab(a) {
        return arguments.length || (a = d3.ascending),
            function(b, c) {
                return a(b && b.__data__, c && c.__data__)
            }
    }

    function Bb(a, b, c) {
        function d() {
            var b = this[f];
            b && (this.removeEventListener(a, b, b.$), delete this[f])
        }

        function e() {
            function e(a) {
                var c = d3.event;
                d3.event = a, h[0] = g.__data__;
                try {
                    b.apply(g, h)
                } finally {
                    d3.event = c
                }
            }
            var g = this,
                h = od(arguments);
            d.call(this), this.addEventListener(a, this[f] = e, e.$ = c), e._ = b
        }
        var f = "__on" + a,
            g = a.indexOf(".");
        return g > 0 && (a = a.substring(0, g)), b ? e : d
    }

    function Cb(a, b) {
        for (var c = 0, d = a.length; c < d; c++)
            for (var e = a[c], f = 0, g = e.length, h; f < g; f++)(h = e[f]) && b(h, f, c);
        return a
    }

    function Db(a) {
        return qd(a, Wd), a
    }

    function Eb(a, b) {
        return qd(a, Xd), a.id = b, a
    }

    function Fb(a, b, c, d) {
        var e = a.__transition__ || (a.__transition__ = {
                active: 0,
                count: 0
            }),
            g = e[c];
        if (!g) {
            var h = d.time;
            return g = e[c] = {
                tween: new f,
                event: d3.dispatch("start", "end"),
                time: h,
                ease: d.ease,
                delay: d.delay,
                duration: d.duration
            }, ++e.count, d3.timer(function(d) {
                function f(d) {
                    return e.active > c ? j() : (e.active = c, m.start.call(a, k, b), g.tween.forEach(function(c, d) {
                        (d = d.call(a, k, b)) && p.push(d)
                    }), i(d) || d3.timer(i, 0, h), 1)
                }

                function i(d) {
                    if (e.active !== c) return j();
                    var f = (d - n) / o,
                        g = l(f),
                        h = p.length;
                    while (h > 0) p[--h].call(a, g);
                    if (f >= 1) return j(), m.end.call(a, k, b), 1
                }

                function j() {
                    return --e.count ? delete e[c] : delete a.__transition__, 1
                }
                var k = a.__data__,
                    l = g.ease,
                    m = g.event,
                    n = g.delay,
                    o = g.duration,
                    p = [];
                return n <= d ? f(d) : d3.timer(f, n, h), 1
            }, 0, h), g
        }
    }

    function Gb(a) {
        return a == null && (a = ""),
            function() {
                this.textContent = a
            }
    }

    function Hb(a, b, c, d) {
        var e = a.id;
        return Cb(a, typeof c == "function" ? function(a, f, g) {
            a.__transition__[e].tween.set(b, d(c.call(a, a.__data__, f, g)))
        } : (c = d(c), function(a) {
            a.__transition__[e].tween.set(b, c)
        }))
    }

    function Ib() {
        var a, b = Date.now(),
            c = be;
        while (c) a = b - c.then, a >= c.delay && (c.flush = c.callback(a)), c = c.next;
        var d = Jb() - b;
        d > 24 ? (isFinite(d) && (clearTimeout(de), de = setTimeout(Ib, d)), ce = 0) : (ce = 1, ee(Ib))
    }

    function Jb() {
        var a = null,
            b = be,
            c = Infinity;
        while (b) b.flush ? (delete ae[b.callback.id], b = a ? a.next = b.next : be = b.next) : (c = Math.min(c, b.then + b.delay), b = (a = b).next);
        return c
    }

    function Kb(a, b) {
        var c = a.ownerSVGElement || a;
        if (c.createSVGPoint) {
            var d = c.createSVGPoint();
            if (fe < 0 && (window.scrollX || window.scrollY)) {
                c = d3.select(document.body).append("svg").style("position", "absolute").style("top", 0).style("left", 0);
                var e = c[0][0].getScreenCTM();
                fe = !e.f && !e.e, c.remove()
            }
            return fe ? (d.x = b.pageX, d.y = b.pageY) : (d.x = b.clientX, d.y = b.clientY), d = d.matrixTransform(a.getScreenCTM().inverse()), [d.x, d.y]
        }
        var f = a.getBoundingClientRect();
        return [b.clientX - f.left - a.clientLeft, b.clientY - f.top - a.clientTop]
    }

    function Lb() {}

    function Mb(a) {
        var b = a[0],
            c = a[a.length - 1];
        return b < c ? [b, c] : [c, b]
    }

    function Nb(a) {
        return a.rangeExtent ? a.rangeExtent() : Mb(a.range())
    }

    function Ob(a, b) {
        var c = 0,
            d = a.length - 1,
            e = a[c],
            f = a[d],
            g;
        f < e && (g = c, c = d, d = g, g = e, e = f, f = g);
        if (b = b(f - e)) a[c] = b.floor(e), a[d] = b.ceil(f);
        return a
    }

    function Pb() {
        return Math
    }

    function Qb(a, b, c, d) {
        function e() {
            var e = Math.min(a.length, b.length) > 2 ? Xb : Wb,
                i = d ? U : T;
            return g = e(a, b, i, c), h = e(b, a, i, d3.interpolate), f
        }

        function f(a) {
            return g(a)
        }
        var g, h;
        return f.invert = function(a) {
            return h(a)
        }, f.domain = function(b) {
            return arguments.length ? (a = b.map(Number), e()) : a
        }, f.range = function(a) {
            return arguments.length ? (b = a, e()) : b
        }, f.rangeRound = function(a) {
            return f.range(a).interpolate(d3.interpolateRound)
        }, f.clamp = function(a) {
            return arguments.length ? (d = a, e()) : d
        }, f.interpolate = function(a) {
            return arguments.length ? (c = a, e()) : c
        }, f.ticks = function(b) {
            return Ub(a, b)
        }, f.tickFormat = function(b) {
            return Vb(a, b)
        }, f.nice = function() {
            return Ob(a, Sb), e()
        }, f.copy = function() {
            return Qb(a, b, c, d)
        }, e()
    }

    function Rb(a, b) {
        return d3.rebind(a, b, "range", "rangeRound", "interpolate", "clamp")
    }

    function Sb(a) {
        return a = Math.pow(10, Math.round(Math.log(a) / Math.LN10) - 1), a && {
            floor: function(b) {
                return Math.floor(b / a) * a
            },
            ceil: function(b) {
                return Math.ceil(b / a) * a
            }
        }
    }

    function Tb(a, b) {
        var c = Mb(a),
            d = c[1] - c[0],
            e = Math.pow(10, Math.floor(Math.log(d / b) / Math.LN10)),
            f = b / d * e;
        return f <= .15 ? e *= 10 : f <= .35 ? e *= 5 : f <= .75 && (e *= 2), c[0] = Math.ceil(c[0] / e) * e, c[1] = Math.floor(c[1] / e) * e + e * .5, c[2] = e, c
    }

    function Ub(a, b) {
        return d3.range.apply(d3, Tb(a, b))
    }

    function Vb(a, b) {
        return d3.format(",." + Math.max(0, -Math.floor(Math.log(Tb(a, b)[2]) / Math.LN10 + .01)) + "f")
    }

    function Wb(a, b, c, d) {
        var e = c(a[0], a[1]),
            f = d(b[0], b[1]);
        return function(a) {
            return f(e(a))
        }
    }

    function Xb(a, b, c, d) {
        var e = [],
            f = [],
            g = 0,
            h = Math.min(a.length, b.length) - 1;
        a[h] < a[0] && (a = a.slice().reverse(), b = b.slice().reverse());
        while (++g <= h) e.push(c(a[g - 1], a[g])), f.push(d(b[g - 1], b[g]));
        return function(b) {
            var c = d3.bisect(a, b, 1, h) - 1;
            return f[c](e[c](b))
        }
    }

    function Yb(a, b) {
        function c(c) {
            return a(b(c))
        }
        var d = b.pow;
        return c.invert = function(b) {
            return d(a.invert(b))
        }, c.domain = function(e) {
            return arguments.length ? (b = e[0] < 0 ? $b : Zb, d = b.pow, a.domain(e.map(b)), c) : a.domain().map(d)
        }, c.nice = function() {
            return a.domain(Ob(a.domain(), Pb)), c
        }, c.ticks = function() {
            var c = Mb(a.domain()),
                e = [];
            if (c.every(isFinite)) {
                var f = Math.floor(c[0]),
                    g = Math.ceil(c[1]),
                    h = d(c[0]),
                    i = d(c[1]);
                if (b === $b) {
                    e.push(d(f));
                    for (; f++ < g;)
                        for (var j = 9; j > 0; j--) e.push(d(f) * j)
                } else {
                    for (; f < g; f++)
                        for (var j = 1; j < 10; j++) e.push(d(f) * j);
                    e.push(d(f))
                }
                for (f = 0; e[f] < h; f++);
                for (g = e.length; e[g - 1] > i; g--);
                e = e.slice(f, g)
            }
            return e
        }, c.tickFormat = function(a, e) {
            arguments.length < 2 && (e = ge);
            if (!arguments.length) return e;
            var f = Math.max(.1, a / c.ticks().length),
                g = b === $b ? (h = -1e-12, Math.floor) : (h = 1e-12, Math.ceil),
                h;
            return function(a) {
                return a / d(g(b(a) + h)) <= f ? e(a) : ""
            }
        }, c.copy = function() {
            return Yb(a.copy(), b)
        }, Rb(c, a)
    }

    function Zb(a) {
        return Math.log(a < 0 ? 0 : a) / Math.LN10
    }

    function $b(a) {
        return -Math.log(a > 0 ? 0 : -a) / Math.LN10
    }

    function _b(a, b) {
        function c(b) {
            return a(d(b))
        }
        var d = ac(b),
            e = ac(1 / b);
        return c.invert = function(b) {
            return e(a.invert(b))
        }, c.domain = function(b) {
            return arguments.length ? (a.domain(b.map(d)), c) : a.domain().map(e)
        }, c.ticks = function(a) {
            return Ub(c.domain(), a)
        }, c.tickFormat = function(a) {
            return Vb(c.domain(), a)
        }, c.nice = function() {
            return c.domain(Ob(c.domain(), Sb))
        }, c.exponent = function(a) {
            if (!arguments.length) return b;
            var f = c.domain();
            return d = ac(b = a), e = ac(1 / b), c.domain(f)
        }, c.copy = function() {
            return _b(a.copy(), b)
        }, Rb(c, a)
    }

    function ac(a) {
        return function(b) {
            return b < 0 ? -Math.pow(-b, a) : Math.pow(b, a)
        }
    }

    function bc(a, b) {
        function c(b) {
            return g[((e.get(b) || e.set(b, a.push(b))) - 1) % g.length]
        }

        function d(b, c) {
            return d3.range(a.length).map(function(a) {
                return b + c * a
            })
        }
        var e, g, h;
        return c.domain = function(d) {
            if (!arguments.length) return a;
            a = [], e = new f;
            var g = -1,
                h = d.length,
                i;
            while (++g < h) e.has(i = d[g]) || e.set(i, a.push(i));
            return c[b.t].apply(c, b.a)
        }, c.range = function(a) {
            return arguments.length ? (g = a, h = 0, b = {
                t: "range",
                a: arguments
            }, c) : g
        }, c.rangePoints = function(e, f) {
            arguments.length < 2 && (f = 0);
            var i = e[0],
                j = e[1],
                k = (j - i) / (Math.max(1, a.length - 1) + f);
            return g = d(a.length < 2 ? (i + j) / 2 : i + k * f / 2, k), h = 0, b = {
                t: "rangePoints",
                a: arguments
            }, c
        }, c.rangeBands = function(e, f, i) {
            arguments.length < 2 && (f = 0), arguments.length < 3 && (i = f);
            var j = e[1] < e[0],
                k = e[j - 0],
                l = e[1 - j],
                m = (l - k) / (a.length - f + 2 * i);
            return g = d(k + m * i, m), j && g.reverse(), h = m * (1 - f), b = {
                t: "rangeBands",
                a: arguments
            }, c
        }, c.rangeRoundBands = function(e, f, i) {
            arguments.length < 2 && (f = 0), arguments.length < 3 && (i = f);
            var j = e[1] < e[0],
                k = e[j - 0],
                l = e[1 - j],
                m = Math.floor((l - k) / (a.length - f + 2 * i)),
                n = l - k - (a.length - f) * m;
            return g = d(k + Math.round(n / 2), m), j && g.reverse(), h = Math.round(m * (1 - f)), b = {
                t: "rangeRoundBands",
                a: arguments
            }, c
        }, c.rangeBand = function() {
            return h
        }, c.rangeExtent = function() {
            return Mb(b.a[0])
        }, c.copy = function() {
            return bc(a, b)
        }, c.domain(a)
    }

    function cc(a, b) {
        function c() {
            var c = 0,
                f = b.length;
            e = [];
            while (++c < f) e[c - 1] = d3.quantile(a, c / f);
            return d
        }

        function d(a) {
            return isNaN(a = +a) ? NaN : b[d3.bisect(e, a)]
        }
        var e;
        return d.domain = function(b) {
            return arguments.length ? (a = b.filter(function(a) {
                return !isNaN(a)
            }).sort(d3.ascending), c()) : a
        }, d.range = function(a) {
            return arguments.length ? (b = a, c()) : b
        }, d.quantiles = function() {
            return e
        }, d.copy = function() {
            return cc(a, b)
        }, c()
    }

    function dc(a, b, c) {
        function d(b) {
            return c[Math.max(0, Math.min(g, Math.floor(f * (b - a))))]
        }

        function e() {
            return f = c.length / (b - a), g = c.length - 1, d
        }
        var f, g;
        return d.domain = function(c) {
            return arguments.length ? (a = +c[0], b = +c[c.length - 1], e()) : [a, b]
        }, d.range = function(a) {
            return arguments.length ? (c = a, e()) : c
        }, d.copy = function() {
            return dc(a, b, c)
        }, e()
    }

    function ec(a, b) {
        function c(c) {
            return b[d3.bisect(a, c)]
        }
        return c.domain = function(b) {
            return arguments.length ? (a = b, c) : a
        }, c.range = function(a) {
            return arguments.length ? (b = a, c) : b
        }, c.copy = function() {
            return ec(a, b)
        }, c
    }

    function fc(a) {
        function b(a) {
            return +a
        }
        return b.invert = b, b.domain = b.range = function(c) {
            return arguments.length ? (a = c.map(b), b) : a
        }, b.ticks = function(b) {
            return Ub(a, b)
        }, b.tickFormat = function(b) {
            return Vb(a, b)
        }, b.copy = function() {
            return fc(a)
        }, b
    }

    function gc(a) {
        var b = a.source,
            c = a.target,
            d = ic(b, c),
            e = [b];
        while (b !== d) b = b.parent, e.push(b);
        var f = e.length;
        while (c !== d) e.splice(f, 0, c), c = c.parent;
        return e
    }

    function hc(a) {
        var b = [],
            c = a.parent;
        while (c != null) b.push(a), a = c, c = c.parent;
        return b.push(a), b
    }

    function ic(a, b) {
        if (a === b) return a;
        var c = hc(a),
            d = hc(b),
            e = c.pop(),
            f = d.pop(),
            g = null;
        while (e === f) g = e, e = c.pop(), f = d.pop();
        return g
    }

    function jc(a) {
        a.fixed |= 2
    }

    function kc(a) {
        a.fixed &= 1
    }

    function lc(a) {
        a.fixed |= 4, a.px = a.x, a.py = a.y
    }

    function mc(a) {
        a.fixed &= 3
    }

    function nc(a, b, c) {
        var d = 0,
            e = 0;
        a.charge = 0;
        if (!a.leaf) {
            var f = a.nodes,
                g = f.length,
                h = -1,
                i;
            while (++h < g) {
                i = f[h];
                if (i == null) continue;
                nc(i, b, c), a.charge += i.charge, d += i.charge * i.cx, e += i.charge * i.cy
            }
        }
        if (a.point) {
            a.leaf || (a.point.x += Math.random() - .5, a.point.y += Math.random() - .5);
            var j = b * c[a.point.index];
            a.charge += a.pointCharge = j, d += j * a.point.x, e += j * a.point.y
        }
        a.cx = d / a.charge, a.cy = e / a.charge
    }

    function oc() {
        return 20
    }

    function pc() {
        return 1
    }

    function qc(a) {
        return a.x
    }

    function rc(a) {
        return a.y
    }

    function sc(a, b, c) {
        a.y0 = b, a.y = c
    }

    function tc(a) {
        return d3.range(a.length)
    }

    function uc(a) {
        var b = -1,
            c = a[0].length,
            d = [];
        while (++b < c) d[b] = 0;
        return d
    }

    function vc(a) {
        var b = 1,
            c = 0,
            d = a[0][1],
            e, f = a.length;
        for (; b < f; ++b)(e = a[b][1]) > d && (c = b, d = e);
        return c
    }

    function wc(a) {
        return a.reduce(xc, 0)
    }

    function xc(a, b) {
        return a + b[1]
    }

    function yc(a, b) {
        return zc(a, Math.ceil(Math.log(b.length) / Math.LN2 + 1))
    }

    function zc(a, b) {
        var c = -1,
            d = +a[0],
            e = (a[1] - d) / b,
            f = [];
        while (++c <= b) f[c] = e * c + d;
        return f
    }

    function Ac(a) {
        return [d3.min(a), d3.max(a)]
    }

    function Bc(a, b) {
        return d3.rebind(a, b, "sort", "children", "value"), a.nodes = a, a.links = Fc, a
    }

    function Cc(a) {
        return a.children
    }

    function Dc(a) {
        return a.value
    }

    function Ec(a, b) {
        return b.value - a.value
    }

    function Fc(a) {
        return d3.merge(a.map(function(a) {
            return (a.children || []).map(function(b) {
                return {
                    source: a,
                    target: b
                }
            })
        }))
    }

    function Gc(a, b) {
        return a.value - b.value
    }

    function Hc(a, b) {
        var c = a._pack_next;
        a._pack_next = b, b._pack_prev = a, b._pack_next = c, c._pack_prev = b
    }

    function Ic(a, b) {
        a._pack_next = b, b._pack_prev = a
    }

    function Jc(a, b) {
        var c = b.x - a.x,
            d = b.y - a.y,
            e = a.r + b.r;
        return e * e - c * c - d * d > .001
    }

    function Kc(a) {
        function b(a) {
            d = Math.min(a.x - a.r, d), e = Math.max(a.x + a.r, e), f = Math.min(a.y - a.r, f), g = Math.max(a.y + a.r, g)
        }
        if (!(c = a.children) || !(n = c.length)) return;
        var c, d = Infinity,
            e = -Infinity,
            f = Infinity,
            g = -Infinity,
            h, i, j, k, l, m, n;
        c.forEach(Lc), h = c[0], h.x = -h.r, h.y = 0, b(h);
        if (n > 1) {
            i = c[1], i.x = i.r, i.y = 0, b(i);
            if (n > 2) {
                j = c[2], Oc(h, i, j), b(j), Hc(h, j), h._pack_prev = j, Hc(j, i), i = h._pack_next;
                for (k = 3; k < n; k++) {
                    Oc(h, i, j = c[k]);
                    var o = 0,
                        p = 1,
                        q = 1;
                    for (l = i._pack_next; l !== i; l = l._pack_next, p++)
                        if (Jc(l, j)) {
                            o = 1;
                            break
                        }
                    if (o == 1)
                        for (m = h._pack_prev; m !== l._pack_prev; m = m._pack_prev, q++)
                            if (Jc(m, j)) break;
                    o ? (p < q || p == q && i.r < h.r ? Ic(h, i = l) : Ic(h = m, i), k--) : (Hc(h, j), i = j, b(j))
                }
            }
        }
        var r = (d + e) / 2,
            s = (f + g) / 2,
            t = 0;
        for (k = 0; k < n; k++) j = c[k], j.x -= r, j.y -= s, t = Math.max(t, j.r + Math.sqrt(j.x * j.x + j.y * j.y));
        a.r = t, c.forEach(Mc)
    }

    function Lc(a) {
        a._pack_next = a._pack_prev = a
    }

    function Mc(a) {
        delete a._pack_next, delete a._pack_prev
    }

    function Nc(a, b, c, d) {
        var e = a.children;
        a.x = b += d * a.x, a.y = c += d * a.y, a.r *= d;
        if (e) {
            var f = -1,
                g = e.length;
            while (++f < g) Nc(e[f], b, c, d)
        }
    }

    function Oc(a, b, c) {
        var d = a.r + c.r,
            e = b.x - a.x,
            f = b.y - a.y;
        if (d && (e || f)) {
            var g = b.r + c.r,
                h = e * e + f * f;
            g *= g, d *= d;
            var i = .5 + (d - g) / (2 * h),
                j = Math.sqrt(Math.max(0, 2 * g * (d + h) - (d -= h) * d - g * g)) / (2 * h);
            c.x = a.x + i * e + j * f, c.y = a.y + i * f - j * e
        } else c.x = a.x + d, c.y = a.y
    }

    function Pc(a) {
        return 1 + d3.max(a, function(a) {
            return a.y
        })
    }

    function Qc(a) {
        return a.reduce(function(a, b) {
            return a + b.x
        }, 0) / a.length
    }

    function Rc(a) {
        var b = a.children;
        return b && b.length ? Rc(b[0]) : a
    }

    function Sc(a) {
        var b = a.children,
            c;
        return b && (c = b.length) ? Sc(b[c - 1]) : a
    }

    function Tc(a, b) {
        return a.parent == b.parent ? 1 : 2
    }

    function Uc(a) {
        var b = a.children;
        return b && b.length ? b[0] : a._tree.thread
    }

    function Vc(a) {
        var b = a.children,
            c;
        return b && (c = b.length) ? b[c - 1] : a._tree.thread
    }

    function Wc(a, b) {
        var c = a.children;
        if (c && (e = c.length)) {
            var d, e, f = -1;
            while (++f < e) b(d = Wc(c[f], b), a) > 0 && (a = d)
        }
        return a
    }

    function Xc(a, b) {
        return a.x - b.x
    }

    function Yc(a, b) {
        return b.x - a.x
    }

    function Zc(a, b) {
        return a.depth - b.depth
    }

    function $c(a, b) {
        function c(a, d) {
            var e = a.children;
            if (e && (i = e.length)) {
                var f, g = null,
                    h = -1,
                    i;
                while (++h < i) f = e[h], c(f, g), g = f
            }
            b(a, d)
        }
        c(a, null)
    }

    function _c(a) {
        var b = 0,
            c = 0,
            d = a.children,
            e = d.length,
            f;
        while (--e >= 0) f = d[e]._tree, f.prelim += b, f.mod += b, b += f.shift + (c += f.change)
    }

    function ad(a, b, c) {
        a = a._tree, b = b._tree;
        var d = c / (b.number - a.number);
        a.change += d, b.change -= d, b.shift += c, b.prelim += c, b.mod += c
    }

    function bd(a, b, c) {
        return a._tree.ancestor.parent == b.parent ? a._tree.ancestor : c
    }

    function cd(a) {
        return {
            x: a.x,
            y: a.y,
            dx: a.dx,
            dy: a.dy
        }
    }

    function dd(a, b) {
        var c = a.x + b[3],
            d = a.y + b[0],
            e = a.dx - b[1] - b[3],
            f = a.dy - b[0] - b[2];
        return e < 0 && (c += e / 2, e = 0), f < 0 && (d += f / 2, f = 0), {
            x: c,
            y: d,
            dx: e,
            dy: f
        }
    }
    var ed = ".",
        fd = ",",
        gd = [3, 3];
    Date.now || (Date.now = function() {
        return +new Date
    });
    try {
        document.createElement("div").style.setProperty("opacity", 0, "")
    } catch (hd) {
        var id = CSSStyleDeclaration.prototype,
            jd = id.setProperty;
        id.setProperty = function(a, b, c) {
            jd.call(this, a, b + "", c)
        }
    }
    d3 = {
        version: "3.0.2"
    };
    var kd = Math.PI,
        ld = 1e-6,
        md = kd / 180,
        nd = 180 / kd,
        od = e;
    try {
        od(document.documentElement.childNodes)[0].nodeType
    } catch (pd) {
        od = d
    }
    var qd = [].__proto__ ? function(a, b) {
        a.__proto__ = b
    } : function(a, b) {
        for (var c in b) a[c] = b[c]
    };
    d3.map = function(a) {
        var b = new f;
        for (var c in a) b.set(c, a[c]);
        return b
    }, c(f, {
        has: function(a) {
            return rd + a in this
        },
        get: function(a) {
            return this[rd + a]
        },
        set: function(a, b) {
            return this[rd + a] = b
        },
        remove: function(a) {
            return a = rd + a, a in this && delete this[a]
        },
        keys: function() {
            var a = [];
            return this.forEach(function(b) {
                a.push(b)
            }), a
        },
        values: function() {
            var a = [];
            return this.forEach(function(b, c) {
                a.push(c)
            }), a
        },
        entries: function() {
            var a = [];
            return this.forEach(function(b, c) {
                a.push({
                    key: b,
                    value: c
                })
            }), a
        },
        forEach: function(a) {
            for (var b in this) b.charCodeAt(0) === sd && a.call(this, b.substring(1), this[b])
        }
    });
    var rd = "\x00",
        sd = rd.charCodeAt(0);
    d3.functor = i, d3.rebind = function(a, b) {
        var c = 1,
            d = arguments.length,
            e;
        while (++c < d) a[e = arguments[c]] = j(a, b, b[e]);
        return a
    }, d3.ascending = function(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN
    }, d3.descending = function(a, b) {
        return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN
    }, d3.mean = function(a, b) {
        var c = a.length,
            d, e = 0,
            f = -1,
            g = 0;
        if (arguments.length === 1)
            while (++f < c) k(d = a[f]) && (e += (d - e) / ++g);
        else
            while (++f < c) k(d = b.call(a, a[f], f)) && (e += (d - e) / ++g);
        return g ? e : undefined
    }, d3.median = function(a, b) {
        return arguments.length > 1 && (a = a.map(b)), a = a.filter(k), a.length ? d3.quantile(a.sort(d3.ascending), .5) : undefined
    }, d3.min = function(a, b) {
        var c = -1,
            d = a.length,
            e, f;
        if (arguments.length === 1) {
            while (++c < d && ((e = a[c]) == null || e != e)) e = undefined;
            while (++c < d)(f = a[c]) != null && e > f && (e = f)
        } else {
            while (++c < d && ((e = b.call(a, a[c], c)) == null || e != e)) e = undefined;
            while (++c < d)(f = b.call(a, a[c], c)) != null && e > f && (e = f)
        }
        return e
    }, d3.max = function(a, b) {
        var c = -1,
            d = a.length,
            e, f;
        if (arguments.length === 1) {
            while (++c < d && ((e = a[c]) == null || e != e)) e = undefined;
            while (++c < d)(f = a[c]) != null && f > e && (e = f)
        } else {
            while (++c < d && ((e = b.call(a, a[c], c)) == null || e != e)) e = undefined;
            while (++c < d)(f = b.call(a, a[c], c)) != null && f > e && (e = f)
        }
        return e
    }, d3.extent = function(a, b) {
        var c = -1,
            d = a.length,
            e, f, g;
        if (arguments.length === 1) {
            while (++c < d && ((e = g = a[c]) == null || e != e)) e = g = undefined;
            while (++c < d)(f = a[c]) != null && (e > f && (e = f), g < f && (g = f))
        } else {
            while (++c < d && ((e = g = b.call(a, a[c], c)) == null || e != e)) e = undefined;
            while (++c < d)(f = b.call(a, a[c], c)) != null && (e > f && (e = f), g < f && (g = f))
        }
        return [e, g]
    }, d3.random = {
        normal: function(a, b) {
            var c = arguments.length;
            return c < 2 && (b = 1), c < 1 && (a = 0),
                function() {
                    var c, d, e;
                    do c = Math.random() * 2 - 1, d = Math.random() * 2 - 1, e = c * c + d * d; while (!e || e > 1);
                    return a + b * c * Math.sqrt(-2 * Math.log(e) / e)
                }
        },
        logNormal: function(a, b) {
            var c = arguments.length;
            c < 2 && (b = 1), c < 1 && (a = 0);
            var d = d3.random.normal();
            return function() {
                return Math.exp(a + b * d())
            }
        },
        irwinHall: function(a) {
            return function() {
                for (var b = 0, c = 0; c < a; c++) b += Math.random();
                return b / a
            }
        }
    }, d3.sum = function(a, b) {
        var c = 0,
            d = a.length,
            e, f = -1;
        if (arguments.length === 1)
            while (++f < d) isNaN(e = +a[f]) || (c += e);
        else
            while (++f < d) isNaN(e = +b.call(a, a[f], f)) || (c += e);
        return c
    }, d3.quantile = function(a, b) {
        var c = (a.length - 1) * b + 1,
            d = Math.floor(c),
            e = +a[d - 1],
            f = c - d;
        return f ? e + f * (a[d] - e) : e
    }, d3.shuffle = function(a) {
        var b = a.length,
            c, d;
        while (b) d = Math.random() * b-- | 0, c = a[b], a[b] = a[d], a[d] = c;
        return a
    }, d3.transpose = function(a) {
        return d3.zip.apply(d3, a)
    }, d3.zip = function() {
        if (!(e = arguments.length)) return [];
        for (var a = -1, b = d3.min(arguments, l), c = new Array(b); ++a < b;)
            for (var d = -1, e, f = c[a] = new Array(e); ++d < e;) f[d] = arguments[d][a];
        return c
    }, d3.bisector = function(a) {
        return {
            left: function(b, c, d, e) {
                arguments.length < 3 && (d = 0), arguments.length < 4 && (e = b.length);
                while (d < e) {
                    var f = d + e >>> 1;
                    a.call(b, b[f], f) < c ? d = f + 1 : e = f
                }
                return d
            },
            right: function(b, c, d, e) {
                arguments.length < 3 && (d = 0), arguments.length < 4 && (e = b.length);
                while (d < e) {
                    var f = d + e >>> 1;
                    c < a.call(b, b[f], f) ? e = f : d = f + 1
                }
                return d
            }
        }
    };
    var td = d3.bisector(function(a) {
        return a
    });
    d3.bisectLeft = td.left, d3.bisect = d3.bisectRight = td.right, d3.nest = function() {
        function a(b, e) {
            if (e >= d.length) return h ? h.call(c, b) : g ? b.sort(g) : b;
            var i = -1,
                j = b.length,
                k = d[e++],
                l, m, n = new f,
                o, p = {};
            while (++i < j)(o = n.get(l = k(m = b[i]))) ? o.push(m) : n.set(l, [m]);
            return n.forEach(function(b, c) {
                p[b] = a(c, e)
            }), p
        }

        function b(a, c) {
            if (c >= d.length) return a;
            var f = [],
                g = e[c++],
                h;
            for (h in a) f.push({
                key: h,
                values: b(a[h], c)
            });
            return g && f.sort(function(a, b) {
                return g(a.key, b.key)
            }), f
        }
        var c = {},
            d = [],
            e = [],
            g, h;
        return c.map = function(b) {
            return a(b, 0)
        }, c.entries = function(c) {
            return b(a(c, 0), 0)
        }, c.key = function(a) {
            return d.push(a), c
        }, c.sortKeys = function(a) {
            return e[d.length - 1] = a, c
        }, c.sortValues = function(a) {
            return g = a, c
        }, c.rollup = function(a) {
            return h = a, c
        }, c
    }, d3.keys = function(a) {
        var b = [];
        for (var c in a) b.push(c);
        return b
    }, d3.values = function(a) {
        var b = [];
        for (var c in a) b.push(a[c]);
        return b
    }, d3.entries = function(a) {
        var b = [];
        for (var c in a) b.push({
            key: c,
            value: a[c]
        });
        return b
    }, d3.permute = function(a, b) {
        var c = [],
            d = -1,
            e = b.length;
        while (++d < e) c[d] = a[b[d]];
        return c
    }, d3.merge = function(a) {
        return Array.prototype.concat.apply([], a)
    }, d3.range = function(a, b, c) {
        arguments.length < 3 && (c = 1, arguments.length < 2 && (b = a, a = 0));
        if ((b - a) / c === Infinity) throw new Error("infinite range");
        var d = [],
            e = n(Math.abs(c)),
            f = -1,
            g;
        a *= e, b *= e, c *= e;
        if (c < 0)
            while ((g = a + c * ++f) > b) d.push(g / e);
        else
            while ((g = a + c * ++f) < b) d.push(g / e);
        return d
    }, d3.requote = function(a) {
        return a.replace(ud, "\\$&")
    };
    var ud = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
    d3.round = function(a, b) {
        return b ? Math.round(a * (b = Math.pow(10, b))) / b : Math.round(a)
    }, d3.xhr = function(a, b, c) {
        function d() {
            var a = j.status;
            !a && j.responseText || a >= 200 && a < 300 || a === 304 ? f.load.call(e, i.call(e, j)) : f.error.call(e, j)
        }
        var e = {},
            f = d3.dispatch("progress", "load", "error"),
            h = {},
            i = g,
            j = new(window.XDomainRequest && /^(http(s)?:)?\/\//.test(a) ? XDomainRequest : XMLHttpRequest);
        return "onload" in j ? j.onload = j.onerror = d : j.onreadystatechange = function() {
            j.readyState > 3 && d()
        }, j.onprogress = function(a) {
            var b = d3.event;
            d3.event = a;
            try {
                f.progress.call(e, j)
            } finally {
                d3.event = b
            }
        }, e.header = function(a, b) {
            return a = (a + "").toLowerCase(), arguments.length < 2 ? h[a] : (b == null ? delete h[a] : h[a] = b + "", e)
        }, e.mimeType = function(a) {
            return arguments.length ? (b = a == null ? null : a + "", e) : b
        }, e.response = function(a) {
            return i = a, e
        }, ["get", "post"].forEach(function(a) {
            e[a] = function() {
                return e.send.apply(e, [a].concat(od(arguments)))
            }
        }), e.send = function(c, d, f) {
            arguments.length === 2 && typeof d == "function" && (f = d, d = null), j.open(c, a, !0), b != null && !("accept" in h) && (h.accept = b + ",*/*");
            if (j.setRequestHeader)
                for (var g in h) j.setRequestHeader(g, h[g]);
            return b != null && j.overrideMimeType && j.overrideMimeType(b), f != null && e.on("error", f).on("load", function(a) {
                f(null, a)
            }), j.send(d == null ? null : d), e
        }, e.abort = function() {
            return j.abort(), e
        }, d3.rebind(e, f, "on"), arguments.length === 2 && typeof b == "function" && (c = b, b = null), c == null ? e : e.get(o(c))
    }, d3.text = function() {
        return d3.xhr.apply(d3, arguments).response(p)
    }, d3.json = function(a, b) {
        return d3.xhr(a, "application/json", b).response(q)
    }, d3.html = function(a, b) {
        return d3.xhr(a, "text/html", b).response(r)
    }, d3.xml = function() {
        return d3.xhr.apply(d3, arguments).response(s)
    };
    var vd = {
        svg: "http://www.w3.org/2000/svg",
        xhtml: "http://www.w3.org/1999/xhtml",
        xlink: "http://www.w3.org/1999/xlink",
        xml: "http://www.w3.org/XML/1998/namespace",
        xmlns: "http://www.w3.org/2000/xmlns/"
    };
    d3.ns = {
        prefix: vd,
        qualify: function(a) {
            var b = a.indexOf(":"),
                c = a;
            return b >= 0 && (c = a.substring(0, b), a = a.substring(b + 1)), vd.hasOwnProperty(c) ? {
                space: vd[c],
                local: a
            } : a
        }
    }, d3.dispatch = function() {
        var a = new t,
            b = -1,
            c = arguments.length;
        while (++b < c) a[arguments[b]] = u(a);
        return a
    }, t.prototype.on = function(a, b) {
        var c = a.indexOf("."),
            d = "";
        return c > 0 && (d = a.substring(c + 1), a = a.substring(0, c)), arguments.length < 2 ? this[a].on(d) : this[a].on(d, b)
    }, d3.format = function(a) {
        var b = wd.exec(a),
            c = b[1] || " ",
            d = b[2] || ">",
            e = b[3] || "",
            f = b[4] || "",
            g = b[5],
            h = +b[6],
            i = b[7],
            j = b[8],
            k = b[9],
            l = 1,
            m = "",
            n = !1;
        j && (j = +j.substring(1));
        if (g || c === "0" && d === "=") g = c = "0", d = "=", i && (h -= Math.floor((h - 1) / 4));
        switch (k) {
            case "n":
                i = !0, k = "g";
                break;
            case "%":
                l = 100, m = "%", k = "f";
                break;
            case "p":
                l = 100, m = "%", k = "r";
                break;
            case "b":
            case "o":
            case "x":
            case "X":
                f && (f = "0" + k.toLowerCase());
            case "c":
            case "d":
                n = !0, j = 0;
                break;
            case "s":
                l = -1, k = "r"
        }
        f === "#" && (f = ""), k == "r" && !j && (k = "g"), k = xd.get(k) || w;
        var o = g && i;
        return function(a) {
            if (n && a % 1) return "";
            var b = a < 0 || a === 0 && 1 / a < 0 ? (a = -a, "-") : e;
            if (l < 0) {
                var p = d3.formatPrefix(a, j);
                a = p.scale(a), m = p.symbol
            } else a *= l;
            a = k(a, j), !g && i && (a = yd(a));
            var q = f.length + a.length + (o ? 0 : b.length),
                r = q < h ? new Array(q = h - q + 1).join(c) : "";
            return o && (a = yd(r + a)), ed && a.replace(".", ed), b += f, (d === "<" ? b + a + r : d === ">" ? r + b + a : d === "^" ? r.substring(0, q >>= 1) + b + a + r.substring(q) : b + (o ? a : r + a)) + m
        }
    };
    var wd = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?([0-9]+)?(,)?(\.[0-9]+)?([a-zA-Z%])?/,
        xd = d3.map({
            b: function(a) {
                return a.toString(2)
            },
            c: function(a) {
                return String.fromCharCode(a)
            },
            o: function(a) {
                return a.toString(8)
            },
            x: function(a) {
                return a.toString(16)
            },
            X: function(a) {
                return a.toString(16).toUpperCase()
            },
            g: function(a, b) {
                return a.toPrecision(b)
            },
            e: function(a, b) {
                return a.toExponential(b)
            },
            f: function(a, b) {
                return a.toFixed(b)
            },
            r: function(a, b) {
                return d3.round(a, b = v(a, b)).toFixed(Math.max(0, Math.min(20, b)))
            }
        }),
        yd = g;
    if (gd) {
        var zd = gd.length;
        yd = function(a) {
            var b = a.lastIndexOf("."),
                c = b >= 0 ? "." + a.substring(b + 1) : (b = a.length, ""),
                d = [],
                e = 0,
                f = gd[0];
            while (b > 0 && f > 0) d.push(a.substring(b -= f, b + f)), f = gd[e = (e + 1) % zd];
            return d.reverse().join(fd || "") + c
        }
    }
    var Ad = ["y", "z", "a", "f", "p", "n", "μ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"].map(x);
    d3.formatPrefix = function(a, b) {
        var c = 0;
        return a && (a < 0 && (a *= -1), b && (a = d3.round(a, v(a, b))), c = 1 + Math.floor(1e-12 + Math.log(a) / Math.LN10), c = Math.max(-24, Math.min(24, Math.floor((c <= 0 ? c + 1 : c - 1) / 3) * 3))), Ad[8 + c / 3]
    };
    var Bd = function() {
            return g
        },
        Cd = d3.map({
            linear: Bd,
            poly: E,
            quad: function() {
                return B
            },
            cubic: function() {
                return C
            },
            sin: function() {
                return F
            },
            exp: function() {
                return G
            },
            circle: function() {
                return H
            },
            elastic: I,
            back: J,
            bounce: function() {
                return K
            }
        }),
        Dd = d3.map({
            "in": g,
            out: z,
            "in-out": A,
            "out-in": function(a) {
                return A(z(a))
            }
        });
    d3.ease = function(a) {
        var b = a.indexOf("-"),
            c = b >= 0 ? a.substring(0, b) : a,
            d = b >= 0 ? a.substring(b + 1) : "in";
        return c = Cd.get(c) || Bd, d = Dd.get(d) || g, y(d(c.apply(null, Array.prototype.slice.call(arguments, 1))))
    }, d3.event = null, d3.transform = function(a) {
        var b = document.createElementNS(d3.ns.prefix.svg, "g");
        return (d3.transform = function(a) {
            b.setAttribute("transform", a);
            var c = b.transform.baseVal.consolidate();
            return new O(c ? c.matrix : Ed)
        })(a)
    }, O.prototype.toString = function() {
        return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")"
    };
    var Ed = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0
    };
    d3.interpolate = function(a, b) {
        var c = d3.interpolators.length,
            d;
        while (--c >= 0 && !(d = d3.interpolators[c](a, b)));
        return d
    }, d3.interpolateNumber = function(a, b) {
        return b -= a,
            function(c) {
                return a + b * c
            }
    }, d3.interpolateRound = function(a, b) {
        return b -= a,
            function(c) {
                return Math.round(a + b * c)
            }
    }, d3.interpolateString = function(a, b) {
        var c, d, e, f = 0,
            g = 0,
            h = [],
            i = [],
            j, k;
        Fd.lastIndex = 0;
        for (d = 0; c = Fd.exec(b); ++d) c.index && h.push(b.substring(f, g = c.index)), i.push({
            i: h.length,
            x: c[0]
        }), h.push(null), f = Fd.lastIndex;
        f < b.length && h.push(b.substring(f));
        for (d = 0, j = i.length;
            (c = Fd.exec(a)) && d < j; ++d) {
            k = i[d];
            if (k.x == c[0]) {
                if (k.i)
                    if (h[k.i + 1] == null) {
                        h[k.i - 1] += k.x, h.splice(k.i, 1);
                        for (e = d + 1; e < j; ++e) i[e].i--
                    } else {
                        h[k.i - 1] += k.x + h[k.i + 1], h.splice(k.i, 2);
                        for (e = d + 1; e < j; ++e) i[e].i -= 2
                    } else if (h[k.i + 1] == null) h[k.i] = k.x;
                else {
                    h[k.i] = k.x + h[k.i + 1], h.splice(k.i + 1, 1);
                    for (e = d + 1; e < j; ++e) i[e].i--
                }
                i.splice(d, 1), j--, d--
            } else k.x = d3.interpolateNumber(parseFloat(c[0]), parseFloat(k.x))
        }
        while (d < j) k = i.pop(), h[k.i + 1] == null ? h[k.i] = k.x : (h[k.i] = k.x + h[k.i + 1], h.splice(k.i + 1, 1)), j--;
        return h.length === 1 ? h[0] == null ? i[0].x : function() {
            return b
        } : function(a) {
            for (d = 0; d < j; ++d) h[(k = i[d]).i] = k.x(a);
            return h.join("")
        }
    }, d3.interpolateTransform = function(a, b) {
        var c = [],
            d = [],
            e, f = d3.transform(a),
            g = d3.transform(b),
            h = f.translate,
            i = g.translate,
            j = f.rotate,
            k = g.rotate,
            l = f.skew,
            m = g.skew,
            n = f.scale,
            o = g.scale;
        return h[0] != i[0] || h[1] != i[1] ? (c.push("translate(", null, ",", null, ")"), d.push({
                i: 1,
                x: d3.interpolateNumber(h[0], i[0])
            }, {
                i: 3,
                x: d3.interpolateNumber(h[1], i[1])
            })) : i[0] || i[1] ? c.push("translate(" + i + ")") : c.push(""), j != k ? (j - k > 180 ? k += 360 : k - j > 180 && (j += 360), d.push({
                i: c.push(c.pop() + "rotate(", null, ")") - 2,
                x: d3.interpolateNumber(j, k)
            })) : k && c.push(c.pop() + "rotate(" + k + ")"), l != m ? d.push({
                i: c.push(c.pop() + "skewX(", null, ")") - 2,
                x: d3.interpolateNumber(l, m)
            }) : m && c.push(c.pop() + "skewX(" + m + ")"), n[0] != o[0] || n[1] != o[1] ? (e = c.push(c.pop() + "scale(", null, ",", null, ")"), d.push({
                i: e - 4,
                x: d3.interpolateNumber(n[0], o[0])
            }, {
                i: e - 2,
                x: d3.interpolateNumber(n[1], o[1])
            })) : (o[0] != 1 || o[1] != 1) && c.push(c.pop() + "scale(" + o + ")"), e = d.length,
            function(a) {
                var b = -1,
                    f;
                while (++b < e) c[(f = d[b]).i] = f.x(a);
                return c.join("")
            }
    }, d3.interpolateRgb = function(a, b) {
        a = d3.rgb(a), b = d3.rgb(b);
        var c = a.r,
            d = a.g,
            e = a.b,
            f = b.r - c,
            g = b.g - d,
            h = b.b - e;
        return function(a) {
            return "#" + Y(Math.round(c + f * a)) + Y(Math.round(d + g * a)) + Y(Math.round(e + h * a))
        }
    }, d3.interpolateHsl = function(a, b) {
        a = d3.hsl(a), b = d3.hsl(b);
        var c = a.h,
            d = a.s,
            e = a.l,
            f = b.h - c,
            g = b.s - d,
            h = b.l - e;
        return f > 180 ? f -= 360 : f < -180 && (f += 360),
            function(a) {
                return eb(c + f * a, d + g * a, e + h * a) + ""
            }
    }, d3.interpolateLab = function(a, b) {
        a = d3.lab(a), b = d3.lab(b);
        var c = a.l,
            d = a.a,
            e = a.b,
            f = b.l - c,
            g = b.a - d,
            h = b.b - e;
        return function(a) {
            return kb(c + f * a, d + g * a, e + h * a) + ""
        }
    }, d3.interpolateHcl = function(a, b) {
        a = d3.hcl(a), b = d3.hcl(b);
        var c = a.h,
            d = a.c,
            e = a.l,
            f = b.h - c,
            g = b.c - d,
            h = b.l - e;
        return f > 180 ? f -= 360 : f < -180 && (f += 360),
            function(a) {
                return hb(c + f * a, d + g * a, e + h * a) + ""
            }
    }, d3.interpolateArray = function(a, b) {
        var c = [],
            d = [],
            e = a.length,
            f = b.length,
            g = Math.min(a.length, b.length),
            h;
        for (h = 0; h < g; ++h) c.push(d3.interpolate(a[h], b[h]));
        for (; h < e; ++h) d[h] = a[h];
        for (; h < f; ++h) d[h] = b[h];
        return function(a) {
            for (h = 0; h < g; ++h) d[h] = c[h](a);
            return d
        }
    }, d3.interpolateObject = function(a, b) {
        var c = {},
            d = {},
            e;
        for (e in a) e in b ? c[e] = S(e)(a[e], b[e]) : d[e] = a[e];
        for (e in b) e in a || (d[e] = b[e]);
        return function(a) {
            for (e in c) d[e] = c[e](a);
            return d
        }
    };
    var Fd = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
    d3.interpolators = [d3.interpolateObject, function(a, b) {
        return b instanceof Array && d3.interpolateArray(a, b)
    }, function(a, b) {
        return (typeof a == "string" || typeof b == "string") && d3.interpolateString(a + "", b + "")
    }, function(a, b) {
        return (typeof b == "string" ? Hd.has(b) || /^(#|rgb\(|hsl\()/.test(b) : b instanceof V) && d3.interpolateRgb(a, b)
    }, function(a, b) {
        return !isNaN(a = +a) && !isNaN(b = +b) && d3.interpolateNumber(a, b)
    }], V.prototype.toString = function() {
        return this.rgb() + ""
    }, d3.rgb = function(a, b, c) {
        return arguments.length === 1 ? a instanceof X ? W(a.r, a.g, a.b) : Z("" + a, W, eb) : W(~~a, ~~b, ~~c)
    };
    var Gd = X.prototype = new V;
    Gd.brighter = function(a) {
        a = Math.pow(.7, arguments.length ? a : 1);
        var b = this.r,
            c = this.g,
            d = this.b,
            e = 30;
        return !b && !c && !d ? W(e, e, e) : (b && b < e && (b = e), c && c < e && (c = e), d && d < e && (d = e), W(Math.min(255, Math.floor(b / a)), Math.min(255, Math.floor(c / a)), Math.min(255, Math.floor(d / a))))
    }, Gd.darker = function(a) {
        return a = Math.pow(.7, arguments.length ? a : 1), W(Math.floor(a * this.r), Math.floor(a * this.g), Math.floor(a * this.b))
    }, Gd.hsl = function() {
        return $(this.r, this.g, this.b)
    }, Gd.toString = function() {
        return "#" + Y(this.r) + Y(this.g) + Y(this.b)
    };
    var Hd = d3.map({
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
    });
    Hd.forEach(function(a, b) {
        Hd.set(a, Z(b, W, eb))
    }), d3.hsl = function(a, b, c) {
        return arguments.length === 1 ? a instanceof db ? cb(a.h, a.s, a.l) : Z("" + a, $, cb) : cb(+a, +b, +c)
    };
    var Id = db.prototype = new V;
    Id.brighter = function(a) {
        return a = Math.pow(.7, arguments.length ? a : 1), cb(this.h, this.s, this.l / a)
    }, Id.darker = function(a) {
        return a = Math.pow(.7, arguments.length ? a : 1), cb(this.h, this.s, a * this.l)
    }, Id.rgb = function() {
        return eb(this.h, this.s, this.l)
    }, d3.hcl = function(a, b, c) {
        return arguments.length === 1 ? a instanceof gb ? fb(a.h, a.c, a.l) : a instanceof jb ? lb(a.l, a.a, a.b) : lb((a = _((a = d3.rgb(a)).r, a.g, a.b)).l, a.a, a.b) : fb(+a, +b, +c)
    };
    var Jd = gb.prototype = new V;
    Jd.brighter = function(a) {
        return fb(this.h, this.c, Math.min(100, this.l + Kd * (arguments.length ? a : 1)))
    }, Jd.darker = function(a) {
        return fb(this.h, this.c, Math.max(0, this.l - Kd * (arguments.length ? a : 1)))
    }, Jd.rgb = function() {
        return hb(this.h, this.c, this.l).rgb()
    }, d3.lab = function(a, b, c) {
        return arguments.length === 1 ? a instanceof jb ? ib(a.l, a.a, a.b) : a instanceof gb ? hb(a.l, a.c, a.h) : _((a = d3.rgb(a)).r, a.g, a.b) : ib(+a, +b, +c)
    };
    var Kd = 18,
        Ld = .95047,
        Md = 1,
        Nd = 1.08883,
        Od = jb.prototype = new V;
    Od.brighter = function(a) {
        return ib(Math.min(100, this.l + Kd * (arguments.length ? a : 1)), this.a, this.b)
    }, Od.darker = function(a) {
        return ib(Math.max(0, this.l - Kd * (arguments.length ? a : 1)), this.a, this.b)
    }, Od.rgb = function() {
        return kb(this.l, this.a, this.b)
    };
    var Pd = function(a, b) {
            return b.querySelector(a)
        },
        Qd = function(a, b) {
            return b.querySelectorAll(a)
        },
        Rd = document.documentElement,
        Sd = Rd.matchesSelector || Rd.webkitMatchesSelector || Rd.mozMatchesSelector || Rd.msMatchesSelector || Rd.oMatchesSelector,
        Td = function(a, b) {
            return Sd.call(a, b)
        };
    typeof Sizzle == "function" && (Pd = function(a, b) {
        return Sizzle(a, b)[0] || null
    }, Qd = function(a, b) {
        return Sizzle.uniqueSort(Sizzle(a, b))
    }, Td = Sizzle.matchesSelector);
    var Ud = [];
    d3.selection = function() {
        return Vd
    }, d3.selection.prototype = Ud, Ud.select = function(a) {
        var b = [],
            c, d, e, f;
        typeof a != "function" && (a = qb(a));
        for (var g = -1, h = this.length; ++g < h;) {
            b.push(c = []), c.parentNode = (e = this[g]).parentNode;
            for (var i = -1, j = e.length; ++i < j;)(f = e[i]) ? (c.push(d = a.call(f, f.__data__, i)), d && "__data__" in f && (d.__data__ = f.__data__)) : c.push(null)
        }
        return pb(b)
    }, Ud.selectAll = function(a) {
        var b = [],
            c, d;
        typeof a != "function" && (a = rb(a));
        for (var e = -1, f = this.length; ++e < f;)
            for (var g = this[e], h = -1, i = g.length; ++h < i;)
                if (d = g[h]) b.push(c = od(a.call(d, d.__data__, h))), c.parentNode = d;
        return pb(b)
    }, Ud.attr = function(a, b) {
        if (arguments.length < 2) {
            if (typeof a == "string") {
                var c = this.node();
                return a = d3.ns.qualify(a), a.local ? c.getAttributeNS(a.space, a.local) : c.getAttribute(a)
            }
            for (b in a) this.each(sb(b, a[b]));
            return this
        }
        return this.each(sb(a, b))
    }, Ud.classed = function(a, b) {
        if (arguments.length < 2) {
            if (typeof a == "string") {
                var c = this.node(),
                    d = (a = a.trim().split(/^|\s+/g)).length,
                    e = -1;
                if (b = c.classList) {
                    while (++e < d)
                        if (!b.contains(a[e])) return !1
                } else {
                    b = c.className, b.baseVal != null && (b = b.baseVal);
                    while (++e < d)
                        if (!tb(a[e]).test(b)) return !1
                }
                return !0
            }
            for (b in a) this.each(ub(b, a[b]));
            return this
        }
        return this.each(ub(a, b))
    }, Ud.style = function(a, b, c) {
        var d = arguments.length;
        if (d < 3) {
            if (typeof a != "string") {
                d < 2 && (b = "");
                for (c in a) this.each(wb(c, a[c], b));
                return this
            }
            if (d < 2) return getComputedStyle(this.node(), null).getPropertyValue(a);
            c = ""
        }
        return this.each(wb(a, b, c))
    }, Ud.property = function(a, b) {
        if (arguments.length < 2) {
            if (typeof a == "string") return this.node()[a];
            for (b in a) this.each(xb(b, a[b]));
            return this
        }
        return this.each(xb(a, b))
    }, Ud.text = function(a) {
        return arguments.length ? this.each(typeof a == "function" ? function() {
            var b = a.apply(this, arguments);
            this.textContent = b == null ? "" : b
        } : a == null ? function() {
            this.textContent = ""
        } : function() {
            this.textContent = a
        }) : this.node().textContent
    }, Ud.html = function(a) {
        return arguments.length ? this.each(typeof a == "function" ? function() {
            var b = a.apply(this, arguments);
            this.innerHTML = b == null ? "" : b
        } : a == null ? function() {
            this.innerHTML = ""
        } : function() {
            this.innerHTML = a
        }) : this.node().innerHTML
    }, Ud.append = function(a) {
        function b() {
            return this.appendChild(document.createElementNS(this.namespaceURI, a))
        }

        function c() {
            return this.appendChild(document.createElementNS(a.space, a.local))
        }
        return a = d3.ns.qualify(a), this.select(a.local ? c : b)
    }, Ud.insert = function(a, b) {
        function c() {
            return this.insertBefore(document.createElementNS(this.namespaceURI, a), Pd(b, this))
        }

        function d() {
            return this.insertBefore(document.createElementNS(a.space, a.local), Pd(b, this))
        }
        return a = d3.ns.qualify(a), this.select(a.local ? d : c)
    }, Ud.remove = function() {
        return this.each(function() {
            var a = this.parentNode;
            a && a.removeChild(this)
        })
    }, Ud.data = function(a, b) {
        function c(a, c) {
            var d, e = a.length,
                g = c.length,
                h = Math.min(e, g),
                l = Math.max(e, g),
                m = [],
                n = [],
                o = [],
                p, q;
            if (b) {
                var r = new f,
                    s = [],
                    t, u = c.length;
                for (d = -1; ++d < e;) t = b.call(p = a[d], p.__data__, d), r.has(t) ? o[u++] = p : r.set(t, p), s.push(t);
                for (d = -1; ++d < g;) t = b.call(c, q = c[d], d), r.has(t) ? (m[d] = p = r.get(t), p.__data__ = q, n[d] = o[d] = null) : (n[d] = yb(q), m[d] = o[d] = null), r.remove(t);
                for (d = -1; ++d < e;) r.has(s[d]) && (o[d] = a[d])
            } else {
                for (d = -1; ++d < h;) p = a[d], q = c[d], p ? (p.__data__ = q, m[d] = p, n[d] = o[d] = null) : (n[d] = yb(q), m[d] = o[d] = null);
                for (; d < g; ++d) n[d] = yb(c[d]), m[d] = o[d] = null;
                for (; d < l; ++d) o[d] = a[d], n[d] = m[d] = null
            }
            n.update = m, n.parentNode = m.parentNode = o.parentNode = a.parentNode, i.push(n), j.push(m), k.push(o)
        }
        var d = -1,
            e = this.length,
            g, h;
        if (!arguments.length) {
            a = new Array(e = (g = this[0]).length);
            while (++d < e)
                if (h = g[d]) a[d] = h.__data__;
            return a
        }
        var i = Db([]),
            j = pb([]),
            k = pb([]);
        if (typeof a == "function")
            while (++d < e) c(g = this[d], a.call(g, g.parentNode.__data__, d));
        else
            while (++d < e) c(g = this[d], a);
        return j.enter = function() {
            return i
        }, j.exit = function() {
            return k
        }, j
    }, Ud.datum = function(a) {
        return arguments.length ? this.property("__data__", a) : this.property("__data__")
    }, Ud.filter = function(a) {
        var b = [],
            c, d, e;
        typeof a != "function" && (a = zb(a));
        for (var f = 0, g = this.length; f < g; f++) {
            b.push(c = []), c.parentNode = (d = this[f]).parentNode;
            for (var h = 0, i = d.length; h < i; h++)(e = d[h]) && a.call(e, e.__data__, h) && c.push(e)
        }
        return pb(b)
    }, Ud.order = function() {
        for (var a = -1, b = this.length; ++a < b;)
            for (var c = this[a], d = c.length - 1, e = c[d], f; --d >= 0;)
                if (f = c[d]) e && e !== f.nextSibling && e.parentNode.insertBefore(f, e), e = f;
        return this
    }, Ud.sort = function(a) {
        a = Ab.apply(this, arguments);
        for (var b = -1, c = this.length; ++b < c;) this[b].sort(a);
        return this.order()
    }, Ud.on = function(a, b, c) {
        var d = arguments.length;
        if (d < 3) {
            if (typeof a != "string") {
                d < 2 && (b = !1);
                for (c in a) this.each(Bb(c, a[c], b));
                return this
            }
            if (d < 2) return (d = this.node()["__on" + a]) && d._;
            c = !1
        }
        return this.each(Bb(a, b, c))
    }, Ud.each = function(a) {
        return Cb(this, function(b, c, d) {
            a.call(b, b.__data__, c, d)
        })
    }, Ud.call = function(a) {
        var b = od(arguments);
        return a.apply(b[0] = this, b), this
    }, Ud.empty = function() {
        return !this.node()
    }, Ud.node = function() {
        for (var a = 0, b = this.length; a < b; a++)
            for (var c = this[a], d = 0, e = c.length; d < e; d++) {
                var f = c[d];
                if (f) return f
            }
        return null
    }, Ud.transition = function() {
        var a = Zd || ++Yd,
            b = [],
            c, d, e = Object.create($d);
        e.time = Date.now();
        for (var f = -1, g = this.length; ++f < g;) {
            b.push(c = []);
            for (var h = this[f], i = -1, j = h.length; ++i < j;)(d = h[i]) && Fb(d, i, a, e), c.push(d)
        }
        return Eb(b, a)
    };
    var Vd = pb([
        [document]
    ]);
    Vd[0].parentNode = Rd, d3.select = function(a) {
        return typeof a == "string" ? Vd.select(a) : pb([
            [a]
        ])
    }, d3.selectAll = function(a) {
        return typeof a == "string" ? Vd.selectAll(a) : pb([od(a)])
    };
    var Wd = [];
    d3.selection.enter = Db, d3.selection.enter.prototype = Wd, Wd.append = Ud.append, Wd.insert = Ud.insert, Wd.empty = Ud.empty, Wd.node = Ud.node, Wd.select = function(a) {
        var b = [],
            c, d, e, f, g;
        for (var h = -1, i = this.length; ++h < i;) {
            e = (f = this[h]).update, b.push(c = []), c.parentNode = f.parentNode;
            for (var j = -1, k = f.length; ++j < k;)(g = f[j]) ? (c.push(e[j] = d = a.call(f.parentNode, g.__data__, j)), d.__data__ = g.__data__) : c.push(null)
        }
        return pb(b)
    };
    var Xd = [],
        Yd = 0,
        Zd, $d = {
            ease: D,
            delay: 0,
            duration: 250
        };
    Xd.call = Ud.call, Xd.empty = Ud.empty, Xd.node = Ud.node, d3.transition = function(a) {
        return arguments.length ? Zd ? a.transition() : a : Vd.transition()
    }, d3.transition.prototype = Xd, Xd.select = function(a) {
        var b = this.id,
            c = [],
            d, e, f;
        typeof a != "function" && (a = qb(a));
        for (var g = -1, h = this.length; ++g < h;) {
            c.push(d = []);
            for (var i = this[g], j = -1, k = i.length; ++j < k;)(f = i[j]) && (e = a.call(f, f.__data__, j)) ? ("__data__" in f && (e.__data__ = f.__data__), Fb(e, j, b, f.__transition__[b]), d.push(e)) : d.push(null)
        }
        return Eb(c, b)
    }, Xd.selectAll = function(a) {
        var b = this.id,
            c = [],
            d, e, f, g, h;
        typeof a != "function" && (a = rb(a));
        for (var i = -1, j = this.length; ++i < j;)
            for (var k = this[i], l = -1, m = k.length; ++l < m;)
                if (f = k[l]) {
                    h = f.__transition__[b], e = a.call(f, f.__data__, l), c.push(d = []);
                    for (var n = -1, o = e.length; ++n < o;) Fb(g = e[n], n, b, h), d.push(g)
                }
        return Eb(c, b)
    }, Xd.filter = function(a) {
        var b = [],
            c, d, e;
        typeof a != "function" && (a = zb(a));
        for (var f = 0, g = this.length; f < g; f++) {
            b.push(c = []);
            for (var d = this[f], h = 0, i = d.length; h < i; h++)(e = d[h]) && a.call(e, e.__data__, h) && c.push(e)
        }
        return Eb(b, this.id, this.time).ease(this.ease())
    }, Xd.attr = function(a, b) {
        function c() {
            this.removeAttribute(f)
        }

        function d() {
            this.removeAttributeNS(f.space, f.local)
        }
        if (arguments.length < 2) {
            for (b in a) this.attr(b, a[b]);
            return this
        }
        var e = S(a),
            f = d3.ns.qualify(a);
        return Hb(this, "attr." + a, b, function(a) {
            function b() {
                var b = this.getAttribute(f),
                    c;
                return b !== a && (c = e(b, a), function(a) {
                    this.setAttribute(f, c(a))
                })
            }

            function g() {
                var b = this.getAttributeNS(f.space, f.local),
                    c;
                return b !== a && (c = e(b, a), function(a) {
                    this.setAttributeNS(f.space, f.local, c(a))
                })
            }
            return a == null ? f.local ? d : c : (a += "", f.local ? g : b)
        })
    }, Xd.attrTween = function(a, b) {
        function c(a, c) {
            var d = b.call(this, a, c, this.getAttribute(e));
            return d && function(a) {
                this.setAttribute(e, d(a))
            }
        }

        function d(a, c) {
            var d = b.call(this, a, c, this.getAttributeNS(e.space, e.local));
            return d && function(a) {
                this.setAttributeNS(e.space, e.local, d(a))
            }
        }
        var e = d3.ns.qualify(a);
        return this.tween("attr." + a, e.local ? d : c)
    }, Xd.style = function(a, b, c) {
        function d() {
            this.style.removeProperty(a)
        }
        var e = arguments.length;
        if (e < 3) {
            if (typeof a != "string") {
                e < 2 && (b = "");
                for (c in a) this.style(c, a[c], b);
                return this
            }
            c = ""
        }
        var f = S(a);
        return Hb(this, "style." + a, b, function(b) {
            function e() {
                var d = getComputedStyle(this, null).getPropertyValue(a),
                    e;
                return d !== b && (e = f(d, b), function(b) {
                    this.style.setProperty(a, e(b), c)
                })
            }
            return b == null ? d : (b += "", e)
        })
    }, Xd.styleTween = function(a, b, c) {
        return arguments.length < 3 && (c = ""), this.tween("style." + a, function(d, e) {
            var f = b.call(this, d, e, getComputedStyle(this, null).getPropertyValue(a));
            return f && function(b) {
                this.style.setProperty(a, f(b), c)
            }
        })
    }, Xd.text = function(a) {
        return Hb(this, "text", a, Gb)
    }, Xd.remove = function() {
        return this.each("end.transition", function() {
            var a;
            !this.__transition__ && (a = this.parentNode) && a.removeChild(this)
        })
    }, Xd.ease = function(a) {
        var b = this.id;
        return arguments.length < 1 ? this.node().__transition__[b].ease : (typeof a != "function" && (a = d3.ease.apply(d3, arguments)), Cb(this, function(c) {
            c.__transition__[b].ease = a
        }))
    }, Xd.delay = function(a) {
        var b = this.id;
        return Cb(this, typeof a == "function" ? function(c, d, e) {
            c.__transition__[b].delay = a.call(c, c.__data__, d, e) | 0
        } : (a |= 0, function(c) {
            c.__transition__[b].delay = a
        }))
    }, Xd.duration = function(a) {
        var b = this.id;
        return Cb(this, typeof a == "function" ? function(c, d, e) {
            c.__transition__[b].duration = Math.max(1, a.call(c, c.__data__, d, e) | 0)
        } : (a = Math.max(1, a | 0), function(c) {
            c.__transition__[b].duration = a
        }))
    }, Xd.each = function(a, b) {
        var c = this.id;
        if (arguments.length < 2) {
            var d = $d,
                e = Zd;
            Zd = c, Cb(this, function(b, d, e) {
                $d = b.__transition__[c], a.call(b, b.__data__, d, e)
            }), $d = d, Zd = e
        } else Cb(this, function(d) {
            d.__transition__[c].event.on(a, b)
        });
        return this
    }, Xd.transition = function() {
        var a = this.id,
            b = ++Yd,
            c = [],
            d, e, f, g;
        for (var h = 0, i = this.length; h < i; h++) {
            c.push(d = []);
            for (var e = this[h], j = 0, k = e.length; j < k; j++) {
                if (f = e[j]) g = Object.create(f.__transition__[a]), g.delay += g.duration, Fb(f, j, b, g);
                d.push(f)
            }
        }
        return Eb(c, b)
    }, Xd.tween = function(a, b) {
        var c = this.id;
        return arguments.length < 2 ? this.node().__transition__[c].tween.get(a) : Cb(this, b == null ? function(b) {
            b.__transition__[c].tween.remove(a)
        } : function(d) {
            d.__transition__[c].tween.set(a, b)
        })
    };
    var _d = 0,
        ae = {},
        be = null,
        ce, de;
    d3.timer = function(a, b, c) {
        if (arguments.length < 3) {
            if (arguments.length < 2) b = 0;
            else if (!isFinite(b)) return;
            c = Date.now()
        }
        var d = ae[a.id];
        d && d.callback === a ? (d.then = c, d.delay = b) : ae[a.id = ++_d] = be = {
            callback: a,
            then: c,
            delay: b,
            next: be
        }, ce || (de = clearTimeout(de), ce = 1, ee(Ib))
    }, d3.timer.flush = function() {
        var a, b = Date.now(),
            c = be;
        while (c) a = b - c.then, c.delay || (c.flush = c.callback(a)), c = c.next;
        Jb()
    };
    var ee = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        setTimeout(a, 17)
    };
    d3.mouse = function(a) {
        return Kb(a, M())
    };
    var fe = /WebKit/.test(navigator.userAgent) ? -1 : 0;
    d3.touches = function(a, b) {
        return arguments.length < 2 && (b = M().touches), b ? od(b).map(function(b) {
            var c = Kb(a, b);
            return c.identifier = b.identifier, c
        }) : []
    }, d3.scale = {}, d3.scale.linear = function() {
        return Qb([0, 1], [0, 1], d3.interpolate, !1)
    }, d3.scale.log = function() {
        return Yb(d3.scale.linear(), Zb)
    };
    var ge = d3.format(".0e");
    Zb.pow = function(a) {
        return Math.pow(10, a)
    }, $b.pow = function(a) {
        return -Math.pow(10, -a)
    }, d3.scale.pow = function() {
        return _b(d3.scale.linear(), 1)
    }, d3.scale.sqrt = function() {
        return d3.scale.pow().exponent(.5)
    }, d3.scale.ordinal = function() {
        return bc([], {
            t: "range",
            a: [
                []
            ]
        })
    }, d3.scale.category10 = function() {
        return d3.scale.ordinal().range(he)
    }, d3.scale.category20 = function() {
        return d3.scale.ordinal().range(ie)
    }, d3.scale.category20b = function() {
        return d3.scale.ordinal().range(je)
    }, d3.scale.category20c = function() {
        return d3.scale.ordinal().range(ke)
    };
    var he = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
        ie = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
        je = ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"],
        ke = ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"];
    d3.scale.quantile = function() {
        return cc([], [])
    }, d3.scale.quantize = function() {
        return dc(0, 1, [0, 1])
    }, d3.scale.threshold = function() {
        return ec([.5], [0, 1])
    }, d3.scale.identity = function() {
        return fc([0, 1])
    }, d3.layout = {}, d3.layout.bundle = function() {
        return function(a) {
            var b = [],
                c = -1,
                d = a.length;
            while (++c < d) b.push(gc(a[c]));
            return b
        }
    }, d3.layout.chord = function() {
        function a() {
            var a = {},
                c = [],
                l = d3.range(g),
                m = [],
                n, o, p, q, r;
            d = [], e = [], n = 0, q = -1;
            while (++q < g) {
                o = 0, r = -1;
                while (++r < g) o += f[q][r];
                c.push(o), m.push(d3.range(g)), n += o
            }
            i && l.sort(function(a, b) {
                return i(c[a], c[b])
            }), j && m.forEach(function(a, b) {
                a.sort(function(a, c) {
                    return j(f[b][a], f[b][c])
                })
            }), n = (2 * kd - h * g) / n, o = 0, q = -1;
            while (++q < g) {
                p = o, r = -1;
                while (++r < g) {
                    var s = l[q],
                        t = m[s][r],
                        u = f[s][t],
                        v = o,
                        w = o += u * n;
                    a[s + "-" + t] = {
                        index: s,
                        subindex: t,
                        startAngle: v,
                        endAngle: w,
                        value: u
                    }
                }
                e[s] = {
                    index: s,
                    startAngle: p,
                    endAngle: o,
                    value: (o - p) / n
                }, o += h
            }
            q = -1;
            while (++q < g) {
                r = q - 1;
                while (++r < g) {
                    var x = a[q + "-" + r],
                        y = a[r + "-" + q];
                    (x.value || y.value) && d.push(x.value < y.value ? {
                        source: y,
                        target: x
                    } : {
                        source: x,
                        target: y
                    })
                }
            }
            k && b()
        }

        function b() {
            d.sort(function(a, b) {
                return k((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2)
            })
        }
        var c = {},
            d, e, f, g, h = 0,
            i, j, k;
        return c.matrix = function(a) {
            return arguments.length ? (g = (f = a) && f.length, d = e = null, c) : f
        }, c.padding = function(a) {
            return arguments.length ? (h = a, d = e = null, c) : h
        }, c.sortGroups = function(a) {
            return arguments.length ? (i = a, d = e = null, c) : i
        }, c.sortSubgroups = function(a) {
            return arguments.length ? (j = a, d = null, c) : j
        }, c.sortChords = function(a) {
            return arguments.length ? (k = a, d && b(), c) : k
        }, c.chords = function() {
            return d || a(), d
        }, c.groups = function() {
            return e || a(), e
        }, c
    }, d3.layout.force = function() {
        function a(a) {
            return function(b, c, d, e) {
                if (b.point !== a) {
                    var f = b.cx - a.x,
                        g = b.cy - a.y,
                        h = 1 / Math.sqrt(f * f + g * g);
                    if ((e - c) * h < o) {
                        var i = b.charge * h * h;
                        return a.px -= f * i, a.py -= g * i, !0
                    }
                    if (b.point && isFinite(h)) {
                        var i = b.pointCharge * h * h;
                        a.px -= f * i, a.py -= g * i
                    }
                }
                return !b.charge
            }
        }

        function b(a) {
            a.px = d3.event.x, a.py = d3.event.y, c.resume()
        }
        var c = {},
            d = d3.dispatch("start", "tick", "end"),
            e = [1, 1],
            f, h, j = .9,
            k = oc,
            l = pc,
            m = -30,
            n = .1,
            o = .8,
            p = [],
            q = [],
            r, s, t;
        return c.tick = function() {
            if ((h *= .99) < .005) return d.end({
                type: "end",
                alpha: h = 0
            }), !0;
            var b = p.length,
                c = q.length,
                f, g, i, k, l, o, u, v, w;
            for (g = 0; g < c; ++g) {
                i = q[g], k = i.source, l = i.target, v = l.x - k.x, w = l.y - k.y;
                if (o = v * v + w * w) o = h * s[g] * ((o = Math.sqrt(o)) - r[g]) / o, v *= o, w *= o, l.x -= v * (u = k.weight / (l.weight + k.weight)), l.y -= w * u, k.x += v * (u = 1 - u), k.y += w * u
            }
            if (u = h * n) {
                v = e[0] / 2, w = e[1] / 2, g = -1;
                if (u)
                    while (++g < b) i = p[g], i.x += (v - i.x) * u, i.y += (w - i.y) * u
            }
            if (m) {
                nc(f = d3.geom.quadtree(p), h, t), g = -1;
                while (++g < b)(i = p[g]).fixed || f.visit(a(i))
            }
            g = -1;
            while (++g < b) i = p[g], i.fixed ? (i.x = i.px, i.y = i.py) : (i.x -= (i.px - (i.px = i.x)) * j, i.y -= (i.py - (i.py = i.y)) * j);
            d.tick({
                type: "tick",
                alpha: h
            })
        }, c.nodes = function(a) {
            return arguments.length ? (p = a, c) : p
        }, c.links = function(a) {
            return arguments.length ? (q = a, c) : q
        }, c.size = function(a) {
            return arguments.length ? (e = a, c) : e
        }, c.linkDistance = function(a) {
            return arguments.length ? (k = i(a), c) : k
        }, c.distance = c.linkDistance, c.linkStrength = function(a) {
            return arguments.length ? (l = i(a), c) : l
        }, c.friction = function(a) {
            return arguments.length ? (j = a, c) : j
        }, c.charge = function(a) {
            return arguments.length ? (m = typeof a == "function" ? a : +a, c) : m
        }, c.gravity = function(a) {
            return arguments.length ? (n = a, c) : n
        }, c.theta = function(a) {
            return arguments.length ? (o = a, c) : o
        }, c.alpha = function(a) {
            return arguments.length ? (h ? a > 0 ? h = a : h = 0 : a > 0 && (d.start({
                type: "start",
                alpha: h = a
            }), d3.timer(c.tick)), c) : h
        }, c.start = function() {
            function a(a, c) {
                var e = b(d),
                    f = -1,
                    g = e.length,
                    h;
                while (++f < g)
                    if (!isNaN(h = e[f][a])) return h;
                return Math.random() * c
            }

            function b() {
                if (!n) {
                    n = [];
                    for (f = 0; f < g; ++f) n[f] = [];
                    for (f = 0; f < h; ++f) {
                        var a = q[f];
                        n[a.source.index].push(a.target), n[a.target.index].push(a.source)
                    }
                }
                return n[d]
            }
            var d, f, g = p.length,
                h = q.length,
                i = e[0],
                j = e[1],
                n, o;
            for (d = 0; d < g; ++d)(o = p[d]).index = d, o.weight = 0;
            r = [], s = [];
            for (d = 0; d < h; ++d) o = q[d], typeof o.source == "number" && (o.source = p[o.source]), typeof o.target == "number" && (o.target = p[o.target]), r[d] = k.call(this, o, d), s[d] = l.call(this, o, d), ++o.source.weight, ++o.target.weight;
            for (d = 0; d < g; ++d) o = p[d], isNaN(o.x) && (o.x = a("x", i)), isNaN(o.y) && (o.y = a("y", j)), isNaN(o.px) && (o.px = o.x), isNaN(o.py) && (o.py = o.y);
            t = [];
            if (typeof m == "function")
                for (d = 0; d < g; ++d) t[d] = +m.call(this, p[d], d);
            else
                for (d = 0; d < g; ++d) t[d] = m;
            return c.resume()
        }, c.resume = function() {
            return c.alpha(.1)
        }, c.stop = function() {
            return c.alpha(0)
        }, c.drag = function() {
            f || (f = d3.behavior.drag().origin(g).on("dragstart", jc).on("drag", b).on("dragend", kc)), this.on("mouseover.force", lc).on("mouseout.force", mc).call(f)
        }, d3.rebind(c, d, "on")
    }, d3.layout.partition = function() {
        function a(b, c, d, e) {
            var f = b.children;
            b.x = c, b.y = b.depth * e, b.dx = d, b.dy = e;
            if (f && (h = f.length)) {
                var g = -1,
                    h, i, j;
                d = b.value ? d / b.value : 0;
                while (++g < h) a(i = f[g], c, j = i.value * d, e), c += j
            }
        }

        function b(a) {
            var c = a.children,
                d = 0;
            if (c && (f = c.length)) {
                var e = -1,
                    f;
                while (++e < f) d = Math.max(d, b(c[e]))
            }
            return 1 + d
        }

        function c(c, f) {
            var g = d.call(this, c, f);
            return a(g[0], 0, e[0], e[1] / b(g[0])), g
        }
        var d = d3.layout.hierarchy(),
            e = [1, 1];
        return c.size = function(a) {
            return arguments.length ? (e = a, c) : e
        }, Bc(c, d)
    }, d3.layout.pie = function() {
        function a(f) {
            var g = f.map(function(c, d) {
                    return +b.call(a, c, d)
                }),
                h = +(typeof d == "function" ? d.apply(this, arguments) : d),
                i = ((typeof e == "function" ? e.apply(this, arguments) : e) - d) / d3.sum(g),
                j = d3.range(f.length);
            c != null && j.sort(c === le ? function(a, b) {
                return g[b] - g[a]
            } : function(a, b) {
                return c(f[a], f[b])
            });
            var k = [];
            return j.forEach(function(a) {
                var b;
                k[a] = {
                    data: f[a],
                    value: b = g[a],
                    startAngle: h,
                    endAngle: h += b * i
                }
            }), k
        }
        var b = Number,
            c = le,
            d = 0,
            e = 2 * kd;
        return a.value = function(c) {
            return arguments.length ? (b = c, a) : b
        }, a.sort = function(b) {
            return arguments.length ? (c = b, a) : c
        }, a.startAngle = function(b) {
            return arguments.length ? (d = b, a) : d
        }, a.endAngle = function(b) {
            return arguments.length ? (e = b, a) : e
        }, a
    };
    var le = {};
    d3.layout.stack = function() {
        function a(g, i) {
            var j = g.map(function(c, d) {
                    return b.call(a, c, d)
                }),
                k = j.map(function(b) {
                    return b.map(function(b, c) {
                        return [f.call(a, b, c), h.call(a, b, c)]
                    })
                }),
                l = c.call(a, k, i);
            j = d3.permute(j, l), k = d3.permute(k, l);
            var m = d.call(a, k, i),
                n = j.length,
                o = j[0].length,
                p, q, r;
            for (q = 0; q < o; ++q) {
                e.call(a, j[0][q], r = m[q], k[0][q][1]);
                for (p = 1; p < n; ++p) e.call(a, j[p][q], r += k[p - 1][q][1], k[p][q][1])
            }
            return g
        }
        var b = g,
            c = tc,
            d = uc,
            e = sc,
            f = qc,
            h = rc;
        return a.values = function(c) {
            return arguments.length ? (b = c, a) : b
        }, a.order = function(b) {
            return arguments.length ? (c = typeof b == "function" ? b : me.get(b) || tc, a) : c
        }, a.offset = function(b) {
            return arguments.length ? (d = typeof b == "function" ? b : ne.get(b) || uc, a) : d
        }, a.x = function(b) {
            return arguments.length ? (f = b, a) : f
        }, a.y = function(b) {
            return arguments.length ? (h = b, a) : h
        }, a.out = function(b) {
            return arguments.length ? (e = b, a) : e
        }, a
    };
    var me = d3.map({
            "inside-out": function(a) {
                var b = a.length,
                    c, d, e = a.map(vc),
                    f = a.map(wc),
                    g = d3.range(b).sort(function(a, b) {
                        return e[a] - e[b]
                    }),
                    h = 0,
                    i = 0,
                    j = [],
                    k = [];
                for (c = 0; c < b; ++c) d = g[c], h < i ? (h += f[d], j.push(d)) : (i += f[d], k.push(d));
                return k.reverse().concat(j)
            },
            reverse: function(a) {
                return d3.range(a.length).reverse()
            },
            "default": tc
        }),
        ne = d3.map({
            silhouette: function(a) {
                var b = a.length,
                    c = a[0].length,
                    d = [],
                    e = 0,
                    f, g, h, i = [];
                for (g = 0; g < c; ++g) {
                    for (f = 0, h = 0; f < b; f++) h += a[f][g][1];
                    h > e && (e = h), d.push(h)
                }
                for (g = 0; g < c; ++g) i[g] = (e - d[g]) / 2;
                return i
            },
            wiggle: function(a) {
                var b = a.length,
                    c = a[0],
                    d = c.length,
                    e, f, g, h, i, j, k, l, m, n = [];
                n[0] = l = m = 0;
                for (f = 1; f < d; ++f) {
                    for (e = 0, h = 0; e < b; ++e) h += a[e][f][1];
                    for (e = 0, i = 0, k = c[f][0] - c[f - 1][0]; e < b; ++e) {
                        for (g = 0, j = (a[e][f][1] - a[e][f - 1][1]) / (2 * k); g < e; ++g) j += (a[g][f][1] - a[g][f - 1][1]) / k;
                        i += j * a[e][f][1]
                    }
                    n[f] = l -= h ? i / h * k : 0, l < m && (m = l)
                }
                for (f = 0; f < d; ++f) n[f] -= m;
                return n
            },
            expand: function(a) {
                var b = a.length,
                    c = a[0].length,
                    d = 1 / b,
                    e, f, g, h = [];
                for (f = 0; f < c; ++f) {
                    for (e = 0, g = 0; e < b; e++) g += a[e][f][1];
                    if (g)
                        for (e = 0; e < b; e++) a[e][f][1] /= g;
                    else
                        for (e = 0; e < b; e++) a[e][f][1] = d
                }
                for (f = 0; f < c; ++f) h[f] = 0;
                return h
            },
            zero: uc
        });
    d3.layout.histogram = function() {
        function a(a, f) {
            var g = [],
                h = a.map(c, this),
                i = d.call(this, h, f),
                j = e.call(this, i, h, f),
                k, f = -1,
                l = h.length,
                m = j.length - 1,
                n = b ? 1 : 1 / l,
                o;
            while (++f < m) k = g[f] = [], k.dx = j[f + 1] - (k.x = j[f]), k.y = 0;
            if (m > 0) {
                f = -1;
                while (++f < l) o = h[f], o >= i[0] && o <= i[1] && (k = g[d3.bisect(j, o, 1, m) - 1], k.y += n, k.push(a[f]))
            }
            return g
        }
        var b = !0,
            c = Number,
            d = Ac,
            e = yc;
        return a.value = function(b) {
            return arguments.length ? (c = b, a) : c
        }, a.range = function(b) {
            return arguments.length ? (d = i(b), a) : d
        }, a.bins = function(b) {
            return arguments.length ? (e = typeof b == "number" ? function(a) {
                return zc(a, b)
            } : i(b), a) : e
        }, a.frequency = function(c) {
            return arguments.length ? (b = !!c, a) : b
        }, a
    }, d3.layout.hierarchy = function() {
        function a(b, g, h) {
            var i = e.call(c, b, g);
            b.depth = g, h.push(b);
            if (i && (k = i.length)) {
                var j = -1,
                    k, l = b.children = [],
                    m = 0,
                    n = g + 1,
                    o;
                while (++j < k) o = a(i[j], n, h), o.parent = b, l.push(o), m += o.value;
                d && l.sort(d), f && (b.value = m)
            } else f && (b.value = +f.call(c, b, g) || 0);
            return b
        }

        function b(a, d) {
            var e = a.children,
                g = 0;
            if (e && (i = e.length)) {
                var h = -1,
                    i, j = d + 1;
                while (++h < i) g += b(e[h], j)
            } else f && (g = +f.call(c, a, d) || 0);
            return f && (a.value = g), g
        }

        function c(b) {
            var c = [];
            return a(b, 0, c), c
        }
        var d = Ec,
            e = Cc,
            f = Dc;
        return c.sort = function(a) {
            return arguments.length ? (d = a, c) : d
        }, c.children = function(a) {
            return arguments.length ? (e = a, c) : e
        }, c.value = function(a) {
            return arguments.length ? (f = a, c) : f
        }, c.revalue = function(a) {
            return b(a, 0), a
        }, c
    }, d3.layout.pack = function() {
        function a(a, e) {
            var f = b.call(this, a, e),
                g = f[0];
            g.x = 0, g.y = 0, $c(g, function(a) {
                a.r = Math.sqrt(a.value)
            }), $c(g, Kc);
            var h = d[0],
                i = d[1],
                j = Math.max(2 * g.r / h, 2 * g.r / i);
            if (c > 0) {
                var k = c * j / 2;
                $c(g, function(a) {
                    a.r += k
                }), $c(g, Kc), $c(g, function(a) {
                    a.r -= k
                }), j = Math.max(2 * g.r / h, 2 * g.r / i)
            }
            return Nc(g, h / 2, i / 2, 1 / j), f
        }
        var b = d3.layout.hierarchy().sort(Gc),
            c = 0,
            d = [1, 1];
        return a.size = function(b) {
            return arguments.length ? (d = b, a) : d
        }, a.padding = function(b) {
            return arguments.length ? (c = +b, a) : c
        }, Bc(a, b)
    }, d3.layout.cluster = function() {
        function a(a, e) {
            var f = b.call(this, a, e),
                g = f[0],
                h, i = 0;
            $c(g, function(a) {
                var b = a.children;
                b && b.length ? (a.x = Qc(b), a.y = Pc(b)) : (a.x = h ? i += c(a, h) : 0, a.y = 0, h = a)
            });
            var j = Rc(g),
                k = Sc(g),
                l = j.x - c(j, k) / 2,
                m = k.x + c(k, j) / 2;
            return $c(g, function(a) {
                a.x = (a.x - l) / (m - l) * d[0], a.y = (1 - (g.y ? a.y / g.y : 1)) * d[1]
            }), f
        }
        var b = d3.layout.hierarchy().sort(null).value(null),
            c = Tc,
            d = [1, 1];
        return a.separation = function(b) {
            return arguments.length ? (c = b, a) : c
        }, a.size = function(b) {
            return arguments.length ? (d = b, a) : d
        }, Bc(a, b)
    }, d3.layout.tree = function() {
        function a(a, e) {
            function f(a, b) {
                var d = a.children,
                    e = a._tree;
                if (d && (g = d.length)) {
                    var g, i = d[0],
                        j, k = i,
                        l, m = -1;
                    while (++m < g) l = d[m], f(l, j), k = h(l, j, k), j = l;
                    _c(a);
                    var n = .5 * (i._tree.prelim + l._tree.prelim);
                    b ? (e.prelim = b._tree.prelim + c(a, b), e.mod = e.prelim - n) : e.prelim = n
                } else b && (e.prelim = b._tree.prelim + c(a, b))
            }

            function g(a, b) {
                a.x = a._tree.prelim + b;
                var c = a.children;
                if (c && (e = c.length)) {
                    var d = -1,
                        e;
                    b += a._tree.mod;
                    while (++d < e) g(c[d], b)
                }
            }

            function h(a, b, d) {
                if (b) {
                    var e = a,
                        f = a,
                        g = b,
                        h = a.parent.children[0],
                        i = e._tree.mod,
                        j = f._tree.mod,
                        k = g._tree.mod,
                        l = h._tree.mod,
                        m;
                    while (g = Vc(g), e = Uc(e), g && e) h = Uc(h), f = Vc(f), f._tree.ancestor = a, m = g._tree.prelim + k - e._tree.prelim - i + c(g, e), m > 0 && (ad(bd(g, a, d), a, m), i += m, j += m), k += g._tree.mod, i += e._tree.mod, l += h._tree.mod, j += f._tree.mod;
                    g && !Vc(f) && (f._tree.thread = g, f._tree.mod += k - j), e && !Uc(h) && (h._tree.thread = e, h._tree.mod += i - l, d = a)
                }
                return d
            }
            var i = b.call(this, a, e),
                j = i[0];
            $c(j, function(a, b) {
                a._tree = {
                    ancestor: a,
                    prelim: 0,
                    mod: 0,
                    change: 0,
                    shift: 0,
                    number: b ? b._tree.number + 1 : 0
                }
            }), f(j), g(j, -j._tree.prelim);
            var k = Wc(j, Yc),
                l = Wc(j, Xc),
                m = Wc(j, Zc),
                n = k.x - c(k, l) / 2,
                o = l.x + c(l, k) / 2,
                p = m.depth || 1;
            return $c(j, function(a) {
                a.x = (a.x - n) / (o - n) * d[0], a.y = a.depth / p * d[1], delete a._tree
            }), i
        }
        var b = d3.layout.hierarchy().sort(null).value(null),
            c = Tc,
            d = [1, 1];
        return a.separation = function(b) {
            return arguments.length ? (c = b, a) : c
        }, a.size = function(b) {
            return arguments.length ? (d = b, a) : d
        }, Bc(a, b)
    }, d3.layout.treemap = function() {
        function a(a, b) {
            var c = -1,
                d = a.length,
                e, f;
            while (++c < d) f = (e = a[c]).value * (b < 0 ? 0 : b), e.area = isNaN(f) || f <= 0 ? 0 : f
        }

        function b(c) {
            var f = c.children;
            if (f && f.length) {
                var g = k(c),
                    h = [],
                    i = f.slice(),
                    j, l = Infinity,
                    m, o = n === "slice" ? g.dx : n === "dice" ? g.dy : n === "slice-dice" ? c.depth & 1 ? g.dy : g.dx : Math.min(g.dx, g.dy),
                    p;
                a(i, g.dx * g.dy / c.value), h.area = 0;
                while ((p = i.length) > 0) h.push(j = i[p - 1]), h.area += j.area, n !== "squarify" || (m = d(h, o)) <= l ? (i.pop(), l = m) : (h.area -= h.pop().area, e(h, o, g, !1), o = Math.min(g.dx, g.dy), h.length = h.area = 0, l = Infinity);
                h.length && (e(h, o, g, !0), h.length = h.area = 0), f.forEach(b)
            }
        }

        function c(b) {
            var d = b.children;
            if (d && d.length) {
                var f = k(b),
                    g = d.slice(),
                    h, i = [];
                a(g, f.dx * f.dy / b.value), i.area = 0;
                while (h = g.pop()) i.push(h), i.area += h.area, h.z != null && (e(i, h.z ? f.dx : f.dy, f, !g.length), i.length = i.area = 0);
                d.forEach(c)
            }
        }

        function d(a, b) {
            var c = a.area,
                d, e = 0,
                f = Infinity,
                g = -1,
                h = a.length;
            while (++g < h) {
                if (!(d = a[g].area)) continue;
                d < f && (f = d), d > e && (e = d)
            }
            return c *= c, b *= b, c ? Math.max(b * e * o / c, c / (b * f * o)) : Infinity
        }

        function e(a, b, c, d) {
            var e = -1,
                f = a.length,
                g = c.x,
                i = c.y,
                j = b ? h(a.area / b) : 0,
                k;
            if (b == c.dx) {
                if (d || j > c.dy) j = c.dy;
                while (++e < f) k = a[e], k.x = g, k.y = i, k.dy = j, g += k.dx = Math.min(c.x + c.dx - g, j ? h(k.area / j) : 0);
                k.z = !0, k.dx += c.x + c.dx - g, c.y += j, c.dy -= j
            } else {
                if (d || j > c.dx) j = c.dx;
                while (++e < f) k = a[e], k.x = g, k.y = i, k.dx = j, i += k.dy = Math.min(c.y + c.dy - i, j ? h(k.area / j) : 0);
                k.z = !1, k.dy += c.y + c.dy - i, c.x += j, c.dx -= j
            }
        }

        function f(d) {
            var e = m || g(d),
                f = e[0];
            return f.x = 0, f.y = 0, f.dx = i[0], f.dy = i[1], m && g.revalue(f), a([f], f.dx * f.dy / f.value), (m ? c : b)(f), l && (m = e), e
        }
        var g = d3.layout.hierarchy(),
            h = Math.round,
            i = [1, 1],
            j = null,
            k = cd,
            l = !1,
            m, n = "squarify",
            o = .5 * (1 + Math.sqrt(5));
        return f.size = function(a) {
            return arguments.length ? (i = a, f) : i
        }, f.padding = function(a) {
            function b(b) {
                var c = a.call(f, b, b.depth);
                return c == null ? cd(b) : dd(b, typeof c == "number" ? [c, c, c, c] : c)
            }

            function c(b) {
                return dd(b, a)
            }
            if (!arguments.length) return j;
            var d;
            return k = (j = a) == null ? cd : (d = typeof a) === "function" ? b : d === "number" ? (a = [a, a, a, a], c) : c, f
        }, f.round = function(a) {
            return arguments.length ? (h = a ? Math.round : Number, f) : h != Number
        }, f.sticky = function(a) {
            return arguments.length ? (l = a, m = null, f) : l
        }, f.ratio = function(a) {
            return arguments.length ? (o = a, f) : o
        }, f.mode = function(a) {
            return arguments.length ? (n = a + "", f) : n
        }, Bc(f, g)
    }
})();
(function($, window, document, undefined) {
    function Coords(obj) {
        if (obj[0] && $.isPlainObject(obj[0])) {
            this.data = obj[0]
        } else {
            this.el = obj
        }
        this.isCoords = true;
        this.coords = {};
        this.init();
        return this
    }
    var fn = Coords.prototype;
    fn.init = function() {
        this.set();
        this.original_coords = this.get()
    };
    fn.set = function(update, not_update_offsets) {
        var el = this.el;
        if (el && !update) {
            this.data = el.offset();
            this.data.width = el.width();
            this.data.height = el.height()
        }
        if (el && update && !not_update_offsets) {
            var offset = el.offset();
            this.data.top = offset.top;
            this.data.left = offset.left
        }
        var d = this.data;
        this.coords.x1 = d.left;
        this.coords.y1 = d.top;
        this.coords.x2 = d.left + d.width;
        this.coords.y2 = d.top + d.height;
        this.coords.cx = d.left + d.width / 2;
        this.coords.cy = d.top + d.height / 2;
        this.coords.width = d.width;
        this.coords.height = d.height;
        this.coords.el = el || false;
        return this
    };
    fn.update = function(data) {
        if (!data && !this.el) {
            return this
        }
        if (data) {
            var new_data = $.extend({}, this.data, data);
            this.data = new_data;
            return this.set(true, true)
        }
        this.set(true);
        return this
    };
    fn.get = function() {
        return this.coords
    };
    $.fn.coords = function() {
        if (this.data("coords")) {
            return this.data("coords")
        }
        var ins = new Coords(this, arguments[0]);
        this.data("coords", ins);
        return ins
    }
})(jQuery, window, document);
(function($, window, document, undefined) {
    var defaults = {
        colliders_context: document.body
    };

    function Collision(el, colliders, options) {
        this.options = $.extend(defaults, options);
        this.$element = el;
        this.last_colliders = [];
        this.last_colliders_coords = [];
        if (typeof colliders === "string" || colliders instanceof jQuery) {
            this.$colliders = $(colliders, this.options.colliders_context).not(this.$element)
        } else {
            this.colliders = $(colliders)
        }
        this.init()
    }
    var fn = Collision.prototype;
    fn.init = function() {
        this.find_collisions()
    };
    fn.overlaps = function(a, b) {
        var x = false;
        var y = false;
        if (b.x1 >= a.x1 && b.x1 <= a.x2 || b.x2 >= a.x1 && b.x2 <= a.x2 || a.x1 >= b.x1 && a.x2 <= b.x2) {
            x = true
        }
        if (b.y1 >= a.y1 && b.y1 <= a.y2 || b.y2 >= a.y1 && b.y2 <= a.y2 || a.y1 >= b.y1 && a.y2 <= b.y2) {
            y = true
        }
        return x && y
    };
    fn.detect_overlapping_region = function(a, b) {
        var regionX = "";
        var regionY = "";
        if (a.y1 > b.cy && a.y1 < b.y2) {
            regionX = "N"
        }
        if (a.y2 > b.y1 && a.y2 < b.cy) {
            regionX = "S"
        }
        if (a.x1 > b.cx && a.x1 < b.x2) {
            regionY = "W"
        }
        if (a.x2 > b.x1 && a.x2 < b.cx) {
            regionY = "E"
        }
        return regionX + regionY || "C"
    };
    fn.calculate_overlapped_area_coords = function(a, b) {
        var x1 = Math.max(a.x1, b.x1);
        var y1 = Math.max(a.y1, b.y1);
        var x2 = Math.min(a.x2, b.x2);
        var y2 = Math.min(a.y2, b.y2);
        return $({
            left: x1,
            top: y1,
            width: x2 - x1,
            height: y2 - y1
        }).coords().get()
    };
    fn.calculate_overlapped_area = function(coords) {
        return coords.width * coords.height
    };
    fn.manage_colliders_start_stop = function(new_colliders_coords, start_callback, stop_callback) {
        var last = this.last_colliders_coords;
        for (var i = 0, il = last.length; i < il; i++) {
            if ($.inArray(last[i], new_colliders_coords) === -1) {
                start_callback.call(this, last[i])
            }
        }
        for (var j = 0, jl = new_colliders_coords.length; j < jl; j++) {
            if ($.inArray(new_colliders_coords[j], last) === -1) {
                stop_callback.call(this, new_colliders_coords[j])
            }
        }
    };
    fn.find_collisions = function(player_data_coords) {
        var self = this;
        var colliders_coords = [];
        var colliders_data = [];
        var $colliders = this.colliders || this.$colliders;
        var count = $colliders.length;
        var player_coords = self.$element.coords().update(player_data_coords || false).get();
        while (count--) {
            var $collider = self.$colliders ? $($colliders[count]) : $colliders[count];
            var $collider_coords_ins = $collider.isCoords ? $collider : $collider.coords();
            var collider_coords = $collider_coords_ins.get();
            var overlaps = self.overlaps(player_coords, collider_coords);
            if (!overlaps) {
                continue
            }
            var region = self.detect_overlapping_region(player_coords, collider_coords);
            if (region === "C") {
                var area_coords = self.calculate_overlapped_area_coords(player_coords, collider_coords);
                var area = self.calculate_overlapped_area(area_coords);
                var collider_data = {
                    area: area,
                    area_coords: area_coords,
                    region: region,
                    coords: collider_coords,
                    player_coords: player_coords,
                    el: $collider
                };
                if (self.options.on_overlap) {
                    self.options.on_overlap.call(this, collider_data)
                }
                colliders_coords.push($collider_coords_ins);
                colliders_data.push(collider_data)
            }
        }
        if (self.options.on_overlap_stop || self.options.on_overlap_start) {
            this.manage_colliders_start_stop(colliders_coords, self.options.on_overlap_stop, self.options.on_overlap_start)
        }
        this.last_colliders_coords = colliders_coords;
        return colliders_data
    };
    fn.get_closest_colliders = function(player_data_coords) {
        var colliders = this.find_collisions(player_data_coords);
        colliders.sort(function(a, b) {
            if (a.region === "C" && b.region === "C") {
                if (a.coords.y1 < b.coords.y1 || a.coords.x1 < b.coords.x1) {
                    return -1
                } else {
                    return 1
                }
            }
            if (a.area < b.area) {
                return 1
            }
            return 1
        });
        return colliders
    };
    $.fn.collision = function(collider, options) {
        return new Collision(this, collider, options)
    }
})(jQuery, window, document);
(function(window, undefined) {
    window.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args)
            };
            if (immediate && !timeout) func.apply(context, args);
            clearTimeout(timeout);
            timeout = setTimeout(later, wait)
        }
    };
    window.throttle = function(func, wait) {
        var context, args, timeout, throttling, more, result;
        var whenDone = debounce(function() {
            more = throttling = false
        }, wait);
        return function() {
            context = this;
            args = arguments;
            var later = function() {
                timeout = null;
                if (more) func.apply(context, args);
                whenDone()
            };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) {
                more = true
            } else {
                result = func.apply(context, args)
            }
            whenDone();
            throttling = true;
            return result
        }
    }
})(window);
(function($, window, document, undefined) {
    var defaults = {
        items: ".gs_w",
        distance: 1,
        limit: true,
        offset_left: 0,
        autoscroll: true,
        ignore_dragging: ["INPUT", "TEXTAREA", "SELECT", "BUTTON"],
        handle: null
    };
    var $window = $(window);
    var isTouch = !!("ontouchstart" in window);
    var pointer_events = {
        start: isTouch ? "touchstart" : "mousedown.draggable",
        move: isTouch ? "touchmove" : "mousemove.draggable",
        end: isTouch ? "touchend" : "mouseup.draggable"
    };

    function Draggable(el, options) {
        this.options = $.extend({}, defaults, options);
        this.$body = $(document.body);
        this.$container = $(el);
        this.$dragitems = $(this.options.items, this.$container);
        this.is_dragging = false;
        this.player_min_left = 0 + this.options.offset_left;
        this.init()
    }
    var fn = Draggable.prototype;
    fn.init = function() {
        this.calculate_positions();
        this.$container.css("position", "relative");
        this.disabled = false;
        this.events();
        $(window).bind("resize", throttle($.proxy(this.calculate_positions, this), 200))
    };
    fn.events = function() {
        this.$container.on("selectstart", $.proxy(this.on_select_start, this));
        this.$container.on(pointer_events.start, this.options.items, $.proxy(this.drag_handler, this));
        this.$body.on(pointer_events.end, $.proxy(function(e) {
            this.is_dragging = false;
            if (this.disabled) {
                return
            }
            this.$body.off(pointer_events.move);
            if (this.drag_start) {
                this.on_dragstop(e)
            }
        }, this))
    };
    fn.get_actual_pos = function($el) {
        var pos = $el.position();
        return pos
    };
    fn.get_mouse_pos = function(e) {
        if (isTouch) {
            var oe = e.originalEvent;
            e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0]
        }
        return {
            left: e.clientX,
            top: e.clientY
        }
    };
    fn.get_offset = function(e) {
        e.preventDefault();
        var mouse_actual_pos = this.get_mouse_pos(e);
        var diff_x = Math.round(mouse_actual_pos.left - this.mouse_init_pos.left);
        var diff_y = Math.round(mouse_actual_pos.top - this.mouse_init_pos.top);
        var left = Math.round(this.el_init_offset.left + diff_x - this.baseX);
        var top = Math.round(this.el_init_offset.top + diff_y - this.baseY + this.scrollOffset);
        if (this.options.limit) {
            if (left > this.player_max_left) {
                left = this.player_max_left
            } else if (left < this.player_min_left) {
                left = this.player_min_left
            }
        }
        return {
            left: left,
            top: top,
            mouse_left: mouse_actual_pos.left,
            mouse_top: mouse_actual_pos.top
        }
    };
    fn.manage_scroll = function(offset) {
        var nextScrollTop;
        var scrollTop = $window.scrollTop();
        var min_window_y = scrollTop;
        var max_window_y = min_window_y + this.window_height;
        var mouse_down_zone = max_window_y - 50;
        var mouse_up_zone = min_window_y + 50;
        var abs_mouse_left = offset.mouse_left;
        var abs_mouse_top = min_window_y + offset.mouse_top;
        var max_player_y = this.doc_height - this.window_height + this.player_height;
        if (abs_mouse_top >= mouse_down_zone) {
            nextScrollTop = scrollTop + 30;
            if (nextScrollTop < max_player_y) {
                $window.scrollTop(nextScrollTop);
                this.scrollOffset = this.scrollOffset + 30
            }
        }
        if (abs_mouse_top <= mouse_up_zone) {
            nextScrollTop = scrollTop - 30;
            if (nextScrollTop > 0) {
                $window.scrollTop(nextScrollTop);
                this.scrollOffset = this.scrollOffset - 30
            }
        }
    };
    fn.calculate_positions = function(e) {
        this.window_height = $window.height()
    };
    fn.drag_handler = function(e) {
        var node = e.target.nodeName;
        if (this.disabled || e.which !== 1 && !isTouch) {
            return
        }
        if (this.ignore_drag(e)) {
            return
        }
        var self = this;
        var first = true;
        this.$player = $(e.currentTarget);
        this.el_init_pos = this.get_actual_pos(this.$player);
        this.mouse_init_pos = this.get_mouse_pos(e);
        this.offsetY = this.mouse_init_pos.top - this.el_init_pos.top;
        this.$body.on(pointer_events.move, function(mme) {
            var mouse_actual_pos = self.get_mouse_pos(mme);
            var diff_x = Math.abs(mouse_actual_pos.left - self.mouse_init_pos.left);
            var diff_y = Math.abs(mouse_actual_pos.top - self.mouse_init_pos.top);
            if (!(diff_x > self.options.distance || diff_y > self.options.distance)) {
                return false
            }
            if (first) {
                first = false;
                self.on_dragstart.call(self, mme);
                return false
            }
            if (self.is_dragging === true) {
                self.on_dragmove.call(self, mme)
            }
            return false
        });
        return false
    };
    fn.on_dragstart = function(e) {
        e.preventDefault();
        this.drag_start = true;
        this.is_dragging = true;
        var offset = this.$container.offset();
        this.baseX = Math.round(offset.left);
        this.baseY = Math.round(offset.top);
        this.doc_height = $(document).height();
        if (this.options.helper === "clone") {
            this.$helper = this.$player.clone().appendTo(this.$container).addClass("helper");
            this.helper = true
        } else {
            this.helper = false
        }
        this.scrollOffset = 0;
        this.el_init_offset = this.$player.offset();
        this.player_width = this.$player.width();
        this.player_height = this.$player.height();
        this.player_max_left = this.$container.width() - this.player_width + this.options.offset_left;
        if (this.options.start) {
            this.options.start.call(this.$player, e, {
                helper: this.helper ? this.$helper : this.$player
            })
        }
        return false
    };
    fn.on_dragmove = function(e) {
        var offset = this.get_offset(e);
        this.options.autoscroll && this.manage_scroll(offset);
        (this.helper ? this.$helper : this.$player).css({
            position: "absolute",
            left: offset.left,
            top: offset.top
        });
        var ui = {
            position: {
                left: offset.left,
                top: offset.top
            }
        };
        if (this.options.drag) {
            this.options.drag.call(this.$player, e, ui)
        }
        return false
    };
    fn.on_dragstop = function(e) {
        var offset = this.get_offset(e);
        this.drag_start = false;
        var ui = {
            position: {
                left: offset.left,
                top: offset.top
            }
        };
        if (this.options.stop) {
            this.options.stop.call(this.$player, e, ui)
        }
        if (this.helper) {
            this.$helper.remove()
        }
        return false
    };
    fn.on_select_start = function(e) {
        if (this.disabled) {
            return
        }
        if (this.ignore_drag(e)) {
            return
        }
        return false
    };
    fn.enable = function() {
        this.disabled = false
    };
    fn.disable = function() {
        this.disabled = true
    };
    fn.destroy = function() {
        this.disable();
        $.removeData(this.$container, "drag")
    };
    fn.ignore_drag = function(event) {
        if (this.options.handle) {
            return !$(event.target).is(this.options.handle)
        }
        return $.inArray(event.target.nodeName, this.options.ignore_dragging) >= 0
    };
    $.fn.drag = function(options) {
        return this.each(function() {
            if (!$.data(this, "drag")) {
                $.data(this, "drag", new Draggable(this, options))
            }
        })
    }
})(jQuery, window, document);
(function($, window, document, undefined) {
    var defaults = {
        namespace: "",
        widget_selector: "li",
        widget_margins: [10, 10],
        widget_base_dimensions: [400, 225],
        extra_rows: 0,
        extra_cols: 0,
        min_cols: 1,
        min_rows: 15,
        max_size_x: 6,
        autogenerate_stylesheet: true,
        avoid_overlapped_widgets: true,
        serialize_params: function($w, wgd) {
            return {
                col: wgd.col,
                row: wgd.row,
                size_x: wgd.size_x,
                size_y: wgd.size_y
            }
        },
        collision: {},
        draggable: {
            distance: 4
        }
    };

    function Gridster(el, options) {
        this.options = $.extend(true, defaults, options);
        this.$el = $(el);
        this.$wrapper = this.$el.parent();
        this.$widgets = this.$el.children(this.options.widget_selector).addClass("gs_w");
        this.widgets = [];
        this.$changed = $([]);
        this.wrapper_width = this.$wrapper.width();
        this.min_widget_width = this.options.widget_margins[0] * 2 + this.options.widget_base_dimensions[0];
        this.min_widget_height = this.options.widget_margins[1] * 2 + this.options.widget_base_dimensions[1];
        this.init()
    }
    Gridster.generated_stylesheets = [];
    var fn = Gridster.prototype;
    fn.init = function() {
        this.generate_grid_and_stylesheet();
        this.get_widgets_from_DOM();
        this.set_dom_grid_height();
        this.$wrapper.addClass("ready");
        this.draggable();
        $(window).bind("resize", throttle($.proxy(this.recalculate_faux_grid, this), 200))
    };
    fn.disable = function() {
        this.$wrapper.find(".player-revert").removeClass("player-revert");
        this.drag_api.disable();
        return this
    };
    fn.enable = function() {
        this.drag_api.enable();
        return this
    };
    fn.add_widget = function(html, size_x, size_y, col, row) {
        var pos;
        size_x || (size_x = 1);
        size_y || (size_y = 1);
        if (!col & !row) {
            pos = this.next_position(size_x, size_y)
        } else {
            pos = {
                col: col,
                row: row
            };
            this.empty_cells(col, row, size_x, size_y)
        }
        var $w = $(html).attr({
            "data-col": pos.col,
            "data-row": pos.row,
            "data-sizex": size_x,
            "data-sizey": size_y
        }).addClass("gs_w").appendTo(this.$el).hide();
        this.$widgets = this.$widgets.add($w);
        this.register_widget($w);
        this.add_faux_rows(pos.size_y);
        this.set_dom_grid_height();
        return $w.fadeIn()
    };
    fn.resize_widget = function($widget, size_x, size_y) {
        var wgd = $widget.coords().grid;
        size_x || (size_x = wgd.size_x);
        size_y || (size_y = wgd.size_y);
        if (size_x > this.cols) {
            size_x = this.cols
        }
        var old_cells_occupied = this.get_cells_occupied(wgd);
        var old_size_x = wgd.size_x;
        var old_size_y = wgd.size_y;
        var old_col = wgd.col;
        var new_col = old_col;
        var wider = size_x > old_size_x;
        var taller = size_y > old_size_y;
        if (old_col + size_x - 1 > this.cols) {
            var diff = old_col + (size_x - 1) - this.cols;
            var c = old_col - diff;
            new_col = Math.max(1, c)
        }
        var new_grid_data = {
            col: new_col,
            row: wgd.row,
            size_x: size_x,
            size_y: size_y
        };
        var new_cells_occupied = this.get_cells_occupied(new_grid_data);
        var empty_cols = [];
        $.each(old_cells_occupied.cols, function(i, col) {
            if ($.inArray(col, new_cells_occupied.cols) === -1) {
                empty_cols.push(col)
            }
        });
        var occupied_cols = [];
        $.each(new_cells_occupied.cols, function(i, col) {
            if ($.inArray(col, old_cells_occupied.cols) === -1) {
                occupied_cols.push(col)
            }
        });
        var empty_rows = [];
        $.each(old_cells_occupied.rows, function(i, row) {
            if ($.inArray(row, new_cells_occupied.rows) === -1) {
                empty_rows.push(row)
            }
        });
        var occupied_rows = [];
        $.each(new_cells_occupied.rows, function(i, row) {
            if ($.inArray(row, old_cells_occupied.rows) === -1) {
                occupied_rows.push(row)
            }
        });
        this.remove_from_gridmap(wgd);
        if (occupied_cols.length) {
            var cols_to_empty = [new_col, wgd.row, size_x, Math.min(old_size_y, size_y), $widget];
            this.empty_cells.apply(this, cols_to_empty)
        }
        if (occupied_rows.length) {
            var rows_to_empty = [new_col, wgd.row, size_x, size_y, $widget];
            this.empty_cells.apply(this, rows_to_empty)
        }
        wgd.col = new_col;
        wgd.size_x = size_x;
        wgd.size_y = size_y;
        this.add_to_gridmap(new_grid_data, $widget);
        $widget.data("coords").update({
            width: size_x * this.options.widget_base_dimensions[0] + (size_x - 1) * this.options.widget_margins[0] * 2,
            height: size_y * this.options.widget_base_dimensions[1] + (size_y - 1) * this.options.widget_margins[1] * 2
        });
        if (size_y > old_size_y) {
            this.add_faux_rows(size_y - old_size_y)
        }
        if (size_x > old_size_x) {
            this.add_faux_cols(size_x - old_size_x)
        }
        $widget.attr({
            "data-col": new_col,
            "data-sizex": size_x,
            "data-sizey": size_y
        });
        if (empty_cols.length) {
            var cols_to_remove_holes = [empty_cols[0], wgd.row, empty_cols.length, Math.min(old_size_y, size_y), $widget];
            this.remove_empty_cells.apply(this, cols_to_remove_holes)
        }
        if (empty_rows.length) {
            var rows_to_remove_holes = [new_col, wgd.row, size_x, size_y, $widget];
            this.remove_empty_cells.apply(this, rows_to_remove_holes)
        }
        return $widget
    };
    fn.empty_cells = function(col, row, size_x, size_y, $exclude) {
        var $nexts = this.widgets_below({
            col: col,
            row: row - size_y,
            size_x: size_x,
            size_y: size_y
        });
        $nexts.not($exclude).each($.proxy(function(i, w) {
            var wgd = $(w).coords().grid;
            if (!(wgd.row <= row + size_y - 1)) {
                return
            }
            var diff = row + size_y - wgd.row;
            this.move_widget_down($(w), diff)
        }, this));
        this.set_dom_grid_height();
        return this
    };
    fn.remove_empty_cells = function(col, row, size_x, size_y, exclude) {
        var $nexts = this.widgets_below({
            col: col,
            row: row,
            size_x: size_x,
            size_y: size_y
        });
        $nexts.not(exclude).each($.proxy(function(i, widget) {
            this.move_widget_up($(widget), size_y)
        }, this));
        this.set_dom_grid_height();
        return this
    };
    fn.next_position = function(size_x, size_y) {
        size_x || (size_x = 1);
        size_y || (size_y = 1);
        var ga = this.gridmap;
        var cols_l = ga.length;
        var valid_pos = [];
        var rows_l;
        for (var c = 1; c < cols_l; c++) {
            rows_l = ga[c].length;
            for (var r = 1; r <= rows_l; r++) {
                var can_move_to = this.can_move_to({
                    size_x: size_x,
                    size_y: size_y
                }, c, r);
                if (can_move_to) {
                    valid_pos.push({
                        col: c,
                        row: r,
                        size_y: size_y,
                        size_x: size_x
                    })
                }
            }
        }
        if (valid_pos.length) {
            return this.sort_by_row_and_col_asc(valid_pos)[0]
        }
        return false
    };
    fn.remove_widget = function(el, silent, callback) {
        var $el = el instanceof jQuery ? el : $(el);
        var wgd = $el.coords().grid;
        if ($.isFunction(silent)) {
            callback = silent;
            silent = false
        }
        this.cells_occupied_by_placeholder = {};
        this.$widgets = this.$widgets.not($el);
        var $nexts = this.widgets_below($el);
        this.remove_from_gridmap(wgd);
        $el.fadeOut($.proxy(function() {
            $el.remove();
            if (!silent) {
                $nexts.each($.proxy(function(i, widget) {
                    this.move_widget_up($(widget), wgd.size_y)
                }, this))
            }
            this.set_dom_grid_height();
            if (callback) {
                callback.call(this, el)
            }
        }, this))
    };
    fn.remove_all_widgets = function(callback) {
        this.$widgets.each($.proxy(function(i, el) {
            this.remove_widget(el, true, callback)
        }, this));
        return this
    };
    fn.serialize = function($widgets) {
        $widgets || ($widgets = this.$widgets);
        var result = [];
        $widgets.each($.proxy(function(i, widget) {
            result.push(this.options.serialize_params($(widget), $(widget).coords().grid))
        }, this));
        return result
    };
    fn.serialize_changed = function() {
        return this.serialize(this.$changed)
    };
    fn.register_widget = function($el) {
        var wgd = {
            col: parseInt($el.attr("data-col"), 10),
            row: parseInt($el.attr("data-row"), 10),
            size_x: parseInt($el.attr("data-sizex"), 10),
            size_y: parseInt($el.attr("data-sizey"), 10),
            el: $el
        };
        if (this.options.avoid_overlapped_widgets && !this.can_move_to({
                size_x: wgd.size_x,
                size_y: wgd.size_y
            }, wgd.col, wgd.row)) {
            wgd = this.next_position(wgd.size_x, wgd.size_y);
            wgd.el = $el;
            $el.attr({
                "data-col": wgd.col,
                "data-row": wgd.row,
                "data-sizex": wgd.size_x,
                "data-sizey": wgd.size_y
            })
        }
        $el.data("coords", $el.coords());
        $el.data("coords").grid = wgd;
        this.add_to_gridmap(wgd, $el);
        return this
    };
    fn.update_widget_position = function(grid_data, value) {
        this.for_each_cell_occupied(grid_data, function(col, row) {
            if (!this.gridmap[col]) {
                return this
            }
            this.gridmap[col][row] = value
        });
        return this
    };
    fn.remove_from_gridmap = function(grid_data) {
        return this.update_widget_position(grid_data, false)
    };
    fn.add_to_gridmap = function(grid_data, value) {
        this.update_widget_position(grid_data, value || grid_data.el);
        if (grid_data.el) {
            var $widgets = this.widgets_below(grid_data.el);
            $widgets.each($.proxy(function(i, widget) {
                this.move_widget_up($(widget))
            }, this))
        }
    };
    fn.draggable = function() {
        var self = this;
        var draggable_options = $.extend(true, {}, this.options.draggable, {
            offset_left: this.options.widget_margins[0],
            start: function(event, ui) {
                self.$widgets.filter(".player-revert").removeClass("player-revert");
                self.$player = $(this);
                self.$helper = self.options.draggable.helper === "clone" ? $(ui.helper) : self.$player;
                self.helper = !self.$helper.is(self.$player);
                self.on_start_drag.call(self, event, ui);
                self.$el.trigger("gridster:dragstart")
            },
            stop: function(event, ui) {
                self.on_stop_drag.call(self, event, ui);
                self.$el.trigger("gridster:dragstop")
            },
            drag: throttle(function(event, ui) {
                self.on_drag.call(self, event, ui);
                self.$el.trigger("gridster:drag")
            }, 60)
        });
        this.drag_api = this.$el.drag(draggable_options).data("drag");
        return this
    };
    fn.on_start_drag = function(event, ui) {
        this.$helper.add(this.$player).add(this.$wrapper).addClass("dragging");
        this.$player.addClass("player");
        this.player_grid_data = this.$player.coords().grid;
        this.placeholder_grid_data = $.extend({}, this.player_grid_data);
        this.$el.css("height", this.$el.height() + this.player_grid_data.size_y * this.min_widget_height);
        var colliders = this.faux_grid;
        var coords = this.$player.data("coords").coords;
        this.cells_occupied_by_player = this.get_cells_occupied(this.player_grid_data);
        this.cells_occupied_by_placeholder = this.get_cells_occupied(this.placeholder_grid_data);
        this.last_cols = [];
        this.last_rows = [];
        this.collision_api = this.$helper.collision(colliders, this.options.collision);
        this.$preview_holder = $("<li />", {
            "class": "preview-holder",
            "data-row": this.$player.attr("data-row"),
            "data-col": this.$player.attr("data-col"),
            css: {
                width: coords.width,
                height: coords.height
            }
        }).appendTo(this.$el);
        if (this.options.draggable.start) {
            this.options.draggable.start.call(this, event, ui)
        }
    };
    fn.on_drag = function(event, ui) {
        if (this.$player === null) {
            return false
        }
        var abs_offset = {
            left: ui.position.left + this.baseX,
            top: ui.position.top + this.baseY
        };
        this.colliders_data = this.collision_api.get_closest_colliders(abs_offset);
        this.on_overlapped_column_change(this.on_start_overlapping_column, this.on_stop_overlapping_column);
        this.on_overlapped_row_change(this.on_start_overlapping_row, this.on_stop_overlapping_row);
        if (this.helper && this.$player) {
            this.$player.css({
                left: ui.position.left,
                top: ui.position.top
            })
        }
        if (this.options.draggable.drag) {
            this.options.draggable.drag.call(this, event, ui)
        }
    };
    fn.on_stop_drag = function(event, ui) {
        this.$helper.add(this.$player).add(this.$wrapper).removeClass("dragging");
        ui.position.left = ui.position.left + this.baseX;
        ui.position.top = ui.position.top + this.baseY;
        this.colliders_data = this.collision_api.get_closest_colliders(ui.position);
        this.on_overlapped_column_change(this.on_start_overlapping_column, this.on_stop_overlapping_column);
        this.on_overlapped_row_change(this.on_start_overlapping_row, this.on_stop_overlapping_row);
        this.$player.addClass("player-revert").removeClass("player").attr({
            "data-col": this.placeholder_grid_data.col,
            "data-row": this.placeholder_grid_data.row
        }).css({
            left: "",
            top: ""
        });
        this.$changed = this.$changed.add(this.$player);
        this.cells_occupied_by_player = this.get_cells_occupied(this.placeholder_grid_data);
        this.set_cells_player_occupies(this.placeholder_grid_data.col, this.placeholder_grid_data.row);
        this.$player.coords().grid.row = this.placeholder_grid_data.row;
        this.$player.coords().grid.col = this.placeholder_grid_data.col;
        if (this.options.draggable.stop) {
            this.options.draggable.stop.call(this, event, ui)
        }
        this.$preview_holder.remove();
        this.$player = null;
        this.$helper = null;
        this.placeholder_grid_data = {};
        this.player_grid_data = {};
        this.cells_occupied_by_placeholder = {};
        this.cells_occupied_by_player = {};
        this.set_dom_grid_height()
    };
    fn.on_overlapped_column_change = function(start_callback, stop_callback) {
        if (!this.colliders_data.length) {
            return
        }
        var cols = this.get_targeted_columns(this.colliders_data[0].el.data.col);
        var last_n_cols = this.last_cols.length;
        var n_cols = cols.length;
        var i;
        for (i = 0; i < n_cols; i++) {
            if ($.inArray(cols[i], this.last_cols) === -1) {
                (start_callback || $.noop).call(this, cols[i])
            }
        }
        for (i = 0; i < last_n_cols; i++) {
            if ($.inArray(this.last_cols[i], cols) === -1) {
                (stop_callback || $.noop).call(this, this.last_cols[i])
            }
        }
        this.last_cols = cols;
        return this
    };
    fn.on_overlapped_row_change = function(start_callback, end_callback) {
        if (!this.colliders_data.length) {
            return
        }
        var rows = this.get_targeted_rows(this.colliders_data[0].el.data.row);
        var last_n_rows = this.last_rows.length;
        var n_rows = rows.length;
        var i;
        for (i = 0; i < n_rows; i++) {
            if ($.inArray(rows[i], this.last_rows) === -1) {
                (start_callback || $.noop).call(this, rows[i])
            }
        }
        for (i = 0; i < last_n_rows; i++) {
            if ($.inArray(this.last_rows[i], rows) === -1) {
                (end_callback || $.noop).call(this, this.last_rows[i])
            }
        }
        this.last_rows = rows
    };
    fn.set_player = function(col, row, no_player) {
        var self = this;
        if (!no_player) {
            this.empty_cells_player_occupies()
        }
        var cell = !no_player ? self.colliders_data[0].el.data : {
            col: col
        };
        var to_col = cell.col;
        var to_row = row || cell.row;
        this.player_grid_data = {
            col: to_col,
            row: to_row,
            size_y: this.player_grid_data.size_y,
            size_x: this.player_grid_data.size_x
        };
        this.cells_occupied_by_player = this.get_cells_occupied(this.player_grid_data);
        var $overlapped_widgets = this.get_widgets_overlapped(this.player_grid_data);
        var constraints = this.widgets_constraints($overlapped_widgets);
        this.manage_movements(constraints.can_go_up, to_col, to_row);
        this.manage_movements(constraints.can_not_go_up, to_col, to_row);
        if (!$overlapped_widgets.length) {
            var pp = this.can_go_player_up(this.player_grid_data);
            if (pp !== false) {
                to_row = pp
            }
            this.set_placeholder(to_col, to_row)
        }
        return {
            col: to_col,
            row: to_row
        }
    };
    fn.widgets_constraints = function($widgets) {
        var $widgets_can_go_up = $([]);
        var $widgets_can_not_go_up;
        var wgd_can_go_up = [];
        var wgd_can_not_go_up = [];
        $widgets.each($.proxy(function(i, w) {
            var $w = $(w);
            var wgd = $w.coords().grid;
            if (this.can_go_widget_up(wgd)) {
                $widgets_can_go_up = $widgets_can_go_up.add($w);
                wgd_can_go_up.push(wgd)
            } else {
                wgd_can_not_go_up.push(wgd)
            }
        }, this));
        $widgets_can_not_go_up = $widgets.not($widgets_can_go_up);
        return {
            can_go_up: this.sort_by_row_asc(wgd_can_go_up),
            can_not_go_up: this.sort_by_row_desc(wgd_can_not_go_up)
        }
    };
    fn.sort_by_row_asc = function(widgets) {
        widgets = widgets.sort(function(a, b) {
            if (!a.row) {
                a = $(a).coords().grid;
                b = $(b).coords().grid
            }
            if (a.row > b.row) {
                return 1
            }
            return -1
        });
        return widgets
    };
    fn.sort_by_row_and_col_asc = function(widgets) {
        widgets = widgets.sort(function(a, b) {
            if (a.row > b.row || a.row === b.row && a.col > b.col) {
                return 1
            }
            return -1
        });
        return widgets
    };
    fn.sort_by_col_asc = function(widgets) {
        widgets = widgets.sort(function(a, b) {
            if (a.col > b.col) {
                return 1
            }
            return -1
        });
        return widgets
    };
    fn.sort_by_row_desc = function(widgets) {
        widgets = widgets.sort(function(a, b) {
            if (a.row + a.size_y < b.row + b.size_y) {
                return 1
            }
            return -1
        });
        return widgets
    };
    fn.manage_movements = function($widgets, to_col, to_row) {
        $.each($widgets, $.proxy(function(i, w) {
            var wgd = w;
            var $w = wgd.el;
            var can_go_widget_up = this.can_go_widget_up(wgd);
            if (can_go_widget_up) {
                this.move_widget_to($w, can_go_widget_up);
                this.set_placeholder(to_col, can_go_widget_up + wgd.size_y)
            } else {
                var can_go_player_up = this.can_go_player_up(this.player_grid_data);
                if (!can_go_player_up) {
                    var y = to_row + this.player_grid_data.size_y - wgd.row;
                    this.move_widget_down($w, y);
                    this.set_placeholder(to_col, to_row)
                }
            }
        }, this));
        return this
    };
    fn.is_player = function(col_or_el, row) {
        if (row && !this.gridmap[col_or_el]) {
            return false
        }
        var $w = row ? this.gridmap[col_or_el][row] : col_or_el;
        return $w && ($w.is(this.$player) || $w.is(this.$helper))
    };
    fn.is_player_in = function(col, row) {
        var c = this.cells_occupied_by_player || {};
        return $.inArray(col, c.cols) >= 0 && $.inArray(row, c.rows) >= 0
    };
    fn.is_placeholder_in = function(col, row) {
        var c = this.cells_occupied_by_placeholder || {};
        return this.is_placeholder_in_col(col) && $.inArray(row, c.rows) >= 0
    };
    fn.is_placeholder_in_col = function(col) {
        var c = this.cells_occupied_by_placeholder || [];
        return $.inArray(col, c.cols) >= 0
    };
    fn.is_empty = function(col, row) {
        if (typeof this.gridmap[col] !== "undefined" && typeof this.gridmap[col][row] !== "undefined" && this.gridmap[col][row] === false) {
            return true
        }
        return false
    };
    fn.is_occupied = function(col, row) {
        if (!this.gridmap[col]) {
            return false
        }
        if (this.gridmap[col][row]) {
            return true
        }
        return false
    };
    fn.is_widget = function(col, row) {
        var cell = this.gridmap[col];
        if (!cell) {
            return false
        }
        cell = cell[row];
        if (cell) {
            return cell
        }
        return false
    };
    fn.is_widget_under_player = function(col, row) {
        if (this.is_widget(col, row)) {
            return this.is_player_in(col, row)
        }
        return false
    };
    fn.get_widgets_under_player = function(cells) {
        cells || (cells = this.cells_occupied_by_player || {
            cols: [],
            rows: []
        });
        var $widgets = $([]);
        $.each(cells.cols, $.proxy(function(i, col) {
            $.each(cells.rows, $.proxy(function(i, row) {
                if (this.is_widget(col, row)) {
                    $widgets = $widgets.add(this.gridmap[col][row])
                }
            }, this))
        }, this));
        return $widgets
    };
    fn.set_placeholder = function(col, row) {
        var phgd = $.extend({}, this.placeholder_grid_data);
        var $nexts = this.widgets_below({
            col: phgd.col,
            row: phgd.row,
            size_y: phgd.size_y,
            size_x: phgd.size_x
        });
        var right_col = col + phgd.size_x - 1;
        if (right_col > this.cols) {
            col = col - (right_col - col)
        }
        var moved_down = this.placeholder_grid_data.row < row;
        var changed_column = this.placeholder_grid_data.col !== col;
        this.placeholder_grid_data.col = col;
        this.placeholder_grid_data.row = row;
        this.cells_occupied_by_placeholder = this.get_cells_occupied(this.placeholder_grid_data);
        this.$preview_holder.attr({
            "data-row": row,
            "data-col": col
        });
        if (moved_down || changed_column) {
            $nexts.each($.proxy(function(i, widget) {
                this.move_widget_up($(widget), this.placeholder_grid_data.col - col + phgd.size_y)
            }, this))
        }
        var $widgets_under_ph = this.get_widgets_under_player(this.cells_occupied_by_placeholder);
        if ($widgets_under_ph.length) {
            $widgets_under_ph.each($.proxy(function(i, widget) {
                var $w = $(widget);
                this.move_widget_down($w, row + phgd.size_y - $w.data("coords").grid.row)
            }, this))
        }
    };
    fn.can_go_player_up = function(widget_grid_data) {
        var p_bottom_row = widget_grid_data.row + widget_grid_data.size_y - 1;
        var result = true;
        var upper_rows = [];
        var min_row = 1e4;
        var $widgets_under_player = this.get_widgets_under_player();
        this.for_each_column_occupied(widget_grid_data, function(tcol) {
            var grid_col = this.gridmap[tcol];
            var r = p_bottom_row + 1;
            upper_rows[tcol] = [];
            while (--r > 0) {
                if (this.is_empty(tcol, r) || this.is_player(tcol, r) || this.is_widget(tcol, r) && grid_col[r].is($widgets_under_player)) {
                    upper_rows[tcol].push(r);
                    min_row = r < min_row ? r : min_row
                } else {
                    break
                }
            }
            if (upper_rows[tcol].length === 0) {
                result = false;
                return true
            }
            upper_rows[tcol].sort()
        });
        if (!result) {
            return false
        }
        return this.get_valid_rows(widget_grid_data, upper_rows, min_row)
    };
    fn.can_go_widget_up = function(widget_grid_data) {
        var p_bottom_row = widget_grid_data.row + widget_grid_data.size_y - 1;
        var result = true;
        var upper_rows = [];
        var min_row = 1e4;
        this.for_each_column_occupied(widget_grid_data, function(tcol) {
            var grid_col = this.gridmap[tcol];
            upper_rows[tcol] = [];
            var r = p_bottom_row + 1;
            while (--r > 0) {
                if (this.is_widget(tcol, r) && !this.is_player_in(tcol, r)) {
                    if (!grid_col[r].is(widget_grid_data.el)) {
                        break
                    }
                }
                if (!this.is_player(tcol, r) && !this.is_placeholder_in(tcol, r) && !this.is_player_in(tcol, r)) {
                    upper_rows[tcol].push(r)
                }
                if (r < min_row) {
                    min_row = r
                }
            }
            if (upper_rows[tcol].length === 0) {
                result = false;
                return true
            }
            upper_rows[tcol].sort()
        });
        if (!result) {
            return false
        }
        return this.get_valid_rows(widget_grid_data, upper_rows, min_row)
    };
    fn.get_valid_rows = function(widget_grid_data, upper_rows, min_row) {
        var p_top_row = widget_grid_data.row;
        var p_bottom_row = widget_grid_data.row + widget_grid_data.size_y - 1;
        var size_y = widget_grid_data.size_y;
        var r = min_row - 1;
        var valid_rows = [];
        while (++r <= p_bottom_row) {
            var common = true;
            $.each(upper_rows, function(col, rows) {
                if ($.isArray(rows) && $.inArray(r, rows) === -1) {
                    common = false
                }
            });
            if (common === true) {
                valid_rows.push(r);
                if (valid_rows.length === size_y) {
                    break
                }
            }
        }
        var new_row = false;
        if (size_y === 1) {
            if (valid_rows[0] !== p_top_row) {
                new_row = valid_rows[0] || false
            }
        } else {
            if (valid_rows[0] !== p_top_row) {
                new_row = this.get_consecutive_numbers_index(valid_rows, size_y)
            }
        }
        return new_row
    };
    fn.get_consecutive_numbers_index = function(arr, size_y) {
        var max = arr.length;
        var result = [];
        var first = true;
        var prev = -1;
        for (var i = 0; i < max; i++) {
            if (first || arr[i] === prev + 1) {
                result.push(i);
                if (result.length === size_y) {
                    break
                }
                first = false
            } else {
                result = [];
                first = true
            }
            prev = arr[i]
        }
        return result.length >= size_y ? arr[result[0]] : false
    };
    fn.get_widgets_overlapped = function() {
        var $w;
        var $widgets = $([]);
        var used = [];
        var rows_from_bottom = this.cells_occupied_by_player.rows.slice(0);
        rows_from_bottom.reverse();
        $.each(this.cells_occupied_by_player.cols, $.proxy(function(i, col) {
            $.each(rows_from_bottom, $.proxy(function(i, row) {
                if (!this.gridmap[col]) {
                    return true
                }
                var $w = this.gridmap[col][row];
                if (this.is_occupied(col, row) && !this.is_player($w) && $.inArray($w, used) === -1) {
                    $widgets = $widgets.add($w);
                    used.push($w)
                }
            }, this))
        }, this));
        return $widgets
    };
    fn.on_start_overlapping_column = function(col) {
        this.set_player(col, false)
    };
    fn.on_start_overlapping_row = function(row) {
        this.set_player(false, row)
    };
    fn.on_stop_overlapping_column = function(col) {
        this.set_player(col, false);
        var self = this;
        this.for_each_widget_below(col, this.cells_occupied_by_player.rows[0], function(tcol, trow) {
            self.move_widget_up(this, self.player_grid_data.size_y)
        })
    };
    fn.on_stop_overlapping_row = function(row) {
        this.set_player(false, row);
        var self = this;
        var cols = this.cells_occupied_by_player.cols;
        for (var c = 0, cl = cols.length; c < cl; c++) {
            this.for_each_widget_below(cols[c], row, function(tcol, trow) {
                self.move_widget_up(this, self.player_grid_data.size_y)
            })
        }
    };
    fn.move_widget_to = function($widget, row) {
        var self = this;
        var widget_grid_data = $widget.coords().grid;
        var diff = row - widget_grid_data.row;
        var $next_widgets = this.widgets_below($widget);
        var can_move_to_new_cell = this.can_move_to(widget_grid_data, widget_grid_data.col, row, $widget);
        if (can_move_to_new_cell === false) {
            return false
        }
        this.remove_from_gridmap(widget_grid_data);
        widget_grid_data.row = row;
        this.add_to_gridmap(widget_grid_data);
        $widget.attr("data-row", row);
        this.$changed = this.$changed.add($widget);
        $next_widgets.each(function(i, widget) {
            var $w = $(widget);
            var wgd = $w.coords().grid;
            var can_go_up = self.can_go_widget_up(wgd);
            if (can_go_up && can_go_up !== wgd.row) {
                self.move_widget_to($w, can_go_up)
            }
        });
        return this
    };
    fn.move_widget_up = function($widget, y_units) {
        var el_grid_data = $widget.coords().grid;
        var actual_row = el_grid_data.row;
        var moved = [];
        var can_go_up = true;
        y_units || (y_units = 1);
        if (!this.can_go_up($widget)) {
            return false
        }
        this.for_each_column_occupied(el_grid_data, function(col) {
            if ($.inArray($widget, moved) === -1) {
                var widget_grid_data = $widget.coords().grid;
                var next_row = actual_row - y_units;
                next_row = this.can_go_up_to_row(widget_grid_data, col, next_row);
                if (!next_row) {
                    return true
                }
                var $next_widgets = this.widgets_below($widget);
                this.remove_from_gridmap(widget_grid_data);
                widget_grid_data.row = next_row;
                this.add_to_gridmap(widget_grid_data);
                $widget.attr("data-row", widget_grid_data.row);
                this.$changed = this.$changed.add($widget);
                moved.push($widget);
                $next_widgets.each($.proxy(function(i, widget) {
                    this.move_widget_up($(widget), y_units)
                }, this))
            }
        })
    };
    fn.move_widget_down = function($widget, y_units) {
        var el_grid_data = $widget.coords().grid;
        var actual_row = el_grid_data.row;
        var moved = [];
        var y_diff = y_units;
        if (!$widget) {
            return false
        }
        if ($.inArray($widget, moved) === -1) {
            var widget_grid_data = $widget.coords().grid;
            var next_row = actual_row + y_units;
            var $next_widgets = this.widgets_below($widget);
            this.remove_from_gridmap(widget_grid_data);
            $next_widgets.each($.proxy(function(i, widget) {
                var $w = $(widget);
                var wd = $w.coords().grid;
                var tmp_y = this.displacement_diff(wd, widget_grid_data, y_diff);
                if (tmp_y > 0) {
                    this.move_widget_down($w, tmp_y)
                }
            }, this));
            widget_grid_data.row = next_row;
            this.update_widget_position(widget_grid_data, $widget);
            $widget.attr("data-row", widget_grid_data.row);
            this.$changed = this.$changed.add($widget);
            moved.push($widget)
        }
    };
    fn.can_go_up_to_row = function(widget_grid_data, col, row) {
        var ga = this.gridmap;
        var result = true;
        var urc = [];
        var actual_row = widget_grid_data.row;
        var r;
        this.for_each_column_occupied(widget_grid_data, function(tcol) {
            var grid_col = ga[tcol];
            urc[tcol] = [];
            r = actual_row;
            while (r--) {
                if (this.is_empty(tcol, r) && !this.is_placeholder_in(tcol, r)) {
                    urc[tcol].push(r)
                } else {
                    break
                }
            }
            if (!urc[tcol].length) {
                result = false;
                return true
            }
        });
        if (!result) {
            return false
        }
        r = row;
        for (r = 1; r < actual_row; r++) {
            var common = true;
            for (var uc = 0, ucl = urc.length; uc < ucl; uc++) {
                if (urc[uc] && $.inArray(r, urc[uc]) === -1) {
                    common = false
                }
            }
            if (common === true) {
                result = r;
                break
            }
        }
        return result
    };
    fn.displacement_diff = function(widget_grid_data, parent_bgd, y_units) {
        var actual_row = widget_grid_data.row;
        var diffs = [];
        var parent_max_y = parent_bgd.row + parent_bgd.size_y;
        this.for_each_column_occupied(widget_grid_data, function(col) {
            var temp_y_units = 0;
            for (var r = parent_max_y; r < actual_row; r++) {
                if (this.is_empty(col, r)) {
                    temp_y_units = temp_y_units + 1
                }
            }
            diffs.push(temp_y_units)
        });
        var max_diff = Math.max.apply(Math, diffs);
        y_units = y_units - max_diff;
        return y_units > 0 ? y_units : 0
    };
    fn.widgets_below = function($el) {
        var el_grid_data = $.isPlainObject($el) ? $el : $el.coords().grid;
        var self = this;
        var ga = this.gridmap;
        var next_row = el_grid_data.row + el_grid_data.size_y - 1;
        var $nexts = $([]);
        this.for_each_column_occupied(el_grid_data, function(col) {
            self.for_each_widget_below(col, next_row, function(tcol, trow) {
                if (!self.is_player(this) && $.inArray(this, $nexts) === -1) {
                    $nexts = $nexts.add(this);
                    return true
                }
            })
        });
        return this.sort_by_row_asc($nexts)
    };
    fn.set_cells_player_occupies = function(col, row) {
        this.remove_from_gridmap(this.placeholder_grid_data);
        this.placeholder_grid_data.col = col;
        this.placeholder_grid_data.row = row;
        this.add_to_gridmap(this.placeholder_grid_data, this.$player);
        return this
    };
    fn.empty_cells_player_occupies = function() {
        this.remove_from_gridmap(this.placeholder_grid_data);
        return this
    };
    fn.can_go_up = function($el) {
        var el_grid_data = $el.coords().grid;
        var initial_row = el_grid_data.row;
        var prev_row = initial_row - 1;
        var ga = this.gridmap;
        var upper_rows_by_column = [];
        var result = true;
        if (initial_row === 1) {
            return false
        }
        this.for_each_column_occupied(el_grid_data, function(col) {
            var $w = this.is_widget(col, prev_row);
            if (this.is_occupied(col, prev_row) || this.is_player(col, prev_row) || this.is_placeholder_in(col, prev_row) || this.is_player_in(col, prev_row)) {
                result = false;
                return true
            }
        });
        return result
    };
    fn.can_move_to = function(widget_grid_data, col, row, max_row) {
        var ga = this.gridmap;
        var $w = widget_grid_data.el;
        var future_wd = {
            size_y: widget_grid_data.size_y,
            size_x: widget_grid_data.size_x,
            col: col,
            row: row
        };
        var result = true;
        var right_col = col + widget_grid_data.size_x - 1;
        if (right_col > this.cols) {
            return false
        }
        if (max_row && max_row < row + widget_grid_data.size_y - 1) {
            return false
        }
        this.for_each_cell_occupied(future_wd, function(tcol, trow) {
            var $tw = this.is_widget(tcol, trow);
            if ($tw && (!widget_grid_data.el || $tw.is($w))) {
                result = false
            }
        });
        return result
    };
    fn.get_targeted_columns = function(from_col) {
        var max = (from_col || this.player_grid_data.col) + (this.player_grid_data.size_x - 1);
        var cols = [];
        for (var col = from_col; col <= max; col++) {
            cols.push(col)
        }
        return cols
    };
    fn.get_targeted_rows = function(from_row) {
        var max = (from_row || this.player_grid_data.row) + (this.player_grid_data.size_y - 1);
        var rows = [];
        for (var row = from_row; row <= max; row++) {
            rows.push(row)
        }
        return rows
    };
    fn.get_cells_occupied = function(el_grid_data) {
        var cells = {
            cols: [],
            rows: []
        };
        var i;
        if (arguments[1] instanceof jQuery) {
            el_grid_data = arguments[1].coords().grid
        }
        for (i = 0; i < el_grid_data.size_x; i++) {
            var col = el_grid_data.col + i;
            cells.cols.push(col)
        }
        for (i = 0; i < el_grid_data.size_y; i++) {
            var row = el_grid_data.row + i;
            cells.rows.push(row)
        }
        return cells
    };
    fn.for_each_cell_occupied = function(grid_data, callback) {
        this.for_each_column_occupied(grid_data, function(col) {
            this.for_each_row_occupied(grid_data, function(row) {
                callback.call(this, col, row)
            })
        });
        return this
    };
    fn.for_each_column_occupied = function(el_grid_data, callback) {
        for (var i = 0; i < el_grid_data.size_x; i++) {
            var col = el_grid_data.col + i;
            callback.call(this, col, el_grid_data)
        }
    };
    fn.for_each_row_occupied = function(el_grid_data, callback) {
        for (var i = 0; i < el_grid_data.size_y; i++) {
            var row = el_grid_data.row + i;
            callback.call(this, row, el_grid_data)
        }
    };
    fn._traversing_widgets = function(type, direction, col, row, callback) {
        var ga = this.gridmap;
        if (!ga[col]) {
            return
        }
        var cr, max;
        var action = type + "/" + direction;
        if (arguments[2] instanceof jQuery) {
            var el_grid_data = arguments[2].coords().grid;
            col = el_grid_data.col;
            row = el_grid_data.row;
            callback = arguments[3]
        }
        var matched = [];
        var trow = row;
        var methods = {
            "for_each/above": function() {
                while (trow--) {
                    if (trow > 0 && this.is_widget(col, trow) && $.inArray(ga[col][trow], matched) === -1) {
                        cr = callback.call(ga[col][trow], col, trow);
                        matched.push(ga[col][trow]);
                        if (cr) {
                            break
                        }
                    }
                }
            },
            "for_each/below": function() {
                for (trow = row + 1, max = ga[col].length; trow < max; trow++) {
                    if (this.is_widget(col, trow) && $.inArray(ga[col][trow], matched) === -1) {
                        cr = callback.call(ga[col][trow], col, trow);
                        matched.push(ga[col][trow]);
                        if (cr) {
                            break
                        }
                    }
                }
            }
        };
        if (methods[action]) {
            methods[action].call(this)
        }
    };
    fn.for_each_widget_above = function(col, row, callback) {
        this._traversing_widgets("for_each", "above", col, row, callback);
        return this
    };
    fn.for_each_widget_below = function(col, row, callback) {
        this._traversing_widgets("for_each", "below", col, row, callback);
        return this
    };
    fn.get_highest_occupied_cell = function() {
        var r;
        var gm = this.gridmap;
        var rows = [];
        var row_in_col = [];
        for (var c = gm.length - 1; c >= 1; c--) {
            for (r = gm[c].length - 1; r >= 1; r--) {
                if (this.is_widget(c, r)) {
                    rows.push(r);
                    row_in_col[r] = c;
                    break
                }
            }
        }
        var highest_row = Math.max.apply(Math, rows);
        this.highest_occupied_cell = {
            col: row_in_col[highest_row],
            row: highest_row
        };
        return this.highest_occupied_cell
    };
    fn.get_widgets_from = function(col, row) {
        var ga = this.gridmap;
        var $widgets = $();
        if (col) {
            $widgets = $widgets.add(this.$widgets.filter(function() {
                var tcol = $(this).attr("data-col");
                return tcol === col || tcol > col
            }))
        }
        if (row) {
            $widgets = $widgets.add(this.$widgets.filter(function() {
                var trow = $(this).attr("data-row");
                return trow === row || trow > row
            }))
        }
        return $widgets
    };
    fn.set_dom_grid_height = function() {
        var r = this.get_highest_occupied_cell().row;
        this.$el.css("height", r * this.min_widget_height);
        return this
    };
    fn.generate_stylesheet = function(opts) {
        var styles = "";
        var max_size_x = this.options.max_size_x;
        var max_rows = 0;
        var max_cols = 0;
        var i;
        var rules;
        opts || (opts = {});
        opts.cols || (opts.cols = this.cols);
        opts.rows || (opts.rows = this.rows);
        opts.namespace || (opts.namespace = this.options.namespace);
        opts.widget_base_dimensions || (opts.widget_base_dimensions = this.options.widget_base_dimensions);
        opts.widget_margins || (opts.widget_margins = this.options.widget_margins);
        opts.min_widget_width = opts.widget_margins[0] * 2 + opts.widget_base_dimensions[0];
        opts.min_widget_height = opts.widget_margins[1] * 2 + opts.widget_base_dimensions[1];
        var serialized_opts = $.param(opts);
        if ($.inArray(serialized_opts, Gridster.generated_stylesheets) >= 0) {
            return false
        }
        Gridster.generated_stylesheets.push(serialized_opts);
        for (i = opts.cols; i >= 0; i--) {
            styles += opts.namespace + ' [data-col="' + (i + 1) + '"] { left:' + (i * opts.widget_base_dimensions[0] + i * opts.widget_margins[0] + (i + 1) * opts.widget_margins[0]) + "px;} "
        }
        for (i = opts.rows; i >= 0; i--) {
            styles += opts.namespace + ' [data-row="' + (i + 1) + '"] { top:' + (i * opts.widget_base_dimensions[1] + i * opts.widget_margins[1] + (i + 1) * opts.widget_margins[1]) + "px;} "
        }
        for (var y = 1; y <= opts.rows; y++) {
            styles += opts.namespace + ' [data-sizey="' + y + '"] { height:' + (y * opts.widget_base_dimensions[1] + (y - 1) * (opts.widget_margins[1] * 2)) + "px;}"
        }
        for (var x = 1; x <= max_size_x; x++) {
            styles += opts.namespace + ' [data-sizex="' + x + '"] { width:' + (x * opts.widget_base_dimensions[0] + (x - 1) * (opts.widget_margins[0] * 2)) + "px;}"
        }
        return this.add_style_tag(styles)
    };
    fn.add_style_tag = function(css) {
        var d = document;
        var tag = d.createElement("style");
        d.getElementsByTagName("head")[0].appendChild(tag);
        tag.setAttribute("type", "text/css");
        if (tag.styleSheet) {
            tag.styleSheet.cssText = css
        } else {
            tag.appendChild(document.createTextNode(css))
        }
        return this
    };
    fn.generate_faux_grid = function(rows, cols) {
        this.faux_grid = [];
        this.gridmap = [];
        var col;
        var row;
        for (col = cols; col > 0; col--) {
            this.gridmap[col] = [];
            for (row = rows; row > 0; row--) {
                this.add_faux_cell(row, col)
            }
        }
        return this
    };
    fn.add_faux_cell = function(row, col) {
        var coords = $({
            left: this.baseX + (col - 1) * this.min_widget_width,
            top: this.baseY + (row - 1) * this.min_widget_height,
            width: this.min_widget_width,
            height: this.min_widget_height,
            col: col,
            row: row,
            original_col: col,
            original_row: row
        }).coords();
        if (!$.isArray(this.gridmap[col])) {
            this.gridmap[col] = []
        }
        this.gridmap[col][row] = false;
        this.faux_grid.push(coords);
        return this
    };
    fn.add_faux_rows = function(rows) {
        var actual_rows = this.rows;
        var max_rows = actual_rows + (rows || 1);
        for (var r = max_rows; r > actual_rows; r--) {
            for (var c = this.cols; c >= 1; c--) {
                this.add_faux_cell(r, c)
            }
        }
        this.rows = max_rows;
        if (this.options.autogenerate_stylesheet) {
            this.generate_stylesheet()
        }
        return this
    };
    fn.add_faux_cols = function(cols) {
        var actual_cols = this.cols;
        var max_cols = actual_cols + (cols || 1);
        for (var c = actual_cols; c < max_cols; c++) {
            for (var r = this.rows; r >= 1; r--) {
                this.add_faux_cell(r, c)
            }
        }
        this.cols = max_cols;
        if (this.options.autogenerate_stylesheet) {
            this.generate_stylesheet()
        }
        return this
    };
    fn.recalculate_faux_grid = function() {
        var aw = this.$wrapper.width();
        this.baseX = ($(window).width() - aw) / 2;
        this.baseY = this.$wrapper.offset().top;
        $.each(this.faux_grid, $.proxy(function(i, coords) {
            this.faux_grid[i] = coords.update({
                left: this.baseX + (coords.data.col - 1) * this.min_widget_width,
                top: this.baseY + (coords.data.row - 1) * this.min_widget_height
            })
        }, this));
        return this
    };
    fn.get_widgets_from_DOM = function() {
        this.$widgets.each($.proxy(function(i, widget) {
            this.register_widget($(widget))
        }, this));
        return this
    };
    fn.generate_grid_and_stylesheet = function() {
        var aw = this.$wrapper.width();
        var ah = this.$wrapper.height();
        var cols = Math.floor(aw / this.min_widget_width) + this.options.extra_cols;
        var actual_cols = this.$widgets.map(function() {
            return $(this).attr("data-col")
        });
        actual_cols = Array.prototype.slice.call(actual_cols, 0);
        actual_cols.length || (actual_cols = [0]);
        var min_cols = Math.max.apply(Math, actual_cols);
        var max_rows = this.options.extra_rows;
        this.$widgets.each(function(i, w) {
            max_rows += +$(w).attr("data-sizey")
        });
        this.cols = Math.max(min_cols, cols, this.options.min_cols);
        this.rows = Math.max(max_rows, this.options.min_rows);
        this.baseX = ($(window).width() - aw) / 2;
        this.baseY = this.$wrapper.offset().top;
        if (this.options.autogenerate_stylesheet) {
            this.generate_stylesheet()
        }
        return this.generate_faux_grid(this.rows, this.cols)
    };
    $.fn.gridster = function(options) {
        return this.each(function() {
            if (!$(this).data("gridster")) {
                $(this).data("gridster", new Gridster(this, options))
            }
        })
    };
    $.Gridster = fn
})(jQuery, window, document);
vizjslib_git_revision = "77aa15bad9e886018d610c6f27a62d6423a4a0d1";
vizjslib_git_tag = "16.01-15-g77aa15b";
(function() {
    var V = envision,
        global_data = {};

    function getDefaultsMarkers(option, markers, dates) {
        var mark = "";
        if (!markers || markers.length === 0) return mark;
        for (var i = 0; i < markers.date.length; i++) {
            if (markers.date[i] == dates[option.index]) {
                mark = markers.marks[i]
            }
        }
        return mark
    }

    function getEnvisionDefaultsGraph(name, gconfig) {
        var graph = {
            name: name,
            config: {
                colors: gconfig.colors,
                grid: {
                    verticalLines: false,
                    horizontalLines: false
                },
                mouse: {
                    track: true,
                    trackY: false,
                    position: "ne"
                },
                yaxis: {
                    min: 0,
                    autoscale: true
                },
                legend: {
                    show: false,
                    backgroundColor: "#FFFFFF",
                    backgroundOpacity: 0
                }
            }
        };
        if (gconfig.gtype === "whiskers") graph.config.whiskers = {
            show: true,
            lineWidth: 2
        };
        else graph.config["lite-lines"] = {
            lineWidth: 2,
            show: true,
            fill: false,
            fillOpacity: .5
        };
        if (gconfig.y_labels) graph.config.yaxis = {
            showLabels: true,
            min: 0
        };
        if (gconfig.show_markers) graph.config.markers = {
            show: true,
            position: "ct",
            labelFormatter: function(o) {
                return getDefaultsMarkers(o, gconfig.markers, gconfig.dates)
            }
        };
        return graph
    }

    function getDefaultsMetrics(DS, viz, metrics, default_config) {
        var all_metrics = Report.getAllMetrics();
        var label = null;
        $.each(metrics, function(metric, value) {
            config = default_config;
            if (value.envision) config = DataProcess.mergeConfig(default_config, value.envision);
            if ($.inArray(metric, global_data.envision_hide) === -1) {
                viz[metric] = getEnvisionDefaultsGraph("report-" + DS.getName() + "-" + metric, config);
                label = metric;
                if (all_metrics[metric]) label = all_metrics[metric].name;
                viz[metric].config.subtitle = label;
                if (DS.getMainMetric() == metric) {
                    viz[metric + "_relative"] = getEnvisionDefaultsGraph("report-" + DS.getName() + "-" + metric + "_relative", config);
                    viz[metric].config["lite-lines"] = {
                        show: false
                    };
                    viz[metric].config.lines = {
                        lineWidth: 1,
                        show: true,
                        stacked: true,
                        fill: true,
                        fillOpacity: 1
                    }
                }
            }
        })
    }

    function getDefaults(ds) {
        var defaults_colors = ["#ffa500", "#00A8F0", "#C0D800", "#ffff00", "#00ff00", "#4DA74D", "#9440ED"];
        var default_config = {
            colors: defaults_colors,
            dates: global_data.dates,
            g_type: "",
            markers: global_data.markers,
            y_labels: false
        };
        var data_sources = Report.getDataSources();
        var viz = {};
        var metrics = {};
        if (!ds) {
            $.each(data_sources, function(i, DS) {
                metrics = DS.getMetrics();
                getDefaultsMetrics(DS, viz, metrics, default_config)
            })
        } else {
            $.each(data_sources, function(i, DS) {
                if ($.inArray(DS.getName(), ds) > -1) {
                    metrics = DS.getMetrics();
                    getDefaultsMetrics(DS, viz, metrics, default_config)
                }
            })
        }
        config = default_config;
        viz.summary = getEnvisionDefaultsGraph("report-summary", config);
        viz.summary.config.xaxis = {
            noTickets: 10,
            showLabels: true
        };
        viz.summary.config.handles = {
            show: true
        };
        viz.summary.config.selection = {
            mode: "x"
        };
        viz.summary.config.mouse = {};
        viz.connection = {
            name: "report-connection",
            adapterConstructor: V.components.QuadraticDrawing
        };
        return viz
    }

    function getOrderedDataSources(ds_list, main_metric) {
        var ordered = [];
        var main_DS = null;
        $.each(ds_list, function(i, DS) {
            if (DS.getMetrics()[main_metric]) {
                main_DS = DS;
                return false
            }
        });
        ordered.push(main_DS);
        $.each(ds_list, function(i, DS) {
            if (DS === main_DS) return;
            ordered.push(DS)
        });
        return ordered
    }

    function Envision_Report(options, data_sources) {
        var main_metric = options.data.main_metric;
        global_data = options.data;
        if (!data_sources) data_sources = Report.getDataSources();
        data_sources = getOrderedDataSources(data_sources, main_metric);
        var ds = [];
        for (var i = 0; i < data_sources.length; i++) {
            if (data_sources[i].getData().length === 0) continue;
            ds.push(data_sources[i].getName())
        }
        var data = options.data,
            defaults = getDefaults(ds),
            vis = new V.Visualization({
                name: "report-" + ds.join(",")
            }),
            selection = new V.Interaction,
            hit = new V.Interaction;
        var metrics = {};
        $.each(data_sources, function(i, DS) {
            if (DS.getData().length === 0) return;
            metrics = $.extend(metrics, DS.getMetrics())
        });
        $.each(metrics, function(metric, value) {
            if ($.inArray(metric, data.envision_hide) !== -1) return;
            if (data[metric] === undefined) return;
            defaults[metric].data = data[metric];
            if (defaults[metric].data.length < Report.getProjectsList().length) defaults[metric].config.legend.show = true;
            if (data[metric + "_relative"]) defaults[metric].data = data[metric + "_relative"]
        });
        defaults.summary.data = data.summary;
        defaults[main_metric].config.legend.show = true;
        if (options.legend_show === false) defaults[main_metric].config.legend.show = false;
        defaults[main_metric].config.mouse.trackFormatter = options.trackFormatter;
        if (options.xTickFormatter) {
            defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter
        }
        defaults[main_metric].config.yaxis.tickFormatter = options.yTickFormatter || function(n) {
            return "$" + n
        };
        var components = {};
        $.each(metrics, function(metric, value) {
            if (data[metric] === undefined) return;
            if ($.inArray(metric, data.envision_hide) === -1) {
                components[metric] = new V.Component(defaults[metric])
            }
        });
        connection = new V.Component(defaults.connection);
        summary = new V.Component(defaults.summary);
        $.each(components, function(component, value) {
            vis.add(value)
        });
        vis.add(connection).add(summary).render(options.container);
        $.each(components, function(component, value) {
            selection.follower(value)
        });
        selection.follower(connection).leader(summary).add(V.actions.selection, options.selectionCallback ? {
            callback: options.selectionCallback
        } : null);
        var hit_group = [];
        $.each(components, function(component, value) {
            hit_group.push(value)
        });
        hit.group(hit_group).add(V.actions.hit);
        if (options.selection) {
            summary.trigger("select", options.selection)
        }
    }
    V.templates.Envision_Report = Envision_Report
})();
if (Loader === undefined) var Loader = {};
(function() {
    var data_callbacks = [];
    var data_global_callbacks = [];
    var data_repos_callbacks = [];
    var check_companies = false,
        check_repos = false,
        check_countries = false;
    var ds_supporting_top_company = ["scm", "mls", "its", "its_1"];
    var ds_supporting_top_repos = ["scm", "mls", "its", "its_1", "eventizer"];
    var all_data;
    Loader.data_ready = function(callback) {
        data_callbacks.push(callback)
    };
    Loader.data_ready_global = function(callback) {
        data_global_callbacks.push(callback)
    };
    Loader.set_all_data = function(data) {
        all_data = data
    };

    function fillProjectInfo(data, dir) {
        if (data.project_name === undefined) {
            data.project_name = dir.replace("data/json", "").replace(/\.\.\//g, "")
        }
        var projects_data = Report.getProjectsData();
        projects_data[data.project_name] = {
            dir: dir,
            url: data.project_url
        }
    }
    Loader.data_load = function() {
        if (Report.getConfig() !== null && Report.getConfig().project_info !== undefined) {
            Report.setProjectData(Report.getConfig().project_info);
            if (Report.getConfig().markers) data_load_file(Report.getMarkersFile(), function(data, self) {
                Report.setMarkers(data)
            })
        } else {
            data_load_file(Report.getProjectFile(), function(data, self) {
                Report.setProjectData(data)
            });
            data_load_file(Report.getMarkersFile(), function(data, self) {
                Report.setMarkers(data)
            })
        }
        var projects_dirs = Report.getProjectsDirs();
        for (var i = 0; i < projects_dirs.length; i++) {
            var data_dir = projects_dirs[i];
            var prj_file = Report.getDataDir() + "/project-info.json";
            data_load_file(prj_file, fillProjectInfo, data_dir)
        }
        data_load_file(Report.getProjectsHierarchyFile(), Report.setProjectsHierarchy);
        data_load_file(Report.getVizConfigFile(), function(data, self) {
            Report.setVizConfig(data)
        });
        data_load_metrics_definition();
        data_load_metrics();
        data_load_tops("authors");
        data_load_time_to_fix();
        data_load_time_to_attention();
        data_load_demographics();
        data_load_markov_table();
        if (Report.getConfig() !== null && Report.getConfig().reports !== undefined) {
            var active_reports = Report.getConfig().reports;
            if ($.inArray("companies", active_reports) > -1) data_load_companies();
            if ($.inArray("repositories", active_reports) > -1) data_load_repos();
            if ($.inArray("countries", active_reports) > -1) data_load_countries();
            if ($.inArray("domains", active_reports) > -1) data_load_domains();
            if ($.inArray("projects", active_reports) > -1) data_load_projects();
            if ($.inArray("people", active_reports) > -1) {
                data_load_people();
                data_load_people_identities()
            }
        } else {
            data_load_companies();
            data_load_repos();
            data_load_countries();
            data_load_domains();
            data_load_projects();
            data_load_people();
            data_load_people_identities()
        }
    };
    Loader.get_file_data_div = function(file, cb, div) {
        $.when($.getJSON(file)).done(function(history) {
            cb(div, file, history)
        }).fail(function() {
            cb(file, null)
        })
    };

    function get_data_from_all(file, fn_data_set, self) {
        all_data_found = false;
        if (all_data) {
            file_no_path = file.replace(Report.getDataDir() + "/", "");
            data = all_data[file_no_path];
            if (data) {
                fn_data_set(data, self);
                end_data_load();
                all_data_found = true
            } else {
                if (window.console) {
                    Report.log("Can't find in " + Report.all_json_file + " " + file)
                }
            }
        }
        return all_data_found
    }

    function data_load_file(file, fn_data_set, self) {
        if (get_data_from_all(file, fn_data_set, self)) return;
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history, self);
            end_data_load()
        }).fail(function() {
            fn_data_set([], self);
            end_data_load()
        })
    }

    function data_load_companies() {
        var ds_not_supported = ["irc", "mediawiki"];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) > -1) DS.setCompaniesData([]);
            else data_load_file(DS.getCompaniesDataFile(), DS.setCompaniesData, DS)
        })
    }

    function data_load_repos() {
        var ds_not_supported = ["mediawiki"];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) > -1) {
                DS.setReposData([])
            } else {
                data_load_file(DS.getReposDataFile(), DS.setReposData, DS)
            }
        });
        data_load_file(Report.getReposMapFile(), Report.setReposMap)
    }

    function data_load_countries() {
        var ds_not_supported = ["irc", "mediawiki"];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) > -1) DS.setCountriesData([]);
            else data_load_file(DS.getCountriesDataFile(), DS.setCountriesData, DS)
        })
    }

    function data_load_domains() {
        var ds_not_supported = ["irc", "mediawiki"];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) > -1) DS.setDomainsData([]);
            else data_load_file(DS.getDomainsDataFile(), DS.setDomainsData, DS)
        })
    }

    function data_load_projects() {
        var ds_not_supported = ["irc", "mediawiki"];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) > -1) DS.setProjectsData([]);
            else data_load_file(DS.getProjectsDataFile(), DS.setProjectsData, DS)
        })
    }

    function data_load_time_to_fix() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "its") data_load_file(DS.getTimeToFixDataFile(), DS.setTimeToFixData, DS)
        })
    }

    function data_load_markov_table() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "its") data_load_file(DS.getMarkovTableDataFile(), DS.setMarkovTableData, DS)
        })
    }

    function data_load_time_to_attention() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "mls") data_load_file(DS.getTimeToAttentionDataFile(), DS.setTimeToAttentionData, DS)
        })
    }

    function data_load_demographics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDemographicsAgingFile(), DS.setDemographicsAgingData, DS);
            data_load_file(DS.getDemographicsBirthFile(), DS.setDemographicsBirthData, DS)
        })
    }

    function data_load_tops(metric) {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            var file_all = DS.getTopDataFile();
            if (get_data_from_all(file_all, DS.setGlobalTopData, DS)) return;
            $.when($.getJSON(file_all)).done(function(history) {
                DS.setGlobalTopData(history);
                end_data_load()
            }).fail(function() {
                DS.setGlobalTopData([], DS);
                end_data_load()
            })
        })
    }
    Loader.check_filters_page = function(page) {
        var check = true;
        var filters = ["repos", "companies", "countries"];
        $.each(filters, function(index, filter) {
            if (!Loader.check_filter_page(page, filter)) {
                check = false;
                return false
            }
        });
        return check
    };
    Loader.check_filter_page = function(page, filter) {
        var check = true;
        if (page === undefined) page = 1;
        var start = Report.getPageSize() * (page - 1);
        var end = start + Report.getPageSize();
        $.each(Report.getDataSources(), function(index, DS) {
            var total = 0;
            if (filter === "repos") total = DS.getReposData().length;
            if (filter === "companies") total = DS.getCompaniesData().length;
            if (filter === "countries") total = DS.getCountriesData().length;
            if (filter === "domains") total = DS.getDomainsData().length;
            if (filter === "projects") total = DS.getProjectsData().length;
            if (end > total) end = total;
            for (var i = start; i < end; i++) {
                var item;
                if (filter === "repos") {
                    item = DS.getReposData()[i];
                    if (DS.getReposGlobalData()[item] === undefined || DS.getReposMetricsData()[item] === undefined) {
                        check = false;
                        return false
                    }
                }
                if (filter === "companies") {
                    item = DS.getCompaniesData()[i];
                    if (DS.getCompaniesGlobalData()[item] === undefined || DS.getCompaniesMetricsData()[item] === undefined) {
                        check = false;
                        return false
                    }
                }
                if (filter === "countries") {
                    item = DS.getCountriesData()[i];
                    if (DS.getCountriesGlobalData()[item] === undefined || DS.getCountriesMetricsData()[item] === undefined) {
                        check = false;
                        return false
                    }
                }
                if (filter === "domains") {
                    item = DS.getDomainsData()[i];
                    if (DS.getDomainsGlobalData()[item] === undefined || DS.getDomainsMetricsData()[item] === undefined) {
                        check = false;
                        return false
                    }
                }
                if (filter === "projects") {
                    item = DS.getProjectsData()[i];
                    if (DS.getProjectsGlobalData()[item] === undefined || DS.getProjectsMetricsData()[item] === undefined) {
                        check = false;
                        return false
                    }
                }
            }
            end = start + Report.getPageSize()
        });
        return check
    };

    function getItemDS(item, filter) {
        var ds = null;
        $.each(Report.getDataSources(), function(index, DS) {
            if (filter == "repos") {
                if ($.inArray(item, DS.getReposData()) > -1) {
                    ds = DS;
                    return false
                }
            }
            if (filter == "companies") {
                if ($.inArray(item, DS.getCompaniesData()) > -1) {
                    ds = DS;
                    return false
                }
            }
            if (filter == "countries") {
                if ($.inArray(item, DS.getCountriesData()) > -1) {
                    ds = DS;
                    return false
                }
            }
            if (filter == "domains") {
                if ($.inArray(item, DS.getDomainsData()) > -1) {
                    ds = DS;
                    return false
                }
            }
            if (filter == "projects") {
                if ($.inArray(item, DS.getProjectsData()) > -1) {
                    ds = DS;
                    return false
                }
            }
        });
        return ds
    }
    Loader.filterTopCheck = function(item, filter) {
        var check = true;
        item = item.split("&ds=")[0];
        if (filter === "repos") {
            if (Loader.check_item(item, filter, "top") === false) {
                ds = getItemDS(item, filter);
                if (ds === null) {
                    Report.log("Can't find data source for " + item);
                    return true
                }
                if ($.inArray(ds.getName(), ds_supporting_top_repos) >= 0) {
                    Loader.data_load_item_top(item, ds, null, Convert.convertFilterTop, filter, "top")
                }
                return false
            }
        }
        return check
    };
    Loader.FilterItemCheck = function(item, filter) {
        var check = true,
            ds;
        var map = Report.getReposMap();
        item = item.split("&ds=")[0];
        if (filter === "repos") {
            if (Loader.check_item(item, filter) === false) {
                ds = getItemDS(item, filter);
                if (ds === null) {
                    Report.log("Can't find data source for " + item);
                    return true
                }
                Loader.data_load_item(item, ds, null, Convert.convertFilterStudyItem, filter, null);
                if ($.inArray(ds.getName(), ds_supporting_top_repos) >= 0) {
                    Loader.data_load_item_top(item, ds, null, Convert.convertFilterStudyItem, filter)
                }
                return false
            }
            if (map !== undefined && map.length !== 0) {
                var items_map = [];
                $.each(Report.getDataSources(), function(index, DS) {
                    var itmap = Convert.getRealItem(DS, filter, item);
                    if (itmap !== undefined && itmap !== null) items_map.push(itmap)
                });
                if (Loader.check_items(items_map, filter) === false) {
                    for (var i = 0; i < items_map.length; i++) {
                        if (Loader.check_item(items_map[i], filter) === false) {
                            ds = getItemDS(items_map[i], filter);
                            if (ds === null) {
                                Report.log("Can't find " + items_map[i]);
                                Report.log("Check repos-map.json");
                                continue
                            }
                            Loader.data_load_item(items_map[i], ds, null, Convert.convertFilterStudyItem, filter, items_map)
                        }
                    }
                    check = false
                }
            }
        } else {
            $.each(Report.getDataSources(), function(index, DS) {
                if (Loader.check_item(item, filter) === false) {
                    check = false;
                    Loader.data_load_item(item, DS, null, Convert.convertFilterStudyItem, filter, null);
                    if (filter === "companies") {
                        if ($.inArray(DS.getName(), ds_supporting_top_company) > -1) Loader.data_load_item_top(item, DS, null, Convert.convertFilterStudyItem, filter)
                    }
                }
            })
        }
        return check
    };
    Loader.check_item = function(item, filter, optional_filter) {
        var check = false;
        $.each(Report.getDataSources(), function(index, DS) {
            if (filter === "repos") {
                if (optional_filter === "top") {
                    if ($.inArray(DS.getName(), ds_supporting_top_repos) >= 0 && $.inArray(item, DS.getReposData()) >= 0 && DS.getRepositoriesTopData()[item] !== undefined) {
                        check = true;
                        return false
                    }
                } else {
                    if (DS.getReposGlobalData()[item] !== undefined && DS.getReposMetricsData()[item] !== undefined) {
                        check = true;
                        return false
                    }
                }
            } else if (filter === "companies") {
                var companies = DS.getCompaniesData();
                if (companies.length === 0) check = true;
                else if ($.inArray(item, companies) === -1) check = true;
                else if (DS.getCompaniesGlobalData()[item] === undefined || DS.getCompaniesMetricsData()[item] === undefined) {
                    check = false;
                    return false
                } else if ($.inArray(DS.getName(), ds_supporting_top_company) > -1 && DS.getCompaniesTopData()[item] === undefined) {
                    check = false;
                    return false
                } else check = true
            } else if (filter === "countries") {
                var countries = DS.getCountriesData();
                if (countries.length === 0) check = true;
                else if ($.inArray(item, countries) === -1) check = true;
                else if (DS.getCountriesGlobalData()[item] === undefined || DS.getCountriesMetricsData()[item] === undefined) {
                    check = false;
                    return false
                } else check = true
            } else if (filter === "domains") {
                var domains = DS.getDomainsData();
                if (domains.length === 0) check = true;
                else if ($.inArray(item, domains) === -1) check = true;
                else if (DS.getDomainsGlobalData()[item] === undefined || DS.getDomainsMetricsData()[item] === undefined) {
                    check = false;
                    return false
                } else check = true
            } else if (filter === "projects") {
                var projects = DS.getProjectsData();
                if (projects.length === 0) check = true;
                else if ($.inArray(item, projects) === -1) check = true;
                else if (DS.getProjectsGlobalData()[item] === undefined || DS.getProjectsMetricsData()[item] === undefined) {
                    check = false;
                    return false
                } else check = true
            }
        });
        return check
    };
    Loader.check_items = function(items, filter) {
        var check = true;
        $.each(items, function(id, item) {
            if (Loader.check_item(item, filter) === false) {
                check = false;
                return false
            }
        });
        return check
    };
    Loader.data_load_items_page = function(DS, page, cb, filter) {
        if (page === undefined) page = 1;
        if (filter === "repos")
            if (DS.getReposData() === null) return false;
        if (filter === "companies")
            if (DS.getCompaniesData() === null) return false;
        if (filter === "countries")
            if (DS.getCountriesData() === null) return false;
        if (filter === "domains")
            if (DS.getDomainsData() === null) return false;
        if (filter === "projects")
            if (DS.getProjectsData() === null) return false;
        var total = 0;
        if (filter === "repos") total = DS.getReposData().length;
        if (filter === "companies") total = DS.getCompaniesData().length;
        if (filter === "countries") total = DS.getCountriesData().length;
        if (filter === "domains") total = DS.getDomainsData().length;
        if (filter === "projects") total = DS.getProjectsData().length;
        if (total === 0) return true;
        var start = Report.getPageSize() * (page - 1);
        var end = start + Report.getPageSize();
        if (end > total) end = total;
        for (var i = start; i < end; i++) {
            if (filter === "repos") {
                var repo = DS.getReposData()[i];
                Loader.data_load_item(repo, DS, page, cb, "repos")
            } else if (filter === "companies") {
                var company = DS.getCompaniesData()[i];
                Loader.data_load_item(company, DS, page, cb, "companies")
            } else if (filter === "countries") {
                var country = DS.getCountriesData()[i];
                Loader.data_load_item(country, DS, page, cb, "countries")
            } else if (filter === "domains") {
                var domain = DS.getDomainsData()[i];
                Loader.data_load_item(domain, DS, page, cb, "domains")
            } else if (filter === "projects") {
                var project = DS.getProjectsData()[i];
                Loader.data_load_item(project, DS, page, cb, "projects")
            }
        }
    };
    Loader.check_people_item = function(item) {
        var check = true;
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getPeopleGlobalData()[item] === undefined || DS.getPeopleMetricsData()[item] === undefined) {
                check = false;
                return false
            }
        });
        return check
    };
    Loader.data_load_people_item = function(upeople_id, DS, cb) {
        var file = DS.getDataDir() + "/people-" + upeople_id + "-" + DS.getName();
        var file_evo = file + "-evolutionary.json";
        var file_static = file + "-static.json";
        if (all_data) {
            file_evo_no_path = file_evo.replace(Report.getDataDir() + "/", "");
            file_static_no_path = file_static.replace(Report.getDataDir() + "/", "");
            data_evo = all_data[file_evo_no_path];
            data_static = all_data[file_static_no_path];
            if (data_evo && data_static) {
                DS.addPeopleMetricsData(upeople_id, data_evo, DS);
                DS.addPeopleGlobalData(upeople_id, data_static, DS);
                if (Loader.check_people_item(upeople_id)) cb(upeople_id);
                return
            }
        }
        $.when($.getJSON(file_evo), $.getJSON(file_static)).done(function(evo, global) {
            DS.addPeopleMetricsData(upeople_id, evo[0], DS);
            DS.addPeopleGlobalData(upeople_id, global[0], DS);
            if (Loader.check_people_item(upeople_id)) cb(upeople_id)
        }).fail(function() {
            DS.addPeopleMetricsData(upeople_id, [], DS);
            DS.addPeopleGlobalData(upeople_id, [], DS);
            if (Loader.check_people_item(upeople_id)) cb(upeople_id)
        })
    };

    function getFilterSuffix(filter) {
        var filter_suffix = "";
        if (filter === "repos") {
            filter_suffix = "rep"
        } else if (filter === "companies") {
            filter_suffix = "com"
        } else if (filter === "countries") {
            filter_suffix = "cou"
        } else if (filter === "domains") {
            filter_suffix = "dom"
        } else if (filter === "projects") {
            filter_suffix = "prj"
        }
        return filter_suffix
    }
    Loader.data_load_item_top = function(item, DS, page, cb, filter, optional_filter) {
        var file_top = DS.getDataDir() + "/" + item + "-" + DS.getName();
        file_top += "-" + getFilterSuffix(filter) + "-top-";
        if (DS.getName() === "scm") file_top += "authors";
        else if (DS.getName() === "its") file_top += "closers";
        else if (DS.getName() === "its_1") file_top += "closers";
        else if (DS.getName() === "mls") file_top += "senders";
        else if (DS.getName() === "eventizer") file_top += "rsvps";
        else return;
        file_top += ".json";
        if (all_data) {
            file_no_path = file_top.replace(Report.getDataDir() + "/", "");
            data = all_data[file_no_path];
            if (data) {
                if (filter === "companies") DS.addCompanyTopData(item, data);
                else if (filter === "repos") DS.addRepositoryTopData(item, data);
                if (Loader.check_item(item, filter, optional_filter)) {
                    if (!cb.called_item) cb(filter);
                    cb.called_item = true
                }
                return
            }
        }
        $.when($.getJSON(file_top)).done(function(top) {
            if (filter === "companies") {
                DS.addCompanyTopData(item, top)
            } else if (filter === "repos") {
                DS.addRepositoryTopData(item, top)
            }
        }).fail(function() {
            if (filter === "companies") {
                DS.addCompanyTopData(item, [])
            } else if (filter === "repos") {
                DS.addRepositoryTopData(item, [])
            }
        }).always(function() {
            if (Loader.check_item(item, filter, optional_filter)) {
                if (!cb.called_item) cb(filter);
                cb.called_item = true
            }
        })
    };
    Loader.data_load_item = function(item, DS, page, cb, filter, items_map) {
        var ds_not_supported_countries = ["irc", "mediawiki"];
        var ds_not_supported_companies = ["irc", "mediawiki"];
        var ds_not_supported_domains = ["irc", "mediawiki"];
        var ds_not_supported_repos = ["mediawiki"];
        var ds_not_supported_projects = ["irc", "mediawiki"];
        if (filter === "repos") {
            if ($.inArray(DS.getName(), ds_not_supported_repos) > -1) {
                DS.addRepoMetricsData(item, [], DS);
                DS.addRepoGlobalData(item, [], DS);
                return
            }
        } else if (filter === "companies") {
            if ($.inArray(DS.getName(), ds_not_supported_companies) > -1) {
                DS.addCompanyMetricsData(item, [], DS);
                DS.addCompanyGlobalData(item, [], DS);
                return
            }
        } else if (filter === "countries") {
            if ($.inArray(DS.getName(), ds_not_supported_countries) > -1) {
                DS.addCountryMetricsData(item, [], DS);
                DS.addCountryGlobalData(item, [], DS);
                return
            }
        } else if (filter === "domains") {
            if ($.inArray(DS.getName(), ds_not_supported_domains) > -1) {
                DS.addDomainMetricsData(item, [], DS);
                DS.addDomainGlobalData(item, [], DS);
                return
            }
        } else if (filter === "projects") {
            if ($.inArray(DS.getName(), ds_not_supported_projects) > -1) {
                DS.addDomainMetricsData(item, [], DS);
                DS.addDomainGlobalData(item, [], DS);
                return
            }
        } else return;
        var item_uri = encodeURIComponent(item);
        item_uri = item_uri.replace("%2F", "_");
        var file = DS.getDataDir() + "/" + item_uri + "-";
        file += DS.getName() + "-" + getFilterSuffix(filter);
        var file_evo = file + "-evolutionary.json";
        var file_static = file + "-static.json";

        function addData(item, evo, global, DS) {
            if (filter === "repos") {
                DS.addRepoMetricsData(item, evo, DS);
                DS.addRepoGlobalData(item, global, DS)
            } else if (filter === "companies") {
                DS.addCompanyMetricsData(item, evo, DS);
                DS.addCompanyGlobalData(item, global, DS)
            } else if (filter === "countries") {
                DS.addCountryMetricsData(item, evo, DS);
                DS.addCountryGlobalData(item, global, DS)
            } else if (filter === "domains") {
                DS.addDomainMetricsData(item, evo, DS);
                DS.addDomainGlobalData(item, global, DS)
            } else if (filter === "projects") {
                DS.addProjectMetricsData(item, evo, DS);
                DS.addProjectGlobalData(item, global, DS)
            }
        }

        function check_data() {
            if (page !== null) {
                if (Loader.check_filter_page(page, filter)) {
                    if (cb.called_page === undefined) {
                        cb.called_page = {};
                        cb.called_page[filter] = true;
                        cb(filter)
                    } else if (!cb.called_page[filter]) {
                        cb(filter);
                        cb.called_page[filter] = true
                    }
                }
            } else if (items_map !== null) {
                if (Loader.check_items(items_map, filter)) {
                    if (cb.called_map === undefined) {
                        cb.called_map = {};
                        cb.called_map[filter] = true;
                        cb(filter)
                    } else if (!cb.called_map[filter]) {
                        cb(filter);
                        cb.called_map[filter] = true
                    }
                }
            } else {
                if (Loader.check_item(item, filter)) {
                    if (cb.called_item === undefined) {
                        cb.called_item = {};
                        cb.called_item[filter] = true;
                        cb(filter, item)
                    } else if (!cb.called_item[filter]) {
                        cb(filter, item);
                        cb.called_item[filter] = true
                    }
                }
            }
        }
        if (all_data) {
            file_evo_no_path = decodeURIComponent(file_evo.replace(Report.getDataDir() + "/", ""));
            file_static_no_path = decodeURIComponent(file_static.replace(Report.getDataDir() + "/", ""));
            data_evo = all_data[file_evo_no_path];
            data_static = all_data[file_static_no_path];
            if (data_evo && data_static) {
                addData(item, data_evo, data_static, DS);
                check_data();
                return
            }
        }
        $.when($.getJSON(file_evo), $.getJSON(file_static)).done(function(evo, global) {
            addData(item, evo[0], global[0], DS)
        }).always(function() {
            check_data()
        })
    };

    function data_load_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDataFile(), DS.setData, DS);
            data_load_file(DS.getGlobalDataFile(), DS.setGlobalData, DS);
            if (DS instanceof MLS) {
                data_load_file(DS.getListsFile(), DS.setListsData, DS)
            }
        })
    }

    function data_load_metrics_definition() {
        data_load_file(Report.getDataDir() + "/../metrics.json", Report.setMetricsDefinition)
    }

    function data_load_people() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getPeopleDataFile(), DS.setPeopleData, DS)
        })
    }

    function data_load_people_identities() {
        data_load_file(Report.getDataDir() + "/people.json", Report.setPeopleIdentities)
    }

    function check_companies_loaded(DS) {
        if (DS.getCompaniesData() === null) return false;
        return true
    }

    function check_repos_loaded(DS) {
        if (DS.getReposData() === null) return false;
        return true
    }

    function check_countries_loaded(DS) {
        if (DS.getCountriesData() === null) return false;
        return true
    }

    function check_domains_loaded(DS) {
        if (DS.getDomainsData() === null) return false;
        return true
    }

    function check_projects_loaded(DS) {
        if (DS.getProjectsData() === null) return false;
        return true
    }

    function check_meta_projects_loaded() {
        var projects_loaded = 0;
        var projects_data = Report.getProjectsData();
        var projects_dirs = Report.getProjectsDirs();
        for (var key in projects_data) {
            projects_loaded++
        }
        if (projects_loaded < projects_dirs.length) return false;
        return true
    }

    function check_data_loaded_global() {
        var check = true;
        if (Report.getProjectData() === null || Report.getVizConfig() === null) return false;
        if (Report.getConfig() === null)
            if (Report.getMarkers() === null) return false;
        if (Report.getReposMap() === null) return false;
        if (Report.getConfig() === null)
            if (!check_meta_projects_loaded()) return false;
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) {
                check = false;
                return false
            }
            if (DS.getGlobalData() === null) {
                check = false;
                return false
            }
            if (DS.getGlobalTopData() === null) {
                check = false;
                return false
            }
            if (DS.getDemographicsData().aging === undefined || DS.getDemographicsData().birth === undefined) {
                check = false;
                return false
            }
            if (DS.getName() === "its")
                if (DS.getTimeToFixData() === null) {
                    check = false;
                    return false
                }
            if (DS.getName() === "mls")
                if (DS.getTimeToAttentionData() === null) {
                    check = false;
                    return false
                }
        });
        return check
    }
    Loader.check_data_loaded = function() {
        var check = true;
        if (!check_data_loaded_global()) return false;
        var data_sources = Report.getDataSources();
        var active_reports = ["companies", "repositories", "countries", "domains", "projects"];
        if (Report.getConfig() !== null && Report.getConfig().reports !== undefined) active_reports = Report.getConfig().reports;
        $.each(data_sources, function(index, DS) {
            if (DS.getPeopleData() === null) {
                check = false;
                return false
            }
            if ($.inArray("companies", active_reports) > -1)
                if (!check_companies_loaded(DS)) {
                    check = false;
                    return false
                }
            if ($.inArray("repositories", active_reports) > -1)
                if (!check_repos_loaded(DS)) {
                    check = false;
                    return false
                }
            if ($.inArray("countries", active_reports) > -1)
                if (!check_countries_loaded(DS)) {
                    check = false;
                    return false
                }
            if ($.inArray("domains", active_reports) > -1)
                if (!check_domains_loaded(DS)) {
                    check = false;
                    return false
                }
            if ($.inArray("projects", active_reports) > -1)
                if (!check_projects_loaded(DS)) {
                    check = false;
                    return false
                }
            if (DS instanceof MLS) {
                if (DS.getListsData() === null) {
                    check = false;
                    return false
                }
            }
        });
        return check
    };

    function end_data_load() {
        if (check_data_loaded_global()) {
            for (var i = 0; i < data_global_callbacks.length; i++) {
                data_global_callbacks[i]()
            }
            data_global_callbacks = []
        }
        if (Loader.check_data_loaded()) {
            for (var j = 0; j < data_callbacks.length; j++) {
                if (data_callbacks[j].called !== true) data_callbacks[j]();
                data_callbacks[j].called = true
            }
        }
    }
})();
var DataProcess = {};
(function() {
    DataProcess.info = function() {};
    DataProcess.paginate = function(data, page) {
        if (page === undefined || page === 0 || isNaN(page)) return data;
        var page_items = [];
        var psize = Report.getPageSize();
        var start = (page - 1) * psize;
        for (var i = start; i < psize * page; i++) {
            if (data[i]) page_items.push(data[i])
        }
        return page_items
    };
    DataProcess.convert = function(data, convert, metric_ids) {
        if (convert === "aggregate") {
            data = DataProcess.aggregate(data, metric_ids)
        } else if (convert === "substract") {
            data = DataProcess.substract(data, metric_ids[0], metric_ids[1]);
            metric_ids = ["substract"]
        } else if (convert === "substract-aggregate") {
            data = DataProcess.substract(data, metric_ids[0], metric_ids[1]);
            metric_ids = ["substract"];
            data = DataProcess.aggregate(data, metric_ids)
        } else if (convert === "divide") {
            data = DataProcess.divide(data, metric_ids[0], metric_ids[1]);
            metric_ids = ["divide"]
        }
        return data
    };
    DataProcess.sortGlobal = function(ds, metric_id, kind) {
        if (metric_id === undefined) metric_id = "scm_commits";
        var metric = [];
        var data = [],
            sorted = {};
        sorted.name = [];
        sorted[metric_id] = [];
        var metrics_data = null;
        if (kind === "companies") {
            data = ds.getCompaniesData();
            metrics_data = ds.getCompaniesDataFull()
        } else if (kind === "repos") {
            data = ds.getReposData();
            metrics_data = ds.getReposDataFull()
        } else if (kind === "countries") {
            data = ds.getCountriesData()
        } else if (kind === "domains") {
            data = ds.getDomainsData();
            metrics_data = ds.getDomainsDataFull()
        } else if (kind === "projects") {
            data = ds.getProjectsData()
        }
        if (data === null) return [];
        if (metrics_data === null) return data;
        if (metrics_data instanceof Array || metric_id in metrics_data === false) return data;
        for (var i = 0; i < metrics_data[metric_id].length; i++) {
            var value = metrics_data[metric_id][i];
            if (value === "NA") value = 0;
            metric.push([metrics_data.name[i], value])
        }
        metric.sort(function(a, b) {
            return b[1] - a[1]
        });
        $.each(metric, function(id, value) {
            sorted.name.push(value[0]);
            sorted[metric_id].push(value[1])
        });
        return sorted.name
    };
    DataProcess.orderItems = function(filter_order) {
        $.each($("[class^='FilterItems']"), function(id, div) {
            order_by = $(this).data("order-by");
            if (order_by !== undefined) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var filter = $(this).data("filter");
                if (filter === undefined) return;
                if (filter !== filter_order) return;
                Report.log("Ordering with " + order_by + " " + ds + " for " + filter);
                var data = DataProcess.sortGlobal(DS, order_by, filter);
                if (filter === "companies") DS.setCompaniesData(data);
                if (filter === "repos") DS.setReposData(data);
                if (filter === "countries") DS.setCountriesData(data);
                if (filter === "domains") DS.setDomainsData(data);
                return false
            }
        })
    };
    DataProcess.mergeConfig = function(config1, config2) {
        var new_config = {};
        $.each(config1, function(entry, value) {
            new_config[entry] = value
        });
        $.each(config2, function(entry, value) {
            new_config[entry] = value
        });
        return new_config
    };
    DataProcess.hideEmail = function(email) {
        var clean = email;
        if (typeof email == "string" && email.indexOf("@") > -1) {
            clean = email.split("@")[0]
        }
        return clean
    };
    DataProcess.selectPersonName = function(person) {
        var name = "",
            cname, ctype, i;
        if (person.identity) {
            for (i = 0; i < person.identity.length; i++) {
                cname = person.identity[i];
                ctype = person.type[i];
                if (ctype === "name") {
                    if (cname.length > name.length) name = cname
                }
            }
        } else if (person.name) {
            if (person.name.constructor !== Array) {
                person.name = [person.name]
            }
            for (i = 0; i < person.name.length; i++) {
                cname = person.name[i];
                if (cname !== null && cname.length > name.length) {
                    name = cname
                }
            }
        }
        return name
    };
    DataProcess.selectPersonEmail = function(person) {
        var email = "",
            cemail, ctype;
        if (person.identity === undefined) return;
        for (var i = 0; i < person.identity.length; i++) {
            cemail = person.identity[i];
            ctype = person.type[i];
            if (ctype === "email") {
                email = cemail
            }
        }
        return email
    };
    DataProcess.frameTime = function(history, metrics) {
        var new_history = {};
        var i = 0,
            max_offset = 0,
            offset_list = [],
            MIN_LENGTH = 5;
        $.each(metrics, function(id, metric) {
            var offset = 0;
            array_len = history[metric].length;
            max_offset = array_len - MIN_LENGTH;
            for (i = 0; i < max_offset; i++) {
                if (history[metric][i] === 0) {
                    offset++
                } else {
                    offset_list.push(offset);
                    break
                }
            }
        });
        var min_offset = offset_list.sort()[0];
        for (var key in history) {
            new_history[key] = [];
            new_history[key] = history[key].slice(min_offset)
        }
        return new_history
    };
    DataProcess.filterDates = function(start_id, end_id, history) {
        var history_dates = {};
        $.each(history, function(name, data) {
            history_dates[name] = [];
            $.each(data, function(i, value) {
                var id = history.unixtime[i];
                if (id > start_id)
                    if (!end_id || end_id && id <= end_id) history_dates[name].push(value)
            })
        });
        return history_dates
    };
    DataProcess.filterYear = function(year, history) {
        year = parseInt(year, null);
        var min_id = new Date(year.toString()).getTime();
        var max_id = new Date((year + 1).toString()).getTime();
        var history_year = filterDates(min_id, max_id, history);
        return history_year
    };
    DataProcess.fillDates = function(dates_orig, more_dates) {
        if (dates_orig[0].length === 0) return more_dates;
        var new_dates = [
            [],
            []
        ];
        var i = 0;
        if (dates_orig[0][0] > more_dates[0][0]) {
            for (i = 0; i < more_dates[0].length; i++) {
                new_dates[0][i] = more_dates[0][i];
                new_dates[1][i] = more_dates[1][i]
            }
        }
        for (i = 0; i < dates_orig[0].length; i++) {
            pos = new_dates[0].indexOf(dates_orig[0][i]);
            if (pos === -1) {
                new_dates[0].push(dates_orig[0][i]);
                new_dates[1].push(dates_orig[1][i])
            }
        }
        if (dates_orig[0][dates_orig[0].length - 1] < more_dates[0][more_dates[0].length - 1]) {
            for (i = 0; i < more_dates[0].length; i++) {
                pos = new_dates[0].indexOf(more_dates[0][i]);
                if (pos === -1) {
                    new_dates[0].push(more_dates[0][i]);
                    new_dates[1].push(more_dates[1][i])
                }
            }
        }
        return new_dates
    };
    DataProcess.fillHistory = function(hist_complete_id, hist_partial) {
        var new_history = [
            [],
            []
        ];
        for (var i = 0; i < hist_complete_id.length; i++) {
            pos = hist_partial[0].indexOf(hist_complete_id[i]);
            new_history[0][i] = hist_complete_id[i];
            if (pos != -1) {
                new_history[1][i] = hist_partial[1][pos]
            } else {
                new_history[1][i] = 0
            }
        }
        return new_history
    };
    DataProcess.fillHistoryLines = function(hist_complete_id, hist_partial) {
        var old_history = [
            [],
            []
        ];
        var new_history = [
            [],
            []
        ];
        var lines_history = [];
        for (var i = 0; i < hist_partial.length; i++) {
            old_history[0].push(hist_partial[i][0]);
            old_history[1].push(hist_partial[i][1])
        }
        new_history = DataProcess.fillHistory(hist_complete_id, old_history);
        for (i = 0; i < hist_complete_id.length; i++) {
            lines_history.push([new_history[0][i], new_history[1][i]])
        }
        return lines_history
    };
    DataProcess.addRelativeValues = function(metrics_data, metric) {
        if (metrics_data[metric] === undefined) return;
        metrics_data[metric + "_relative"] = [];
        var added_values = [];
        $.each(metrics_data[metric], function(index, pdata) {
            var metric_values = pdata.data[1];
            for (var i = 0; i < metric_values.length; i++) {
                if (added_values[i] === undefined) added_values[i] = 0;
                added_values[i] += metric_values[i]
            }
        });
        $.each(metrics_data[metric], function(index, pdata) {
            var val_relative = [];
            for (var i = 0; i < pdata.data[0].length; i++) {
                if (added_values[i] === 0) val_relative[i] = 0;
                else {
                    var rel_val = pdata.data[1][i] / added_values[i] * 100;
                    val_relative[i] = rel_val
                }
            }
            metrics_data[metric + "_relative"].push({
                label: pdata.label,
                data: [pdata.data[0], val_relative]
            })
        })
    };
    DataProcess.aggregate = function(data, metrics) {
        var new_data = {};
        if (!(metrics instanceof Array)) metrics = [metrics];
        $.each(data, function(metric, mdata) {
            if ($.inArray(metric, metrics) > -1) {
                var metric_agg = [];
                metric_agg[0] = data[metric][0];
                for (var i = 1; i < data[metric].length; i++) {
                    metric_agg[i] = metric_agg[i - 1] + data[metric][i]
                }
                new_data[metric] = metric_agg
            } else {
                new_data[metric] = data[metric]
            }
        });
        return new_data
    };
    DataProcess.substract = function(data, metric1, metric2) {
        var new_data = {};
        var substract = [];
        for (var i = 0; i < data[metric1].length; i++) {
            substract[i] = data[metric1][i] - data[metric2][i]
        }
        $.each(data, function(metric, mdata) {
            new_data[metric] = data[metric]
        });
        new_data.substract = substract;
        return new_data
    };
    DataProcess.divide = function(data, metric1, metric2) {
        var new_data = {};
        var divide = [];
        for (var i = 0; i < data[metric1].length; i++) {
            if (data[metric1][i] === 0 || data[metric2][i] === 0) divide[i] = 0;
            else divide[i] = parseInt(data[metric1][i] / data[metric2][i], null)
        }
        $.each(data, function(metric, mdata) {
            new_data[metric] = data[metric]
        });
        new_data.divide = divide;
        return new_data
    };
    DataProcess.revomeLastPoint = function(data) {
        var new_data = {};
        $.each(data, function(key, value) {
            new_data[key] = [];
            for (var i = 0; i < data[key].length - 1; i++) {
                new_data[key].push(data[key][i])
            }
        });
        return new_data
    }
})();
var Utils = {};
(function() {
    Utils.paramsInURL = paramsInURL;
    Utils.isReleasePage = isReleasePage;
    Utils.filenameInURL = filenameInURL;
    Utils.createLink = createLink;
    Utils.createReleaseLink = createReleaseLink;
    Utils.getParameter = getParameter;
    $.urlParam = function(name) {
        var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.href);
        if (results === null) {
            return null
        } else {
            return results[1] || 0
        }
    };

    function isReleasePage() {
        if ($.urlParam("release") === null) return false;
        else return true
    }

    function paramsInURL() {
        params = "";
        if (document.URL.split("?").length > 1) {
            params = document.URL.split("?")[1]
        }
        return params
    }

    function filenameInURL() {
        aux = document.URL.split("?")[0].split("/");
        res = aux[aux.length - 1];
        return res
    }

    function createLink(target) {
        url = target;
        if (paramsInURL().length > 0) url += "?" + paramsInURL();
        return url
    }

    function createReleaseLink(target) {
        url = target;
        if (isReleasePage()) {
            if (url.indexOf("?") >= 0) {
                url += "&release=" + $.urlParam("release")
            } else {
                url += "?release=" + $.urlParam("release")
            }
        }
        return url
    }

    function getParameter(param) {
        if ($.urlParam(param) === null) return false;
        return $.urlParam(param)
    }
})();
String.prototype.supplant = function(o) {
    return this.replace(/{([^{}]*)}/g, function(a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a
    })
};
var HTMLComposer = {};
(function() {
    HTMLComposer.personDSBlock = personDSBlock;
    HTMLComposer.filterDSBlock = filterDSBlock;
    HTMLComposer.CompanyDSBlock = CompanyDSBlock;
    HTMLComposer.DSBlock = DSBlock;
    HTMLComposer.DSBlockProject = DSBlockProject;
    HTMLComposer.repositorySummaryTable = repositorySummaryTable;
    HTMLComposer.personSummaryTable = personSummaryTable;
    HTMLComposer.personName = personName;
    HTMLComposer.personAffiliation = personAffiliation;
    HTMLComposer.personCountry = personCountry;
    HTMLComposer.itemName = itemName;
    HTMLComposer.releaseSelector = releaseSelector;
    HTMLComposer.sideBarLinks = sideBarLinks;
    HTMLComposer.overallSummaryBlock = overallSummaryBlock;
    HTMLComposer.smartLinks = smartLinks;
    HTMLComposer.metricDesc = metricDesc;
    HTMLComposer.TopByPeriod = TopByPeriod;
    HTMLComposer.companyFilters = companyFilters;

    function personDSBlock(ds_name, metric_name, ds_realname) {
        var html = '<div class="col-md-12">';
        html += '<div class="well well-small">';
        html += '<div class="row">';
        html += '<div class="col-md-12">';
        if (ds_realname === undefined) {
            html += "<p>" + title4DS(ds_name) + "</p>"
        } else {
            html += "<p>" + title4DS(ds_realname) + "</p>"
        }
        html += "</div>";
        html += '<div class="col-md-3">';
        html += '<div class="PersonSummary" data-data-source="' + ds_name + '"></div>';
        html += "</div>";
        html += '<div class="col-md-9">';
        html += '<div class="PersonMetrics" data-data-source="' + ds_name + '"';
        html += 'data-metrics="' + metric_name + '" data-min="true"';
        html += 'data-frame-time="true"></div>';
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "</div>";
        return html
    }

    function filterDSBlock(ds_name, filter_name, metric_names, ds_realname) {
        var html = '<div class="col-md-12">';
        html += '<div class="row">';
        html += '<div class="col-md-3">';
        if (filter_name !== "companies") {
            html += '<div class="well">'
        }
        if (ds_realname) {
            html += '<div class="FilterItemSummary" data-data-source="' + ds_name + '" data-filter="' + filter_name + '" data-data-realname="' + ds_realname + '"></div>'
        } else {
            html += '<div class="FilterItemSummary" data-data-source="' + ds_name + '" data-filter="' + filter_name + '"></div>'
        }
        if (filter_name !== "companies") {
            html += "</div></div>";
            html += '<div class="col-md-9">';
            html += '<div class="well">'
        } else {
            html += "</div>";
            html += '<div class="col-md-9">'
        }
        $.each(metric_names, function(id, metric) {
            html += '<div class="row"><div class="col-md-12"></br></br></div></div>';
            html += '<div class="row">';
            html += '<div class="col-md-12">';
            html += '<div class="FilterItemMetricsEvol" data-data-source="' + ds_name + '"';
            html += 'data-metrics="' + metric + '" data-min="true"';
            html += 'data-filter="' + filter_name + '" data-frame-time="true"></div>';
            html += "</div></div>"
        });
        html += "</div></div></div>";
        if (filter_name !== "companies") {
            html += "</div>"
        }
        return html
    }

    function CompanyHasTop(company_name, metric) {
        if (DS.getCompaniesTopData()[company_name] !== undefined) {
            return DS.getCompaniesTopData()[company_name][metric + "."] !== undefined
        } else {
            return false
        }
    }

    function CompanyDSBlock(company_name, ds_name, filter_name, metric_names, top_metric, ds_realname) {
        var html = '<div class="row">';
        html += '<div class="col-md-12">';
        html += '<div class="wellmin">';
        html += '<div class="row">';
        if (CompanyHasTop(company_name, top_metric)) {
            html += '<div class="col-md-7">';
            html += filterDSBlock(ds_name, filter_name, metric_names, ds_realname);
            html += "</div>";
            html += '<div class="col-md-3">';
            html += '<div class="FilterItemTop" data-filter="companies" data-metric="' + top_metric + '"';
            html += 'data-period="all" data-data-source="' + ds_name + '"';
            html += 'data-people_links="true" data-height="340"></div>';
            html += "</div>"
        } else {
            html += '<div class="col-md-10">';
            html += filterDSBlock(ds_name, filter_name, metric_names, ds_realname);
            html += "</div>"
        }
        html += '<div class="col-md-2">';
        html += '<div class="DemographicsCompany" data-data-source="' + ds_name + '" data-period="0.5"></div></div>';
        html += "</div>";
        html += "</div>";
        html += "</div>";
        return html
    }

    function repositorySummaryTable(ds, global_data, id_label, ds_realname) {
        var html = "<table class='table-condensed table-hover'>",
            ds_title;
        if (ds_realname) {
            ds_title = title4DS(ds_realname)
        } else {
            ds_title = title4DS(ds.getName())
        }
        html += '<tr><td colspan="2"><p class="subsection-title">' + ds_title + "</p></td></tr>";
        var html_irow = "<tr><td>";
        var html_erow = "</td></tr>";
        $.each(global_data, function(id, value) {
            if (ds.getMetrics()[id]) {
                var desc = ds.getMetricDesc(id);
                html += html_irow;
                html += '<span data-toggle="tooltip" title="' + desc + '">';
                html += ds.getMetrics()[id].name;
                html += "</span>";
                if (id === "first_date" || id === "last_date") {
                    html += '</td><td class="numberInTD">' + value + html_erow
                } else {
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow
                }
            } else if (id_label[id]) {
                html += html_irow + id_label[id];
                if (id === "first_date" || id === "last_date") {
                    html += '</td><td class="numberInTD">' + value + html_erow
                } else {
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow
                }
            }
        });
        html += "</table>";
        return html
    }

    function personSummaryTable(ds_name, history) {
        var html = "<table class='table-condensed table-hover'>";
        html += "<tr><td>";
        html += "First contribution: </br>";
        html += "&nbsp;&nbsp;" + history.first_date;
        html += "</td></tr><tr><td>";
        html += "Last contribution: </br>";
        html += "&nbsp;&nbsp;" + history.last_date;
        html += "</td></tr><tr><td>";
        if (ds_name == "scm") html += "Commits:</br>&nbsp;&nbsp;" + history.scm_commits;
        else if (ds_name == "its") html += "Closed:</br>&nbsp;&nbsp;" + history.its_closed;
        else if (ds_name == "mls") html += "Sent:</br>&nbsp;&nbsp;" + history.mls_sent;
        else if (ds_name == "irc") html += "Sent:</br>&nbsp;&nbsp;" + history.irc_sent;
        else if (ds_name == "scr") {
            if (history.scr_closed !== undefined) {
                html += "Closed:</br>&nbsp;&nbsp;" + history.scr_closed
            }
            if (history.scr_submissions !== undefined) {
                html += "Submissions:</br>&nbsp;&nbsp;" + history.scr_submissions
            }
        }
        html += "</td></tr>";
        html += "</table>";
        return html
    }

    function personName(name, email) {
        var html = '<p class="section-title" style="margin-bottom:0px;"><i class="fa fa-user fa-lg"></i> &nbsp;&nbsp;';
        if (name.length > 0) html += name;
        else if (email.length > 0) {
            if (email.indexOf("@") > 0) email = email.split("@")[0];
            html += email
        }
        html += "</p>";
        return html
    }

    function personAffiliation(com_name) {
        var html = '<p class="section-title" style="margin-bottom:0px;"><i class="fa fa-building fa-lg"></i> &nbsp;&nbsp;';
        html += com_name;
        html += "</p>";
        return html
    }

    function personCountry(cou_name) {
        var html = '<p class="section-title" style="margin-bottom:0px;"><i class="fa fa-globe fa-lg"></i> &nbsp;&nbsp;';
        html += cou_name;
        html += "</p>";
        return html
    }

    function itemName(text, filter_name) {
        var html = '<p class="section-title" style="margin-bottom:0px;">';
        if (filter_name === "companies") html += '<i class="fa fa-building-o"></i> &nbsp;&nbsp;';
        html += text;
        html += "</p>";
        return html
    }

    function title4DS(ds_name) {
        var title = "";
        if (ds_name === "scm") title = '<i class="fa fa-code"></i> Source Code Management';
        else if (ds_name === "scr") title = '<i class="fa fa-check"></i> Source Code Review';
        else if (ds_name === "its") title = '<i class="fa fa-ticket"></i> Issue tracking system';
        else if (ds_name === "storyboard") title = '<i class="fa fa-ticket"></i> StoryBoard';
        else if (ds_name === "maniphest") title = '<i class="fa fa-ticket"></i> Maniphest';
        else if (ds_name === "mls") title = '<i class="fa fa-envelope-o"></i> Mailing Lists';
        else if (ds_name === "irc") title = '<i class="fa fa-comment-o"></i> IRC Channels';
        else if (ds_name === "slack") title = '<i class="fa fa-comment-o"></i> Slack';
        else if (ds_name === "mediawiki") title = '<i class="fa fa-pencil-square-o"></i> Wiki';
        else if (ds_name === "releases") title = '<i class="fa fa-umbrella"></i> Forge Releases';
        else if (ds_name === "meetup") title = '<i class="fa fa-users"></i> Meetup';
        return title
    }

    function releaseSelector(current_release, release_names) {
        function get_label(url, labels) {
            label = "";
            $.each(labels, function(pos, data) {
                if (data[1] === url) {
                    label = data[0];
                    return false
                }
            });
            return label
        }
        if (release_names.length === 0) return "";
        var release_names_labels = null;
        if (release_names[0] instanceof Array) {
            var old_relase_names = [];
            $.each(release_names, function(pos, data) {
                old_relase_names.push(data[1])
            });
            release_names_labels = release_names;
            release_names = old_relase_names
        }
        unsupported = ["irc.html", "qaforums.html", "project.html"];
        ah_label = "&nbsp;All history&nbsp;";
        label = current_release;
        if (label === null) label = ah_label;
        else {
            label = decodeURIComponent(label);
            if (release_names_labels !== null) {
                label = get_label(label, release_names_labels);
                label = "&nbsp; " + label + " &nbsp;"
            } else {
                label = "&nbsp; " + label[0].toUpperCase() + label.substring(1) + " release &nbsp;"
            }
            release_names.reverse().push(ah_label);
            release_names.reverse()
        }
        html = '<div class="input-group-btn">';
        html += '<button type="button" class="btn btn-default btn-lg btn-releaseselector dropdown-toggle"';
        html += 'data-toggle="dropdown">';
        html += label;
        html += '<span class="caret"></span>';
        html += "</button>";
        html += '<ul class="dropdown-menu pull-left">';
        page_name = Utils.filenameInURL();
        if (unsupported.indexOf(page_name) < 0) {
            $.each(release_names, function(id, value) {
                var final_p = [];
                params = Utils.paramsInURL().split("&");
                for (i = 0; i < params.length; i++) {
                    sub_value = params[i];
                    if (sub_value.length === 0) continue;
                    if (sub_value.indexOf("release") === 0) {
                        if (value != ah_label) final_p.push("release=" + value)
                    } else {
                        final_p.push(sub_value)
                    }
                }
                if ($.urlParam("release") === null) {
                    final_p.push("release=" + value)
                }
                if (value === ah_label) {
                    html += '<li><a href="' + page_name + "?" + final_p.join("&") + '" data-value="' + value + '">  ' + value + "</a></li>"
                } else {
                    html += '<li><a href="' + page_name + "?" + final_p.join("&") + '" data-value="' + value + '">  ';
                    if (release_names_labels !== null) {
                        html += get_label(value, release_names_labels) + "</li>"
                    } else {
                        html += value[0].toUpperCase() + value.substring(1) + " release</a></li>"
                    }
                }
            })
        } else {
            html += "<li><i>No releases for this section</i></li>"
        }
        html += "</ul>";
        html += "</div>";
        return html
    }

    function DSBlock(ds_name, box_labels, box_metrics, ts_metrics) {
        html = "";
        html += "<!-- irc -->";
        html += '<div class="row invisible-box">';
        blabels = box_labels.split(",");
        bmetrics = box_metrics.split(",");
        html += DSSummaryBox(ds_name, blabels, bmetrics, false, ds_realname);
        html += '<div class="col-md-5">';
        tsm = ts_metrics.split(",");
        html += DSTimeSerie(ds_name, tsm[0], false, ds_realname);
        html += "</div>";
        html += '<div class="col-md-5">';
        html += DSTimeSerie(ds_name, tsm[1], false, ds_realname);
        html += "</div>";
        html += "</div>";
        html += "<!-- end irc -->";
        return html
    }

    function DSBlockProject(ds_name, box_labels, box_metrics, ts_metrics, pname) {
        html = "";
        html += "<!-- irc -->";
        html += '<div class="row invisible-box">';
        blabels = box_labels.split(",");
        bmetrics = box_metrics.split(",");
        html += DSSummaryBox(ds_name, blabels, bmetrics, true);
        html += '<div class="col-md-5">';
        tsm = ts_metrics.split(",");
        html += DSTimeSerie(ds_name, tsm[0], true);
        html += "</div>";
        html += '<div class="col-md-5">';
        html += DSTimeSerie(ds_name, tsm[1], true);
        html += "</div>";
        html += "</div>";
        html += "<!-- end irc -->";
        return html
    }

    function linkToPanel(ds_name, ds_realname) {
        if (ds_realname === undefined) {
            target_page = Utils.createLink(ds_name + ".html")
        } else {
            target_page = Utils.createLink(ds_realname + ".html")
        }
        return target_page
    }

    function summaryCell(width, label, ds_name, metric, project_flag, ds_realname) {
        var target_page = linkToPanel(ds_name, ds_realname);
        if (project_flag) {
            widget_name = "ProjectData"
        } else {
            widget_name = "GlobalData"
        }
        html = "";
        html += '<div class="col-xs-' + width + '">';
        html += '<div class="row thin-border">';
        html += '<div class="col-md-12">' + label + "</div>";
        html += "</div>";
        html += '<div class="row">';
        html += '<div class="col-md-12 medium-fp-number">';
        if (project_flag) {
            html += '<span class="' + widget_name + '"';
            html += 'data-data-source="' + ds_name + '" data-field="' + metric + '"></span>'
        } else {
            html += '<a href="' + target_page + '"> <span class="' + widget_name + '"';
            html += 'data-data-source="' + ds_name + '" data-field="' + metric + '"></span>';
            html += "</a>"
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
        return html
    }

    function DSSummaryBox(ds_name, labels, metrics, project_flag, ds_realname) {
        var target_page = linkToPanel(ds_name, ds_realname);
        if (project_flag) {
            widget_name = "ProjectData"
        } else {
            widget_name = "GlobalData"
        }
        html = "";
        html += "<!-- summary box-->";
        html += '<div class="col-md-2">';
        html += '<div class="well well-small">';
        html += '<div class="row thin-border">';
        html += '<div class="col-md-12">' + labels[0] + "</div>";
        html += "</div>";
        html += '<div class="row grey-border">';
        html += '<div class="col-md-12 big-fp-number">';
        if (ds_name === "releases") target_page = Utils.createLink("forge.html");
        if (project_flag) {
            html += '<span class="' + widget_name + '"';
            html += 'data-data-source="' + ds_name + '" data-field="' + metrics[0] + '"></span>'
        } else {
            html += '<a href="' + target_page + '"> <span class="' + widget_name + '"';
            html += 'data-data-source="' + ds_name + '" data-field="' + metrics[0] + '"></span>';
            html += "</a>"
        }
        html += "</div>";
        html += "</div>";
        html += '<div class="row" style="padding: 5px 0px 0px 0px;">';
        if (labels.length === 2 && metrics.length === 2) {
            html += summaryCell("12", labels[1], ds_name, metrics[1], project_flag, ds_realname)
        } else if (labels.length === 3 && metrics.length === 3) {
            html += summaryCell("6", labels[1], ds_name, metrics[1], project_flag, ds_realname);
            html += summaryCell("6", labels[2], ds_name, metrics[2], project_flag, ds_realname)
        } else if (labels.length === 4 && metrics.length === 4) {
            html += summaryCell("4", labels[1], ds_name, metrics[1], project_flag, ds_realname);
            html += summaryCell("4", labels[2], ds_name, metrics[2], project_flag, ds_realname);
            html += summaryCell("4", labels[3], ds_name, metrics[3], project_flag, ds_realname)
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "<!-- end summary box -->";
        return html
    }

    function DSTimeSerie(ds_name, metric, project_flag, ds_realname) {
        if (project_flag) {
            ts_widget_name = "FilterItemMetricsEvol";
            trend_widget_name = "FilterItemMicrodashText";
            filter_name = "projects"
        } else {
            ts_widget_name = "MetricsEvol";
            trend_widget_name = "MicrodashText";
            filter_name = ""
        }
        html = "";
        html += '<div class="well well-small">';
        html += '<div class="' + ts_widget_name + '" data-data-source="' + ds_name + '"';
        html += ' data-filter="' + filter_name + '"';
        if (project_flag) {
            html += ' data-frame-time="true"'
        }
        html += ' data-metrics="' + metric + '" data-min="true" style="height: 100px;"';
        html += ' data-light-style="true"></div>';
        if (project_flag) {
            html += ' <span class="' + trend_widget_name + '"';
            html += ' data-filter="' + filter_name + '"';
            html += ' data-metric="' + metric + '"></span>'
        } else {
            if (ds_realname === undefined) {
                html += '<a href="' + ds_name + '.html" style="color: black;">'
            } else {
                html += '<a href="' + ds_realname + '.html" style="color: black;">'
            }
            html += ' <span class="' + trend_widget_name + '"';
            html += ' data-filter="' + filter_name + '"';
            html += ' data-metric="' + metric + '"></span>';
            html += "</a>"
        }
        html += "</div>";
        return html
    }

    function sideBarLinks(icon_text, title, ds_name, elements) {
        text = {
            backlog: "Backlog",
            companies: "Companies",
            "companies-summary": "Companies summary",
            organizations: "Organizations",
            "organizations-summary": "Organizations summary",
            contributors: "Contributors",
            countries: "Countries",
            domains: "Domains",
            projects: "Projects",
            repos: "Repositories",
            tags: "Tags",
            states: "States",
            past_meetings: "Past Meetings",
            next_meetings: "Next Meetings"
        };
        html = "";
        html += '<li class="dropdown">';
        html += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">';
        html += '<i class="fa ' + icon_text + '"></i>&nbsp;' + title + ' <b class="caret"></b></a>';
        html += '<ul class="dropdown-menu navmenu-nav">';
        var target_page = "";
        if (Utils.isReleasePage()) {
            target_page = Utils.createReleaseLink(ds_name + ".html")
        } else {
            target_page = ds_name + ".html"
        }
        html += '<li><a href="' + target_page + '">&nbsp;Overview</a></li>';
        $.each(elements, function(id, value) {
            if (Utils.isReleasePage()) {
                target_page = Utils.createReleaseLink(ds_name + "-" + value + ".html")
            } else {
                target_page = ds_name + "-" + value + ".html"
            }
            if (text.hasOwnProperty(value)) {
                var label = text[value];
                if (value === "repos") {
                    if (ds_name == "storyboard") {
                        ds_name = "its"
                    } else if (ds_name == "maniphest") {
                        ds_name = "its"
                    }
                    var DS;
                    if (ds_name === "slack") {
                        DS = Report.getDataSourceByName("irc")
                    } else {
                        DS = Report.getDataSourceByName(ds_name)
                    }
                    label = DS.getLabelForRepositories();
                    label = label.charAt(0).toUpperCase() + label.slice(1)
                }
                html += '<li><a href="' + target_page + '">&nbsp;' + label + "</a></li>"
            } else {
                html += '<li><a href="' + target_page + '">&nbsp;' + value + "</a></li>"
            }
        });
        html += "</ul></li>";
        return html
    }

    function overallSummaryBlock() {
        html = "";
        html += "<!-- summary bar -->";
        html += '<div class="capped-box overall-summary ">';
        html += '<div class="stats-switcher-viewport js-stats-switcher-viewport">';
        html += '<div class="row numbers-summary">';
        html += '<div class="col-xs-3"><a href="' + Utils.createReleaseLink("scm.html") + '"><span class="GlobalData" ';
        html += 'data-data-source="scm" data-field="scm_commits"></span></a> commits</div>';
        html += '<div class="col-xs-3"><a href="' + Utils.createReleaseLink("scm.html") + '"><span class="GlobalData" ';
        html += 'data-data-source="scm" data-field="scm_authors"></span></a> developers ';
        html += "</div>";
        html += '<div class="col-xs-3"><a href="' + Utils.createReleaseLink("its.html") + '"><span class="GlobalData" ';
        html += 'data-data-source="its" data-field="its_opened"></span></a> tickets</div>';
        html += '<div class="col-xs-3"><a href="' + Utils.createReleaseLink("mls.html") + '"><span class="GlobalData" ';
        html += 'data-data-source="mls" data-field="mls_sent"></span></a> mail messages ';
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "<!-- end of summary bar -->";
        return html
    }

    function smartLinks(target_page, label) {
        html = "";
        link_exists = false;
        try {
            fname = target_page.split(".")[0];
            section = fname.split("-")[0];
            subsection = fname.split("-")[1];
            var mele = Report.getMenuElements();
            if (mele[section].indexOf(subsection) >= 0) link_exists = true;
            if (Utils.isReleasePage() && link_exists) {
                link_to = Utils.createReleaseLink(target_page);
                html = '<a href="' + link_to + '">' + label + "</a>"
            } else if (link_exists) {
                html = '<a href="' + target_page + '">' + label + "</a>"
            } else {
                html = label
            }
        } catch (err) {
            html = label
        }
        return html
    }

    function metricDesc(ds, metric, content) {
        var desc = ds.getMetricDesc(metric);
        var html = '<span data-toggle="tooltip" title="' + desc + '">';
        html += content;
        html += "</span>";
        return html
    }

    function TopByPeriod(ds_name, metric, npeople, is_release) {
        if (is_release) {
            periods = [""]
        } else {
            periods = ["last month", "last year", ""]
        }
        width = 12 / periods.length;
        html = '<div class="row">';
        $.each(periods, function(id, value) {
            html += '<div class="col-md-' + width + '">';
            html += '<div class="Top" data-data-source="' + ds_name + '" data-metric="' + metric + '"';
            html += ' data-period="' + value + '" data-limit="' + npeople + '" data-people_links="true"></div>';
            html += "</div>"
        });
        html += "</div>";
        return html
    }
    var defaultFilterValues = {
        scm: {
            metric_names: "commits+authors",
            order_by: "commits_365"
        },
        its: {
            metric_names: "closed+closers",
            order_by: "closed_365"
        }
    };

    function getFilterName(ds_name, metric_one, metric_two) {
        filters = {
            scm: {
                company: {
                    country: "SCM by country"
                }
            },
            its: {
                company: {
                    country: "ITS by country"
                }
            }
        };
        return filters[ds_name][metric_one][metric_two]
    }

    function companyFilters(company_name) {
        var html = "",
            filter_ds = {};
        var mele = Report.getMenuElements();
        var menu_filters = mele.filter;
        if (menu_filters === undefined) {
            return html
        }
        $.each(menu_filters, function(id, value) {
            var ds_name = value.split(":")[0],
                combo = value.split(":")[1],
                mylen;
            if (Object.keys(filter_ds).indexOf(combo) < 0) {
                filter_ds[combo] = []
            }
            mylen = filter_ds[combo].length;
            filter_ds[combo][mylen] = ds_name
        });
        $.each(Object.keys(filter_ds), function(id, value) {
            switch (value) {
                case "company+country":
                    $.each(filter_ds[value], function(subid, ds_name) {
                        if (subid === 0) {
                            html = '<div class="btn-group">' + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + '<i class="fa fa-globe"></i> Activity by country <span class="caret"></span>' + "</button>" + '<ul class="dropdown-menu" role="menu">'
                        }
                        var aux_obj = {};
                        aux_obj.company_name = company_name;
                        aux_obj.ds_name = ds_name;
                        aux_obj.value = value;
                        aux_obj.metric_names = defaultFilterValues[ds_name].metric_names;
                        aux_obj.order_by = defaultFilterValues[ds_name].order_by;
                        aux_obj.filter_name = getFilterName(ds_name, value.split("+")[0], value.split("+")[1]);
                        var aux_html = '<li><a href="' + "filter.html?filter_by_item=company&filter_item=" + "{company_name}" + "&filter_ds_name={ds_name}" + "&filter_names={value}" + "&filter_metric_names={metric_names}" + "&filter_order_by={order_by}" + '">{filter_name}</a></button></li>';
                        html += aux_html.supplant(aux_obj);
                        if (subid === filter_ds[value].length - 1) {
                            html += "</ul></div>"
                        }
                    })
            }
        });
        return html
    }
})();
var Convert = {};
(function() {
    Convert.convertMicrodashText = function() {
        var divs = $(".MicrodashText");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var metric = $(this).data("metric");
                var show_name = $(this).data("name");
                var ds = Report.getMetricDS(metric)[0];
                if (ds === undefined) return;
                var total = ds.getGlobalData()[metric];
                var html = '<table class="table table-hover" style="margin-bottom:1px"><tr>';
                if (show_name) {
                    html += '<td class="col-md-4">';
                    html += "<span>";
                    html += ds.basic_metrics[metric].name;
                    html += "</span>";
                    html += "</td>"
                }
                $.each([365, 30, 7], function(index, period) {
                    html += '<td class="col-md-3>';
                    var column = ds.getMetrics()[metric].column;
                    var value = ds.getGlobalData()[metric + "_" + period];
                    var netvalue = ds.getGlobalData()["diff_net" + column + "_" + period];
                    var percentagevalue = ds.getGlobalData()["percentage_" + column + "_" + period];
                    percentagevalue = Math.round(percentagevalue * 10) / 10;
                    if (value === undefined) return;
                    var str_percentagevalue = "";
                    if (percentagevalue === 0) {
                        str_percentagevalue = Math.abs(percentagevalue)
                    } else if (netvalue > 0) {
                        str_percentagevalue = "+" + percentagevalue
                    } else if (netvalue < 0) {
                        str_percentagevalue = "-" + Math.abs(percentagevalue)
                    }
                    html += "<span >";
                    html += '<span class="dayschange">Last ' + period + " days:</span>";
                    html += " " + Report.formatValue(value) + "<br>";
                    if (percentagevalue === 0) {
                        html += '<i class="fa fa-arrow-circle-right"></i> <span class="zeropercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    } else if (netvalue > 0) {
                        html += '<i class="fa fa-arrow-circle-up"></i> <span class="pospercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    } else if (netvalue < 0) {
                        html += '<i class="fa fa-arrow-circle-down"></i> <span class="negpercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    }
                    html += "</span><!--col-xs-4-->";
                    html += "</td>"
                });
                html += "</tr></table>";
                $(div).append(html)
            })
        }
    };
    Convert.convertMicrodash = function() {
        var divs = $(".Microdash");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var metric = $(this).data("metric");
                var text = $(this).data("text");
                var ds = Report.getMetricDS(metric)[0];
                var total = ds.getGlobalData()[metric];
                var html = "<div>";
                html += '<div style="float:left">';
                html += '<span class="medium-fp-number">' + Report.formatValue(total);
                html += "</span> " + ds.getMetrics()[metric].name;
                html += "</div>";
                html += '<div id="Microdash" ' + 'class="MetricsEvol" data-data-source="' + ds.getName() + '" data-metrics="' + metric + '" data-min=true style="margin-left:10px; float:left;width:100px; height:25px;"></div>';
                html += '<div style="clear:both"></div><div>';
                $.each([365, 30, 7], function(index, period) {
                    var column = ds.getMetrics()[metric].column;
                    var netvalue = ds.getGlobalData()["diff_net" + column + "_" + period];
                    var percentagevalue = ds.getGlobalData()["percentage_" + column + "_" + period];
                    var value = ds.getGlobalData()[metric + "_" + period];
                    if (value === undefined) return;
                    html += "<span class='dayschange'>" + period + " Days Change</span>:" + Report.formatValue(value) + "&nbsp;";
                    if (netvalue === 0) {
                        html += ""
                    } else if (netvalue > 0) {
                        html += '<i class="icon-circle-arrow-up"></i>';
                        html += "<small>(+" + percentagevalue + "%)</small>&nbsp;"
                    } else if (netvalue < 0) {
                        html += '<i class="icon-circle-arrow-down"></i>';
                        html += "<small>(-" + Math.abs(percentagevalue) + "%)</small>&nbsp;"
                    }
                });
                html += "</div>";
                html += "<div>";
                $(div).append(html)
            })
        }
    };

    function getProjectTitle(project_id, hierarchy) {
        if (hierarchy.hasOwnProperty(project_id) && hierarchy[project_id].title) {
            return hierarchy[project_id].title
        } else {
            return undefined
        }
    }

    function compareProjectTitles(a, b) {
        if (a.project_id < b.project_id) {
            return -1
        } else if (a.project_id > b.project_id) {
            return 1
        } else {
            return 0
        }
    }

    function getParentProjects(project_id, hierarchy) {
        var parent = [];
        var iterate_p = project_id;
        var parent_id = "";
        var aux = {};
        while (hierarchy[iterate_p].hasOwnProperty("parent_project")) {
            parent_id = hierarchy[iterate_p].parent_project;
            aux = hierarchy[parent_id];
            aux.project_id = parent_id;
            parent.push(aux);
            iterate_p = parent_id
        }
        return parent.reverse()
    }

    function getChildrenProjects(project_id, hierarchy) {
        var children = [];
        var aux = {};
        $.each(hierarchy, function(id, p) {
            if (hierarchy[id].parent_project === project_id) {
                aux = hierarchy[id];
                aux.project_id = id;
                children.push(aux)
            }
        });
        children.sort(compareProjectTitles);
        return children
    }

    function composePBreadcrumbsHTMLlast(project_id, children, hierarchy) {
        var html = "";
        var clen = children.length;
        if (clen > 0) {
            children_sort = [];
            children_names = [];
            $.each(children, function(id, value) {
                children_names.push(value.title)
            });
            children_names = children_names.sort();
            $.each(children_names, function(id, name) {
                $.each(children, function(id, value) {
                    if (name === value.title) {
                        children_sort.push(value);
                        return false
                    }
                })
            });
            children = children_sort;
            html += '<li class="dropdown">';
            html += '<span data-toggle="tooltip" title="Project name"> ' + getProjectTitle(project_id, hierarchy) + "</span>";
            html += '&nbsp;<a class="dropdown-toggle" data-toggle="dropdown" href="#">';
            html += '<span data-toggle="tooltip" title="Select subproject" class="badge"> ' + clen + " Subprojects </span></a>";
            html += '<ul class="dropdown-menu scroll-menu">';
            $.each(children, function(id, value) {
                gchildren = getChildrenProjects(value.project_id, hierarchy);
                if (gchildren.length > 0) {
                    html += '<li><a href="project.html?project=' + value.project_id + '">' + value.title + '&nbsp;&nbsp;<span data-toggle="tooltip" title="Number of suprojects" class="badge">' + gchildren.length + '&nbsp;<i class="fa fa-rocket"></i></span></a></li>'
                } else {
                    html += '<li><a href="project.html?project=' + value.project_id + '">' + value.title + "</a></li>"
                }
            });
            html += '<li class="divider"></li>';
            html += '<li><a href="./project_map.html"><i class="fa fa-icon fa-sitemap"></i> Projects treemap</a></li>';
            html += "</ul></li>"
        } else {
            html += "<li>" + getProjectTitle(project_id, hierarchy) + "</li>"
        }
        return html
    }

    function composeProjectBreadcrumbs(project_id) {
        var html = '<ol class="breadcrumbtitle">';
        var hierarchy = Report.getProjectsHierarchy();
        if (hierarchy.length === 0) {
            return ""
        }
        if (project_id === undefined) {
            project_id = "root"
        }
        var children = getChildrenProjects(project_id, hierarchy);
        var parents = getParentProjects(project_id, hierarchy);
        if (parents.length > 0) {
            $.each(parents, function(id, value) {
                if (value.parent_project) {
                    html += '<li><a href="project.html?project=' + value.project_id + '">' + value.title + "</a></li>"
                } else {
                    html += '<li><a href="./">' + value.title + "</a></li>"
                }
            })
        }
        html += composePBreadcrumbsHTMLlast(project_id, children, hierarchy);
        html += "</ol>";
        return html
    }

    function escapeString(string) {
        var aux = "";
        aux = string.replace(" ", "_");
        aux = aux.toLowerCase();
        return aux
    }

    function composeHTMLNestedProjects(project_id, children, hierarchy) {
        var html = "";
        var clen = children.length;
        var epid = project_id;
        var divid = epid.replace(".", "");
        if (clen > 0) {
            html += "<li>";
            html += '<a href="project.html?project=' + epid + '">' + getProjectTitle(project_id, hierarchy) + "</a>";
            html += '&nbsp;<a data-toggle="collapse" data-parent="#accordion" href="#collapse' + divid + '">';
            html += '<span class="badge">' + clen + "&nbsp;subprojects</span></a>";
            html += '<div id="collapse' + divid + '" class="panel-collapse collapse"><ul>';
            $.each(children, function(id, value) {
                gchildren = getChildrenProjects(value.project_id, hierarchy);
                html += composeHTMLNestedProjects(value.project_id, gchildren, hierarchy)
            });
            html += "</ul></li>"
        } else {
            html += '<li><a href="project.html?project=' + project_id + '">' + getProjectTitle(project_id, hierarchy) + "</a></li>"
        }
        return html
    }

    function composeProjectMap() {
        var html = "<ul>";
        var hierarchy = Report.getProjectsHierarchy();
        if (hierarchy.length === 0) {
            return ""
        }
        project_id = "root";
        var children = getChildrenProjects(project_id, hierarchy);
        var parents = getParentProjects(project_id, hierarchy);
        $.each(children, function(id, value) {
            grandchildren = getChildrenProjects(value.project_id, hierarchy);
            html += composeHTMLNestedProjects(value.project_id, grandchildren, hierarchy)
        });
        html += "</ul>";
        return html
    }

    function getSectionName4Release() {
        var result = [];
        var sections = {
            data_sources: "Data sources",
            organization: "Organization",
            project_map: "Project map",
            people: "Contributor",
            company: "Company",
            country: "Country",
            domain: "Domain",
            "scm-companies": "Activity on code repositories by companies",
            "mls-companies": "Activity on mailing lists by companies",
            "its-companies": "Activity on issue trackers by companies"
        };
        url_no_params = document.URL.split("?")[0];
        url_tokens = url_no_params.split("/");
        var section = url_tokens[url_tokens.length - 1].split(".")[0];
        if (section === "project" || section === "index" || section === "release" || section === "") {
            return []
        } else {
            if (sections.hasOwnProperty(section)) {
                result.push([section, sections[section]])
            } else {
                return [
                    ["#", "Unavailable section name"]
                ]
            }
            return result
        }
    }

    function getSectionName() {
        var result = [];
        var sections = {
            mls: "MLS overview",
            irc: "IRC overview",
            slack: "Slack Overview",
            its: "ITS overview",
            storyboard: "Storyboard overview",
            maniphest: "Maniphest overview",
            qaforums: "QA Forums overview",
            scr: "Code Review overview",
            scm: "SCM overview",
            wiki: "Wiki overview",
            confluence: "Confluence overview",
            downloads: "Downloads",
            forge: "Forge releases",
            meetup: "Meetup overview",
            demographics: "Demographics",
            data_sources: "Data sources",
            definitions: "Metrics definitions",
            organization: "Organization",
            project_map: "Project map",
            people: "Contributor",
            company: "Company",
            country: "Country",
            domain: "Domain",
            release: "Companies analysis by release",
            project_comparison: "Project comparison",
            dockerhub: "DockerHub overview"
        };
        var filters = {
            companies: "Activity by companies",
            organizations: "Activity by organizations",
            contributors: "Activity by contributors",
            countries: "Activity by countries",
            domains: "Activity by domains",
            group: "Meetup group",
            next_meetings: "Next meetings",
            projects: "Activity by project",
            repos: "Activity by repositories",
            groups: "Activity by groups",
            states: "Activity by states",
            tags: "Activity by tags",
            past_meetings: "Past meetings",
            backlog: "Backlog"
        };
        var filters2 = {
            repository: "Repository",
            countries: "Activity by countries"
        };
        url_no_params = document.URL.split("?")[0];
        url_tokens = url_no_params.split("/");
        var section = url_tokens[url_tokens.length - 1].split(".")[0];
        if (section === "project" || section === "index" || section === "") {
            return []
        } else if (section === "filter") {
            var filter_by = $.urlParam("filter_by_item");
            var filter_names = $.urlParam("filter_names");
            switch (filter_names) {
                case "company+country":
                    result = [
                        ["company", "Company"],
                        ["Activity by country and company", "Activity by country and company"]
                    ]
            }
            return result
        } else {
            var s_tokens = section.split("-");
            if (s_tokens[0] === "repository") {
                ds_name = $.urlParam("ds");
                s_tokens = [ds_name, "repos", "repository"]
            }
            if (sections.hasOwnProperty(s_tokens[0])) {
                result.push([s_tokens[0], sections[s_tokens[0]]]);
                if (s_tokens.length > 0) {
                    if (filters.hasOwnProperty(s_tokens[1])) {
                        result.push([s_tokens[0] + "-" + s_tokens[1], filters[s_tokens[1]]]);
                        if (s_tokens.length > 2) {
                            if (filters2.hasOwnProperty(s_tokens[2])) {
                                result.push([s_tokens[0], filters2[s_tokens[2]]])
                            }
                        }
                    }
                }
            } else {
                return [
                    ["#", "Unavailable section name"]
                ]
            }
            return result
        }
    }

    function isURLRelease() {
        if ($.urlParam("release") !== null && $.urlParam("release").length > 0) return true;
        else return false
    }

    function composeSideBar(project_id) {
        function getPanelTitle(ds_name, aliases) {
            var panel_title = {
                scm: "Source code management",
                scr: "Code review",
                its: "Tickets",
                its_1: "Tickets 1",
                storyboard: "Storyboard",
                maniphest: "Maniphest",
                mls: "Mailing lists",
                qaforums: "Q&A Forums",
                irc: "IRC",
                slack: "Slack",
                downloads: "Downloads",
                forge: "Forge releases",
                wiki: "Wiki",
                confluence: "Confluence",
                meetup: "Meetup",
                dockerhub: "DockerHub"
            };
            if (aliases.hasOwnProperty(ds_name)) {
                return aliases[ds_name]
            } else {
                return panel_title[ds_name]
            }
        }
        if (project_id === undefined) {
            project_id = "root"
        }
        var html = "";
        var html_extra = "";
        html += '<ul class="nav navmenu-nav">';
        var mele = Report.getMenuElements();
        if (Utils.isReleasePage()) {
            if (Report.getMenuElementsReleases() !== undefined) {
                mele = Report.getMenuElementsReleases()
            }
        }
        var aliases = {};
        if (mele.hasOwnProperty("aliases")) {
            aliases = mele.aliases
        }
        if (project_id === "root") {
            if (mele.hasOwnProperty("scm")) {
                aux = mele.scm;
                ptitle = getPanelTitle("scm", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-code", ptitle, "scm", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("scr")) {
                aux = mele.scr;
                ptitle = getPanelTitle("scr", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-check", ptitle, "scr", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("its")) {
                aux = mele.its;
                ptitle = getPanelTitle("its", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-ticket", ptitle, "its", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("its_1")) {
                aux = mele.its_1;
                ptitle = getPanelTitle("its_1", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-ticket", ptitle, "its_1", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("storyboard")) {
                aux = mele.storyboard;
                ptitle = getPanelTitle("storyboard", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-ticket", ptitle, "storyboard", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("maniphest")) {
                aux = mele.maniphest;
                ptitle = getPanelTitle("maniphest", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-ticket", ptitle, "maniphest", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("mls")) {
                aux = mele.mls;
                ptitle = getPanelTitle("mls", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-envelope-o", ptitle, "mls", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("qaforums")) {
                aux = mele.qaforums;
                ptitle = getPanelTitle("qaforums", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-question", ptitle, "qaforums", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("irc")) {
                aux = mele.irc;
                ptitle = getPanelTitle("irc", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-comment-o", ptitle, "irc", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("slack")) {
                aux = mele.slack;
                ptitle = getPanelTitle("slack", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-comment-o", ptitle, "slack", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("downloads")) {
                aux = mele.downloads;
                ptitle = getPanelTitle("downloads", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-download", ptitle, "downloads", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("forge")) {
                aux = mele.forge;
                ptitle = getPanelTitle("forge", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-umbrella", ptitle, "forge", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("wiki")) {
                aux = mele.wiki;
                ptitle = getPanelTitle("wiki", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-pencil-square-o", ptitle, "wiki", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("confluence")) {
                aux = mele.confluence;
                ptitle = getPanelTitle("confluence", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-pencil-square-o", ptitle, "confluence", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("meetup")) {
                aux = mele.meetup;
                ptitle = getPanelTitle("meetup", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-users", ptitle, "meetup", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("dockerhub")) {
                aux = mele.dockerhub;
                ptitle = getPanelTitle("dockerhub", aliases);
                aux_html = HTMLComposer.sideBarLinks("fa-dockerhub", ptitle, "dockerhub", aux);
                html += aux_html
            }
            if (mele.hasOwnProperty("studies")) {
                aux = mele.studies;
                html += '<li class="dropdown">';
                html += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">';
                html += '<i class="fa fa-lightbulb-o"></i>&nbsp;Studies <b class="caret"></b></a>';
                html += '<ul class="dropdown-menu navmenu-nav">';
                if (aux.indexOf("demographics") >= 0) {
                    html += '<li><a href="demographics.html">&nbsp;Demographics</a></li>'
                }
                if (aux.indexOf("release") >= 0) {
                    aux = Report.getReleaseNames().reverse();
                    latest_release = aux[0];
                    html += '<li><a href="release.html?release=' + latest_release + '">&nbsp;Companies by release</a></li>'
                }
                var e_studies = mele.studies_extra;
                if (e_studies) {
                    $.each(e_studies, function(id, value) {
                        var name, url;
                        name = value[0];
                        url = value[1];
                        html += '<li><a href="' + url + '">&nbsp;' + name + "</a></li>"
                    })
                }
                html += "</ul></li>"
            }
            if (Utils.isReleasePage() === true) {
                current_release = $.urlParam("release");
                html += '<li><a href="data_sources.html?release=' + current_release + '"><i class="fa fa-database"></i> Data sources</a></li>';
                if (mele.hasOwnProperty("project_map")) {
                    html += '<li><a href="project_map.html?release=' + current_release + '"><i class="fa fa-icon fa-sitemap"></i> Project map</a></li>'
                }
            } else {
                html += '<li><a href="data_sources.html"><i class="fa fa-info-circle"></i>&nbsp;Data sources</a></li>';
                if (mele.hasOwnProperty("project_map")) {
                    html += '<li><a href="project_map.html"><i class="fa fa-icon fa-sitemap"></i> Project map</a></li>'
                }
                html += '<li><a href="definitions.html"><i class="fa fa-book"></i>&nbsp;Metrics definitions&nbsp;&nbsp;<span class="label label-danger">New!</span></a></li>'
            }
            if (mele.hasOwnProperty("extra")) {
                aux = mele.extra;
                html_extra += '<li class="sidemenu-divider"></li>';
                html_extra += '<li class="sidemenu-smallheader">More links:</li>';
                $.each(aux, function(id, value) {
                    html_extra += '<li><a href="' + value[1] + '">&nbsp;' + value[0] + "</a></li>"
                })
            }
            html += html_extra
        }
        html += "</ul>";
        return html
    }
    Convert.convertSideBar = function(project_id) {
        var divs = $(".SideNavBar");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if (!div.id) div.id = "SideNavBar";
                var label;
                if (project_id) {
                    label = Report.cleanLabel(project_id)
                }
                var htmlaux = composeSideBar(label);
                $("#" + div.id).append(htmlaux);
                data = Report.getProjectData();
                $(".report_name").text(data.project_name);
                if (Utils.isReleasePage()) $(".report_name").attr("href", "./?release=" + $.urlParam("release"))
            })
        }
    };
    Convert.convertProjectNavBar = function(project_id) {
        var divs = $(".ProjectNavBar");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if (!div.id) div.id = "ProjectNavBar";
                var label;
                if (project_id) {
                    label = Report.cleanLabel(project_id)
                }
                var htmlaux = composeProjectBreadcrumbs(label);
                $("#" + div.id).append(htmlaux)
            })
        }
    };
    Convert.convertNavbar = function() {
        $.get(Report.getHtmlDir() + "navbar.html", function(navigation) {
            $("#Navbar").html(navigation);
            var project_id = Report.getParameterByName("project");
            Convert.convertProjectNavBar(project_id);
            Convert.convertReleaseSelector();
            Convert.convertSideBar(project_id)
        })
    };
    Convert.convertReleaseSelector = function() {
        var releases = Report.getReleaseNames();
        if (releases === undefined) {
            return
        }
        if (releases.length > 0) {
            var divs = $(".ReleaseSelector");
            if (divs.length > 0) {
                $.each(divs, function(id, div) {
                    $(this).empty();
                    if (!div.id) div.id = "ReleaseSelector" + getRandomId();
                    var htmlaux = HTMLComposer.releaseSelector($.urlParam("release"), releases);
                    $("#" + div.id).append(htmlaux)
                })
            }
        }
    };

    function composeSectionBreadCrumb(project_id) {
        var html = '<ol class="breadcrumb">';
        data = Report.getProjectData();
        document.title = data.project_name + " Dashboard";
        if (project_id === undefined) {
            var subsects_b = getSectionName();
            var params = Utils.paramsInURL();
            if (subsects_b.length > 0) {
                html += '<li><a href="./';
                if (Utils.isReleasePage()) html += "?release=" + $.urlParam("release");
                html += '">Project Overview</a></li>';
                var cont_b = 1;
                $.each(subsects_b, function(id, value) {
                    if (subsects_b.length === cont_b) {
                        html += '<li class="active">' + value[1] + "</li>";
                        document.title = value[1] + " | " + data.project_name + " Dashboard"
                    } else {
                        if (Utils.isReleasePage()) {
                            html += '<li><a href="' + value[0] + ".html";
                            html += "?release=" + $.urlParam("release") + '">';
                            html += value[1] + "</a></li>"
                        } else {
                            if (value[0] === "company") {
                                var get_param = $.urlParam("filter_item");
                                html += '<li><a href="' + value[0] + ".html?company=" + get_param + '">' + get_param[0].toUpperCase() + get_param.slice(1) + "</a></li>"
                            } else {
                                html += '<li><a href="' + value[0] + '.html">' + value[1] + "</a></li>"
                            }
                        }
                    }
                    cont_b += 1
                })
            } else {
                html += '<li class="active">Project Overview</li>';
                document.title = "Project Overview | " + data.project_name + " Dashboard"
            }
        } else {
            html += "<li> " + getSectionName() + "</li>";
            document.title = getSectionName() + " | " + data.project_name + " Dashboard"
        }
        html += "</ol>";
        return html
    }
    Convert.convertSectionBreadcrumb = function(project_id) {
        var divs = $(".SectionBreadcrumb");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if (!div.id) div.id = "SectionBreadcrumb";
                var label;
                if (project_id) {
                    label = Report.cleanLabel(project_id)
                }
                var htmlaux = composeSectionBreadCrumb(label);
                $("#" + div.id).append(htmlaux)
            })
        }
    };
    Convert.convertProjectMap = function() {
        var divs = $(".ProjectMap");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if (!div.id) div.id = "ProjectMap";
                var label;
                var htmlaux = composeProjectMap();
                $("#" + div.id).append(htmlaux)
            })
        }
    };
    Convert.convertFooter = function() {
        $.get(Report.getHtmlDir() + "footer.html", function(footer) {
            $("#Footer").html(footer);
            $("#vizjs-lib-version").append(vizjslib_git_tag)
        })
    };
    Convert.convertSummary = function() {
        div_param = "Summary";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                div.id = ds + "-Summary";
                DS.displayGlobalSummary(div.id)
            })
        }
    };

    function sharedStart(array) {
        var A = array.concat().sort(),
            a1 = A[0],
            a2 = A[A.length - 1],
            L = a1.length,
            i = 0,
            delimiter = "_";
        if (A.length <= 1) return "";
        while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
        common_str = a1.substring(0, i);
        index = common_str.lastIndexOf(delimiter);
        if (index > 0) {
            return common_str.slice(0, index + 1)
        }
    }

    function composeDropDownRepo(DS) {
        var repository = Report.getParameterByName("repository");
        if (repository && $.inArray(repository, DS.getReposData()) < 0) return "";
        var dsname = DS.getName();
        var section = "";
        var label_repo = DS.getLabelForRepository();
        var label_repo_plural = DS.getLabelForRepositories();
        if (repository !== undefined) {
            section = repository
        } else {
            section = "All " + label_repo_plural
        }
        html = '<div class="row"><span class="col-md-12">';
        var repo_names = DS.getReposData();
        repo_names.sort();
        var common_str = sharedStart(repo_names);
        html = '<ol class="filterbar"><li>Filtered by ' + label_repo + ":&nbsp;&nbsp;</li>";
        html += '<li><div class="dropdown"><button class="btn btn-default dropdown-toggle" ';
        html += 'type="button" id="dropdownMenu1" data-toggle="dropdown"> ' + section.replace(common_str, "") + " ";
        html += '<span class="caret"></span></button>';
        html += '<ul class="dropdown-menu scroll-menu" role="menu" aria-labelledby="dropdownMenu1">';
        if (repository) {
            html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="' + dsname + '-contributors.html">';
            html += "All " + label_repo_plural;
            html += "</a></li>"
        }
        $.each(repo_names, function(id, value) {
            if (value === repository) return;
            html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="?repository=';
            html += value;
            html += '">';
            html += value.replace(common_str, "");
            html += "</a></li>"
        });
        html += "</ul></div></li></ol>";
        html += "</span></div>";
        return html
    }
    Convert.convertRepositorySelector = function() {
        var divs = $(".repository-selector");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                div.id = ds + "-repository-selector";
                var htmlaux = composeDropDownRepo(DS);
                $("#" + div.id).append(htmlaux)
            })
        }
    };

    function displayReportData() {
        data = Report.getProjectData();
        document.title = data.project_name + " Report by Bitergia";
        if (data.title) document.title = data.title;
        $(".report_date").text(data.date);
        $(".report_name").text(data.project_name);
        str = data.blog_url;
        if (str && str.length > 0) {
            $("#blogEntry").html("<br><a href='" + str + "'>Blog post with some more details</a>");
            $(".blog_url").attr("href", data.blog_url)
        } else {
            $("#more_info").hide()
        }
        str = data.producer;
        if (str && str.length > 0) {
            $("#producer").html(str)
        } else {
            $("#producer").html("<a href='http://bitergia.com'>Bitergia</a>")
        }
        $(".project_name").text(data.project_name);
        $("#project_url").attr("href", data.project_url)
    }
    Convert.convertRefcard = function() {
        $.when($.get(Report.getHtmlDir() + "refcard.html"), $.get(Report.getHtmlDir() + "project-card.html")).done(function(res1, res2) {
            refcard = res1[0];
            projcard = res2[0];
            $("#Refcard").html(refcard);
            displayReportData();
            $.each(Report.getProjectsData(), function(prj_name, prj_data) {
                var new_div = "card-" + prj_name.replace(".", "").replace(" ", "");
                $("#Refcard #projects_info").append(projcard);
                $("#Refcard #projects_info #new_card").attr("id", new_div);
                $.each(Report.getDataSources(), function(i, DS) {
                    if (DS.getProject() !== prj_name) {
                        $("#" + new_div + " ." + DS.getName() + "-info").hide();
                        return
                    }
                    DS.displayData(new_div)
                });
                $("#" + new_div + " #project_name").text(prj_name);
                if (Report.getProjectsDirs.length > 1) $("#" + new_div + " .project_info").append(' <a href="VizGrimoireJS/browser/index.html?data_dir=../../' + prj_data.dir + '">Report</a>');
                $("#" + new_div + " #project_url").attr("href", prj_data.url)
            })
        })
    };
    Convert.convertGlobalData = function() {
        var divs = $(".GlobalData");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var data = DS.getGlobalData();
                var key = $(this).data("field");
                $(this).text(Report.formatValue(data[key], key))
            })
        }
    };
    Convert.convertProjectData = function() {
        var divs = $(".ProjectData");
        var p = Report.getParameterByName("project");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var data = DS.getProjectsGlobalData()[p];
                if (data === undefined) {
                    return
                }
                var key = $(this).data("field");
                $(this).text(Report.formatValue(data[key], key))
            })
        }
    };
    Convert.convertRepositoryData = function() {
        var divs = $(".RepositoryData");
        var p = Report.getParameterByName("repository");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var data = DS.getReposGlobalData()[p];
                if (data === undefined) {
                    return
                }
                var key = $(this).data("field");
                $(this).text(Report.formatValue(data[key], key))
            })
        }
    };
    Convert.convertRadarActivity = function() {
        var div_param = "RadarActivity";
        var divs = $("#" + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty()
            });
            Viz.displayRadarActivity(div_param)
        }
    };
    Convert.convertRadarCommunity = function() {
        var div_param = "RadarCommunity";
        var divs = $("#" + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty()
            });
            Viz.displayRadarCommunity("RadarCommunity")
        }
    };
    Convert.convertTreemap = function() {
        var div_param = "Treemap";
        var divs = $("#" + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty()
            });
            var file = $("#Treemap").data("file");
            $("#Treemap").empty();
            Viz.displayTreeMap("Treemap", file)
        }
    };
    Convert.convertBubbles = function() {
        div_param = "Bubbles";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var radius = $(this).data("radius");
                div.id = ds + "-Bubbles";
                DS.displayBubbles(div.id, radius)
            })
        }
    };

    function loadHTMLEvolParameters(htmldiv, config_viz) {
        config_viz.help = true;
        var help = $(htmldiv).data("help");
        if (help !== undefined) config_viz.help = help;
        config_viz.show_legend = false;
        if ($(htmldiv).data("frame-time")) config_viz.frame_time = true;
        config_viz.graph = $(htmldiv).data("graph");
        if ($(htmldiv).data("min")) {
            config_viz.show_legend = false;
            config_viz.show_labels = true;
            config_viz.show_grid = true;
            config_viz.help = false
        }
        if ($(htmldiv).data("legend")) config_viz.show_legend = true;
        config_viz.ligth_style = false;
        if ($(htmldiv).data("light-style")) {
            config_viz.light_style = true
        }
        if ($(htmldiv).data("custom-title")) {
            config_viz.custom_title = $(htmldiv).data("custom-title")
        }
        if (config_viz.help && $(htmldiv).data("custom-help")) {
            config_viz.custom_help = $(htmldiv).data("custom-help")
        } else {
            config_viz.custom_help = ""
        }
        if ($(htmldiv).data("repo-filter")) {
            config_viz.repo_filter = $(htmldiv).data("repo-filter")
        }
        var start = $(htmldiv).data("start");
        if (start) config_viz.start_time = start;
        var end = $(htmldiv).data("end");
        if (end) config_viz.end_time = end;
        var remove_last_point = $(htmldiv).data("remove-last-point");
        if (remove_last_point) config_viz.remove_last_point = true;
        return config_viz
    }
    Convert.convertMetricsEvol = function() {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = true;
        config_metric.show_labels = true;
        var config = Report.getVizConfig();
        if (config) {
            $.each(config, function(key, value) {
                config_metric[key] = value
            })
        }
        var div_param = "MetricsEvol";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var config_viz = {};
                $.each(config_metric, function(key, value) {
                    config_viz[key] = value
                });
                $(this).empty();
                var metrics = $(this).data("metrics");
                var ds = $(this).data("data-source");
                config_viz.title = $(this).data("title");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                config_viz = loadHTMLEvolParameters(div, config_viz);
                div.id = metrics.replace(/,/g, "-") + "-" + ds + "-metrics-evol-" + this.id;
                div.id = div.id.replace(/\n|\s/g, "");
                DS.displayMetricsEvol(metrics.split(","), div.id, config_viz, $(this).data("convert"))
            })
        }
    };
    Convert.convertMetricsEvolCustomized = function(filter) {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = true;
        config_metric.show_labels = true;
        var config = Report.getVizConfig();
        if (config) {
            $.each(config, function(key, value) {
                config_metric[key] = value
            })
        }
        var div_param = "MetricsEvolCustomized";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (filter !== $(this).data("filter")) return;
                var config_viz = {};
                $.each(config_metric, function(key, value) {
                    config_viz[key] = value
                });
                $(this).empty();
                var metrics = $(this).data("metrics");
                var ds = $(this).data("data-source");
                config_viz.title = $(this).data("title");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                config_viz = loadHTMLEvolParameters(div, config_viz);
                div.id = metrics.replace(/,/g, "-") + "-" + ds + "-metrics-evol-" + this.id;
                div.id = div.id.replace(/\n|\s/g, "");
                DS.displayMetricsEvol(metrics.split(","), div.id, config_viz, $(this).data("convert"))
            })
        }
    };
    Convert.convertMetricsEvolSelector = function() {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = true;
        config_metric.show_labels = true;
        var config = Report.getVizConfig();
        if (config) {
            $.each(config, function(key, value) {
                config_metric[key] = value
            })
        }
        var div_param = "MetricsEvol";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var config_viz = {};
                $.each(config_metric, function(key, value) {
                    config_viz[key] = value
                });
                $(this).empty();
                var metrics = $(this).data("metrics");
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var repository = Report.getParameterByName("repository");
                config_viz.repo_filter = repository;
                config_viz = loadHTMLEvolParameters(div, config_viz);
                div.id = metrics.replace(/,/g, "-") + "-" + ds + "-metrics-evol-" + repository;
                div.id = div.id.replace(/\n|\s/g, "");
                DS.displayMetricsEvol(metrics.split(","), div.id, config_viz, $(this).data("convert"))
            })
        }
    };
    Convert.convertMetricsEvolSet = function() {
        div_param = "MetricsEvolSet";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var all = $(this).data("all");
                var relative = $(this).data("relative");
                var summary_graph = $(this).data("summary-graph");
                var legend = $(this).data("legend-show");
                div.id = ds + "-MetricsEvolSet-" + this.id;
                if (all === true) {
                    div.id = ds + "-All";
                    Viz.displayEnvisionAll(div.id, relative, legend, summary_graph);
                    return false
                }
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                DS.displayEnvision(div.id, relative, legend, summary_graph)
            })
        }
    };
    Convert.convertTimeTo = function() {
        var div_tt = "TimeTo";
        divs = $("." + div_tt);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var ds = $(this).data("data-source");
                var DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var quantil = $(this).data("quantil");
                var type = $(this).data("type");
                div.id = ds + "-time-to-" + type + "-" + quantil;
                if (type === "fix") DS.displayTimeToFix(div.id, quantil);
                if (type === "attention") DS.displayTimeToAttention(div.id, quantil)
            })
        }
    };
    Convert.convertMarkovTable = function() {
        var div_id_mt = "MarkovTable";
        var divs = $("." + div_id_mt);
        var DS, ds;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var title = $(this).data("title");
                div.id = ds + "-markov-table";
                DS.displayMarkovTable(div.id, title)
            })
        }
    };
    Convert.convertLastActivity = function() {
        var all_metrics = Report.getAllMetrics();

        function activityInfo(div, period, label) {
            var html = "<h4>Last " + label + "</h4>";
            $.each(Report.getDataSources(), function(index, DS) {
                var data = DS.getGlobalData();
                $.each(data, function(key, val) {
                    var suffix = "_" + period;
                    if (key.indexOf(suffix, key.length - suffix.length) !== -1) {
                        var metric = key.substring(0, key.length - suffix.length);
                        label = metric;
                        if (all_metrics[metric]) label = all_metrics[metric].name;
                        html += label + ":" + data[key] + "<br>"
                    }
                })
            });
            $(div).append(html)
        }
        var divs = $(".LastActivity");
        var period = null;
        var days = {
            Week: 7,
            Month: 30,
            Quarter: 90,
            Year: 365
        };
        if (divs.length > 0) $.each(divs, function(id, div) {
            period = $(div).data("period");
            activityInfo(div, days[period], period)
        })
    };
    Convert.convertTopByPeriod = function() {
        var div_id_top = "TopByPeriod";
        var divs = $("." + div_id_top);
        var DS, ds;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var show_all = false;
                if ($(this).data("show_all")) show_all = true;
                var top_metric = $(this).data("metric");
                var npeople = $(this).data("limit");
                var is_release = Utils.isReleasePage();
                var html = HTMLComposer.TopByPeriod(ds, top_metric, npeople, is_release);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertTop = function() {
        var div_id_top = "Top";
        var divs = $("." + div_id_top);
        var DS, ds;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var show_all = false;
                if ($(this).data("show_all")) show_all = true;
                var top_metric = $(this).data("metric");
                var limit = $(this).data("limit");
                var graph = $(this).data("graph");
                var people_links = $(this).data("people_links");
                var threads_links = $(this).data("threads_links");
                var period = $(this).data("period");
                var period_all = $(this).data("period_all");
                var repository = Report.getParameterByName("repository");
                div.id = ds + "-" + div_id_top + unique++;
                if (graph) {
                    div.id += "-" + graph
                }
                if (period === undefined && period_all === undefined) {
                    period_all = true
                }
                if (limit === undefined) {
                    limit = 10
                }
                DS.displayTop(div, show_all, top_metric, period, period_all, graph, limit, people_links, threads_links, repository)
            })
        }
    };
    Convert.convertTablePastEvents = function() {
        var div_id_top = "TablePastEvents";
        var divs = $("." + div_id_top);
        var DS, ds;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                if (ds !== "eventizer") return;
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var show_all = false;
                var top_metric = $(this).data("metric");
                var period = $(this).data("period");
                var period_all = $(this).data("period_all");
                var headers = $(this).data("headers");
                var columns = $(this).data("columns");
                var limit = $(this).data("limit");
                div.id = ds + "-" + div_id_top + unique++;
                if (period === undefined && period_all === undefined) {
                    period_all = true
                }
                if (limit === undefined) {
                    limit = 100
                }
                DS.displayTablePastEvents(div, headers.split(","), columns.split(","), limit)
            })
        }
    };
    Convert.convertTableFutureEvents = function() {
        var div_id_top = "TableFutureEvents";
        var divs = $("." + div_id_top);
        var DS, ds;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                if (ds !== "eventizer") return;
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var show_all = false;
                var top_metric = $(this).data("metric");
                var period = $(this).data("period");
                var period_all = $(this).data("period_all");
                var headers = $(this).data("headers");
                var columns = $(this).data("columns");
                var limit = $(this).data("limit");
                div.id = ds + "-" + div_id_top + unique++;
                if (period === undefined && period_all === undefined) {
                    period_all = true
                }
                if (limit === undefined) {
                    limit = 100
                }
                DS.displayTableFutureEvents(div, headers.split(","), columns.split(","), limit)
            })
        }
    };
    Convert.convertTopFilter = function() {
        var div_id_top = "TopFilter";
        var divs = $("." + div_id_top);
        var DS;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                var opt = readHTMLOpts($(this));
                DS = Report.getDataSourceByName(opt.ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                div.id = opt.ds + "-" + div_id_top + unique++;
                if (opt.limit === undefined) {
                    opt.limit = 10
                }
                if (DS.getName() === "eventizer") {
                    var desc_metrics = DS.getMetrics();
                    var data = DS.getReposDataFull();
                    $.each(data.name, function(id, value) {
                        data.name[id] = '<a href="./meetup-group.html?repository=' + data.name[id] + '">' + data.name[id] + "</a>"
                    });
                    if (opt.ratio === undefined) {
                        Table.meetupGroupsTable(div, data, opt.headers.split(","), opt.cols.split(","))
                    } else {
                        Table.meetupGroupsTable(div, data, opt.headers.split(","), opt.cols.split(","), opt.ratio.split(","), opt.ratio_header)
                    }
                }
            })
        }
    };

    function readHTMLOpts(widget) {
        var myobj = {};
        myobj.ds = widget.data("data-source");
        myobj.top_metric = widget.data("metric");
        myobj.limit = widget.data("limit");
        myobj.period = widget.data("period");
        myobj.period_all = widget.data("period_all");
        myobj.cols = widget.data("columns");
        myobj.headers = widget.data("headers");
        myobj.ratio = widget.data("ratio");
        myobj.ratio_header = widget.data("ratio-header");
        return myobj
    }
    Convert.convertPersonMetrics = function(upeople_id, upeople_identifier) {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        divs = $(".PersonMetrics");
        if (divs.length) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var metrics = $(this).data("metrics");
                config_metric.show_legend = false;
                config_metric.help = false;
                if ($(this).data("frame-time")) config_metric.frame_time = true;
                if ($(this).data("legend")) config_metric.show_legend = true;
                if ($(this).data("person_id")) upeople_id = $(this).data("person_id");
                if ($(this).data("person_name")) upeople_identifier = $(this).data("person_name");
                div.id = metrics.replace(/,/g, "-") + "-people-metrics";
                DS.displayMetricsPeople(upeople_id, upeople_identifier, metrics.split(","), div.id, config_metric)
            })
        }
    };

    function getRandomId() {
        return Math.floor(Math.random() * 1e3 + 1)
    }
    Convert.convertPersonAffiliation = function(upeople_id, upeople_identifier) {
        var divs = $(".PersonAffiliation"),
            name, email;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if ($(this).data("person_id")) upeople_id = $(this).data("person_id");
                if (!div.id) div.id = "PersonData" + "-" + upeople_id + "-" + getRandomId();
                var data = Report.getPeopleIdentities()[upeople_id];
                if (data && data.affiliation !== undefined && data.affiliation !== null) {
                    html = HTMLComposer.personAffiliation(data.affiliation);
                    $("#" + div.id).append(html)
                }
            })
        }
    };
    Convert.convertPersonCountry = function(upeople_id, upeople_identifier) {
        var divs = $(".PersonCountry");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if ($(this).data("person_id")) upeople_id = $(this).data("person_id");
                if (!div.id) div.id = "PersonData" + "-" + upeople_id + "-" + getRandomId();
                var data = Report.getPeopleIdentities()[upeople_id];
                if (data && data.country !== undefined && data.country !== null) {
                    html = HTMLComposer.personCountry(data.country);
                    $("#" + div.id).append(html)
                }
            })
        }
    };
    Convert.convertPersonData = function(upeople_id, upeople_identifier) {
        var divs = $(".PersonData"),
            name, email;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                if ($(this).data("person_id")) upeople_id = $(this).data("person_id");
                if (!div.id) div.id = "PersonData" + "-" + upeople_id + "-" + getRandomId();
                var data = Report.getPeopleIdentities()[upeople_id];
                if (data) {
                    name = DataProcess.selectPersonName(data);
                    country = data.country;
                    aff = data.affiliation;
                    email = DataProcess.selectPersonEmail(data);
                    email = "(" + DataProcess.hideEmail(email) + ")"
                } else {
                    if (upeople_identifier !== undefined) name = upeople_identifier;
                    else name = upeople_id;
                    email = ""
                }
                html = HTMLComposer.personName(name, email);
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.personSummaryBlock = function(upeople_id) {
        var divs = $(".PersonSummaryBlock");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                ds_name = $(this).data("data-source");
                ds_realname = $(this).data("data-realname");
                metric_name = $(this).data("metrics");
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                if (DS.getPeopleMetricsData()[upeople_id].length === 0) return;
                var html = HTMLComposer.personDSBlock(ds_name, metric_name, ds_realname);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertPersonSummary = function(upeople_id, upeople_identifier) {
        var divs = $(".PersonSummary");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if ($(this).data("person_id")) upeople_id = $(this).data("person_id");
                if ($(this).data("person_name")) upeople_identifier = $(this).data("person_name");
                div.id = ds + "-refcard-people";
                DS.displayPeopleSummary(div.id, upeople_id, upeople_identifier, DS)
            })
        }
    };
    Convert.convertPeople = function(upeople_id, upeople_identifier) {
        if (upeople_id === undefined) upeople_id = Report.getParameterByName("id");
        if (upeople_identifier === undefined) upeople_identifier = Report.getParameterByName("name");
        if (upeople_id === undefined) return;
        if (Loader.check_people_item(upeople_id) === false) {
            $.each(Report.getDataSources(), function(index, DS) {
                Loader.data_load_people_item(upeople_id, DS, Convert.convertPeople)
            });
            return
        }
        Convert.personSummaryBlock(upeople_id);
        Convert.convertPersonData(upeople_id, upeople_identifier);
        Convert.convertPersonCountry(upeople_id, upeople_identifier);
        Convert.convertPersonAffiliation(upeople_id, upeople_identifier);
        Convert.convertPersonSummary(upeople_id, upeople_identifier);
        Convert.convertPersonMetrics(upeople_id, upeople_identifier);
        Convert.activateHelp()
    };

    function dataFilterAvailable(filter_name, item_name) {
        if (filter_name === "repos") {
            if (DS.getReposGlobalData()[item_name] === undefined || DS.getReposGlobalData()[item_name].length === 0) return false
        } else if (filter_name === "companies") {
            if (DS.getCompaniesGlobalData()[item_name] === undefined || DS.getCompaniesGlobalData()[item_name].length === 0) return false
        } else if (filter_name === "countries") {
            if (DS.getCountriesGlobalData()[item_name] === undefined || DS.getCountriesGlobalData()[item_name].length === 0) return false
        } else if (filter_name === "companies") {
            if (DS.getDomainsGlobalData()[item_name] === undefined || DS.getDomainsGlobalData()[item_name].length === 0) return false
        }
        return true
    }
    Convert.repositoryDSBlock = function(repo_id) {
        var divs = $(".FilterDSBlock");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                ds_name = $(this).data("data-source");
                ds_realname = $(this).data("data-realname");
                filter_name = $(this).data("filter");
                aux = $(this).data("metrics");
                metric_names = aux.split(",");
                $.each(metric_names, function(id, value) {
                    metric_names[id] = metric_names[id].replace(/:/g, ",")
                });
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                if (dataFilterAvailable(filter_name, repo_id)) {
                    var html = HTMLComposer.filterDSBlock(ds_name, filter_name, metric_names, ds_realname);
                    if (!div.id) div.id = "Parsed" + getRandomId();
                    $("#" + div.id).append(html)
                }
            })
        }
    };
    Convert.convertDSSummaryBlock = function(upeople_id) {
        var divs = $(".DSSummaryBlock");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                ds_name = $(this).data("data-source");
                ds_realname = $(this).data("data-realname");
                box_labels = $(this).data("box-labels");
                box_metrics = $(this).data("box-metrics");
                ts_metrics = $(this).data("ts-metrics");
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var html = HTMLComposer.DSBlock(ds_name, box_labels, box_metrics, ts_metrics, ds_realname);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.companyDSBlock = function(repo_id) {
        var divs = $(".CompanyDSBlock");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                var ds_name = $(this).data("data-source"),
                    ds_realname = $(this).data("data-realname"),
                    company_name = Utils.getParameter("company").replace("%20", " "),
                    filter_name = "companies",
                    top_metric = $(this).data("top-metric");
                var aux = $(this).data("metrics");
                var metric_names = aux.split(",");
                $.each(metric_names, function(id, value) {
                    metric_names[id] = metric_names[id].replace(/:/g, ",")
                });
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                if (dataFilterAvailable(filter_name, repo_id)) {
                    var html = HTMLComposer.CompanyDSBlock(company_name, ds_name, filter_name, metric_names, top_metric, ds_realname);
                    if (!div.id) div.id = "Parsed" + getRandomId();
                    $("#" + div.id).append(html)
                }
                Demographics.widget()
            })
        }
    };
    Convert.convertDSSummaryBlockProjectFiltered = function(upeople_id) {
        var divs = $(".DSSummaryBlockProjectFiltered");
        var pname = Report.getParameterByName("project");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                ds_name = $(this).data("data-source");
                box_labels = $(this).data("box-labels");
                box_metrics = $(this).data("box-metrics");
                ts_metrics = $(this).data("ts-metrics");
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getProjectsGlobalData()[pname] === undefined) return;
                if (DS.getProjectsGlobalData()[pname].length === 0) return;
                var html = HTMLComposer.DSBlockProject(ds_name, box_labels, box_metrics, ts_metrics, pname);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertOverallSummaryBlock = function() {
        var divs = $(".OverallSummaryBlock");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                var html = HTMLComposer.overallSummaryBlock();
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertDemographics = function() {
        var divs = $(".Demographics");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var period = $(this).data("period");
                div.id = "Demographics" + "-" + ds + "-" + "-" + period;
                DS.displayDemographics(div.id, period)
            })
        }
    };
    Convert.convertOldestChangesets = function() {
        var divs = $(".OldestChangesets");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                div.id = "OldestChangesets" + "-" + ds + "-" + "-" + getRandomId();
                var headers = $(this).data("headers");
                var columns = $(this).data("columns");
                DS.displayOldestChangesets(div, headers.split(","), columns.split(","))
            })
        }
    };
    Convert.convertOldestChangesetsByAff = function() {
        var divs = $(".OldestChangesetsByAffiliation");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                div.id = "OldestChangesetsByAffiliation" + "-" + ds + "-" + "-" + getRandomId();
                var headers = $(this).data("headers");
                var columns = $(this).data("columns");
                DS.displayOldestChangesetsByAff(div, headers.split(","), columns.split(","))
            })
        }
    };
    Convert.convertMostActiveChangesets = function() {
        var divs = $(".MostActiveChangesets");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                div.id = "MostActiveChangesets" + "-" + ds + "-" + "-" + getRandomId();
                var headers = $(this).data("headers");
                var columns = $(this).data("columns");
                DS.displayMostActiveChangesets(div, headers.split(","), columns.split(","))
            })
        }
    };

    function filterItemsConfig() {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        config_metric.show_legend = false;
        return config_metric
    }
    Convert.getRealItem = function(ds, filter, item) {
        var map = Report.getReposMap();
        if (map === undefined || map.length === 0) {
            if ($.inArray(item, ds.getReposData()) > -1) return item;
            else return null
        }
        var map_item = null;
        if (filter === "repos") {
            var rdata = ds.getReposMetricsData()[item];
            if (rdata === undefined) {
                $.each(map, function(id, repos) {
                    $.each(Report.getDataSources(), function(index, DS) {
                        if (repos[DS.getName()] === item) {
                            map_item = repos[ds.getName()];
                            return false
                        }
                    });
                    if (map_item !== null) return false
                })
            } else map_item = item
        } else map_item = item;
        return map_item
    };
    Convert.convertFilterItemsSummary = function(filter) {
        var divlabel = "FilterItemsSummary";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                div.id = ds + "-" + divlabel;
                $(this).empty();
                if (filter === "repos") DS.displayReposSummary(div.id, DS);
                if (filter === "countries") DS.displayCountriesSummary(div.id, DS);
                if (filter === "companies") DS.displayCompaniesSummary(div.id, DS);
                if (filter === "domains") DS.displayDomainsSummary(div.id, DS);
                if (filter === "projects") DS.displayProjectsSummary(div.id, DS)
            })
        }
    };
    Convert.convertFilterItemsGlobal = function(filter) {
        var config_metric = filterItemsConfig();
        var divlabel = "FilterItemsGlobal";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                var metric = $(this).data("metric");
                var show_others = $(this).data("show-others");
                var order_by = $(this).data("order-by");
                config_metric.show_legend = $(this).data("legend");
                if ($("#" + $(this).data("legend-div")).length > 0) {
                    config_metric.legend = {
                        container: $(this).data("legend-div")
                    }
                } else config_metric.legend = {
                    container: null
                };
                config_metric.graph = $(this).data("graph");
                config_metric.title = $(this).data("title");
                config_metric.show_title = 1;
                div.id = metric + "-" + divlabel;
                $(this).empty();
                if (filter === "repos") DS.displayMetricReposStatic(metric, div.id, config_metric, order_by, show_others);
                if (filter === "countries") DS.displayMetricCountriesStatic(metric, div.id, config_metric, order_by, show_others);
                if (filter === "companies") DS.displayMetricCompaniesStatic(metric, div.id, config_metric, order_by, show_others);
                if (filter === "domains") DS.displayMetricDomainsStatic(metric, div.id, config_metric, order_by, show_others);
                if (filter === "projects") DS.displayMetricProjectsStatic(metric, div.id, config_metric, order_by, show_others)
            })
        }
    };
    Convert.convertFilterItemsNav = function(filter, page) {
        var divlabel = "FilterItemsNav";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            var cont = 0;
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                if ($(this).data("page")) page = $(this).data("page");
                order_by = $(this).data("order-by");
                div.id = ds + "-" + divlabel + "-" + cont;
                cont += 1;
                $(this).empty();
                if (filter === "repos") DS.displayItemsNav(div.id, filter, page, order_by);
                else if (filter === "countries") DS.displayItemsNav(div.id, filter, page);
                else if (filter === "companies") DS.displayItemsNav(div.id, filter, page);
                else if (filter === "domains") DS.displayItemsNav(div.id, filter, page);
                else if (filter === "projects") DS.displayItemsNav(div.id, filter, page)
            })
        }
    };
    Convert.convertFilterItemsMetricsEvol = function(filter) {
        var config_metric = filterItemsConfig();
        var divlabel = "FilterItemsMetricsEvol";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                var metric = $(this).data("metric");
                var stacked = false;
                if ($(this).data("stacked")) stacked = true;
                if ($(this).data("min")) {
                    config_viz.show_legend = false;
                    config_viz.show_labels = true;
                    config_viz.show_grid = true;
                    config_viz.help = false
                }
                var start = $(this).data("start");
                var end = $(this).data("end");
                config_metric.lines = {
                    stacked: stacked
                };
                if ($("#" + $(this).data("legend-div")).length > 0) {
                    config_metric.legend = {
                        container: $(this).data("legend-div")
                    }
                } else config_metric.legend = {
                    container: null
                };
                config_metric.show_legend = $(this).data("legend");
                config_metric.mouse_tracker = $(this).data("mouse_tracker");
                var remove_last_point = $(this).data("remove-last-point");
                if (remove_last_point) config_metric.remove_last_point = true;
                div.id = metric + "-" + divlabel;
                $(this).empty();
                if (filter === "companies") DS.displayMetricCompanies(metric, div.id, config_metric, start, end);
                else if (filter === "repos") DS.displayMetricRepos(metric, div.id, config_metric, start, end);
                else if (filter === "domains") DS.displayMetricDomains(metric, div.id, config_metric, start, end);
                else if (filter === "projects") DS.displayMetricProjects(metric, div.id, config_metric, start, end)
            })
        }
    };
    Convert.convertFilterItemsMiniCharts = function(filter, page) {
        var config_metric = filterItemsConfig();
        var divlabel = "FilterItemsMiniCharts";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data("data-source");
                ds_realname = $(this).data("data-realname");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                if ($(this).data("page")) page = $(this).data("page");
                var metrics = $(this).data("metrics");
                var order_by = $(this).data("order-by");
                var show_links = true;
                if ($(this).data("show_links") !== undefined) show_links = $(this).data("show_links");
                var start = $(this).data("start");
                var end = $(this).data("end");
                var convert = $(this).data("convert");
                if ($(this).data("frame-time")) config_metric.frame_time = true;
                var remove_last_point = $(this).data("remove-last-point");
                if (remove_last_point) config_metric.remove_last_point = true;
                div.id = metrics.replace(/,/g, "-") + "-" + filter + "-" + divlabel;
                $(this).empty();
                if (filter === "repos") DS.displayReposList(metrics.split(","), div.id, config_metric, order_by, page, show_links, start, end, convert, ds_realname);
                else if (filter === "countries") DS.displayCountriesList(metrics.split(","), div.id, config_metric, order_by, page, show_links, start, end, convert);
                else if (filter === "companies") DS.displayCompaniesList(metrics.split(","), div.id, config_metric, order_by, page, show_links, start, end, convert);
                else if (filter === "domains") DS.displayDomainsList(metrics.split(","), div.id, config_metric, order_by, page, show_links, start, end, convert);
                else if (filter === "projects") DS.displayProjectsList(metrics.split(","), div.id, config_metric, order_by, page, show_links, start, end, convert)
            })
        }
    };
    Convert.convertFilterItemData = function(filter, item) {
        var divs = $(".FilterItemData");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var label = Report.cleanLabel(item);
                if (!div.id) div.id = "FilterItemData" + getRandomId();
                html = HTMLComposer.itemName(label, filter);
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertFilterItemSummary = function(filter, item) {
        var divlabel = "FilterItemSummary";
        divs = $("." + divlabel);
        if (item !== null && divs.length > 0) {
            $.each(divs, function(id, div) {
                var real_item = item;
                ds = $(this).data("data-source");
                ds_realname = $(this).data("data-realname");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                if ($(this).data("item")) real_item = $(this).data("item");
                div.id = ds + "-" + filter + "-" + divlabel;
                $(this).empty();
                if (filter === "repos") {
                    DS.displayRepoSummary(div.id, real_item, DS, ds_realname)
                } else if (filter === "countries") DS.displayCountrySummary(div.id, real_item, DS);
                else if (filter === "companies") DS.displayCompanySummary(div.id, real_item, DS);
                else if (filter === "domains") DS.displayDomainSummary(div.id, real_item, DS);
                else if (filter === "projects") DS.displayProjectSummary(div.id, real_item, DS)
            })
        }
    };
    Convert.convertFilterItemMicrodashText = function(filter, item) {
        var divs = $(".FilterItemMicrodashText");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                $(this).empty();
                var global_data;
                var real_item = item;
                var metric = $(this).data("metric");
                var show_name = $(this).data("name");
                var ds = Report.getMetricDS(metric)[0];
                if (ds === undefined) return;
                if (filter === "projects") {
                    global_data = ds.getProjectsGlobalData()[item]
                } else if (filter === "repos") {
                    global_data = ds.getReposGlobalData()[item]
                } else {
                    return
                }
                if (global_data === undefined) {
                    return
                }
                var html = '<div class="row">';
                if (show_name) {
                    html += '<div class="col-md-3">';
                    html += '<span class="dayschange">' + ds.basic_metrics[metric].name + "</span>";
                    html += "</div>"
                }
                $.each([365, 30, 7], function(index, period) {
                    var column = ds.getMetrics()[metric].column;
                    var value = global_data[metric + "_" + period];
                    var netvalue = global_data["diff_net" + column + "_" + period];
                    var percentagevalue = global_data["percentage_" + column + "_" + period];
                    percentagevalue = Math.round(percentagevalue * 10) / 10;
                    if (value === undefined) return;
                    var str_percentagevalue = "";
                    if (netvalue > 0) str_percentagevalue = "+" + percentagevalue;
                    if (netvalue < 0) str_percentagevalue = "-" + Math.abs(percentagevalue);
                    if (show_name) {
                        html += '<div class="col-md-3">'
                    } else {
                        html += '<div class="col-md-4">'
                    }
                    html += '<span class="dayschange">Last ' + period + " days:</span>";
                    html += " " + Report.formatValue(value) + "<br>";
                    if (netvalue === 0) {
                        html += '<i class="fa fa-arrow-circle-right"></i> <span class="zeropercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    } else if (netvalue > 0) {
                        html += '<i class="fa fa-arrow-circle-up"></i> <span class="pospercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    } else if (netvalue < 0) {
                        html += '<i class="fa fa-arrow-circle-down"></i> <span class="negpercent">&nbsp;' + str_percentagevalue + "%</span>&nbsp;"
                    }
                    html += "</div><!--col-md-4-->"
                });
                html += "</div><!--row-->";
                $(div).append(html)
            })
        }
    };
    Convert.convertFilterItemMetricsEvol = function(filter, item) {
        var config_metric = filterItemsConfig();
        var divlabel = "FilterItemMetricsEvol";
        divs = $("." + divlabel);
        if (item !== null && divs.length > 0) {
            $.each(divs, function(id, div) {
                var real_item = item;
                var metrics = $(this).data("metrics");
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                if ($(this).data("item")) real_item = $(this).data("item");
                config_metric = loadHTMLEvolParameters(div, config_metric);
                div.id = Report.cleanLabel(item).replace(/ /g, "_") + "-";
                div.id += metrics.replace(/,/g, "-") + "-" + ds + "-" + filter + "-" + divlabel;
                $(this).empty();
                if (filter === "repos") {
                    DS.displayMetricsRepo(real_item, metrics.split(","), div.id, config_metric, $(this).data("convert"))
                } else if (filter === "countries") {
                    DS.displayMetricsCountry(real_item, metrics.split(","), div.id, config_metric)
                } else if (filter === "companies") {
                    DS.displayMetricsCompany(real_item, metrics.split(","), div.id, config_metric)
                } else if (filter === "domains") {
                    DS.displayMetricsDomain(real_item, metrics.split(","), div.id, config_metric)
                } else if (filter === "projects") {
                    DS.displayMetricsProject(real_item, metrics.split(","), div.id, config_metric)
                }
            })
        }
    };
    Convert.convertFilterItemTop = function(filter, item) {
        var divlabel = "FilterItemTop";
        divs = $("." + divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var real_item = item;
                $(this).empty();
                ds = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                if (filter === undefined) filter = $(this).data("filter");
                if (filter !== $(this).data("filter")) return;
                if (!filter) return;
                if ($(this).data("item")) real_item = $(this).data("item");
                var metric = $(this).data("metric");
                var period = $(this).data("period");
                var titles = $(this).data("titles");
                var height = $(this).data("height");
                var people_links = $(this).data("people_links");
                div.id = metric + "-" + ds + "-" + filter + "-" + divlabel + "-" + getRandomId();
                $(this).empty();
                div.className = "";
                if (filter === "companies") {
                    DS.displayTopCompany(real_item, div, metric, period, titles, height, people_links)
                } else if (filter === "repos") {
                    DS.displayTopRepo(real_item, div, metric, period, titles, height, people_links)
                }
            })
        }
    };
    Convert.convertSmartLinks = function() {
        var divs = $(".SmartLinks");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                target_page = $(this).data("target");
                label = $(this).data("label");
                var html = HTMLComposer.smartLinks(target_page, label);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertMetricDesc = function() {
        var divs = $(".MetricDesc");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                var metric = $(this).data("metric");
                var ds_name = $(this).data("data-source");
                var ds = Report.getDataSourceByName(ds_name);
                var content = div.innerHTML;
                var html = HTMLComposer.metricDesc(ds, metric, content);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).replaceWith(html)
            })
        }
    };
    Convert.companyFilters = function() {
        var divs = $(".CompanyFilters");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                if (div.id.indexOf("Parsed") >= 0) return;
                company_name = Report.getParameterByName("company");
                var html = HTMLComposer.companyFilters(company_name);
                if (!div.id) div.id = "Parsed" + getRandomId();
                $("#" + div.id).append(html)
            })
        }
    };
    Convert.convertFilterStudyItem = function(filter, item) {
        var convertfn = Convert.convertFilterStudyItem;
        if (convertfn.done === undefined) {
            convertfn.done = {}
        } else if (convertfn.done[filter] === true) return;
        if (filter === "repositories") filter = "repos";
        if (item === undefined) {
            if (filter === "repos") item = Report.getParameterByName("repository");
            if (filter === "countries") item = Report.getParameterByName("country");
            if (filter === "companies") item = Report.getParameterByName("company");
            if (filter === "domains") item = Report.getParameterByName("domain");
            if (filter === "projects") item = Report.getParameterByName("project")
        }
        if (!item) return;
        if (Loader.FilterItemCheck(item, filter) === false) return;
        Convert.repositoryDSBlock(item);
        if (filter === "companies") {
            Convert.companyDSBlock(item)
        }
        Convert.convertDSSummaryBlockProjectFiltered();
        Convert.convertFilterItemData(filter, item);
        Convert.convertFilterItemSummary(filter, item);
        Convert.convertFilterItemMetricsEvol(filter, item);
        Convert.convertFilterItemTop(filter, item);
        Convert.convertFilterItemMicrodashText(filter, item);
        Convert.convertProjectData();
        Convert.convertRepositoryData();
        Convert.activateHelp();
        Convert.convertMetricsEvolSelector();
        convertfn.done[filter] = true
    };
    Convert.activateHelp = function() {
        $(".help").popover({
            html: true,
            trigger: "manual"
        }).click(function(e) {
            $(this).popover("toggle");
            e.stopPropagation()
        })
    };
    Convert.convertFilterStudy = function(filter) {
        var page = Report.getCurrentPage();
        if (page === null) {
            page = Report.getParameterByName("page");
            if (page !== undefined) Report.setCurrentPage(page)
        }
        if (page === undefined) {
            if ($("[class^='FilterItems']").length > 0) {
                page = 1;
                Report.setCurrentPage(page)
            } else return
        }
        if (filter === "repositories") filter = "repos";
        if (Loader.check_filter_page(page, filter) === false) {
            $.each(Report.getDataSources(), function(index, DS) {
                Loader.data_load_items_page(DS, page, Convert.convertFilterStudy, filter)
            });
            return
        }
        Convert.convertFilterItemsSummary(filter);
        Convert.convertFilterItemsGlobal(filter);
        Convert.convertFilterItemsNav(filter, page);
        Convert.convertFilterItemsMetricsEvol(filter);
        Convert.convertFilterItemsMiniCharts(filter, page)
    };
    Convert.convertDSTable = function() {
        var dst = "DataSourcesTable";
        var divs = $("." + dst);
        var DS, ds;
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                $(this).empty();
                div.id = dst + unique++;
                Viz.displayDataSourcesTable(div)
            })
        }
    };
    Convert.convertBasicDivs = function() {
        Convert.convertNavbar();
        Convert.convertSmartLinks();
        Convert.convertMetricDesc();
        Convert.convertSectionBreadcrumb();
        Convert.convertProjectMap();
        Convert.convertFooter();
        Convert.convertOverallSummaryBlock();
        Convert.convertDSSummaryBlock();
        Convert.convertDSTable();
        Convert.convertGlobalData();
        Convert.convertSummary();
        Convert.convertTopByPeriod();
        Convert.companyFilters();
        Convert.convertOldestChangesets();
        Convert.convertOldestChangesetsByAff();
        Convert.convertMostActiveChangesets()
    };
    Convert.convertBasicDivsMisc = function() {
        Convert.convertRadarActivity();
        Convert.convertRadarCommunity();
        Convert.convertTreemap();
        Convert.convertBubbles()
    };
    Convert.convertBasicMetrics = function(config) {
        var item = Report.getParameterByName("repository");
        if (item === undefined) Convert.convertMetricsEvol();
        Convert.convertTimeTo();
        Convert.convertMarkovTable()
    };
    Convert.convertFilterTop = function(filter) {
        var item = Report.getParameterByName("repository");
        if (item !== undefined) {
            if (Loader.filterTopCheck(item, filter) === false) return
        }
        Convert.convertTop();
        Convert.convertTableFutureEvents();
        Convert.convertTablePastEvents();
        Convert.convertRepositorySelector();
        Convert.convertTopFilter()
    }
})();
if (Report === undefined) var Report = {};
(function() {
    var project_data = null,
        markers = null,
        viz_config = null,
        gridster = {},
        data_sources = [],
        report_config = null,
        html_dir = "",
        menu_elements;
    var data_dir = "data/json";
    var config_dir = "config";
    var default_data_dir = "data/json";
    var default_html_dir = "";
    var projects_dirs = [default_data_dir];
    var projects_data = {};
    var projects_datasources = {};
    var repos_map;
    Report.all_json_file = data_dir + "/all.json";
    var project_file = config_dir + "/project-info.json";
    viz_config_file = data_dir + "/viz_cfg.json";
    markers_file = data_dir + "/markers.json";
    repos_map_file = data_dir + "/repos-map.json";
    projects_hierarchy_file = data_dir + "/projects_hierarchy.json";
    menu_elements_file = config_dir + "/menu-elements.json";
    var page_size = 10,
        page = null;
    var project_people_identities = {};
    Report.createDataSources = createDataSources;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getVizConfig = getVizConfig;
    Report.getProjectsHierarchy = getProjectsHierarchy;
    Report.getMenuElements = getMenuElements;
    Report.getMenuElementsReleases = getMenuElementsReleases;
    Report.getReleaseNames = getReleaseNames;
    Report.getThreadsSite = getThreadsSite;
    Report.getGerritSite = getGerritSite;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getCurrentPage = function() {
        return page
    };
    Report.setCurrentPage = function(current_page) {
        page = current_page
    };
    Report.getPageSize = function() {
        return page_size
    };
    Report.setPageSize = function(size) {
        page_size = size
    };
    Report.getProjectData = getProjectData;
    Report.getProjectsData = getProjectsData;
    Report.convertStudies = convertStudies;
    Report.getDataSources = function() {
        return data_sources
    };
    Report.registerDataSource = function(backend) {
        data_sources.push(backend)
    };
    Report.setHtmlDir = function(dir) {
        html_dir = dir
    };
    Report.getHtmlDir = function() {
        return html_dir
    };
    Report.getDataDir = function() {
        return data_dir
    };
    Report.setDataDir = function(dataDir) {
        data_dir = dataDir;
        project_file = dataDir + "/project-info.json";
        config_file = dataDir + "/viz_cfg.json";
        markers_file = dataDir + "/markers.json";
        repos_mapping_file = data_dir + "/repos-mapping.json";
        projects_hierarchy_file = data_dir + "/projects_hierarchy.json"
    };

    function getMarkers() {
        return markers
    }
    Report.setMarkers = function(data) {
        markers = data
    };
    Report.getMarkersFile = function() {
        return markers_file
    };
    Report.getReposMap = function() {
        return repos_map
    };
    Report.setReposMap = function(data) {
        repos_map = data
    };
    Report.getReposMapFile = function() {
        return repos_map_file
    };

    function getVizConfig() {
        return viz_config
    }
    Report.setVizConfig = function(cfg) {
        viz_config = cfg
    };
    Report.getVizConfigFile = function() {
        return viz_config_file
    };

    function getProjectsHierarchy() {
        return projects_hierarchy
    }
    Report.setProjectsHierarchy = function(data) {
        projects_hierarchy = data
    };
    Report.getProjectsHierarchyFile = function() {
        return projects_hierarchy_file
    };

    function getMenuElements() {
        var elements;
        if (menu_elements !== undefined) {
            elements = menu_elements.menu
        }
        return elements
    }

    function getMenuElementsReleases() {
        var releases;
        if (menu_elements !== undefined) {
            releases = menu_elements.menu_releases
        }
        return releases
    }

    function getReleaseNames() {
        var names;
        if (menu_elements !== undefined) {
            names = menu_elements.releases
        }
        return names
    }

    function getThreadsSite() {
        var site;
        if (menu_elements !== undefined) {
            site = menu_elements.threads_site
        }
        return site
    }

    function getGerritSite() {
        var site;
        if (menu_elements !== undefined) {
            site = menu_elements.gerrit_site
        }
        return site
    }
    Report.setMenuElements = function(data) {
        menu_elements = data
    };
    Report.getMenuElementsFile = function() {
        return menu_elements_file
    };

    function getGridster() {
        return gridster
    }

    function setGridster(grid) {
        gridster = grid
    }

    function getProjectData() {
        return project_data
    }
    Report.setProjectData = function(data) {
        project_data = data
    };
    Report.getProjectFile = function() {
        return project_file
    };

    function getProjectsData() {
        return projects_data
    }
    Report.getProjectsDirs = function() {
        return projects_dirs
    };
    Report.setProjectsDirs = function(dirs) {
        projects_dirs = dirs
    };
    Report.getProjectsList = function() {
        var projects_list = [];
        $.each(getProjectsData(), function(key, val) {
            projects_list.push(key)
        });
        return projects_list
    };
    Report.getProjectsDataSources = function() {
        return projects_datasources
    };
    Report.setMetricsDefinition = function(metrics) {
        $.each(Report.getDataSources(), function(i, DS) {
            DS.setMetricsDefinition(metrics[DS.getName()])
        })
    };
    Report.getPeopleIdentities = function() {
        return project_people_identities
    };
    Report.setPeopleIdentities = function(people) {
        project_people_identities = people
    };
    Report.cleanLabel = function(item) {
        var label = item;
        var aux = null;
        if (item.split("___").length === 2) {
            aux = item.split(" ");
            label = aux[0]
        } else if (item.lastIndexOf("https:__api.github.com_repos_") === 0) {
            label = label.replace("https:__api.github.com_repos_", "");
            label = label.split("_")[1]
        } else if (item.lastIndexOf("http") === 0 || item.split("_").length > 3) {
            aux = item.split("_");
            label = aux.pop();
            if (label === "") label = aux.pop();
            label = label.replace("buglist.cgi?product=", "");
            label = label.replace("gmane.comp.sysutils.", "")
        } else if (item.lastIndexOf("<") === 0) label = MLS.displayMLSListName(item);
        return label
    };

    function strNumberWithThousands(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".")
    }
    Report.formatValue = function(number, field) {
        if (number === undefined) return "-";
        var date_fields = ["last_date", "first_date"];
        var reports = ["repositories", "companies", "countries", "domains", "projects"];
        var value = number;
        try {
            value = parseFloat(number).toFixed(1).toString().replace(/\.0$/, "");
            value = strNumberWithThousands(value);
            if (navigator.language === "es") {
                var parts = value.split(".");
                parts[0] = parts[0].replace(/,/g, ".");
                value = parts.join(",")
            }
        } catch (err) {}
        if (typeof value === "number" && isNaN(value)) value = number.toString();
        if (field !== undefined && $.inArray(field, date_fields) > -1) value = number.toString();
        return value
    };
    Report.escapeHtml = function(unsafe) {
        return unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
    };
    Report.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search.replace("&", "%26"));
        return results === null ? undefined : Report.escapeHtml(decodeURIComponent(results[1].replace(/\+/g, " ")))
    };

    function getMetricDS(metric_id) {
        var ds = [];
        $.each(Report.getDataSources(), function(i, DS) {
            if (DS.getMetrics()[metric_id]) {
                ds.push(DS)
            }
        });
        return ds
    }
    Report.getDataSourceByName = function(ds) {
        var DS = null;
        $.each(Report.getDataSources(), function(index, DSaux) {
            if (DSaux.getName() === ds) {
                DS = DSaux;
                return false
            }
        });
        return DS
    };

    function getAllMetrics() {
        var all = {};
        $.each(Report.getDataSources(), function(index, DS) {
            all = $.extend({}, all, DS.getMetrics())
        });
        return all
    }
    Report.displayActiveMenu = function() {
        var active = window.location.href;
        var page = active.substr(active.lastIndexOf("/") + 1, active.length);
        page = page.split(".html")[0];
        if (page.indexOf("scm") === 0) {
            $(".scm-menu")[0].className = $(".scm-menu")[0].className + " active"
        } else if (page.indexOf("its") === 0) {
            $(".its-menu")[0].className = $(".its-menu")[0].className + " active"
        } else if (page.indexOf("mls") === 0) {
            $(".mls-menu")[0].className = $(".mls-menu")[0].className + " active"
        } else if (page.indexOf("scr") === 0) {
            $(".scr-menu")[0].className = $(".scr-menu")[0].className + " active"
        } else if (page.indexOf("irc") === 0) {
            $(".irc-menu")[0].className = $(".irc-menu")[0].className + " active"
        } else if (page.indexOf("qaforum") === 0) {
            $(".qaforum-menu")[0].className = $(".qaforum-menu")[0].className + " active"
        } else if (page.indexOf("studies") === 0) {
            $(".studies-menu")[0].className = $(".studies-menu")[0].className + " active"
        } else if (page.indexOf("wiki") === 0) {
            $(".wiki-menu")[0].className = $(".wiki-menu")[0].className + " active"
        } else if (page.indexOf("downloads") === 0) {
            $(".downloads-menu")[0].className = $(".downloads-menu")[0].className + " active"
        } else if (page.indexOf("projects") === 0) {
            $(".listprojects-menu")[0].className = $(".listprojects-menu")[0].className + " active"
        } else if (page.indexOf("index") === 0 || page === "") {
            if ($(".summary-menu").length === 0) return;
            $(".summary-menu")[0].className = $(".summary-menu")[0].className + " active"
        } else {
            if ($(".experimental-menu")[0]) $(".experimental-menu")[0].className = $(".experimental-menu")[0].className + " active"
        }
    };

    function checkDynamicConfig() {
        var data_sources = [];
        var release = $.urlParam("release");
        if (release !== null && release.length > 0) {
            data_sources.push("data/json/" + release);
            Report.setDataDir("data/json/" + release);
            if (data_sources.length > 0) Report.setProjectsDirs(data_sources)
        }
    }

    function createDataSources() {
        checkDynamicConfig();
        var projects_dirs = Report.getProjectsDirs();
        var scm, its, its_1, mls, scr, irc, mediawiki, people, downloads, qaforums, releases, meetup, dockerhub;
        $.each(projects_dirs, function(i, project) {
            if (Report.getConfig() === null || Report.getConfig()["data-sources"] === undefined) {
                its = new ITS;
                Report.registerDataSource(its);
                its_1 = new ITS_1;
                Report.registerDataSource(its_1);
                mls = new MLS;
                Report.registerDataSource(mls);
                scm = new SCM;
                Report.registerDataSource(scm);
                scr = new SCR;
                Report.registerDataSource(scr);
                irc = new IRC;
                Report.registerDataSource(irc);
                mediawiki = new MediaWiki;
                Report.registerDataSource(mediawiki);
                people = new People;
                Report.registerDataSource(people);
                downloads = new Downloads;
                Report.registerDataSource(downloads);
                qaforums = new QAForums;
                Report.registerDataSource(qaforums);
                releases = new Releases;
                Report.registerDataSource(releases);
                meetup = new Meetup;
                Report.registerDataSource(meetup);
                dockerhub = new DockerHub;
                Report.registerDataSource(dockerhub)
            } else {
                var active_ds = Report.getConfig()["data-sources"];
                $.each(active_ds, function(i, name) {
                    if (name === "its") {
                        its = new ITS;
                        Report.registerDataSource(its)
                    } else if (name === "its_1") {
                        its_1 = new ITS_1;
                        Report.registerDataSource(its_1)
                    } else if (name === "mls") {
                        mls = new MLS;
                        Report.registerDataSource(mls)
                    } else if (name === "scm") {
                        scm = new SCM;
                        Report.registerDataSource(scm)
                    } else if (name === "scr") {
                        scr = new SCR;
                        Report.registerDataSource(scr)
                    } else if (name === "irc") {
                        irc = new IRC;
                        Report.registerDataSource(irc)
                    } else if (name === "mediawiki") {
                        mediawiki = new MediaWiki;
                        Report.registerDataSource(mediawiki)
                    } else if (name === "people") {
                        people = new People;
                        Report.registerDataSource(people)
                    } else if (name === "downloads") {
                        downloads = new Downloads;
                        Report.registerDataSource(downloads)
                    } else if (name === "qaforums") {
                        qaforums = new QAForums;
                        Report.registerDataSource(qaforums)
                    } else if (name === "releases") {
                        releases = new Releases;
                        Report.registerDataSource(releases)
                    } else if (name === "meetup") {
                        meetup = new Meetup;
                        Report.registerDataSource(meetup)
                    } else if (name == "dockerhub") {
                        dockerhub = new DockerHub;
                        Report.registerDataSource(dockerhub)
                    } else Report.log("Not support data source " + name)
                })
            }
            if (its) its.setDataDir(project);
            if (its_1) its_1.setDataDir(project);
            if (mls) mls.setDataDir(project);
            if (scm) scm.setDataDir(project);
            if (scr) scr.setDataDir(project);
            if (irc) irc.setDataDir(project);
            if (mediawiki) mediawiki.setDataDir(project);
            if (people) people.setDataDir(project);
            if (downloads) downloads.setDataDir(project);
            if (qaforums) qaforums.setDataDir(project);
            if (releases) releases.setDataDir(project);
            if (scm && its) scm.setITS(its);
            if (meetup) meetup.setDataDir(project);
            if (dockerhub) dockerhub.setDataDir(project)
        });
        return true
    }
    Report.addDataDir = function() {
        var addURL;
        var querystr = window.location.search.substr(1);
        if (querystr && querystr.indexOf("data_dir") !== -1) {
            addURL = window.location.search.substr(1)
        }
        return addURL
    };
    Report.configDataSources = function() {
        var prjs_dss = Report.getProjectsDataSources();
        $.each(Report.getDataSources(), function(index, ds) {
            if (ds.getData() instanceof Array) return;
            $.each(projects_data, function(name, project) {
                if (project.dir === ds.getDataDir()) {
                    if (prjs_dss[name] === undefined) prjs_dss[name] = [];
                    $.each(prjs_dss[name], function(prj, prjds) {
                        if (ds.getName() === prjds.getName()) return false
                    });
                    ds.setProject(name);
                    prjs_dss[name].push(ds);
                    return false
                }
            })
        })
    };
    Report.getConfig = function() {
        return report_config
    };
    Report.setConfig = function(data) {
        report_config = data;
        if (data) {
            Report.log("Global config file found");
            if (data["global-html-dir"]) Report.setHtmlDir(data["global-html-dir"]);
            if (data["global-data-dir"]) {
                Report.setDataDir(data["global-data-dir"]);
                Report.setProjectsDirs([data["global-data-dir"]])
            }
            if (data["projects-data-dirs"]) Report.setProjectsDirs(data["projects-data-dirs"])
        }
    };
    Report.convertGlobal = function() {
        Convert.convertBasicDivs();
        Convert.convertBasicDivsMisc();
        Convert.convertBasicMetrics();
        Convert.convertDemographics();
        Convert.convertMetricsEvolSet();
        Convert.convertLastActivity();
        Convert.convertMicrodash();
        Convert.convertMicrodashText()
    };
    Report.getActiveStudies = function() {
        var activeStudies = [];
        var reports;
        var reports_study = ["repositories", "countries", "companies", "domains", "projects"];
        if (Report.getConfig() !== null) reports = Report.getConfig().reports;
        else reports = reports_study;
        $.each(reports_study, function(i, study) {
            if ($.inArray(study, reports) > -1) activeStudies.push(study)
        });
        return activeStudies
    };
    Report.convertStudiesGlobal = function() {
        Convert.convertPeople()
    };

    function convertStudies() {
        $.each(Report.getActiveStudies(), function(i, study) {
            var filter = study;
            if (study === "repositories") filter = "repos";
            DataProcess.orderItems(filter);
            Convert.convertFilterStudy(study);
            Convert.convertFilterStudyItem(study)
        })
    }
    var log_on = true;
    Report.getLog = function() {
        return log_on
    };
    Report.setLog = function(status) {
        log_on = status
    };
    Report.log = function(msg) {
        if (Report.getLog() === true)
            if (window.console) console.log(msg)
    }
})();
Loader.data_ready_global(function() {
    Report.configDataSources();
    Report.convertGlobal();
    Report.convertStudiesGlobal()
});
Loader.data_ready(function() {
    study = "repos";
    Convert.convertFilterTop(study)
});
Loader.data_ready(function() {
    Report.convertStudies();
    $("body").css("cursor", "auto");
    $("html").click(function(e) {
        $(".help").popover("hide")
    });
    Convert.activateHelp()
});
$(document).ready(function() {
    $.getJSON(Report.getMenuElementsFile(), function(data) {
        Report.setMenuElements(data)
    }).fail(function() {
        if (window.console) Report.log("Can't read global config file " + Report.getMenuElementsFile())
    }).always(function(data) {
        Report.createDataSources();
        $.getJSON(Report.all_json_file, function(data) {
            if (window.console) {
                Report.log("Loaded all JSON data from " + Report.all_json_file)
            }
            Loader.set_all_data(data)
        }).always(function(data) {
            Loader.data_load()
        });
        $("body").css("cursor", "progress")
    })
});

function resizedw() {
    if (true) {
        return
    }
    Report.convertGlobal();
    Report.convertStudiesGlobal();
    Report.convertStudies();
    Convert.activateHelp()
}
var resized;
$(window).resize(function() {
    clearTimeout(resized);
    resized = setTimeout(resizedw, 100)
});

function DataSource(name, basic_metrics) {
    this.top_data_file = this.data_dir + "/" + this.name + "-top.json";
    this.getTopDataFile = function() {
        return this.top_data_file
    };
    this.getMetrics = function() {
        return this.basic_metrics
    };
    this.setMetrics = function(metrics) {
        this.basic_metrics = metrics
    };
    this.getMetricDesc = function(metric_id) {
        var metric_data = this.basic_metrics[metric_id];
        if (metric_data !== undefined && metric_data.desc !== undefined) {
            return metric_data.desc
        } else {
            return ""
        }
    };
    this.setMetricsDefinition = function(metrics) {
        if (metrics === undefined) return;
        this.setMetrics(metrics)
    };
    this.data_file = this.data_dir + "/" + this.name + "-evolutionary.json";
    this.getDataFile = function() {
        return this.data_file
    };
    this.setDataFile = function(file) {
        this.data_file = file
    };
    this.data = null;
    this.getData = function() {
        return this.data
    };

    function nameSpaceMetrics(plain_metrics, ds) {
        if (plain_metrics instanceof Array) return plain_metrics;
        var metrics = {};
        if (plain_metrics === null) {
            return metrics
        }
        $.each(plain_metrics, function(name, value) {
            var basic_name = name;
            var aux = name.split("_");
            if (isNaN(aux[aux.length - 1]) === false) basic_name = aux.slice(0, aux.length - 1).join("_");
            var ns_basic_name = ds.getName() + "_" + basic_name;
            var ns_name = ds.getName() + "_" + name;
            if (ds.getMetrics()[ns_basic_name] === undefined && name !== "submissions") metrics[name] = value;
            else metrics[ns_name] = value
        });
        return metrics
    }
    this.setData = function(load_data, self) {
        if (self === undefined) self = this;
        self.data = nameSpaceMetrics(load_data, self)
    };
    this.demographics_aging_file = this.data_dir + "/" + this.name + "-demographics-aging.json";
    this.demographics_birth_file = this.data_dir + "/" + this.name + "-demographics-birth.json";
    this.getDemographicsAgingFile = function() {
        return this.demographics_aging_file
    };
    this.getDemographicsBirthFile = function() {
        return this.demographics_birth_file
    };
    this.demographics_data = {};
    this.getDemographicsData = function() {
        return this.demographics_data
    };
    this.setDemographicsAgingData = function(data, self) {
        if (self === undefined) self = this;
        self.demographics_data.aging = data
    };
    this.setDemographicsBirthData = function(data, self) {
        if (self === undefined) self = this;
        self.demographics_data.birth = data
    };
    this.data_dir = "data/json";
    this.getDataDir = function() {
        return this.data_dir
    };
    this.setDataDir = function(dataDir) {
        this.data_dir = dataDir;
        this.data_file = dataDir + "/" + this.name + "-evolutionary.json";
        this.demographics_aging_file = dataDir + "/" + this.name + "-demographics-aging.json";
        this.demographics_birth_file = dataDir + "/" + this.name + "-demographics-birth.json";
        this.global_data_file = dataDir + "/" + this.name + "-static.json";
        this.top_data_file = dataDir + "/" + this.name + "-top.json";
        this.companies_data_file = dataDir + "/" + this.name + "-organizations.json";
        this.repos_data_file = dataDir + "/" + this.name + "-repos.json";
        this.countries_data_file = dataDir + "/" + this.name + "-countries.json";
        this.domains_data_file = dataDir + "/" + this.name + "-domains.json";
        this.projects_data_file = dataDir + "/" + this.name + "-projects.json";
        this.time_to_fix_data_file = dataDir + "/" + this.name + "-quantiles-month-time_to_fix_hour.json"
    };
    this.global_data_file = this.data_dir + "/" + this.name + "-static.json";
    this.getGlobalDataFile = function() {
        return this.global_data_file
    };
    this.global_data = null;
    this.getGlobalData = function() {
        return this.global_data
    };
    this.setGlobalData = function(data, self) {
        if (self === undefined) self = this;
        var aux = Report.getMenuElements();
        var active_companies = null;
        if (aux && typeof aux.filter_companies !== undefined) {
            active_companies = aux.filter_companies
        }
        if (active_companies && active_companies.length > 0 && Object.keys(data).indexOf("companies") >= 0) {
            data.companies = active_companies.length
        }
        self.global_data = nameSpaceMetrics(data, self)
    };
    this.global_top_data = null;
    this.getGlobalTopData = function() {
        return this.global_top_data
    };
    this.setGlobalTopData = function(data, self) {
        if (self === undefined) self = this;
        self.global_top_data = data
    };
    this.name = name;
    this.getName = function() {
        return this.name
    };
    this.people_data_file = this.data_dir + "/" + this.name + "-people.json";
    this.getPeopleDataFile = function() {
        return this.people_data_file
    };
    this.people = null;
    this.getPeopleData = function() {
        return this.people
    };
    this.setPeopleData = function(people, self) {
        if (self === undefined) self = this;
        self.people = people
    };
    this.time_to_fix_data_file = this.data_dir + "/" + this.name + "-quantiles-month-time_to_fix_hour.json";
    this.getTimeToFixDataFile = function() {
        return this.time_to_fix_data_file
    };
    this.time_to_fix_data = null;
    this.getTimeToFixData = function() {
        return this.time_to_fix_data
    };
    this.setTimeToFixData = function(data, self) {
        if (self === undefined) self = this;
        self.time_to_fix_data = data
    };
    this.time_to_attention_data_file = this.data_dir + "/" + this.name + "-quantiles-month-time_to_attention_hour.json";
    this.getTimeToAttentionDataFile = function() {
        return this.time_to_attention_data_file
    };
    this.time_to_attention_data = null;
    this.getTimeToAttentionData = function() {
        return this.time_to_attention_data
    };
    this.setTimeToAttentionData = function(data, self) {
        if (self === undefined) self = this;
        self.time_to_attention_data = data
    };
    this.project = null;
    this.getProject = function() {
        return this.project
    };
    this.setProject = function(project) {
        this.project = project
    };
    this.markov_table_data_file = this.data_dir + "/" + this.name + "-markov.json";
    this.getMarkovTableDataFile = function() {
        return this.markov_table_data_file
    };
    this.markov_table_data = null;
    this.getMarkovTableData = function() {
        return this.markov_table_data
    };
    this.setMarkovTableData = function(data, self) {
        if (self === undefined) self = this;
        self.markov_table_data = data
    };
    this.companies_data_file = this.data_dir + "/" + this.name + "-organizations.json";
    this.getCompaniesDataFile = function() {
        return this.companies_data_file
    };
    this.companies = null;
    this.getCompaniesDataFull = function() {
        return this.companies
    };
    this.getCompaniesData = function() {
        var items = this.companies;
        if (items instanceof Array === false) {
            if (this.companies !== null) {
                items = this.companies.name
            }
        }
        return items
    };

    function filterOutCompaniesArray(com_data) {
        var aux = Report.getMenuElements(),
            active_companies = null,
            result = [];
        if (aux && typeof aux.filter_companies !== undefined) {
            active_companies = aux.filter_companies
        }
        if (active_companies && active_companies.length > 0) {
            $.each(com_data, function(pos, name) {
                if (active_companies.indexOf(name) >= 0) {
                    result[result.length] = name
                }
            })
        } else {
            result = com_data
        }
        return result
    }

    function filterOutCompanies(com_data) {
        var aux = Report.getMenuElements();
        var active_companies = null;
        if (aux && typeof aux.filter_companies !== undefined) {
            active_companies = aux.filter_companies
        }
        if (active_companies && active_companies.length > 0) {
            var keys = Object.keys(com_data);
            var positions = [];
            $.each(com_data.name, function(pos, name) {
                if (active_companies.indexOf(name) >= 0) {
                    positions[positions.length] = pos
                }
            });
            var new_obj = {};
            $.each(keys, function(id, k) {
                new_obj[k] = [];
                $.each(positions, function(subid, pos) {
                    var l = new_obj[k].length;
                    new_obj[k][l] = com_data[k][pos]
                })
            });
            com_data = new_obj
        }
        return com_data
    }
    this.setCompaniesData = function(companies, self) {
        if (companies === null) companies = [];
        if (self === undefined) self = this;
        if (Array.isArray(companies)) {
            self.companies = filterOutCompaniesArray(companies)
        } else if (typeof companies === "object") {
            self.companies = filterOutCompanies(companies)
        }
    };
    this.companies_metrics_data = {};
    this.addCompanyMetricsData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_metrics_data[company] = nameSpaceMetrics(data, self)
    };
    this.getCompaniesMetricsData = function() {
        return this.companies_metrics_data
    };
    this.companies_global_data = {};
    this.addCompanyGlobalData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_global_data[company] = nameSpaceMetrics(data, self)
    };
    this.getCompaniesGlobalData = function() {
        return this.companies_global_data
    };
    this.companies_top_data = {};
    this.addCompanyTopData = function(company, data, self) {
        if (self === undefined) self = this;
        if (self.companies_top_data[company] === undefined) self.companies_top_data[company] = {};
        self.companies_top_data[company] = data
    };
    this.getCompaniesTopData = function() {
        return this.companies_top_data
    };
    this.setCompaniesTopData = function(data, self) {
        if (self === undefined) self = this;
        self.companies_top_data = data
    };
    this.repos_data_file = this.data_dir + "/" + this.name + "-repos.json";
    this.getReposDataFile = function() {
        return this.repos_data_file
    };
    this.repos = null;
    this.getReposDataFull = function() {
        return this.repos
    };
    this.getReposData = function() {
        var items = this.repos;
        if (items instanceof Array === false) {
            if (this.repos !== null) {
                items = this.repos.name
            }
        }
        return items
    };
    this.setReposData = function(repos, self) {
        if (self === undefined) self = this;
        self.repos = repos;
        if (self.getName() !== "its") return;
        repos_names = [];
        if (repos instanceof Array === true) {
            self.repos = {};
            self.repos.name = repos
        }
        var filtered_repos = [];
        for (var i = 0; i < self.repos.name.length; i++) {
            filtered_repos.push(self.repos.name[i].replace(/\//g, "_"))
        }
        self.repos.name = filtered_repos
    };
    this.repos_metrics_data = {};
    this.addRepoMetricsData = function(repo, data, self) {
        if (self === undefined) self = this;
        self.repos_metrics_data[repo] = nameSpaceMetrics(data, self)
    };
    this.getReposMetricsData = function() {
        return this.repos_metrics_data
    };
    this.repos_global_data = {};
    this.addRepoGlobalData = function(repo, data, self) {
        if (self === undefined) self = this;
        self.repos_global_data[repo] = nameSpaceMetrics(data, self)
    };
    this.getReposGlobalData = function() {
        return this.repos_global_data
    };
    this.repositories_top_data = {};
    this.addRepositoryTopData = function(repository, data, self) {
        if (self === undefined) self = this;
        if (self.repositories_top_data[repository] === undefined) self.repositories_top_data[repository] = {};
        self.repositories_top_data[repository] = data
    };
    this.getRepositoriesTopData = function() {
        return this.repositories_top_data
    };
    this.setRepositoriesTopData = function(data, self) {
        if (self === undefined) self = this;
        self.repositories_top_data = data
    };
    this.countries_data_file = this.data_dir + "/" + this.name + "-countries.json";
    this.getCountriesDataFile = function() {
        return this.countries_data_file
    };
    this.countries = null;
    this.getCountriesData = function() {
        var items = this.countries;
        if (items instanceof Array === false) {
            if (this.countries !== null) {
                items = this.countries.name
            }
        }
        return items
    };
    this.setCountriesData = function(countries, self) {
        if (self === undefined) self = this;
        self.countries = countries
    };
    this.countries_metrics_data = {};
    this.addCountryMetricsData = function(country, data, self) {
        if (self === undefined) self = this;
        self.countries_metrics_data[country] = nameSpaceMetrics(data, self)
    };
    this.getCountriesMetricsData = function() {
        return this.countries_metrics_data
    };
    this.countries_global_data = {};
    this.addCountryGlobalData = function(country, data, self) {
        if (self === undefined) self = this;
        self.countries_global_data[country] = nameSpaceMetrics(data, self)
    };
    this.getCountriesGlobalData = function() {
        return this.countries_global_data
    };
    this.domains_data_file = this.data_dir + "/" + this.name + "-domains.json";
    this.getDomainsDataFile = function() {
        return this.domains_data_file
    };
    this.domains = null;
    this.getDomainsDataFull = function() {
        return this.domains
    };
    this.getDomainsData = function() {
        var items = this.domains;
        if (items instanceof Array === false) {
            if (this.domains !== null) {
                items = this.domains.name
            }
        }
        return items
    };
    this.setDomainsData = function(domains, self) {
        if (domains === null) domains = [];
        if (self === undefined) self = this;
        self.domains = domains
    };
    this.domains_metrics_data = {};
    this.addDomainMetricsData = function(domain, data, self) {
        if (self === undefined) self = this;
        self.domains_metrics_data[domain] = nameSpaceMetrics(data, self)
    };
    this.getDomainsMetricsData = function() {
        return this.domains_metrics_data
    };
    this.domains_global_data = {};
    this.addDomainGlobalData = function(domain, data, self) {
        if (self === undefined) self = this;
        self.domains_global_data[domain] = nameSpaceMetrics(data, self)
    };
    this.getDomainsGlobalData = function() {
        return this.domains_global_data
    };
    this.projects_data_file = this.data_dir + "/" + this.name + "-projects.json";
    this.getProjectsDataFile = function() {
        return this.projects_data_file
    };
    this.projects = null;
    this.getProjectsData = function() {
        var items = this.projects;
        if (items instanceof Array === false) {
            if (this.projects !== null) {
                items = this.projects.name
            }
        }
        return items
    };
    this.setProjectsData = function(projects, self) {
        if (projects === null) projects = [];
        if (self === undefined) self = this;
        self.projects = projects
    };
    this.projects_metrics_data = {};
    this.addProjectMetricsData = function(project, data, self) {
        if (self === undefined) self = this;
        self.projects_metrics_data[project] = nameSpaceMetrics(data, self)
    };
    this.getProjectsMetricsData = function() {
        return this.projects_metrics_data
    };
    this.projects_global_data = {};
    this.addProjectGlobalData = function(project, data, self) {
        if (self === undefined) self = this;
        self.projects_global_data[project] = nameSpaceMetrics(data, self)
    };
    this.getProjectsGlobalData = function() {
        return this.projects_global_data
    };
    this.people_metrics_data = {};
    this.addPeopleMetricsData = function(id, data, self) {
        if (self === undefined) self = this;
        self.people_metrics_data[id] = nameSpaceMetrics(data, self)
    };
    this.getPeopleMetricsData = function() {
        return this.people_metrics_data
    };
    this.people_global_data = {};
    this.addPeopleGlobalData = function(id, data, self) {
        if (self === undefined) self = this;
        self.people_global_data[id] = nameSpaceMetrics(data, self)
    };
    this.getPeopleGlobalData = function() {
        return this.people_global_data
    };
    this.getCompanyQuery = function() {
        var company = null;
        var querystr = window.location.search.substr(1);
        if (querystr && querystr.split("&")[0].split("=")[0] === "company") company = querystr.split("&")[0].split("=")[1];
        return company
    };
    this.displayMetricCompanies = function(metric_id, div_target, config, start, end) {
        var companies_data = this.getCompaniesMetricsData();
        Viz.displayMetricCompanies(metric_id, companies_data, div_target, config, start, end)
    };
    this.displayMetricMyCompanies = function(companies, metric_id, div_target, config, start, end) {
        var companies_data = {};
        var self = this;
        $.each(companies, function(i, name) {
            companies_data[name] = self.getCompaniesMetricsData()[name]
        });
        Viz.displayMetricCompanies(metric_id, companies_data, div_target, config, start, end)
    };
    this.displayMetricRepos = function(metric_id, div_target, config, start, end) {
        var repos_data = this.getReposMetricsData();
        Viz.displayMetricRepos(metric_id, repos_data, div_target, config, start, end)
    };
    this.displayBasicMetricMyRepos = function(repos, metric_id, div_target, config, start, end) {
        var repos_data = {};
        var reposMap = Report.getReposMap();
        var self = this;
        $.each(repos, function(i, name) {
            var metrics = self.getReposMetricsData()[name];
            if (!metrics) {
                if (reposMap[name] instanceof Object) {
                    name = reposMap[name][self.getName()]
                } else {
                    name = reposMap[name]
                }
                metrics = self.getReposMetricsData()[name]
            }
            repos_data[name] = metrics
        });
        Viz.displayMetricRepos(metric_id, repos_data, div_target, config, start, end)
    };
    this.displayMetricDomains = function(metric_id, div_target, config, start, end) {
        var domains_data = this.getDomainsMetricsData();
        Viz.displayMetricDomains(metric_id, domains_data, div_target, config, start, end)
    };
    this.displayMetricProjects = function(metric_id, div_target, config, start, end) {
        var projects_data = this.getProjectsMetricsData();
        Viz.displayMetricProjects(metric_id, projects_data, div_target, config, start, end)
    };
    this.displayMetricCompaniesStatic = function(metric_id, div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic("companies", metric_id, div_target, config, order_by, show_others)
    };
    this.displayMetricReposStatic = function(metric_id, div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic("repos", metric_id, div_target, config, order_by, show_others)
    };
    this.displayMetricCountriesStatic = function(metric_id, div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic("countries", metric_id, div_target, config, order_by, show_others)
    };
    this.displayMetricDomainsStatic = function(metric_id, div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic("domains", metric_id, div_target, config, order_by, show_others)
    };
    this.displayMetricProjectsStatic = function(metric_id, div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic("projects", metric_id, div_target, config, order_by, show_others)
    };
    this.displayMetricSubReportStatic = function(report, metric_id, div_target, config, order_by, show_others) {
        if (order_by === undefined) order_by = metric_id;
        var data = null;
        if (report == "companies") data = this.getCompaniesGlobalData();
        else if (report == "repos") data = this.getReposGlobalData();
        else if (report == "countries") data = this.getCountriesGlobalData();
        else if (report == "domains") data = this.getDomainsGlobalData();
        else if (report == "projects") data = this.getProjectsGlobalData();
        else return;
        if ($.isEmptyObject(data)) return;
        var order = DataProcess.sortGlobal(this, order_by, report);
        if (order instanceof Array === false) {
            order = order.name
        }
        data_page = DataProcess.paginate(order, Report.getCurrentPage());
        Viz.displayMetricSubReportStatic(metric_id, data, data_page, div_target, config)
    };
    this.displayMetricsCompany = function(company, metrics, div_id, config) {
        var data = this.getCompaniesMetricsData()[company];
        if (data === undefined) {
            $("#" + div_id).hide();
            return
        }
        Viz.displayMetricsCompany(this, company, metrics, data, div_id, config)
    };
    this.displayMetricsRepo = function(repo, metrics, div_id, config, convert) {
        var data = this.getReposMetricsData()[repo];
        if (data === undefined) {
            $("#" + div_id).hide();
            return
        }
        if (convert) {
            data = DataProcess.convert(data, convert, metrics);
            if (convert === "divide") {
                mlabel = this.getMetrics()[metrics[0]].name + "/";
                mlabel += this.getMetrics()[metrics[1]].name;
                metrics = ["divide"];
                this.getMetrics().divide = {
                    name: mlabel
                }
            }
            if (convert === "substract") {
                mlabel = this.getMetrics()[metrics[0]].name + "-";
                mlabel += this.getMetrics()[metrics[1]].name;
                metrics = ["substract"];
                this.getMetrics().substract = {
                    name: mlabel
                }
            }
        }
        Viz.displayMetricsRepo(this, repo, metrics, data, div_id, config)
    };
    this.displayMetricsCountry = function(country, metrics, div_id, config) {
        var data = this.getCountriesMetricsData()[country];
        if (data === undefined) {
            $("#" + div_id).hide();
            return
        }
        Viz.displayMetricsCountry(this, country, metrics, data, div_id, config)
    };
    this.displayMetricsDomain = function(domain, metrics, div_id, config) {
        var data = this.getDomainsMetricsData()[domain];
        if (data === undefined) return;
        Viz.displayMetricsDomain(this, domain, metrics, data, div_id, config)
    };
    this.displayMetricsProject = function(project, metrics, div_id, config) {
        var data = this.getProjectsMetricsData()[project];
        if (data === undefined) return;
        Viz.displayMetricsProject(this, project, metrics, data, div_id, config)
    };
    this.displayMetricsPeople = function(upeople_id, upeople_identifier, metrics, div_id, config) {
        var history = this.getPeopleMetricsData()[upeople_id];
        if (history === undefined || history instanceof Array) {
            $("#" + div_id).hide();
            return
        }
        Viz.displayMetricsPeople(this, upeople_identifier, metrics, history, div_id, config)
    };
    this.displayMetricsEvol = function(metric_ids, div_target, config, convert) {
        var data = {};
        var repositories;
        if (config.repo_filter) {
            repositories = config.repo_filter.split(",");
            var self = this;
            $.each(repositories, function(id, value) {
                if ($.inArray(value, self.getReposData()) >= 0) {
                    if (self.getName() === "mls") {
                        var mls_name = MLS.displayMLSListName(value);
                        data[mls_name] = self.getReposMetricsData()[value]
                    } else {
                        data[value] = self.getReposMetricsData()[value]
                    }
                }
            })
        } else {
            data = this.getData()
        }
        if (convert) {
            data = DataProcess.convert(data, convert, metric_ids);
            if (convert === "divide") {
                mlabel = this.getMetrics()[metric_ids[0]].name + "/";
                mlabel += this.getMetrics()[metric_ids[1]].name;
                metric_ids = ["divide"];
                this.getMetrics().divide = {
                    name: mlabel
                }
            }
            if (convert === "substract") {
                mlabel = this.getMetrics()[metric_ids[0]].name + "-";
                mlabel += this.getMetrics()[metric_ids[1]].name;
                metric_ids = ["substract"];
                this.getMetrics().substract = {
                    name: mlabel
                }
            }
        }
        Viz.displayMetricsEvol(this, metric_ids, data, div_target, config, repositories)
    };
    this.isPageDisplayed = function(visited, linked, total, displayed) {
        var window = Math.floor((displayed - 3) / 2);
        var lowest_barrier = visited - window;
        var highest_barrier = visited + window;
        if (linked === 1 || linked === total || linked == visited) {
            return true
        } else if (linked >= lowest_barrier && linked < visited) {
            return true
        } else if (linked <= highest_barrier && linked > visited) {
            return true
        } else {
            return false
        }
    };
    this.displayItemsNav = function(div_nav, type, page_str, order_by) {
        var page = parseInt(page_str, null);
        if (isNaN(page)) page = 1;
        var items = null;
        var title = "";
        var total = 0;
        var displayed_pages = 5;
        if (type === "companies") {
            items = this.getCompaniesData();
            title = "List of companies"
        } else if (type === "repos") {
            items = this.getReposData();
            if (order_by) items = DataProcess.sortGlobal(this, order_by, type)
        } else if (type === "countries") {
            items = this.getCountriesData()
        } else if (type === "domains") {
            items = this.getDomainsData()
        } else if (type === "projects") {
            items = this.getProjectsData()
        } else {
            return
        }
        total = items.length;
        var nav = "";
        var psize = Report.getPageSize();
        if (page) {
            nav += "<div class='pagination'>";
            var number_pages = Math.ceil(total / psize);
            var from_item = (page - 1) * psize + 1;
            var to_item = page * psize;
            if (to_item > total) {
                to_item = total
            }
            nav += "<ul class='pagination'>";
            if (page > 1) {
                if (Utils.isReleasePage()) {
                    nav += "<li><a href='" + Utils.createReleaseLink("?page=" + (page - 1)) + "'>&laquo;</a></li>"
                } else {
                    nav += "<li><a href='?page=" + (page - 1) + "'>&laquo;</a></li>"
                }
            } else {
                if (Utils.isReleasePage()) {
                    nav += "<li class='disabled'><a href='" + Utils.createReleaseLink("?page=" + page) + "'>&laquo;</a></li>"
                } else {
                    nav += "<li class='disabled'><a href='?page=" + page + "'>&laquo;</a></li>"
                }
            }
            for (var j = 0; j * Report.getPageSize() < total; j++) {
                if (this.isPageDisplayed(page, j + 1, number_pages, displayed_pages) === true) {
                    if (page === j + 1) {
                        if (Utils.isReleasePage()) {
                            nav += "<li class='active'><a href='" + Utils.createReleaseLink("?page=" + (j + 1)) + "'>" + (j + 1) + "</a></li>"
                        } else {
                            nav += "<li class='active'><a href='?page=" + (j + 1) + "'>" + (j + 1) + "</a></li>"
                        }
                    } else {
                        if (Utils.isReleasePage()) {
                            nav += "<li><a href='" + Utils.createReleaseLink("?page=" + (j + 1)) + "'>" + (j + 1) + "</a></li>"
                        } else {
                            nav += "<li><a href='?page=" + (j + 1) + "'>" + (j + 1) + "</a></li>"
                        }
                    }
                } else {
                    if (j + 1 + 1 === number_pages || j + 1 - 1 === 1) {
                        nav += "<li class='disabled'><a href='#'> .. </a></li>"
                    }
                }
            }
            if (page * Report.getPageSize() < items.length) {
                if (Utils.isReleasePage()) {
                    nav += "<li><a href='" + Utils.createReleaseLink("?page=" + (parseInt(page, null) + 1)) + "'>"
                } else {
                    nav += "<li><a href='?page=" + (parseInt(page, null) + 1) + "'>"
                }
                nav += "&raquo;</a></li>"
            }
            nav += "</ul>";
            nav += "<span class='pagination-text'> (" + from_item + " - " + to_item + "/" + total + ")</span>";
            nav += "</div>"
        }
        if (Report.getPageSize() > 10) $.each(items, function(id, item) {
            var label = Report.cleanLabel(item);
            nav += "<a href='#" + item + "-nav'>" + label + "</a> "
        });
        $("#" + div_nav).append(nav)
    };
    this.displayCompaniesLinks = function(div_links, limit, sort_metric) {
        var sorted_companies = DataProcess.sortGlobal(this, sort_metric, "companies");
        var links = "";
        var i = 0;
        $.each(sorted_companies, function(id, company) {
            links += '<a href="company.html?company=' + company;
            if (Report.addDataDir()) links += "&" + Report.addDataDir();
            links += '">' + company + "</a>| ";
            if (i++ >= limit - 1) return false
        });
        $("#" + div_links).append(links)
    };
    this.displayCompaniesList = function(metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("companies", metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert)
    };
    this.displayReposList = function(metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert, ds_realname) {
        this.displaySubReportList("repos", metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert, ds_realname)
    };
    this.displayCountriesList = function(metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("countries", metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert)
    };
    this.displayDomainsList = function(metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("domains", metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert)
    };
    this.displayProjectsList = function(metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("projects", metrics, div_id, config_metric, sort_metric, page, show_links, start, end, convert)
    };
    this.displaySubReportList = function(report, metrics, div_id, config_metric, sort_metric, page_str, show_links, start, end, convert, ds_realname) {
        var page = parseInt(page_str, null);
        if (isNaN(page)) page = 1;
        var list = "";
        var cont = (page - 1) * Report.getPageSize() + 1;
        var ds = this;
        var data = null,
            sorted = null;
        if (show_links === undefined) show_links = true;
        if (report === "companies") {
            data = this.getCompaniesMetricsData();
            sorted = DataProcess.sortGlobal(this, sort_metric, report)
        } else if (report === "repos") {
            data = this.getReposMetricsData();
            sorted = DataProcess.sortGlobal(this, sort_metric, report)
        } else if (report === "countries") {
            data = this.getCountriesMetricsData();
            sorted = DataProcess.sortGlobal(this, sort_metric, report)
        } else if (report === "domains") {
            data = this.getDomainsMetricsData();
            sorted = DataProcess.sortGlobal(this, sort_metric, report)
        } else if (report === "projects") {
            data = this.getProjectsMetricsData();
            sorted = DataProcess.sortGlobal(this, sort_metric, report)
        } else return;
        sorted = DataProcess.paginate(sorted, page);
        list += '<table class="table table-hover table-repositories">';
        list += "<tr><th></th>";
        $.each(metrics, function(id, metric) {
            if (ds.getMetrics()[metric]) {
                title = ds.getMetrics()[metric].name;
                list += "<th>" + title + "</th>"
            } else {
                list += "<th>" + metric + "</th>"
            }
        });
        list += "</tr>";
        $.each(sorted, function(id, item) {
            list += "<tr><td class='col-md-2 repository-name'>";
            list += "#" + cont + "&nbsp;";
            cont++;
            var addURL = null;
            if (Report.addDataDir()) addURL = Report.addDataDir();
            if (show_links) {
                var release_var = "";
                if (Utils.isReleasePage()) release_var = "&release=" + $.urlParam("release");
                if (report === "companies") {
                    list += "<a href='company.html?company=" + item;
                    list += release_var;
                    if (addURL) list += "&" + addURL;
                    list += "'>"
                } else if (report === "repos") {
                    list += "<a href='";
                    list += "repository.html";
                    list += "?repository=" + encodeURIComponent(item);
                    list += release_var;
                    if (ds_realname) {
                        list += "&ds=" + ds_realname
                    } else {
                        list += "&ds=" + ds.getName()
                    }
                    if (addURL) list += "&" + addURL;
                    list += "'>"
                } else if (report === "countries") {
                    list += "<a href='country.html?country=" + item;
                    list += release_var;
                    if (addURL) list += "&" + addURL;
                    list += "'>"
                } else if (report === "domains") {
                    list += "<a href='domain.html?domain=" + item;
                    list += release_var;
                    if (addURL) list += "&" + addURL;
                    list += "'>"
                } else if (report === "projects") {
                    list += "<a href='project.html?project=" + item;
                    list += release_var;
                    if (addURL) list += "&" + addURL;
                    list += "'>"
                }
            }
            list += "<strong>";
            list += Report.cleanLabel(item);
            list += "</strong>";
            if (show_links) list += "</a>";
            list += "</td>";
            var width = Math.floor(10 / metrics.length);
            $.each(metrics, function(id, metric) {
                var mywidth = width;
                list += "<td class='col-md-" + mywidth + "'>";
                list += "<div id='" + report + "-" + item + "-" + metric + "'";
                list += " class='subreport-list-item'>"
            });
            list += "</td></tr>"
        });
        list += "</table>";
        $("#" + div_id).append(list);
        var start_items = null,
            end_items = null,
            convert_items = null;
        if (start) {
            if (typeof start === "number") start_items = [start.toString()];
            else start_items = start.split(",")
        }
        if (end) {
            if (typeof end === "number") end_items = [end.toString()];
            else end_items = end.split(",")
        }
        if (convert) convert_items = convert.split(",");
        $.each(sorted, function(id, item) {
            var i = 0;
            $.each(metrics, function(id, metric) {
                var mstart = null,
                    mend = null,
                    mconvert = null;
                if (start_items) {
                    if (start_items.length == 1) mstart = start_items[0];
                    else mstart = start_items[i]
                }
                if (end_items) {
                    if (end_items.length == 1) mend = end_items[0];
                    else mend = end_items[i]
                }
                if (convert_items) mconvert = convert_items[i];
                if (item in data === false) return;
                var item_data = data[item];
                if (item_data[metric] === undefined) return;
                var div_id = report + "-" + item + "-" + metric;
                var items = {};
                items[item] = item_data;
                var title = "";
                Viz.displayMetricSubReportLines(div_id, metric, items, title, config_metric, mstart, mend, mconvert);
                i++
            })
        })
    };
    this.displayGlobalSummary = function(divid) {
        this.displaySummary(null, divid, null, this)
    };
    this.displayCompanySummary = function(divid, company, ds) {
        this.displaySummary("companies", divid, company, ds)
    };
    this.displayRepoSummary = function(divid, repo, ds, ds_realname) {
        this.displaySummary("repositories", divid, repo, ds, ds_realname)
    };
    this.displayCountrySummary = function(divid, repo, ds) {
        this.displaySummary("countries", divid, repo, ds)
    };
    this.displayDomainSummary = function(divid, domain, ds) {
        this.displaySummary("domains", divid, domain, ds)
    };
    this.displayProjectSummary = function(divid, project, ds) {
        this.displaySummary("projects", divid, project, ds)
    };
    this.displayPeopleSummary = function(divid, upeople_id, upeople_identifier, ds) {
        var history = ds.getPeopleGlobalData()[upeople_id];
        if (history === undefined || history instanceof Array) return;
        html = HTMLComposer.personSummaryTable(ds.getName(), history);
        $("#" + divid).append(html)
    };
    this.displayCompaniesSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total companies: " + data.companies + "<br>";
        if (data.companies_2006) html += "Companies in 2006: " + data.companies_2006 + "<br>";
        if (data.companies_2009) html += "Companies in 2009: " + data.companies_2009 + "<br>";
        if (data.companies_2012) html += "Companies in 2012: " + data.companies_2012 + "<br>";
        $("#" + divid).append(html)
    };
    this.getSummaryLabels = function() {};
    this.getLabelForRepository = function() {
        return "repository"
    };
    this.getLabelForRepositories = function() {
        return "repositories"
    };
    this.displaySummary = function(report, divid, item, ds, ds_realname) {
        if (!item) item = "";
        var html = "<h6>" + ds.getTitle() + "</h6>";
        var id_label = this.getSummaryLabels();
        var global_data = null;
        if (report === "companies") global_data = ds.getCompaniesGlobalData()[item];
        else if (report === "countries") global_data = ds.getCountriesGlobalData()[item];
        else if (report === "repositories") global_data = ds.getReposGlobalData()[item];
        else if (report === "domains") global_data = ds.getDomainsGlobalData()[item];
        else if (report === "projects") global_data = ds.getProjectsGlobalData()[item];
        else global_data = ds.getGlobalData();
        if (!global_data) return;
        html = HTMLComposer.repositorySummaryTable(ds, global_data, id_label, ds_realname);
        $("#" + divid).append(html)
    };
    this.displayReposSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total repositories: " + data[ds.getName() + "_repositories"] + "<br>";
        $("#" + divid).append(html)
    };
    this.displayCountriesSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total countries: " + data[ds.getName() + "_countries"] + "<br>";
        $("#" + divid).append(html)
    };
    this.displayDomainsSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total domains: " + data.domains + "<br>";
        $("#" + divid).append(html)
    };
    this.displayProjectsSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total projects: " + data.projects + "<br>";
        $("#" + divid).append(html)
    };
    this.displayDemographics = function(divid, period) {
        var data = this.getDemographicsData();
        Viz.displayDemographicsChart(divid, data, period)
    };
    this.displayTimeToAttention = function(div_id, column, labels, title) {
        labels = true;
        title = "Time to Attention " + column;
        var data = this.getTimeToAttentionData();
        if (data instanceof Array) return;
        Viz.displayTimeToAttention(div_id, data, column, labels, title)
    };
    this.displayTimeToFix = function(div_id, column, labels, title) {
        labels = true;
        title = "Time to Fix " + column;
        var data = this.getTimeToFixData();
        if (data instanceof Array) return;
        Viz.displayTimeToFix(div_id, this.getTimeToFixData(), column, labels, title)
    };
    this.displayMarkovTable = function(div_id, title) {
        var data = this.getMarkovTableData();
        if (data === undefined) {
            Report.log("No Markov data available");
            return
        }
        Viz.displayMarkovTable(div_id, data, title)
    };
    this.displayTop = function(div, all, show_metric, period, period_all, graph, limit, people_links, threads_links, repository) {
        if (all === undefined) all = true;
        var titles = null;
        Viz.displayTop(div, this, all, show_metric, period, period_all, null, null, limit, people_links, threads_links, repository)
    };
    this.displayTopCompany = function(company, div, metric_id, period, titles, height, people_links) {
        var data = this.getCompaniesTopData()[company];
        if (data === undefined) return;
        var metric = this.getMetrics()[metric_id];
        Viz.displayTopCompany(this, company, data, div, metric_id, period, titles, height, people_links)
    };
    this.displayTopRepo = function(repo, div, metric_id, period, titles, height, people_links) {
        var data = this.getRepositoriesTopData()[repo];
        if (data === undefined) return;
        var metric = this.getMetrics()[metric_id];
        Viz.displayTopRepo(this, repo, data, div, metric_id, period, titles, height, people_links)
    };
    this.displayTopGlobal = function(div, metric, period, titles) {
        Viz.displayTopGlobal(div, this, metric, period, titles)
    };
    this.envisionEvo = function(div_id, history, relative, legend_show, summary_graph) {
        config = Report.getVizConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this.getName(), Report.getVizConfig()[this.getName() + "_hide"], summary_graph);
        options.legend_show = legend_show;
        if (relative) DataProcess.addRelativeValues(options.data, this.getMainMetric());
        new envision.templates.Envision_Report(options, [this])
    };
    this.displayEnvision = function(divid, relative, legend_show, summary_graph) {
        var projects_full_data = Report.getProjectsDataSources();
        this.envisionEvo(divid, projects_full_data, relative, legend_show, summary_graph)
    }
}
if (Viz === undefined) var Viz = {};
(function() {
    var bitergiaColor = "#ffa500";
    Viz.displayTop = displayTop;
    Viz.displayTopCompany = displayTopCompany;
    Viz.displayTopRepo = displayTopRepo;
    Viz.displayTopGlobal = displayTopGlobal;
    Viz.displayBasicChart = displayBasicChart;
    Viz.displayMetricCompanies = displayMetricCompanies;
    Viz.displayMetricSubReportStatic = displayMetricSubReportStatic;
    Viz.displayMetricsCompany = displayMetricsCompany;
    Viz.displayMetricsDomain = displayMetricsDomain;
    Viz.displayMetricsProject = displayMetricsProject;
    Viz.displayMetricsPeople = displayMetricsPeople;
    Viz.displayMetricsRepo = displayMetricsRepo;
    Viz.displayMetricRepos = displayMetricRepos;
    Viz.displayMetricsCountry = displayMetricsCountry;
    Viz.displayMetricDomains = displayMetricDomains;
    Viz.displayMetricProjects = displayMetricProjects;
    Viz.displayMetricsEvol = displayMetricsEvol;
    Viz.displayBubbles = displayBubbles;
    Viz.displayDemographicsChart = displayDemographicsChart;
    Viz.displayEnvisionAll = displayEnvisionAll;
    Viz.displayTimeToFix = displayTimeToFix;
    Viz.displayTimeToAttention = displayTimeToAttention;
    Viz.displayMetricSubReportLines = displayMetricSubReportLines;
    Viz.displayRadarActivity = displayRadarActivity;
    Viz.displayRadarCommunity = displayRadarCommunity;
    Viz.displayTreeMap = displayTreeMap;
    Viz.displayMarkovTable = displayMarkovTable;
    Viz.displayDataSourcesTable = displayDataSourcesTable;
    Viz.getEnvisionOptions = getEnvisionOptions;
    Viz.checkBasicConfig = checkBasicConfig;
    Viz.displayTimeZone = displayTimeZone;

    function findMetricDoer(history, metric_id) {
        var doer = "";
        $.each(Report.getAllMetrics(), function(name, metric) {
            if (metric.action === metric_id) {
                doer = metric.column;
                return false
            }
        });
        return doer
    }

    function displayMarkovTable(div_id, data, title) {
        var html = "<h4>" + title + "</h4>";
        var table = '<table id="itsmarkovtable" class="table table-striped">';
        table += "<thead><tr>";
        table += "<td>STATUS</td>";
        $.each(data, function(status, val) {
            table += "<th style='min-width:80px'>" + status + "</th>"
        });
        table += "</thead></tr>";
        $.each(data, function(status, status_data) {
            table += "<tr><td>" + status + "</td>";
            for (var k = 0; k < status_data.new_value.length; k++) {
                table += "<td>" + status_data.issue[k];
                table += " <span style='font-size:small'>(" + Math.round(status_data.f[k] * 100) + "%)</span>";
                table += "</td>"
            }
            table += "</tr>"
        });
        table += "</tbody></table>";
        html += table;
        div = $("#" + div_id);
        div.append(html);
        return
    }

    function translate(labels, l) {
        if (labels.hasOwnProperty(l)) {
            return labels[l]
        } else {
            return l
        }
    }

    function getTopVarsFromMetric(metric, ds_name) {
        var var_names = {};
        var_names.id = "id";
        if (metric === "senders" && (ds_name === "mls" || ds_name === "irc")) {
            var_names.name = "senders";
            var_names.action = "sent"
        }
        if (metric === "authors" && ds_name === "scm") {
            var_names.name = "authors";
            var_names.action = "commits"
        }
        if (metric === "closers" && (ds_name === "its" || ds_name === "its_1")) {
            var_names.name = "closers";
            var_names.action = "closed"
        }
        if (ds_name === "scr") {
            if (metric === "mergers") {
                var_names.name = "mergers";
                var_names.action = "merged"
            }
            if (metric === "openers") {
                var_names.name = "openers";
                var_names.action = "opened"
            }
            if (metric === "reviewers") {
                var_names.name = "reviewers";
                var_names.action = "reviews"
            }
            if (metric === "active_core_reviewers") {
                var_names.name = "identifier";
                var_names.action = "reviews"
            }
            if (metric === "participants") {
                var_names.name = "identifier";
                var_names.action = "events"
            }
        }
        if (ds_name === "downloads") {
            if (metric === "ips") {
                var_names.name = "ips";
                var_names.action = "downloads"
            }
            if (metric === "packages") {
                var_names.name = "packages";
                var_names.action = "downloads"
            }
        }
        if (ds_name === "mediawiki") {
            if (metric === "authors") {
                var_names.name = "authors";
                var_names.action = "reviews"
            }
        }
        if (ds_name === "qaforums") {
            if (metric === "senders" || metric === "asenders" || metric === "qsenders") {
                var_names.name = "senders";
                var_names.action = "sent"
            } else if (metric === "participants") {
                var_names.name = "name";
                var_names.action = "messages_sent"
            }
        }
        if (ds_name === "releases") {
            if (metric === "authors") {
                var_names.name = "username";
                var_names.action = "releases"
            }
        }
        if (ds_name === "dockerhub") {
            if (metric === "pulls") {
                var_names.name = "name";
                var_names.action = "pulls"
            }
        }
        return var_names
    }

    function getSortedPeriods() {
        return ["last month", "last year", ""]
    }

    function composeTopRowsDownloads(dl_data, limit, var_names) {
        var rows_html = "";
        for (var j = 0; j < dl_data[var_names.name].length; j++) {
            if (limit && limit <= j) break;
            var metric_value = dl_data[var_names.action][j];
            rows_html += "<tr><td> " + (j + 1) + "</td>";
            rows_html += "<td>";
            rows_html += dl_data[var_names.name][j];
            rows_html += "</td>";
            rows_html += "<td>" + metric_value + "</td></tr>"
        }
        return rows_html
    }

    function composeTopRowsThreads(threads_data, limit, threads_links) {
        var rows_html = "";
        for (var i = 0; i < threads_data.subject.length; i++) {
            if (limit && limit <= i) break;
            rows_html += "<tr><td>#" + (i + 1) + "</td>";
            rows_html += "<td>";
            if (threads_links === true) {
                var url = "http://www.google.com/search?output=search&q=X&btnI=1";
                if (Report.getThreadsSite() !== undefined) {
                    url = "http://www.google.com/search?output=search&q=X%20site%3AY&btnI=1";
                    url = url.replace(/Y/g, Report.getThreadsSite())
                } else if (threads_data.hasOwnProperty("url") && threads_data.url[i].length > 0) {
                    url = "http://www.google.com/search?output=search&q=X%20site%3AY&btnI=1";
                    url = url.replace(/Y/g, threads_data.url[i])
                }
                url = url.replace(/X/g, threads_data.subject[i]);
                rows_html += "<td>";
                rows_html += '<a target="_blank" href="' + url + '">';
                rows_html += threads_data.subject[i] + "</a>";
                rows_html += '&nbsp;<i class="fa fa-external-link"></i></td>'
            } else {
                rows_html += "<td>" + threads_data.subject[i] + "</td>"
            }
            rows_html += "<td>" + threads_data.initiator_name[i] + "</td>";
            rows_html += "<td>" + threads_data.length[i] + "</td>";
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopRowsPeople(people_data, limit, people_links, var_names) {
        var rows_html = "";
        if (people_data[var_names.id] === undefined) {
            return rows_html
        }
        for (var j = 0; j < people_data[var_names.id].length; j++) {
            if (limit && limit <= j) break;
            var metric_value = people_data[var_names.action][j];
            rows_html += "<tr><td>" + (j + 1) + "</td>";
            rows_html += "<td>";
            if (people_links) {
                rows_html += '<a href="people.html?id=' + people_data[var_names.id][j];
                get_params = Utils.paramsInURL();
                if (get_params.length > 0) rows_html += "&" + get_params;
                rows_html += '">';
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j]) + "</a>"
            } else {
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j])
            }
            rows_html += "</td>";
            rows_html += "<td>" + metric_value + "</td>";
            if (people_data.organization !== undefined) {
                org = people_data.organization[j];
                if (org === null) {
                    org = "-"
                }
                rows_html += "<td>" + org + "</td>"
            }
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopTabs(periods, metric, data, ds_name) {
        var tabs_html = "";
        var first = true;
        tabs_html += '<ul id="myTab" class="nav nav-tabs">';
        for (var i = 0; i < periods.length; i++) {
            var mykey = metric + "." + periods[i];
            if (data[mykey]) {
                var data_period = periods[i];
                var data_period_formatted = data_period;
                if (data_period === "") {
                    data_period = "all";
                    data_period_formatted = "Complete history"
                } else if (data_period === "last month") {
                    data_period_formatted = "Last 30 days"
                } else if (data_period === "last year") {
                    data_period_formatted = "Last 365 days"
                }
                var data_period_nows = data_period.replace(/\ /g, "");
                var html = "";
                if (first === true) {
                    html = ' class="active"';
                    first = false
                }
                tabs_html += "<li" + html + '><a href="#' + ds_name + metric + data_period_nows + '"data-toogle="tab">';
                tabs_html += data_period_formatted + "</a></li>"
            }
        }
        tabs_html += "</ul>";
        return tabs_html
    }

    function composeTitle(metric, ds_name, tabs, desc_metrics, selected_period) {
        var key = ds_name + "_" + metric;
        var desc = "";
        var title = "";
        if (key in desc_metrics) {
            desc = desc_metrics[key].desc;
            desc = desc.toLowerCase()
        }
        if (selected_period === "") {
            data_period_formatted = "Complete history"
        } else if (selected_period === "last month") {
            data_period_formatted = "Last 30 days"
        } else if (selected_period === "last year") {
            data_period_formatted = "Last 365 days"
        }
        if (Utils.isReleasePage()) data_period_formatted = "Release history";
        if (tabs === true) {
            title += "<h6>Top " + desc + "</h6>"
        } else {
            title += '<div class="toptable-title">' + data_period_formatted + "</div>"
        }
        return title
    }
    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) {
            return a.toUpperCase()
        })
    };

    function displayTopMetric(div_id, metric, metric_period, history, graph, titles, limit, people_links) {
        var top_metric_id = metric.name;
        if (!history || $.isEmptyObject(history)) return;
        var metric_id = metric.action;
        if (limit && history[metric_id].length < limit) {
            limit = history[metric_id].length;
            graph = false
        }
        var doer = metric.column;
        if (doer === undefined) doer = findMetricDoer(history, metric_id);
        var title = "Top " + top_metric_id + " " + metric_period;
        var div = null;
        if (table === undefined) return;
        if (titles === false) {
            div = $("#" + div_id);
            div.append(table);
            return
        }
        var div_graph = "";
        var new_div = "";
        if (graph) {
            div_graph = "top-" + graph + "-" + doer + "-";
            div_graph += metric_id + "-" + metric_period;
            new_div += "<div id='" + div_graph + "' class='graph' style='float:right'></div>"
        }
        new_div += table;
        div = $("#" + div_id);
        div.append(new_div);
        if (graph) {
            var labels = history[doer];
            var data = history[metric_id];
            if (limit) {
                labels = [];
                data = [];
                for (var i = 0; i < limit; i++) {
                    labels.push(history[doer][i]);
                    data.push(history[metric_id][i])
                }
            }
            displayBasicChart(div_graph, labels, data, graph)
        }
    }

    function displayDataSourcesTable(div) {
        Loader.data_ready(function() {
            dsources = Report.getDataSources();
            html = '<table class="table table-striped">';
            html += "<thead><th>Data Source</th><th>From</th>";
            html += "<th>To <small>(Updated on)</small></th></thead><tbody>";
            $.each(dsources, function(key, ds) {
                if (ds.getName() === "people") return;
                var gdata = ds.getGlobalData();
                var ds_name = ds.getTitle();
                if (ds_name === undefined) {
                    ds_name = "-"
                }
                var last_date = gdata.last_date;
                if (gdata.length === 0) {
                    return
                }
                if (ds_name === "Meetup events" && last_date === undefined) {
                    last_date = "-"
                }
                var first_date = gdata.first_date;
                if (first_date === undefined) {
                    first_date = "-"
                }
                var type = gdata.type;
                var repos = ds.getReposData();
                html += "<tr><td>";
                html += '<div class="panel-heading" role="tab" id="headingTable' + key + '">';
                html += '<a style="color: black" class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTable' + key + '" aria-expanded="false" aria-controls="collapseTable' + key + '">';
                html += ds_name;
                if (type !== undefined) {
                    type = type.toLowerCase();
                    type = type.charAt(0).toUpperCase() + type.slice(1);
                    html += " (" + type + ")"
                }
                html += "</a>";
                html += "</div>";
                html += '<div id="collapseTable' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTable' + key + '">';
                html += '<div class="panel-body" style="max-height: 400px;  word-break: break-all; word-wrap: break-word; overflow: auto;">';
                var mapped = repos.map(function(el, i) {
                    return {
                        index: i,
                        value: el.toLowerCase()
                    }
                });
                mapped.sort(function(a, b) {
                    return +(a.value > b.value) || +(a.value === b.value) - 1
                });
                var result = mapped.map(function(el) {
                    return repos[el.index]
                });
                var empty_val = 0;
                result.forEach(function(value, index) {
                    if (value !== "") {
                        if (ds_name == "Meetup events") {
                            html += '<a href="meetup-group.html?repository=' + value + "&ds=" + ds.name + '">' + (index + 1 - empty_val) + ". " + value + "</a><br>"
                        } else {
                            html += '<a href="repository.html?repository=' + value + "&ds=" + ds.name + '">' + (index + 1 - empty_val) + ". " + value + "</a><br>"
                        }
                    } else {
                        empty_val += 1
                    }
                });
                html += "</div>";
                html += "</div>";
                html += "</td>";
                html += "<td>" + first_date + "</td>";
                html += "<td>" + last_date + "</td></tr>"
            });
            html += "</tbody></table>";
            $(div).append(html)
        })
    }

    function showHelp(div_id, metrics, custom_help) {
        var all_metrics = Report.getAllMetrics();
        var help = '<a href="#" class="help"';
        var content = "";
        if (!custom_help || custom_help === "") {
            var addContent = function(id, value) {
                if (metrics[i] === id) {
                    content += "<strong>" + value.name + "</strong>: " + value.desc + "<br>";
                    return false
                }
            };
            for (var i = 0; i < metrics.length; i++) {
                $.each(all_metrics, addContent)
            }
        } else {
            content = "<strong>Description</strong>: " + custom_help
        }
        help += 'data-content="' + content + '" data-html="true">';
        help += '<img src="qm_15.png"></a>';
        var old_help = $("#" + div_id).prev()[0];
        if (old_help && old_help.className === "help") $("#" + div_id).prev().empty();
        $("#" + div_id).before(help)
    }

    function displayMetricsLines(div_id, metrics, history, title, config) {
        if (!(config && config.help === false)) showHelp(div_id, metrics, config.custom_help);
        var lines_data = [];
        if (config.remove_last_point) history = DataProcess.revomeLastPoint(history);
        if (config.frame_time) history = DataProcess.frameTime(history, metrics);
        if (config.start_time) history = DataProcess.filterDates(config.start_time, config.end_time, history);
        $.each(metrics, function(id, metric) {
            if (!history[metric]) return;
            var mdata = [];
            $.each(history[metric], function(i, value) {
                mdata[i] = [history.id[i], history[metric][i]]
            });
            var label = metric;
            if (Report.getAllMetrics()[metric]) label = Report.getAllMetrics()[metric].name;
            lines_data.push({
                label: label,
                data: mdata
            })
        });
        displayDSLines(div_id, history, lines_data, title, config)
    }

    function displayMetricsLinesRepos(div_id, metrics, history, title, config, repositories) {
        if (!(config && config.help === false)) showHelp(div_id, metrics, config.custom_help);
        var lines_data = [];
        var metric = metrics[0];
        var aux = {};
        $.each(history, function(item, data) {
            if (data === undefined) return false;
            if (data[metric] === undefined) return false;
            if (config.remove_last_point) data = DataProcess.revomeLastPoint(data);
            if (config.frame_time) data = DataProcess.frameTime(data, [metric]);
            if (config.start_time) data = DataProcess.filterDates(config.start_time, config.end_time, data);
            var mdata = [
                [],
                []
            ];
            $.each(data[metric], function(i, value) {
                mdata[i] = [data.id[i], data[metric][i]]
            });
            lines_data.push({
                label: item,
                data: mdata
            });
            aux = data
        });
        displayDSLines(div_id, aux, lines_data, title, config)
    }

    function displayMetricSubReportLines(div_id, metric, items, title, config, start, end, convert, order) {
        var lines_data = [];
        var history = {};
        $.each(items, function(item, data) {
            if (data === undefined) return false;
            if (data[metric] === undefined) return false;
            if (convert) data = DataProcess.convert(data, convert, metric);
            if (start) data = DataProcess.filterDates(start, end, data);
            if (config.frame_time) data = DataProcess.frameTime(data, [metric]);
            var cdata = [
                [],
                []
            ];
            for (var i = 0; i < data.id.length; i++) {
                var metric_value = data[metric][i];
                if (isNaN(metric_value)) {
                    metric_value = 0
                }
                cdata[i] = [data.id[i], metric_value]
            }
            item = Report.cleanLabel(item);
            lines_data.push({
                label: item,
                data: cdata
            });
            history = data
        });
        if (lines_data.length === 0) return;
        if (order) {
            var order_lines_data = [];
            $.each(order, function(i, value_order) {
                $.each(lines_data, function(j, value) {
                    if (value_order === value.label) {
                        order_lines_data.push(value);
                        return false
                    }
                })
            });
            lines_data = order_lines_data
        }
        displayDSLines(div_id, history, lines_data, title, config)
    }
    Viz.track_formatter_com_pending = function(o) {
        scr = Report.getDataSourceByName("scr");
        companies = scr.getCompaniesMetricsData();
        dhistory = Viz._history;
        lines_data = Viz._lines_data;
        var label = dhistory.date[parseInt(o.index, 10)];
        if (label === undefined) label = "";
        else label += "<br>";
        for (var i = 0; i < lines_data.length; i++) {
            var value = lines_data[i].data[o.index][1];
            if (value === undefined) continue;
            if (lines_data.length > 1) {
                if (lines_data[i].label !== undefined) company_name = lines_data[i].label;
                label += lines_data[i].label + ":"
            }
            label += "<strong>" + Report.formatValue(value) + "</strong>";
            if (company_name) {
                var pending_metric = "review_time_pending_upload_ReviewsWaitingForReviewer_reviews";
                var pending;
                if (companies[company_name][pending_metric] !== undefined) {
                    pending = companies[company_name][pending_metric][o.index]
                } else {
                    pending = companies[company_name]["scr_" + pending_metric][o.index]
                }
                label += "(" + pending + ")"
            }
            label += "<br>"
        }
        return label
    };

    function getConfLinesChart(title, legend_div, history, lines_data, mouse_tracker_fn) {
        var config = {
            subtitle: title,
            legend: {
                show: true,
                container: legend_div
            },
            xaxis: {
                minorTickFreq: 4,
                mode: "time",
                timeUnit: "second",
                timeFormat: "%b %y",
                margin: true
            },
            yaxis: {
                min: null,
                noTicks: 2,
                autoscale: true
            },
            grid: {
                verticalLines: false,
                color: "#000000",
                outlineWidth: 1,
                outline: "s"
            },
            mouse: {
                container: legend_div,
                track: true,
                trackY: false,
                relative: true,
                position: "ne",
                trackFormatter: function(o) {
                    var label = history.date[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i = 0; i < lines_data.length; i++) {
                        var value = lines_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (lines_data.length > 1) {
                            if (lines_data[i].label !== undefined) {
                                value_name = abbreviateLabel(lines_data[i].label);
                                label += value_name + ":"
                            }
                        }
                        label += "<strong>" + Report.formatValue(value) + "</strong><br>"
                    }
                    return label
                }
            },
            selection: {
                mode: "x",
                fps: 10
            },
            shadowSize: 4
        };
        if (mouse_tracker_fn) {
            Viz._history = history;
            Viz._lines_data = lines_data;
            config.mouse.trackFormatter = Viz[mouse_tracker_fn]
        }
        return config
    }

    function dropLastLineValue(history, lines_data) {
        if (lines_data.length === 0) return lines_data;
        if (lines_data.length > 1) {
            for (var j = 0; j < lines_data.length; j++) {
                var last = lines_data[j].data.length - 1;
                if (last >= 0) lines_data[j].data[last][1] = undefined
            }
        }
    }

    function lastLineValueToPoint(history, lines_data) {
        if (lines_data.length !== 1) return lines_data;
        var last = lines_data[0].data.length;
        var dots = [];
        var utime = 0;
        for (var i = 0; i < last - 1; i++) {
            utime = parseInt(history.unixtime[i], 10);
            dots.push([utime, undefined])
        }
        utime = parseInt(history.unixtime[last - 1], 10);
        dots.push([utime, lines_data[0].data[last - 1][1]]);
        var dot_graph = {
            data: dots
        };
        dot_graph.points = {
            show: true,
            radius: 3,
            lineWidth: 1,
            fillColor: null,
            shadowSize: 0
        };
        lines_data.push(dot_graph);
        lines_data[0].data[last - 1][1] = undefined;
        lines_data[1].label = lines_data[0].label;
        return lines_data
    }

    function composeRangeText(former_title, starting_utime, end_utime) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var date = new Date(parseInt(starting_utime, 10) * 1e3);
        var starting_date = months[date.getMonth()] + " " + date.getFullYear();
        date = new Date(parseInt(end_utime, 10) * 1e3);
        var end_date = months[date.getMonth()] + " " + date.getFullYear();
        return former_title + " ( " + starting_date + " - " + end_date + " )"
    }

    function sortBiArray(bi_array) {
        bi_array.sort(function(a, b) {
            return a[1] > b[1] || b[1] === undefined ? 1 : -1
        });
        return bi_array
    }

    function getMax(multiple_array, from_unixstamp, to_unixstamp) {
        from_unixstamp = Math.round(from_unixstamp);
        to_unixstamp = Math.round(to_unixstamp);
        var narrays = multiple_array.length;
        var aux_array = [];
        for (var i = 0; i < narrays; i++) {
            for (var z = multiple_array[i].data.length - 1; z > 0; z--) {
                var aux_value = multiple_array[i].data[z][0];
                var cond = aux_value < from_unixstamp || aux_value > to_unixstamp;
                if (cond) {
                    multiple_array[i].data.splice(z, 1)
                }
            }
        }
        var res = [];
        for (i = 0; i < narrays; i++) {
            aux_array = multiple_array[i].data;
            aux_array = sortBiArray(aux_array);
            res.push(aux_array[aux_array.length - 1][1])
        }
        res.sort(function(a, b) {
            return a - b
        });
        return res[res.length - 1]
    }

    function addEmptyValue(lines_data) {
        if (lines_data[0].data.length == 1) {
            return
        }
        var step = lines_data[0].data[1][0] - lines_data[0].data[0][0];
        var narrays = lines_data.length;
        var last_date = 0;
        for (var i = 0; i < narrays; i++) {
            var mylength = lines_data[i].data.length;
            last_date = lines_data[i].data[mylength - 1][0];
            lines_data[i].data.push([last_date + step, undefined])
        }
        return lines_data
    }

    function displayDSLines(div_id, history, lines_data, title, config_metric) {
        var use_stacked = false;
        if (config_metric) {
            if (config_metric.lines && config_metric.lines.stacked) {
                use_stacked = true
            }
        }
        if (use_stacked) {
            displayDSLinesStacked(div_id, history, lines_data, title, config_metric)
        } else if (history.unixtime === undefined) {
            displayDSLinesStacked(div_id, history, lines_data, title, config_metric)
        } else {
            displayDSLinesZoom(div_id, history, lines_data, title, config_metric)
        }
    }

    function abbreviateLabel(string) {
        if (string.length >= 18) {
            if (string.indexOf(" ") > 0 && string.split(" ").length == 2) {
                var slices = string.split(" ");
                return slices[0] + "<br/>&nbsp;" + slices[1]
            } else {
                var l = string.length;
                return string.slice(0, 4) + "..." + string.slice(string.length - 12)
            }
        } else {
            return string
        }
    }

    function displayDSLinesStacked(div_id, history, lines_data, title, config_metric) {
        var container = document.getElementById(div_id);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container) legend_div = $("#" + config_metric.legend.container);
        var config = {
            subtitle: title,
            legend: {
                show: true,
                container: legend_div
            },
            xaxis: {
                minorTickFreq: 4,
                tickFormatter: function(x) {
                    var index = null;
                    for (var i = 0; i < history.id.length; i++) {
                        if (parseInt(x, 10) === history.id[i]) {
                            index = i;
                            break
                        }
                    }
                    return history.date[index]
                }
            },
            yaxis: {
                min: 0,
                noTicks: 2,
                autoscale: false
            },
            grid: {
                verticalLines: false,
                color: "#000000",
                outlineWidth: 1,
                outline: "s"
            },
            mouse: {
                container: legend_div,
                track: true,
                trackY: false,
                trackFormatter: function(o) {
                    var label = history.date[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i = 0; i < lines_data.length; i++) {
                        var value = lines_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (lines_data.length > 1) {
                            if (lines_data[i].label !== undefined) label += abbreviateLabel(lines_data[i].label) + ":"
                        }
                        label += Report.formatValue(value) + "<br>"
                    }
                    return label
                }
            }
        };
        if (config_metric) {
            if (!config_metric.show_title) config.title = "";
            if ("show_legend" in config_metric) {
                if (config_metric.show_legend === true) config.legend.show = true;
                else config.legend.show = false
            }
            if (config_metric.lines && config_metric.lines.stacked) config.lines = {
                stacked: true,
                fill: true,
                fillOpacity: 1,
                fillBorder: true,
                lineWidth: .01
            };
            if (!config_metric.show_labels) {
                config.xaxis.showLabels = false;
                config.yaxis.showLabels = false
            }
            if (config_metric.show_grid === false) {
                config.grid.verticalLines = false;
                config.grid.horizontalLines = false;
                config.grid.outlineWidth = 0
            }
            if (config_metric.show_mouse === false) {
                config.mouse.track = false
            }
            if (config_metric.graph === "bars") {
                config.bars = {
                    show: true
                }
            }
            if (config_metric.light_style === true) {
                config.grid.color = "#ccc";
                config.legend.show = false
            }
            if (config_metric.custom_title) {
                config.subtitle = config_metric.custom_title
            }
        }
        var showLastPoint = false;
        if (config_metric.graph !== "bars" && lines_data.length === 1 && lines_data[0].data[0][0] === 0) {
            showLastPoint = true
        }
        if (showLastPoint) {
            lines_data = lastLineValueToPoint(history, lines_data);
            var next_id = history.id[history.id.length - 1] + 1;
            lines_data[0].data.push([next_id, undefined]);
            lines_data[1].data.push([next_id, undefined]);
            history.date.push("");
            history.id.push(next_id)
        }
        graph = Flotr.draw(container, lines_data, config);
        if (showLastPoint) {
            if (history.date) history.date.pop();
            if (history.id) history.id.pop()
        }
    }

    function guessBarWidth(lines_data, history) {
        var gap_size;
        var data_sets = lines_data.length;
        gap_size = parseInt(history.unixtime[1], 10) - parseInt(history.unixtime[0], 10);
        return gap_size / (data_sets + 1)
    }

    function timeToUnixTime(lines_data, history, bars_flag, bar_width) {
        var number_lines = lines_data.length;
        var data_length = lines_data[0].data.length;
        for (var z = 0; z < number_lines; z++) {
            for (var i = 0; i < data_length; i++) {
                if (bars_flag) {
                    lines_data[z].data[i][0] = parseInt(history.unixtime[i], 10) + z * bar_width
                } else {
                    lines_data[z].data[i][0] = parseInt(history.unixtime[i], 10)
                }
            }
        }
        return lines_data
    }

    function displayDSLinesZoom(div_id, history, lines_data, title, config_metric) {
        var bars_flag = false;
        var bar_width;
        if (lines_data.length === 0) return;
        var container = document.getElementById(div_id);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container) legend_div = $("#" + config_metric.legend.container);
        var config = getConfLinesChart(title, legend_div, history, lines_data, config_metric.mouse_tracker);
        if (config_metric) {
            if (!config_metric.show_title) config.title = "";
            if ("show_legend" in config_metric) {
                if (config_metric.show_legend === true) config.legend.show = true;
                else config.legend.show = false
            }
            if (config_metric.lines && config_metric.lines.stacked) {
                config.lines = {
                    stacked: true,
                    fill: true,
                    fillOpacity: 1,
                    fillBorder: true,
                    lineWidth: .01
                }
            }
            if (!config_metric.show_labels) {
                config.xaxis.showLabels = false;
                config.yaxis.showLabels = false
            }
            if (config_metric.show_grid === false) {
                config.grid.verticalLines = false;
                config.grid.horizontalLines = false;
                config.grid.outlineWidth = 0
            }
            if (config_metric.show_mouse === false) {
                config.mouse.track = false
            }
            if (config_metric.graph === "bars") {
                config.bars = {
                    show: true,
                    stacked: false,
                    horizontal: false,
                    barWidth: 728e3,
                    lineWidth: 1
                };
                config.bars.barWidth = guessBarWidth(lines_data, history);
                bars_flag = true;
                bar_width = config.bars.barWidth
            }
            if (config_metric.light_style === true) {
                config.grid.color = "#ccc";
                config.legend.show = false
            }
            if (config_metric.custom_title) {
                config.subtitle = config_metric.custom_title
            }
            config.mouse.position = "n";
            config.mouse.margin = 20
        }
        if (lines_data.length > 1) config.legend.show = true;
        lines_data = timeToUnixTime(lines_data, history, bars_flag, bar_width);
        var showLastPoint = false;
        if (Utils.isReleasePage() === false) {
            if (config_metric.graph !== "bars" && lines_data.length === 1) {
                showLastPoint = true
            }
            if (showLastPoint) {
                lines_data = lastLineValueToPoint(history, lines_data);
                addEmptyValue(lines_data)
            } else if (!showLastPoint && lines_data.length > 1) {
                dropLastLineValue(history, lines_data)
            }
        }

        function drawGraph(opts) {
            var o = Flotr._.extend(Flotr._.clone(config), opts || {});
            return Flotr.draw(container, lines_data, o)
        }
        graph = drawGraph();
        Flotr.EventAdapter.observe(container, "flotr:select", function(area) {
            var zoom_options = {
                xaxis: {
                    minorTickFreq: 4,
                    mode: "time",
                    timeUnit: "second",
                    timeFormat: "%b %y",
                    min: area.x1,
                    max: area.x2
                },
                yaxis: {
                    min: area.y1,
                    autoscale: true
                },
                grid: {
                    verticalLines: true,
                    color: "#000000",
                    outlineWidth: 1,
                    outline: "s"
                }
            };
            zoom_options.subtitle = composeRangeText(config.subtitle, area.xfirst, area.xsecond);
            var new_lines_data_object = JSON.parse(JSON.stringify(lines_data));
            var max_value = getMax(new_lines_data_object, area.x1, area.x2);
            zoom_options.yaxis.max = max_value + max_value * .2;
            graph = drawGraph(zoom_options)
        });
        Flotr.EventAdapter.observe(container, "flotr:click", function() {
            drawGraph()
        });
        $(window).resize(function() {
            drawGraph()
        })
    }

    function displayTimeZone(divid, labels, data, metric_name) {
        var pretty_mname = metric_name.charAt(0).toUpperCase() + metric_name.slice(1);
        var title = pretty_mname + " by Time Zone";
        var container = document.getElementById(divid);
        var chart_data = [],
            i;
        var legend_div = null;
        for (i = 0; i < data.length; i++) {
            chart_data.push({
                data: [
                    [labels[i], data[i]]
                ],
                label: i
            })
        }
        var config = {
            subtitle: title,
            grid: {
                verticalLines: false,
                outlineWidth: 0,
                horizontalLines: true
            },
            xaxis: {
                tickFormatter: function(value) {
                    var label = "UTC ";
                    if (value > 0) label += "+" + value;
                    else label += value;
                    return label
                },
                color: "#000000",
                tickDecimals: 0
            },
            yaxis: {
                showLabels: true,
                min: 0,
                noTicks: 2,
                color: "#000000"
            },
            mouse: {
                track: true,
                trackY: false,
                relative: true,
                position: "n",
                trackDecimals: 0,
                trackFormatter: function(tuple) {
                    var label = "UTC ";
                    if (tuple.x > 0) label += "+" + tuple.x;
                    else label += tuple.x;
                    pretty_name = metric_name.charAt(0).toUpperCase() + metric_name.slice(1);
                    label += "<br/> " + pretty_name + ": <strong>" + tuple.y + "</strong>";
                    return label
                }
            },
            legend: {
                show: false
            },
            bars: {
                show: true,
                color: "#008080",
                fillColor: "#008080",
                fillOpacity: .6
            }
        };
        graph = Flotr.draw(container, chart_data, config);
        $(window).resize(function() {
            graph = Flotr.draw(container, chart_data, config)
        })
    }

    function displayBasicChart(divid, labels, data, graph, title, config_metric, rotate, fixColor, yformatter) {
        var horizontal = false;
        if (rotate) horizontal = true;
        var container = document.getElementById(divid);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container) legend_div = $("#" + config_metric.legend.container);
        var chart_data = [],
            i;
        var label = "";
        if (!horizontal) {
            for (i = 0; i < data.length; i++) {
                if (labels) label = DataProcess.hideEmail(labels[i]);
                chart_data.push({
                    data: [
                        [i, data[i]]
                    ],
                    label: label
                })
            }
        } else {
            for (i = 0; i < data.length; i++) {
                if (labels) label = DataProcess.hideEmail(labels[i]);
                chart_data.push({
                    data: [
                        [data[i], i]
                    ],
                    label: label
                })
            }
        }
        var config = {
            subtitle: title,
            grid: {
                verticalLines: false,
                horizontalLines: false,
                outlineWidth: 0
            },
            xaxis: {
                showLabels: false,
                min: 0
            },
            yaxis: {
                showLabels: false,
                min: 0
            },
            mouse: {
                container: legend_div,
                track: true,
                trackFormatter: function(o) {
                    var i = "x";
                    if (horizontal) i = "y";
                    var label = "";
                    if (labels) label = DataProcess.hideEmail(labels[parseInt(o[i], 10)]) + ": ";
                    return label + data[parseInt(o[i], 10)]
                }
            },
            legend: {
                show: false,
                position: "se",
                backgroundColor: "#D2E8FF",
                container: legend_div
            }
        };
        if (config_metric) {
            if (!config_metric.show_title) config.title = "";
            if (config_metric.show_legend) config.legend.show = true
        }
        if (graph === "bars") {
            config.bars = {
                show: true,
                horizontal: horizontal
            };
            if (fixColor) {
                config.bars.color = fixColor;
                config.bars.fillColor = fixColor
            }
            if (config_metric && config_metric.show_legend !== false) config.legend = {
                show: true,
                position: "ne",
                container: legend_div
            };
            config.grid.horizontalLines = true;
            config.yaxis = {
                showLabels: true,
                min: 0
            };
            if (config_metric && config_metric.xaxis) config.xaxis = {
                showLabels: config_metric.xaxis,
                min: 0
            };
            if (yformatter) {
                config.yaxis = {
                    showLabels: true,
                    min: 0,
                    tickFormatter: yformatter
                }
            }
        }
        if (graph === "pie") {
            config.pie = {
                show: true
            };
            config.mouse.position = "ne"
        }
        graph = Flotr.draw(container, chart_data, config)
    }

    function displayMultiColumnChart(divid, labels, data, title, config_metric, rotate, yformatter, period_year) {
        var bar_width = .4;
        var lseries = data[0].length;
        if (data[1].length > lseries) lseries = data[1].length;
        var horizontal = false;
        if (rotate) horizontal = true;
        var container = document.getElementById(divid);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container) legend_div = $("#" + config_metric.legend.container);
        var serie1 = [],
            i, serie2 = [],
            data_viz = [];
        for (i = 0; i < lseries; i++) {
            var val1, val2;
            if (data[0].length > i) val1 = data[0][i];
            else val1 = undefined;
            if (data[1].length > i) val2 = data[1][i];
            else val2 = undefined;
            if (!horizontal) {
                serie1.push([i - bar_width / 2, val1]);
                serie2.push([i + bar_width / 2, val2])
            } else {
                serie1.push([val1, i - bar_width / 2]);
                serie2.push([val2, i + bar_width / 2])
            }
        }
        data_viz = [{
            data: serie1,
            label: labels[0]
        }, {
            data: serie2,
            label: labels[1]
        }];
        var config = {
            title: title,
            bars: {
                show: true,
                horizontal: horizontal,
                barWidth: bar_width
            },
            grid: {
                verticalLines: false,
                horizontalLines: false,
                outlineWidth: 0
            },
            xaxis: {
                showLabels: false,
                min: 0
            },
            yaxis: {
                showLabels: true,
                min: 0
            },
            mouse: {
                container: legend_div,
                track: true,
                trackFormatter: function(o) {
                    var index;
                    var i = "x";
                    if (horizontal) i = "y";
                    var point = parseFloat(o[i], 1);
                    var point_down = Math.round((point - .2) * 10) / 10;
                    var point_up = Math.round((point + .2) * 10) / 10;
                    if (point_down === parseInt(point, 10)) index = point_down;
                    else index = point_up;
                    var years = index;
                    if (period_year) years = index * period_year;
                    var label = years + " years: ";
                    var val1, val2;
                    if (serie1[index] === undefined) val1 = 0;
                    else val1 = parseInt(serie1[index][0], 10);
                    if (isNaN(val1)) val1 = 0;
                    if (serie2[index] === undefined) val2 = 0;
                    else val2 = parseInt(serie2[index][0], 10);
                    if (isNaN(val2)) val2 = 0;
                    label += val1 + " " + labels[0];
                    label += " , ";
                    label += val2 + " " + labels[1];
                    label += " (" + parseInt(val1 / val2 * 100, 10) + "% )";
                    return label
                }
            },
            legend: {
                show: true,
                position: "ne",
                backgroundColor: "#D2E8FF",
                container: legend_div
            }
        };
        if (config_metric) {
            if (!config_metric.show_title) config.title = "";
            if (config_metric.show_legend) config.legend.show = true
        }
        if (config_metric && config_metric.show_legend !== false) config.legend = {
            show: true,
            position: "ne",
            container: legend_div
        };
        config.grid.horizontalLines = true;
        config.yaxis = {
            showLabels: true,
            min: 0
        };
        if (yformatter) {
            config.yaxis = {
                showLabels: true,
                min: 0,
                tickFormatter: yformatter
            }
        }
        if (config_metric && config_metric.xaxis) config.xaxis = {
            showLabels: config_metric.xaxis,
            min: 0
        };
        graph = Flotr.draw(container, data_viz, config)
    }

    function displayBubbles(divid, metric1, metric2, radius) {
        var container = document.getElementById(divid);
        var DS = Report.getMetricDS(metric1)[0];
        var DS1 = Report.getMetricDS(metric2)[0];
        var bdata = [];
        if (DS != DS1) {
            Report.log("Metrics for bubbles have different data sources");
            return
        }
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function(index, ds) {
            if (ds.getName() === DS.getName()) {
                full_data.push(ds.getData());
                projects.push(ds.getProject())
            }
        });
        var dates = [
            [],
            []
        ];
        dates = [full_data[0].id, full_data[0].date];
        for (var i = 0; i < full_data.length; i++) {
            if (full_data[i] instanceof Array) return;
            dates = DataProcess.fillDates(dates, [full_data[i].id, full_data[i].date])
        }
        for (var j = 0; j < full_data.length; j++) {
            var serie = [];
            var data = full_data[j];
            var data1 = DataProcess.fillHistory(dates[0], [data.id, data[metric1]]);
            var data2 = DataProcess.fillHistory(dates[0], [data.id, data[metric2]]);
            for (i = 0; i < dates[0].length; i++) {
                serie.push([dates[0][i], data1[1][i], data2[1][i]])
            }
            bdata.push({
                label: projects[j],
                data: serie
            })
        }
        var config = {
            bubbles: {
                show: true,
                baseRadius: 5
            },
            mouse: {
                track: true,
                trackFormatter: function(o) {
                    var value = full_data[0].date[o.index] + ": ";
                    value += o.series.label + " ";
                    value += o.series.data[o.index][1] + " " + metric1 + ",";
                    value += o.series.data[o.index][2] + " " + metric2;
                    return value
                }
            },
            xaxis: {
                tickFormatter: function(o) {
                    return full_data[0].date[parseInt(o, 10) - full_data[0].id[0]]
                }
            }
        };
        if (DS.getName() === "its") $.extend(config.bubbles, {
            baseRadius: 1
        });
        if (radius) {
            $.extend(config.bubbles, {
                baseRadius: radius
            })
        }
        Flotr.draw(container, bdata, config)
    }

    function displayDemographicsChart(divid, data, period_year) {
        if (!data) return;
        if (!period_year) period_year = .25;
        else period = 365 * period_year;
        var period_data_aging = [];
        var period_data_birth = [];
        var labels = [],
            i;
        var config = {
            show_legend: false,
            xaxis: true
        };
        var age, index;
        if (data.aging.persons.age !== undefined) {
            for (i = 0; i < data.aging.persons.age.length; i++) {
                age = data.aging.persons.age[i];
                age = age.toString().split(" ")[0];
                index = parseInt(age / period, 10);
                if (!period_data_aging[index]) period_data_aging[index] = 0;
                period_data_aging[index] += 1
            }
        }
        if (data.birth.persons.age !== undefined) {
            for (i = 0; i < data.birth.persons.age.length; i++) {
                age = data.birth.persons.age[i];
                age = age.toString().split(" ")[0];
                age = age.split(" ")[0];
                index = parseInt(age / period, 10);
                if (!period_data_birth[index]) period_data_birth[index] = 0;
                period_data_birth[index] += 1
            }
        }
        labels = ["Retained", "Attracted"];
        yticks = function(val, axisOpts) {
            var period = period_year;
            var unit = "years";
            val = val * period_year;
            return val + " " + unit
        };
        var period_data = [period_data_aging, period_data_birth];
        if (data) displayMultiColumnChart(divid, labels, period_data, "", config, true, yticks, period_year)
    }

    function displayRadarChart(div_id, ticks, data) {
        var container = document.getElementById(div_id);
        var max = $("#" + div_id).data("max");
        var border = .2;
        if (!max) max = 0;
        for (var j = 0; j < data.length; j++) {
            for (var i = 0; i < data[j].data.length; i++) {
                var value = data[j].data[i][1];
                if (value > max) {
                    max = value;
                    max = parseInt(max * (1 + border), 10)
                }
            }
        }(function() {
            var x = [data, ticks]
        })();
        graph = Flotr.draw(container, data, {
            radar: {
                show: true
            },
            mouse: {
                track: true,
                trackFormatter: function(o) {
                    var value = "";
                    for (var i = 0; i < data.length; i++) {
                        value += data[i].label + " ";
                        value += data[i].data[o.index][1] + " ";
                        value += ticks[o.index][1] + "<br>"
                    }
                    return value
                }
            },
            grid: {
                circular: true,
                minorHorizontalLines: true
            },
            yaxis: {
                min: 0,
                max: max,
                minorTickFreq: 1
            },
            xaxis: {
                ticks: ticks
            }
        })
    }

    function displayRadar(div_id, metrics) {
        var data = [],
            ticks = [];
        var radar_data = [];
        var projects = [];
        var i = 0,
            j = 0;
        for (i = 0; i < metrics.length; i++) {
            var DS = Report.getMetricDS(metrics[i]);
            for (j = 0; j < DS.length; j++) {
                if (!data[j]) {
                    data[j] = [];
                    projects[j] = DS[j].getProject()
                }
                data[j].push([i, parseInt(DS[j].getGlobalData()[metrics[i]], 10)])
            }
            ticks.push([i, DS[0].getMetrics()[metrics[i]].name])
        }
        for (j = 0; j < data.length; j++) {
            radar_data.push({
                label: projects[j],
                data: data[j]
            })
        }
        displayRadarChart(div_id, ticks, radar_data)
    }

    function displayRadarCommunity(div_id) {
        var metrics = ["scm_committers", "scm_authors", "its_openers", "its_closers", "its_changers", "mls_senders"];
        displayRadar(div_id, metrics)
    }

    function displayRadarActivity(div_id) {
        var metrics = ["scm_commits", "scm_files", "its_opened", "its_closed", "its_changed", "mls_sent"];
        displayRadar(div_id, metrics)
    }

    function displayTimeToAttention(div_id, ttf_data, column, labels, title) {
        displayTimeTo(div_id, ttf_data, column, labels, title)
    }

    function displayTimeToFix(div_id, ttf_data, column, labels, title) {
        console.log("DEBUG: time to fix labels are");
        console.log(labels);
        console.log(column);
        console.log(title);
        console.log(div_id);
        ttf_data.labels = ['99%', '95%', '50%', '25%'];
        column = '99%,95%,50%,25%';
        //column = '99%,95%';
        //column = '50%,25%';
        console.log(ttf_data);
        ttf_data.data['99%'] = ttf_data.data['X0.99'];
        ttf_data.data['95%'] = ttf_data.data['X0.95'];
        ttf_data.data['50%'] = ttf_data.data['X0.5'];
        ttf_data.data['25%'] = ttf_data.data['X0.25'];
        displayTimeTo(div_id, ttf_data, column, labels, title)
    }

    function displayTimeTo(div_id, ttf_data, column, labels, title) {
        var metrics = column.split(",");
        var history = ttf_data.data;
        if (!history[metrics[0]]) return;
        var new_history = {};
        new_history.date = history.date;
        $.each(history, function(name, data) {
            if ($.inArray(name, metrics) === -1) return;
            new_history[name] = [];
            for (var i = 0; i < data.length; i++) {
                var hours = parseFloat((parseInt(data[i], null) / 24).toFixed(2), 10);
                new_history[name].push(hours)
            }
        });
        new_history.id = [];
        for (var i = 0; i < history[metrics[0]].length; i++) {
            new_history.id.push(i)
        }
        var config = {
            show_legend: true,
            show_labels: true
        };
        displayMetricsLines(div_id, metrics, new_history, column, config)
    }

    function displayTop(div, ds, all, selected_metric, period, period_all, graph, titles, limit, people_links, threads_links, repository) {
        var desc_metrics = ds.getMetrics();
        if (all === undefined) all = true;
        var history;
        if (repository === undefined) {
            history = ds.getGlobalTopData()
        } else {
            history = ds.getRepositoriesTopData()[repository]
        }
        if (Utils.isReleasePage()) {
            period_all = false;
            period = ""
        }
        if (period_all === true) {
            var filtered_history = {};
            $.each(history, function(key, value) {
                var aux = key.split(".");
                var data_metric = aux[0];
                var data_period = aux[1];
                if (selected_metric && selected_metric !== data_metric) {
                    return true
                }
                if (selected_metric && selected_metric === data_metric) {
                    filtered_history[key] = history[key]
                }
            });
            var classname = ds.getName() + selected_metric;
            var opts = {
                metric: selected_metric,
                class_name: classname,
                links_enabled: people_links,
                limit: limit,
                period: "all",
                ds_name: ds.getName(),
                desc_metrics: desc_metrics
            };
            Table.displayTopTable(div, filtered_history, opts)
        } else {
            $.each(history, function(key, value) {
                var aux = key.split(".");
                var data_metric = aux[0];
                var data_period = aux[1];
                if (selected_metric && selected_metric !== data_metric) return true;
                if (period !== undefined && period !== data_period) return true;
                var classname = ds.getName() + selected_metric;
                var opts = {
                    metric: selected_metric,
                    class_name: classname,
                    links_enabled: people_links,
                    limit: limit,
                    period: data_period,
                    ds_name: ds.getName(),
                    desc_metrics: desc_metrics
                };
                Table.displayTopTable(div, history, opts)
            })
        }
    }

    function displayTopCompany(ds, company, data, div, selected_metric, period, titles, height, people_links) {
        var graph = null,
            limit = 0,
            desc_metrics = ds.getMetrics();
        var classname = ds.getName() + selected_metric;
        var opts = {
            metric: selected_metric,
            class_name: classname,
            links_enabled: people_links,
            limit: limit,
            period: period,
            ds_name: ds.getName(),
            desc_metrics: desc_metrics,
            height: height
        };
        Table.displayTopTable(div, data, opts)
    }

    function displayTopRepo(ds, repo, data, div, selected_metric, period, titles, height, people_links) {
        var graph = null,
            limit = 0,
            desc_metrics = ds.getMetrics();
        var classname = ds.getName() + selected_metric;
        var opts = {
            metric: selected_metric,
            class_name: classname,
            links_enabled: people_links,
            limit: limit,
            period: period,
            ds_name: ds.getName(),
            desc_metrics: desc_metrics,
            height: height
        };
        Table.displayTopTable(div, data, opts)
    }

    function displayTopGlobal(div, data_source, metric_id, period, titles) {
        var project = data_source.getProject();
        var metric = data_source.getMetrics()[metric_id];
        var graph = null;
        if (!data_source.getGlobalTopData()[metric_id]) return;
        data = data_source.getGlobalTopData()[metric_id][period];
        displayTopMetric(div, project, metric, period, data, graph, titles)
    }

    function displayTreeMap(divid, data_file, data) {
        if (data === undefined) {
            if (data_file === undefined) return;
            Loader.get_file_data_div(data_file, Viz.displayTreeMap, divid);
            return
        } else if (data === null) return;
        var color = d3.scale.category20c();
        var div = d3.select("#" + divid);
        var width = $("#" + divid).width(),
            height = $("#" + divid).height();
        var treemap = d3.layout.treemap().size([width, height]).sticky(true).value(function(d) {
            return d.size
        });
        var position = function() {
            this.style("left", function(d) {
                return d.x + "px"
            }).style("top", function(d) {
                return d.y + "px"
            }).style("width", function(d) {
                return Math.max(0, d.dx - 1) + "px"
            }).style("height", function(d) {
                return Math.max(0, d.dy - 1) + "px"
            })
        };
        var node = div.datum(data).selectAll(".node").data(treemap.nodes).enter().append("div").attr("class", "treemap-node").call(position).style("background", function(d) {
            return d.children ? color(d.name) : null
        }).text(function(d) {
            return d.children ? null : d.name
        });
        d3.selectAll("input").on("change", function change() {
            var value = this.value === "count" ? function() {
                return 1
            } : function(d) {
                return d.size
            };
            node.data(treemap.value(value).nodes).transition().duration(1500).call(position)
        })
    }
    Viz.getEnvisionOptionsMin = function(div_id, history, hide) {
        var firstMonth = history.id[0],
            container = document.getElementById(div_id),
            options;
        var markers = Report.getMarkers();
        var basic_metrics = Report.getAllMetrics();
        options = {
            container: container,
            xTickFormatter: function(index) {
                var label = history.date[index - firstMonth];
                if (label === "0") label = "";
                return label
            },
            yTickFormatter: function(n) {
                return n + ""
            },
            selection: {
                data: {
                    x: {
                        min: history.id[0],
                        max: history.id[history.id.length - 1]
                    }
                }
            }
        };
        options.data = {
            summary: [history.id, history.sent],
            markers: markers,
            dates: history.date,
            envision_hide: hide,
            main_metric: "sent"
        };
        var all_metrics = Report.getAllMetrics();
        var label = null;
        for (var metric in history) {
            label = metric;
            if (all_metrics[metric]) label = all_metrics[metric].name;
            options.data[metric] = [{
                label: label,
                data: [history.id, history[metric]]
            }]
        }
        options.trackFormatter = function(o) {
            var sdata = o.series.data,
                index = sdata[o.index][0] - firstMonth;
            var value = history.date[index] + ":<br>";
            for (var metric in basic_metrics) {
                if (history[metric] === undefined) continue;
                value += history[metric][index] + " " + metric + " , "
            }
            return value
        };
        return options
    };

    function getEnvisionOptions(div_id, projects_data, ds_name, hide, summary_graph) {
        var basic_metrics = null,
            main_metric = "",
            summary_data = [
                [],
                []
            ];
        if (ds_name) {
            $.each(Report.getDataSources(), function(i, DS) {
                if (DS.getName() === ds_name) {
                    basic_metrics = DS.getMetrics();
                    return false
                }
            })
        } else basic_metrics = Report.getAllMetrics();
        $.each(Report.getDataSources(), function(i, DS) {
            main_metric = DS.getMainMetric();
            if (ds_name === null && DS.getName() === "scm" || ds_name && DS.getName() == ds_name) {
                summary_data = [DS.getData().id, DS.getData()[main_metric]];
                if (summary_graph === false) summary_data = [DS.getData().id, []];
                return false
            }
        });
        var dates = [
            [],
            []
        ];
        $.each(projects_data, function(project, data) {
            $.each(data, function(index, DS) {
                if (ds_name && ds_name !== DS.getName()) return;
                dates = DataProcess.fillDates(dates, [DS.getData().id, DS.getData().date])
            })
        });
        var firstMonth = dates[0][0],
            container = document.getElementById(div_id),
            options;
        var markers = Report.getMarkers();
        options = {
            container: container,
            xTickFormatter: function(index) {
                var label = dates[1][index - firstMonth];
                if (label === "0") label = "";
                return label
            },
            yTickFormatter: function(n) {
                return n + ""
            },
            selection: {
                data: {
                    x: {
                        min: dates[0][0],
                        max: dates[0][dates[0].length - 1]
                    }
                }
            }
        };
        options.data = {
            summary: DataProcess.fillHistory(dates[0], summary_data),
            markers: markers,
            dates: dates[1],
            envision_hide: hide,
            main_metric: main_metric
        };
        var project = null;
        var buildProjectInfo = function(index, ds) {
            var data = ds.getData();
            if (data[metric] === undefined) return;
            if (options.data[metric] === undefined) options.data[metric] = [];
            var full_data = DataProcess.fillHistory(dates[0], [data.id, data[metric]]);
            if (metric === main_metric) {
                options.data[metric].push({
                    label: project,
                    data: full_data
                });
                if (data[metric + "_relative"] === undefined) return;
                if (options.data[metric + "_relative"] === undefined) options.data[metric + "_relative"] = [];
                full_data = DataProcess.fillHistory(dates[0], [data.id, data[metric + "_relative"]]);
                options.data[metric + "_relative"].push({
                    label: project,
                    data: full_data
                })
            } else {
                options.data[metric].push({
                    label: project,
                    data: full_data
                })
            }
        };
        var buildProjectsInfo = function(name, pdata) {
            project = name;
            $.each(pdata, buildProjectInfo)
        };
        for (var metric in basic_metrics) {
            $.each(projects_data, buildProjectsInfo)
        }
        options.trackFormatter = function(o) {
            var sdata = o.series.data,
                index = sdata[o.index][0] - firstMonth;
            var project_metrics = {};
            var projects = Report.getProjectsList();
            for (var j = 0; j < projects.length; j++) {
                project_metrics[projects[j]] = {}
            }
            var value = dates[1][index] + ":<br>";
            for (var metric in basic_metrics) {
                if (options.data[metric] === undefined) continue;
                if ($.inArray(metric, options.data.envision_hide) > -1) continue;
                for (j = 0; j < projects.length; j++) {
                    if (options.data[metric][j] === undefined) continue;
                    var project_name = options.data[metric][j].label;
                    var pdata = options.data[metric][j].data;
                    value = pdata[1][index];
                    project_metrics[project_name][metric] = value
                }
            }
            value = "<table><tr><td align='right'>" + dates[1][index] + "</td></tr>";
            value += "<tr>";
            if (projects.length > 1) value += "<td></td>";
            for (metric in basic_metrics) {
                if (options.data[metric] === undefined) continue;
                if ($.inArray(metric, options.data.envision_hide) > -1) continue;
                value += "<td>" + basic_metrics[metric].name + "</td>"
            }
            value += "</tr>";
            $.each(project_metrics, function(project, metrics) {
                var row = "<tr>";
                for (var metric in basic_metrics) {
                    if (options.data[metric] === undefined) continue;
                    if ($.inArray(metric, options.data.envision_hide) > -1) continue;
                    mvalue = project_metrics[project][metric];
                    if (mvalue === undefined) mvalue = "n/a";
                    row += "<td>" + mvalue + "</td>"
                }
                if (projects.length > 1) row = "<td>" + project + "</td>" + row;
                row += "</tr>";
                value += row
            });
            value += "</table>";
            return value
        };
        return options
    }

    function checkBasicConfig(config) {
        if (config === undefined) config = {};
        if (config.show_desc === undefined) config.show_desc = true;
        if (config.show_title === undefined) config.show_title = true;
        if (config.show_labels === undefined) config.show_labels = true;
        return config
    }

    function getMetricFriendlyName(metrics) {
        desc_metrics = Report.getAllMetrics();
        var title = "";
        for (var i = 0; i < metrics.length; i++) {
            if (i !== 0) {
                title += " vs. "
            }
            if (metrics[i] in desc_metrics) title += desc_metrics[metrics[i]].name;
            else title += metrics[i]
        }
        return title
    }

    function displayMetricsEvol(ds, metrics, data, div_target, config, repositories) {
        config = checkBasicConfig(config);
        var title = "";
        if (config.show_title) {
            if (config.title === undefined) {
                title = getMetricFriendlyName(metrics)
            } else {
                title = config.title
            }
        }
        if (repositories !== undefined) {
            displayMetricsLinesRepos(div_target, metrics, data, title, config)
        } else {
            displayMetricsLines(div_target, metrics, data, title, config)
        }
    }

    function displayMetricsCompany(ds, company, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricsRepo(ds, repo, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricsDomain(ds, domain, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricsProject(ds, project, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricsPeople(ds, upeople_identifier, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricRepos(metric, data, div_target, config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false) config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title, config, start, end)
    }

    function displayMetricsCountry(ds, country, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(metrics);
        displayMetricsLines(div_id, metrics, data, title, config)
    }

    function displayMetricCompanies(metric, data, div_target, config, start, end, order) {
        if (!(config && config.help === false)) showHelp(div_target, [metric]);
        config = checkBasicConfig(config);
        if (config.show_legend !== false) config.show_legend = true;
        var title = getMetricFriendlyName([metric]);
        displayMetricSubReportLines(div_target, metric, data, title, config, start, end, null, order)
    }

    function displayMetricDomains(metric, data, div_target, config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false) config.show_legend = true;
        var title = getMetricFriendlyName([metric]);
        displayMetricSubReportLines(div_target, metric, data, title, config, start, end)
    }

    function displayMetricProjects(metric, data, div_target, config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false) config.show_legend = true;
        var title = getMetricFriendlyName([metric]);
        displayMetricSubReportLines(div_target, metric, data, title, config, start, end)
    }

    function displayMetricSubReportStatic(metric, data, order, div_id, config) {
        config = checkBasicConfig(config);
        var title = "";
        if (config.title === undefined) title = getMetricFriendlyName([metric]);
        else title = config.title;
        var metric_data = [];
        var labels = [];
        var graph = "bars";
        if (config.graph) graph = config.graph;
        $.each(order, function(i, name) {
            var label = Report.cleanLabel(name);
            labels.push(label);
            metric_data.push(data[name][metric])
        });
        displayBasicChart(div_id, labels, metric_data, graph, title, config)
    }

    function displayEnvisionAll(div_id, relative, legend_show, summary_graph) {
        var projects_full_data = Report.getProjectsDataSources();
        var config = Report.getVizConfig();
        var options = Viz.getEnvisionOptions(div_id, projects_full_data, null, config.summary_hide, summary_graph);
        options.legend_show = legend_show;
        if (relative) {
            $.each(projects_full_data, function(project, data) {
                $.each(data, function(index, DS) {
                    main_metric = DS.getMainMetric()
                })
            });
            DataProcess.addRelativeValues(options.data, main_metric)
        }
        new envision.templates.Envision_Report(options)
    }
})();

function IRC() {
    var self = this;
    this.basic_metrics = {
        irc_sent: {
            divid: "irc_sent",
            column: "sent",
            name: "Sent",
            desc: "Messages sent"
        },
        irc_senders: {
            divid: "irc_senders",
            column: "senders",
            name: "Senders",
            desc: "Messages senders",
            action: "sent"
        },
        irc_repositories: {
            divid: "irc_repositories",
            column: "repositories",
            name: "Repositories",
            desc: "Number of active repositories"
        }
    };
    this.getMainMetric = function() {
        return "irc_sent"
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End"
        };
        return id_label
    };
    this.getLabelForRepository = function() {
        return "channel"
    };
    this.getLabelForRepositories = function() {
        return "channels"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .irc_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().irc_url
        }
        if (this.global_data.type) $(div_id + " #irc_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #irc_url").attr("href", url);
            $(div_id + " #irc_name").text("IRC " + this.global_data.type)
        } else {
            $(div_id + " #irc_url").attr("href", Report.getProjectData().irc_url);
            $(div_id + " #irc_name").text(Report.getProjectData().irc_name);
            $(div_id + " #irc_type").text(Report.getProjectData().irc_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #ircFirst").text(data.first_date);
        $(div_id + " #ircLast").text(data.last_date);
        $(div_id + " #ircSent").text(data.irc_sent);
        $(div_id + " #ircRepositories").text(data.irc_repositories);
        if (data.repositories === 1) $(div_id + " #ircRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "irc_sent", "irc_senders", radius)
    };
    this.getTitle = function() {
        return "IRC Messages"
    }
}
IRC.prototype = new DataSource("irc");

function ITS() {
    this.basic_metrics = {
        its_opened: {
            divid: "its_opened",
            column: "opened",
            name: "Opened",
            desc: "Number of opened tickets",
            envision: {
                y_labels: true,
                show_markers: true
            }
        },
        its_openers: {
            divid: "its_openers",
            column: "openers",
            name: "Openers",
            desc: "Unique identities opening tickets",
            action: "opened",
            envision: {
                gtype: "whiskers"
            }
        },
        its_closed: {
            divid: "its_closed",
            column: "closed",
            name: "Closed",
            desc: "Number of closed tickets"
        },
        its_closers: {
            divid: "its_closers",
            column: "closers",
            name: "Closers",
            desc: "Number of identities closing tickets",
            action: "closed",
            envision: {
                gtype: "whiskers"
            }
        },
        its_bmitickets: {
            divid: "its_bmitickets",
            column: "bmitickets",
            name: "Efficiency",
            desc: "Efficiency closing tickets: number of closed ticket out of the opened ones in a given period"
        },
        its_changed: {
            divid: "its_changed",
            column: "changed",
            name: "Changed",
            desc: "Number of changes to the state of tickets"
        },
        its_changers: {
            divid: "its_changers",
            column: "changers",
            name: "Changers",
            desc: "Number of identities changing the state of tickets",
            action: "changed",
            envision: {
                gtype: "whiskers"
            }
        },
        its_companies: {
            divid: "its_companies",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        its_organizations: {
            divid: "its_organizations",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        its_countries: {
            divid: "its_countries",
            column: "countries",
            name: "Countries",
            desc: "Number of active countries"
        },
        its_repositories: {
            divid: "its_repositories",
            column: "repositories",
            name: "Respositories",
            desc: "Number of active respositories"
        },
        its_domains: {
            divid: "its_domains",
            column: "domains",
            name: "Domains",
            desc: "Number of active domains"
        }
    };
    this.getMainMetric = function() {
        return "its_opened"
    };
    this.getSummaryLabels = function() {
        var labels = {
            first_date: "Start",
            last_date: "End",
            tickets: "Tickets",
            trackers: "Trackers"
        };
        return labels
    };
    this.getLabelForRepository = function() {
        return "tracker"
    };
    this.getLabelForRepositories = function() {
        return "trackers"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .its-info").hide();
            return
        }
        $(div_id + " #its_type").text(this.global_data.type);
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().its_url
        }
        if (url === undefined) url = "";
        if (this.global_data.type === "allura") url = url.replace("rest/", "");
        else if (this.global_data.type === "github") {
            url = url.replace("api.", "");
            url = url.replace("repos/", "")
        }
        $(div_id + " #its_url").attr("href", url);
        var tracker_str = this.global_data.type.charAt(0).toUpperCase() + this.global_data.type.slice(1);
        $(div_id + " #its_name").text(tracker_str + " Tickets");
        var data = this.getGlobalData();
        $(div_id + " #itsFirst").text(data.first_date);
        $(div_id + " #itsLast").text(data.last_date);
        $(div_id + " #itsTickets").text(data.its_opened);
        $(div_id + " #itsOpeners").text(data.its_openers);
        $(div_id + " #itsRepositories").text(data.its_repositories);
        if (data.repositories === 1) $(div_id + " #itsRepositories").hide()
    };
    this.getTitle = function() {
        return "Tickets"
    };
    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "its_opened", "its_openers", radius)
    }
}
ITS.prototype = new DataSource("its");

function ITS_1() {
    this.basic_metrics = {
        its_1_opened: {
            divid: "its_1_opened",
            column: "opened",
            name: "Opened tickets",
            desc: "Number of opened tickets",
            envision: {
                y_labels: true,
                show_markers: true
            }
        },
        its_1_openers: {
            divid: "its_1_openers",
            column: "openers",
            name: "Openers",
            desc: "Unique identities opening tickets",
            action: "opened",
            envision: {
                gtype: "whiskers"
            }
        },
        its_1_stories_opened: {
            divid: "its_1_stories_opened",
            column: "stories_opened",
            name: "Stories Opened",
            desc: "Number of opened stories"
        },
        its_1_stories_openers: {
            divid: "its_1_stories_openers",
            column: "stories_openers",
            name: "Stories Openers",
            desc: "Unique identities opening stories",
            action: "opened"
        },
        its_1_closed: {
            divid: "its_1_closed",
            column: "closed",
            name: "Closed tickets",
            desc: "Number of closed tickets"
        },
        its_1_closers: {
            divid: "its_1_closers",
            column: "closers",
            name: "Closers",
            desc: "Number of identities closing tickets",
            action: "closed",
            envision: {
                gtype: "whiskers"
            }
        },
        its_1_closers_7: {
            divid: "its_1_closers_7",
            column: "closers_7",
            name: "Closers",
            desc: "Number of identities closing tickets during last week",
            action: "closed"
        },
        its_1_stories_closed: {
            divid: "its_1_stories_closed",
            column: "stories_closed",
            name: "Closed stories",
            desc: "Number of closed stories"
        },
        its_1_stories_pending: {
            divid: "its_1_stories_pending",
            column: "stories_pending",
            name: "Pending stories",
            desc: "Number of pending stories"
        },
        its_1_bmitickets: {
            divid: "its_1_bmitickets",
            column: "bmitickets",
            name: "Efficiency",
            desc: "Efficiency closing tickets: number of closed ticket out of the opened ones in a given period"
        },
        its_1_changed: {
            divid: "its_1_changed",
            column: "changed",
            name: "Changed",
            desc: "Number of changes to the state of tickets"
        },
        its_1_changers: {
            divid: "its_1_changers",
            column: "changers",
            name: "Changers",
            desc: "Number of identities changing the state of tickets",
            action: "changed",
            envision: {
                gtype: "whiskers"
            }
        },
        its_1_companies: {
            divid: "its_1_companies",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        its_1_countries: {
            divid: "its_1_countries",
            column: "countries",
            name: "Countries",
            desc: "Number of active countries"
        },
        its_1_repositories: {
            divid: "its_1_repositories",
            column: "repositories",
            name: "Respositories",
            desc: "Number of active respositories"
        },
        its_1_domains: {
            divid: "its_1_domains",
            column: "domains",
            name: "Domains",
            desc: "Number of active domains"
        }
    };
    this.getMainMetric = function() {
        return "its_1_opened"
    };
    this.getSummaryLabels = function() {
        var labels = {
            first_date: "Start",
            last_date: "End",
            tickets: "Tickets",
            trackers: "Trackers"
        };
        return labels
    };
    this.getLabelForRepository = function() {
        return "tracker"
    };
    this.getLabelForRepositories = function() {
        return "trackers"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .its-info").hide();
            return
        }
        $(div_id + " #its_type").text(this.global_data.type);
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().its_url
        }
        if (url === undefined) url = "";
        if (this.global_data.type === "allura") url = url.replace("rest/", "");
        else if (this.global_data.type === "github") {
            url = url.replace("api.", "");
            url = url.replace("repos/", "")
        }
        $(div_id + " #its_url").attr("href", url);
        var tracker_str = this.global_data.type.charAt(0).toUpperCase() + this.global_data.type.slice(1);
        $(div_id + " #its_name").text(tracker_str + " Tickets");
        var data = this.getGlobalData();
        $(div_id + " #itsFirst").text(data.first_date);
        $(div_id + " #itsLast").text(data.last_date);
        $(div_id + " #itsTickets").text(data.its_1_opened);
        $(div_id + " #itsOpeners").text(data.its_1_openers);
        $(div_id + " #itsRepositories").text(data.its_1_repositories);
        if (data.repositories === 1) $(div_id + " #itsRepositories").hide()
    };
    this.getTitle = function() {
        return "Tickets"
    };
    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "its_1_opened", "its_1_openers", radius)
    }
}
ITS_1.prototype = new DataSource("its_1");

function MediaWiki() {
    var self = this;
    this.basic_metrics = {
        mediawiki_reviews: {
            divid: "mediawiki_reviews",
            column: "reviews",
            name: "Editions",
            desc: "Wiki page editions"
        },
        mediawiki_authors: {
            divid: "mediawiki_authors",
            column: "authors",
            name: "Editors",
            desc: "Editors doing editions",
            action: "reviews"
        },
        mediawiki_pages: {
            divid: "mediawiki_pages",
            column: "pages",
            name: "Pages",
            desc: "Wiki pages"
        }
    };
    this.getMainMetric = function() {
        return "mediawiki_reviews"
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End"
        };
        return id_label
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .mediawiki_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().mediawiki_url
        }
        if (this.global_data.type) $(div_id + " #mediawiki_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #mediawiki_url").attr("href", url);
            $(div_id + " #mediawiki_name").text("MediaWiki " + this.global_data.type)
        } else {
            $(div_id + " #mediawiki_url").attr("href", Report.getProjectData().mediawiki_url);
            $(div_id + " #mediawiki_name").text(Report.getProjectData().mediawiki_name);
            $(div_id + " #mediawiki_type").text(Report.getProjectData().mediawiki_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #mediawikiFirst").text(data.first_date);
        $(div_id + " #mediawikiLast").text(data.last_date);
        $(div_id + " #mediawikiSent").text(data.mediawiki_reviews)
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius)
    };
    this.getTitle = function() {
        return "MediaWiki Reviews"
    }
}
MediaWiki.prototype = new DataSource("mediawiki");

function MLS() {
    var self = this;
    this.basic_metrics = {
        mls_responses: {
            divid: "mls_responses",
            column: "responses",
            name: "Responses",
            desc: "Number of messages that are responses"
        },
        mls_sent: {
            divid: "mls_sent",
            column: "sent",
            name: "Sent",
            desc: "Number of messages"
        },
        mls_senders: {
            divid: "mls_senders",
            column: "senders",
            name: "Senders",
            desc: "Number of unique message senders",
            action: "sent"
        },
        mls_threads: {
            divid: "mls_threads",
            column: "threads",
            name: "Threads",
            desc: "Number of messages threads"
        },
        mls_companies: {
            divid: "mls_companies",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        mls_organizations: {
            divid: "mls_organizations",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        mls_countries: {
            divid: "mls_countries",
            column: "countries",
            name: "Countries",
            desc: "Number of active countries"
        },
        mls_repositories: {
            divid: "mls_repositories",
            column: "repositories",
            name: "Respositories",
            desc: "Number of active respositories"
        },
        mls_domains: {
            divid: "mls_domains",
            column: "domains",
            name: "Domains",
            desc: "Number of active domains"
        },
        unanswered_posts: {
            name: "Unanswered Threads",
            desc: "Unanswered Threads"
        }
    };
    this.data_lists_file = this.data_dir + "/mls-lists.json";
    this.getListsFile = function() {
        return this.data_lists_file
    };
    this.data_lists = null;
    this.getListsData = function() {
        return this.data_lists
    };
    this.setListsData = function(lists, self) {
        if (self === undefined) self = this;
        self.data_lists = lists
    };
    this.setDataDir = function(dataDir) {
        this.data_dir = dataDir;
        this.data_lists_file = this.data_dir + "/mls-lists.json";
        MLS.prototype.setDataDir.call(this, dataDir)
    };
    this.getMainMetric = function() {
        return "mls_sent"
    };
    this.getSummaryLabels = function() {
        var labels = {
            first_date: "Start",
            last_date: "End"
        };
        return labels
    };
    this.getLabelForRepository = function() {
        return "mailing list"
    };
    this.getLabelForRepositories = function() {
        return "mailing lists"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .mls_info").hide()
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().mls_url
        }
        if (this.global_data.type) $(div_id + " #mls_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #mls_url").attr("href", url);
            $(div_id + " #mls_name").text("MLS " + this.global_data.type)
        } else {
            $(div_id + " #mls_url").attr("href", Report.getProjectData().mls_url);
            $(div_id + " #mls_name").text(Report.getProjectData().mls_name);
            $(div_id + " #mls_type").text(Report.getProjectData().mls_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #mlsFirst").text(data.first_date);
        $(div_id + " #mlsLast").text(data.last_date);
        $(div_id + " #mlsMessages").text(data.mls_sent);
        $(div_id + " #mlsSenders").text(data.mls_senders);
        $(div_id + " #mlsRepositories").text(data.mls_repositories);
        if (data.repositories === 1) $(div_id + " #mlsRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "mls_sent", "mls_senders", radius)
    };
    MLS.displayMLSListName = function(listinfo) {
        var list_name_tokens = listinfo.split("_");
        var list_name = "";
        if (list_name_tokens.length > 1) {
            list_name = list_name_tokens[list_name_tokens.length - 1];
            if (list_name === "") list_name = list_name_tokens[list_name_tokens.length - 2]
        } else {
            list_name = listinfo.replace("<", "");
            list_name = list_name.replace(">", "");
            list_name_tokens = list_name.split(".");
            list_name = list_name_tokens[0]
        }
        return list_name
    };

    function getUserLists() {
        var form = document.getElementById("form_mls_selector");
        var lists = [];
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].checked) lists.push(form.elements[i].value)
        }
        if (localStorage) {
            localStorage.setItem(getMLSId(), JSON.stringify(lists))
        }
        return lists
    }
    this.displayBasicUserAll = function(id, all) {
        var form = document.getElementById("form_mls_selector");
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox") form.elements[i].checked = all
        }
        this.displayBasicUser(id)
    };
    this.displayBasicUser = function(div_id) {
        $("#" + div_id).empty();
        lists = getUserLists();
        for (var i = 0; i < lists.length; i++) {
            var l = lists[i];
            file_messages = this.getDataDir() + "/mls-";
            file_messages += l;
            file_messages += "-evolutionary.json";
            displayBasicList(div_id, l, file_messages)
        }
    };
    this.displayBasic = function(div_id, config_metric) {
        var lists = this.getListsData();
        lists_hide = Report.getConfig().mls_hide_lists;
        lists = lists.mailing_list;
        if (lists === undefined) return null;
        var user_pref = false;
        if (typeof lists === "string") lists = [lists];
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                user_pref = true
            }
        }
        for (var i = 0; i < lists.length; i++) {
            var l = lists[i];
            if (!user_pref)
                if ($.inArray(l, lists_hide) > -1) continue;
            file_messages = this.getDataDir() + "/mls-";
            file_messages += l;
            file_messages += "-evolutionary.json";
            displayBasicList(div_id, l, file_messages, config_metric)
        }
    };
    this.getTitle = function() {
        return "Mailing Lists"
    };

    function displayBasicList(div_id, l, mls_file, config_metric) {
        var config = Viz.checkBasicConfig(config_metric);
        for (var id in basic_metrics) {
            var metric = basic_metrics[id];
            var title = "";
            if (config.show_title) title = metric.name;
            if ($.inArray(metric.column, Report.getConfig().mls_hide) > -1) continue;
            var new_div = "<div class='info-pill m0-box-div flotr2-" + metric.column + "'>";
            new_div += "<h4>" + metric.name + " " + MLS.displayMLSListName(l) + "</h4>";
            new_div += "<div id='" + metric.divid + "_" + l + "' class='m0-box flotr2-" + metric.column + "'></div>";
            if (config.show_desc) new_div += "<p>" + metric.desc + "</p>";
            new_div += "</div>";
            $("#" + div_id).append(new_div);
            Viz.displayBasicLinesFile(metric.divid + "_" + l, mls_file, metric.column, config.show_labels, title)
        }
    }

    function getReportId() {
        var project_data = Report.getProjectData();
        return project_data.date + "_" + project_data.project_name
    }

    function getMLSId() {
        return getReportId() + "_mls_lists"
    }
    this.displayEvoListsMain = function(id) {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                return this.displayEvoLists(id, lists)
            }
        }
        history = this.getListsData();
        lists = history.mailing_list;
        if (lists === undefined) return;
        var config = Report.getConfig();
        lists_hide = config.mls_hide_lists;
        if (typeof lists === "string") {
            lists = [lists]
        }
        var filtered_lists = [];
        for (var i = 0; i < lists.length; i++) {
            if ($.inArray(lists[i], lists_hide) == -1) filtered_lists.push(lists[i])
        }
        if (localStorage) {
            if (!localStorage.getItem(getMLSId())) {
                localStorage.setItem(getMLSId(), JSON.stringify(filtered_lists))
            }
        }
        this.displayEvoLists(id, filtered_lists)
    };

    function cleanLocalStorage() {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                localStorage.removeItem(getMLSId())
            }
        }
    }
    this.getDefaultLists = function() {
        var default_lists = [];
        var hide_lists = Report.getConfig().mls_hide_lists;
        $.each(this.getListsData().mailing_list, function(index, list) {
            if ($.inArray(list, hide_lists) === -1) default_lists.push(list)
        });
        return default_lists
    };
    this.displaySelectorCheckDefault = function() {
        var default_lists = this.getDefaultLists();
        var form = document.getElementById("form_mls_selector");
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox") {
                var id = form.elements[i].id;
                l = id.split("_check")[0];
                if ($.inArray(l, default_lists) > -1) form.elements[i].checked = true;
                else form.elements[i].checked = false
            }
        }
    };
    this.displayBasicDefault = function(div_id) {
        var obj = self;
        if (this instanceof MLS) obj = this;
        cleanLocalStorage();
        obj.displaySelectorCheckDefault();
        $("#" + div_id).empty();
        obj.displayBasic(div_id)
    };
    this.displayEvoDefault = function(div_id) {
        var obj = self;
        if (this instanceof MLS) obj = this;
        cleanLocalStorage();
        if (document.getElementById("form_mls_selector")) obj.displaySelectorCheckDefault();
        $("#" + div_id).empty();
        obj.displayEvoLists(div_id, obj.getDefaultLists())
    };
    this.displayEvoUserAll = function(id, all) {
        var form = document.getElementById("form_mls_selector");
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox") form.elements[i].checked = all
        }
        this.displayEvoUser(id)
    };
    this.displayEvoUser = function(id) {
        $("#" + id).empty();
        var obj = self;
        if (this instanceof MLS) obj = this;
        obj.displayEvoLists(id, getUserLists())
    };
    this.displayEvoListSelector = function(div_id_sel, div_id_mls) {
        this.displayEvoBasicListSelector(div_id_sel, div_id_mls, null)
    };
    this.displayBasicListSelector = function(div_id_sel, div_id_mls) {
        this.displayEvoBasicListSelector(div_id_sel, null, div_id_mls)
    };
    this.displayEvoBasicListSelector = function(div_id_sel, div_id_evo, div_id_basic) {
        var res1 = this.getListsData();
        var lists = res1.mailing_list;
        var user_lists = [];
        if (lists === undefined) return;
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                user_lists = JSON.parse(localStorage.getItem(getMLSId()))
            }
        }
        Report.displayBasicUser = this.displayBasicUser;
        Report.displayBasicUserAll = this.displayBasicUserAll;
        Report.displayBasicDefault = this.displayBasicDefault;
        Report.displayEvoDefault = this.displayEvoDefault;
        Report.displayEvoUser = this.displayEvoUser;
        Report.displayEvoUserAll = this.displayEvoUserAll;
        var html = "Mailing list selector:";
        html += "<form id='form_mls_selector'>";
        if (typeof lists === "string") {
            lists = [lists]
        }
        for (var i = 0; i < lists.length; i++) {
            var l = lists[i];
            html += '<input type=checkbox name="check_list" value="' + l + '" ';
            html += 'onClick="';
            if (div_id_evo) html += "Report.displayEvoUser('" + div_id_evo + "');";
            if (div_id_basic) html += "Report.displayBasicUser('" + div_id_basic + "')\";";
            html += '" ';
            html += 'id="' + l + '_check" ';
            if ($.inArray(l, user_lists) > -1) html += "checked ";
            html += ">";
            html += MLS.displayMLSListName(l);
            html += "<br>"
        }
        html += '<input type=button value="All" ';
        html += 'onClick="';
        if (div_id_evo) html += "Report.displayEvoUserAll('" + div_id_evo + "',true);";
        if (div_id_basic) html += "Report.displayBasicUserAll('" + div_id_basic + "',true);";
        html += '">';
        html += '<input type=button value="None" ';
        html += 'onClick="';
        if (div_id_evo) html += "Report.displayEvoUserAll('" + div_id_evo + "',false);";
        if (div_id_basic) html += "Report.displayBasicUserAll('" + div_id_basic + "',false);";
        html += '">';
        html += '<input type=button value="Default" ';
        html += 'onClick="';
        if (div_id_evo) html += "Report.displayEvoDefault('" + div_id_evo + "');";
        if (div_id_basic) html += "Report.displayBasicDefault('" + div_id_basic + "')";
        html += '">';
        html += "</form>";
        $("#" + div_id_sel).html(html);
        if (Report.getProjectsList().length > 1) {
            $("#" + div_id_sel).append("Not supported in multiproject");
            $("#" + div_id_sel + " :input").attr("disabled", true)
        }
    };

    function filterHistory(history) {
        if (typeof history.id === "number") {
            $.each(history, function(key, value) {
                value = [value]
            })
        }
        return history
    }
    this.displayEvoLists = function(id, lists) {
        for (var i = 0; i < lists.length; i++) {
            var l = lists[i];
            file_messages = this.getDataDir() + "/mls-";
            file_messages += l;
            file_messages += "-evolutionary.json";
            this.displayEvoList(MLS.displayMLSListName(l), id, file_messages)
        }
    };
    this.displayEvoList = function(list_label, id, mls_file) {
        var self = this;
        $.getJSON(mls_file, function(history) {
            self.envisionEvoList(list_label, id, history)
        })
    };
    this.envisionEvoList = function(list_label, div_id, history) {
        var config = Report.getConfig();
        var options = Viz.getEnvisionOptionsMin(div_id, history, config.mls_hide);
        options.data.list_label = MLS.displayMLSListName(list_label);
        new envision.templates.Envision_Report(options, [this])
    }
}
MLS.prototype = new DataSource("mls");

function SCM() {
    this.basic_metrics = {
        scm_commits: {
            divid: "scm_commits",
            column: "commits",
            name: "Commits",
            desc: "Evolution of the number of commits (aggregating branches)",
            envision: {
                y_labels: true,
                show_markers: true
            }
        },
        scm_committers: {
            divid: "scm_committers",
            column: "committers",
            name: "Committers",
            desc: "Unique committers making changes to the source code",
            action: "commits",
            envision: {
                gtype: "whiskers"
            }
        },
        scm_authors: {
            divid: "scm_authors",
            column: "authors",
            name: "Organizations",
            desc: "Unique authors making changes to the source code",
            action: "commits",
            envision: {
                gtype: "whiskers"
            }
        },
        scm_newauthors: {
            divid: "scm_newauthors",
            column: "newauthors",
            name: "New Authors",
            desc: "Number of new people authoring commits (changes to source code)",
            action: "commits",
            envision: {
                gtype: "whiskers"
            }
        },
        scm_branches: {
            divid: "scm_branches",
            column: "branches",
            name: "Branches",
            desc: "Evolution of the number of branches"
        },
        scm_files: {
            divid: "scm_files",
            column: "files",
            name: "Modified Files",
            desc: "Evolution of the number of unique files handled by the community"
        },
        scm_added_lines: {
            divid: "scm_added_lines",
            column: "added_lines",
            name: "Lines Added",
            desc: "Evolution of the source code lines added"
        },
        scm_removed_lines: {
            divid: "scm_removed_lines",
            column: "removed_lines",
            name: "Lines Removed",
            desc: "Evolution of the source code lines removed"
        },
        scm_repositories: {
            divid: "scm_repositories",
            column: "repositories",
            name: "Repositories",
            desc: "Evolution of the number of repositories",
            envision: {
                gtype: "whiskers"
            }
        },
        scm_companies: {
            divid: "scm_companies",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        scm_organizations: {
            divid: "scm_organizations",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        scm_countries: {
            divid: "scm_countries",
            column: "countries",
            name: "Countries",
            desc: "Number of active countries"
        },
        scm_domains: {
            divid: "scm_domains",
            column: "domains",
            name: "Domains",
            desc: "Number of active domains"
        }
    };
    this.getMainMetric = function() {
        return "scm_commits"
    };
    this.setITS = function(its) {
        this.its = its
    };
    this.getITS = function(its) {
        return this.its
    };
    this.getTitle = function() {
        return "Source Code Management"
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End"
        };
        return id_label
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .scm-info").hide();
            return
        }
        var repo_str = this.global_data.type.charAt(0).toUpperCase() + this.global_data.type.slice(1);
        $(div_id + " #scm_type").text(repo_str);
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().scm_url
        }
        if (this.global_data.type === "git")
            if (url) url = url.replace("git://", "http://");
        $(div_id + " #scm_url").attr("href", url);
        $(div_id + " #scm_name").text(repo_str);
        var data = this.getGlobalData();
        $(div_id + " #scmFirst").text(data.first_date);
        $(div_id + " #scmLast").text(data.last_date);
        $(div_id + " #scmCommits").text(data.scm_commits);
        $(div_id + " #scmAuthors").text(data.scm_authors);
        if (data.reviewers) $(div_id + " #scmReviewers").text(data.scm_reviewers);
        $(div_id + " #scmCommitters").text(data.scm_committers);
        $(div_id + " #scmRepositories").text(data.scm_repositories);
        if (data.repositories === 1) $(div_id + " #scmRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "scm_commits", "scm_committers", radius)
    }
}
SCM.prototype = new DataSource("scm");

function SCR() {
    var self = this;
    this.basic_metrics = {
        scr_opened: {
            divid: "scr_opened",
            column: "opened",
            name: "Reviews opened",
            desc: "Reviews in status new or inprogress"
        },
        scr_submissions: {
            divid: "scr_submissions",
            column: "submissions",
            name: "Reviews submitted",
            desc: "Reviews submitted"
        },
        scr_closed: {
            divid: "scr_closed",
            column: "closed",
            name: "Reviews closed",
            desc: "Reviews merged or abandoned"
        },
        scr_merged: {
            divid: "scr_merged",
            column: "merged",
            name: "Reviews merged",
            desc: "Reviews merged"
        },
        scr_mergers: {
            divid: "scr_mergers",
            column: "mergers",
            name: "Reviews mergers",
            action: "merged",
            desc: "People merging reviews"
        },
        scr_new: {
            divid: "scr_new",
            column: "new",
            name: "Reviews new",
            desc: "Reviews in status new"
        },
        scr_abandoned: {
            divid: "scr_abandoned",
            column: "abandoned",
            name: "Reviews abandoned",
            desc: "Reviews abandoned"
        },
        scr_pending: {
            divid: "scr_pending",
            column: "pending",
            name: "Reviews pending",
            desc: "Reviews pending to be attended"
        },
        scr_review_time_days_avg: {
            divid: "scr_review_time_days_avg",
            column: "review_time_days_avg",
            name: "Average review time",
            desc: "Average review time in days"
        },
        scr_verified: {
            divid: "scr_verified",
            column: "verified",
            name: "Patches verified",
            desc: "Patches verified"
        },
        scr_approved: {
            divid: "scr_approved",
            column: "approved",
            name: "Patches approved",
            desc: "Patches approved"
        },
        scr_codereview: {
            divid: "scr_codereview",
            column: "codereview",
            name: "Patches codereview",
            desc: "Patches in code review process"
        },
        scr_WaitingForReviewer: {
            divid: "scr_WaitingForReviewer",
            column: "WaitingForReviewer",
            name: "Patches waiting reviewer",
            desc: "Patches waiting for reviewer"
        },
        scr_WaitingForSubmitter: {
            divid: "scr_WaitingForSubmitter",
            column: "WaitingForSubmitter",
            name: "Patches waiting submitter",
            desc: "Patches waiting for a new version"
        },
        scr_submitted: {
            divid: "scr_submitted",
            column: "submitted",
            name: "Reviews submitted",
            desc: "Reviews submitted"
        },
        scr_sent: {
            divid: "scr_sent",
            column: "sent",
            name: "Patches Sent",
            desc: "Patches sent"
        },
        scr_companies: {
            divid: "scr_companies",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        scr_organizations: {
            divid: "scr_organizations",
            column: "companies",
            name: "Companies",
            desc: "Number of active companies"
        },
        scr_countries: {
            divid: "scr_countries",
            column: "countries",
            name: "Countries",
            desc: "Number of active countries"
        },
        scr_repositories: {
            divid: "scr_repositories",
            column: "repositories",
            name: "Respositories",
            desc: "Number of active respositories"
        },
        scr_closers: {
            divid: "scr_closers",
            column: "closers",
            name: "Closers",
            desc: "Reviews closers",
            action: "closed"
        },
        scr_submitters: {
            divid: "scr_submitters",
            column: "openers",
            name: "Submitters",
            desc: "Reviews submitters",
            action: "opened"
        },
        scr_openers: {
            divid: "scr_openers",
            column: "openers",
            name: "Submitters",
            desc: "Reviews submitters",
            action: "opened"
        },
        scr_reviewers: {
            divid: "scr_reviewers",
            column: "reviewers",
            name: "Reviewers",
            desc: "Number of people reviewing contributions"
        },
        scr_timeto_merge_avg: {
            divid: "scr_timeto_merge_avg",
            column: "timeto_merge_avg",
            name: "Time to merge (average days)",
            desc: "Number of average days a contribution waits to be merged"
        },
        scr_timeto_merge_median: {
            divid: "scr_timeto_merge_median",
            column: "timeto_merge_median",
            name: "Time to merge (median of the days)",
            desc: "Median of the number of days a contribution waits to be merged"
        },
        scr_timeto_close_avg: {
            divid: "scr_timeto_close_avg",
            column: "timeto_close_avg",
            name: "Time to close (average days)",
            desc: "Number of average days a contribution waits to be closed"
        },
        scr_timeto_close_median: {
            divid: "scr_timeto_close_median",
            column: "timeto_close_median",
            name: "Time to close (median of the days)",
            desc: "Median of the number of days a contribution waits to be closed"
        },
        scr_participants: {
            divid: "scr_participants",
            column: "participants",
            name: "Participants",
            desc: "Number of participants in the review process",
            action: "events"
        },
        scr_active_core_reviewers: {
            divid: "scr_active_core_reviewers",
            column: "active_core_reviewers",
            name: "Active core reviewers",
            desc: "Number of active core reviewers",
            action: "reviews"
        },
        scr_voted_patchsets: {
            divid: "scr_voted_patchsets",
            column: "voted_patchsets",
            name: "Voted Patchsets",
            desc: "Number of Voted Patchsets"
        },
        scr_sent_patchsets: {
            divid: "scr_sent_patchsets",
            column: "sent_patchsets",
            name: "Sent Patchsets",
            desc: "Number of Patchsets sent"
        },
        scr_patchset_submitters: {
            divid: "scr_patchset_submitters",
            column: "patchset_submitters",
            name: "Patchset Submitters",
            desc: "Number of contributors sending Patchsets"
        }
    };
    this.getMainMetric = function() {
        return "scr_merged"
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End",
            review_time_pending_ReviewsWaitingForReviewer_days_avg: "Review Time for reviewers (days, avg)",
            review_time_pending_ReviewsWaitingForReviewer_days_median: "Review Time for reviewers (days, median)",
            review_time_pending_update_ReviewsWaitingForReviewer_days_avg: "Update time for reviewers (days, avg)",
            review_time_pending_update_ReviewsWaitingForReviewer_days_median: "Update time for reviewers (days, avg)",
            review_time_pending_days_avg: "Review time (days, avg)",
            review_time_pending_days_median: "Review time (days, median)",
            review_time_pending_update_days_avg: "Update time (days, avg)",
            review_time_pending_update_days_median: "Update time (days, median)"
        };
        return id_label
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .scr_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().scr_url
        }
        if (this.global_data.type) $(div_id + " #scr_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #scr_url").attr("href", url);
            $(div_id + " #scr_name").text("SCR " + this.global_data.type)
        } else {
            $(div_id + " #scr_url").attr("href", Report.getProjectData().mls_url);
            $(div_id + " #scr_name").text(Report.getProjectData().scr_name);
            $(div_id + " #scr_type").text(Report.getProjectData().scr_type)
        }
        var company = this.getCompanyQuery();
        var data = this.getGlobalData();
        if (company) {
            data = this.getCompaniesGlobalData()[company]
        }
        $(div_id + " #scrFirst").text(data.first_date);
        $(div_id + " #scrLast").text(data.last_date);
        $(div_id + " #scrReviews").text(data.scr_opened)
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "scr_opened", "scr_openers", radius)
    };
    SCR.displaySCRListName = function(listinfo) {
        var list_name_tokens = listinfo.split("_");
        var list_name = "";
        if (list_name_tokens.length > 1) {
            list_name = list_name_tokens[list_name_tokens.length - 1];
            if (list_name === "") list_name = list_name_tokens[list_name_tokens.length - 2]
        } else {
            list_name = listinfo.replace("<", "");
            list_name = list_name.replace(">", "");
            list_name_tokens = list_name.split(".");
            list_name = list_name_tokens[0]
        }
        return list_name
    };
    this.oldest_changesets = {};
    this.ma_changesets = {};
    this.displayOldestChangesets = function(div, headers, columns) {
        loadOldestChangesets(function(data) {
            Table.gerritTable(div, data, headers, columns)
        })
    };
    this.displayOldestChangesetsByAff = function(div, headers, columns) {
        loadOldestChangesetsByAffiliation(function(data) {
            Table.gerritTable(div, data, headers, columns)
        })
    };
    this.displayMostActiveChangesets = function(div, headers, columns) {
        loadMostActiveChangesets(function(data) {
            Table.gerritTable(div, data, headers, columns)
        })
    };

    function loadOldestChangesets(cb) {
        var json_file = "data/json/scr-oldest_changesets.json";
        $.when($.getJSON(json_file)).done(function(json_data) {
            this.oldest_changesets = json_data;
            cb(this.oldest_changesets)
        }).fail(function() {
            console.log("SCR oldest changesets disabled. Missing " + json_file)
        })
    }

    function loadOldestChangesetsByAffiliation(cb) {
        var json_file = "data/json/scr-oldest_changesets_by_affiliation.json";
        $.when($.getJSON(json_file)).done(function(json_data) {
            this.oldest_changesets_by_aff = json_data;
            cb(this.oldest_changesets_by_aff)
        }).fail(function() {
            console.log("SCR oldest changesets by affiliation disabled. Missing " + json_file)
        })
    }

    function loadMostActiveChangesets(cb) {
        var json_file = "data/json/scr-most_active_changesets.json";
        $.when($.getJSON(json_file)).done(function(json_data) {
            this.ma_changesets = json_data;
            cb(this.ma_changesets)
        }).fail(function() {
            console.log("SCR most active changesets disabled. Missing " + json_file)
        })
    }
    this.getTitle = function() {
        return "Source Code Review"
    }
}
SCR.prototype = new DataSource("scr");

function People() {
    this.basic_metrics = {
        people_members: {
            column: "members",
            name: "Members",
            desc: "Community Members"
        }
    };
    this.getMainMetric = function() {
        return "people_members"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .mediawiki_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().mediawiki_url
        }
        if (this.global_data.type) $(div_id + " #mediawiki_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #mediawiki_url").attr("href", url);
            $(div_id + " #mediawiki_name").text("MediaWiki " + this.global_data.type)
        } else {
            $(div_id + " #mediawiki_url").attr("href", Report.getProjectData().mediawiki_url);
            $(div_id + " #mediawiki_name").text(Report.getProjectData().mediawiki_name);
            $(div_id + " #mediawiki_type").text(Report.getProjectData().mediawiki_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #mediawikiFirst").text(data.first_date);
        $(div_id + " #mediawikiLast").text(data.last_date);
        $(div_id + " #mediawikiSent").text(data.mediawiki_reviews)
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius)
    };
    this.getTitle = function() {
        return "Community Members"
    }
}
People.prototype = new DataSource("people");

function Downloads() {
    var self = this;
    this.basic_metrics = {
        downloads_downloads: {
            name: "Total downloads",
            column: "downloads"
        },
        downloads_packages: {
            divid: "",
            column: "packages",
            name: "Packages downloaded",
            desc: "",
            action: "downloads"
        },
        downloads_ips: {
            divid: "",
            column: "ips",
            name: "IP addresses",
            desc: "",
            action: "downloads"
        },
        downloads_bounces: {
            divid: "",
            column: "bounces",
            name: "Bounces",
            desc: ""
        },
        downloads_uvisitors: {
            divid: "",
            column: "uvisitors",
            name: "Unique visitors",
            desc: ""
        },
        downloads_visits: {
            divid: "",
            column: "visits",
            name: "Visits",
            desc: ""
        },
        downloads_pages: {
            divid: "",
            column: "page",
            name: "Pages",
            desc: "",
            action: "visits"
        },
        downloads_countries: {
            divid: "",
            column: "country",
            name: "Countries",
            desc: "",
            action: "visits"
        }
    };
    this.getMainMetric = function() {
        return "downloads_downloads"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .irc_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().irc_url
        }
        if (this.global_data.type) $(div_id + " #irc_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #irc_url").attr("href", url);
            $(div_id + " #irc_name").text("IRC " + this.global_data.type)
        } else {
            $(div_id + " #irc_url").attr("href", Report.getProjectData().irc_url);
            $(div_id + " #irc_name").text(Report.getProjectData().irc_name);
            $(div_id + " #irc_type").text(Report.getProjectData().irc_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #ircFirst").text(data.first_date);
        $(div_id + " #ircLast").text(data.last_date);
        $(div_id + " #ircSent").text(data.irc_sent);
        $(div_id + " #ircRepositories").text(data.irc_repositories);
        if (data.repositories === 1) $(div_id + " #ircRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius)
    };
    this.getTitle = function() {
        return "Downloads"
    }
}
Downloads.prototype = new DataSource("downloads");

function QAForums() {
    var self = this;
    this.basic_metrics = {
        qaforums_sent: {
            name: "Messages posted",
            desc: "Number of messages posted to Q&A forums(s)",
            column: "sent"
        },
        qaforums_qsent: {
            name: "Questions posted",
            desc: "Number of questions posted to Q&A forums(s)",
            column: "qsent"
        },
        qaforums_asent: {
            name: "Answers posted",
            desc: "Number of answers posted to Q&A forums(s)",
            column: "asent"
        },
        qaforums_unanswered: {
            name: "Unanswered questions",
            desc: "Backlog of unanswered questions",
            column: "unanswered"
        },
        qaforums_senders: {
            name: "Persons posting messages",
            desc: "Number of persons posting messages to Q&A forums(s)",
            column: "senders"
        },
        qaforums_asenders: {
            name: "Persons posting answers",
            desc: "Number of persons answering in Q&A forums(s)",
            column: "asenders"
        },
        qaforums_qsenders: {
            divid: "qaforums_qsenders",
            name: "Persons posting questions",
            desc: "Number of persons asking questions in Q&A forums(s)",
            column: "qsenders"
        },
        qaforums_participants: {
            name: "Participants",
            desc: "Number of persons posting messages",
            column: "participants"
        }
    };
    this.getMainMetric = function() {
        return "qaforums_qsent"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .irc_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().irc_url
        }
        if (this.global_data.type) $(div_id + " #irc_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #irc_url").attr("href", url);
            $(div_id + " #irc_name").text("IRC " + this.global_data.type)
        } else {
            $(div_id + " #irc_url").attr("href", Report.getProjectData().irc_url);
            $(div_id + " #irc_name").text(Report.getProjectData().irc_name);
            $(div_id + " #irc_type").text(Report.getProjectData().irc_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #ircFirst").text(data.first_date);
        $(div_id + " #ircLast").text(data.last_date);
        $(div_id + " #ircSent").text(data.irc_sent);
        $(div_id + " #ircRepositories").text(data.irc_repositories);
        if (data.repositories === 1) $(div_id + " #ircRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "qaforums_quetions", "qaforums_authors", radius)
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End",
            sent: "Messages posted",
            qsent: "Questions posted",
            asent: "Answers posted",
            qunanswered: "Unanswered questions",
            senders: "Persons posting messages",
            asenders: "Persons posting answers",
            qsenders: "Persons posting questions"
        };
        return id_label
    };
    this.getTitle = function() {
        return "QAForums"
    }
}
QAForums.prototype = new DataSource("qaforums");

function DockerHub() {
    var self = this;
    this.basic_metrics = {
        dockerhub_pulls: {
            divid: "dockerhub_pulls",
            column: "pulls",
            name: "Docker Hub repo pulls",
            desc: "Pulls for a Docker Hub repo"
        },
        dockerhub_starred: {
            divid: "dockerhub_starred",
            column: "starred",
            name: "Docker Hub repo stars",
            desc: "Stars for a Docker Hub repo"
        }
    };
    this.getMainMetric = function() {
        return "dockerhub_pulls"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .irc_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().irc_url
        }
        if (this.global_data.type) $(div_id + " #irc_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #irc_url").attr("href", url);
            $(div_id + " #irc_name").text("IRC " + this.global_data.type)
        } else {
            $(div_id + " #irc_url").attr("href", Report.getProjectData().irc_url);
            $(div_id + " #irc_name").text(Report.getProjectData().irc_name);
            $(div_id + " #irc_type").text(Report.getProjectData().irc_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #ircFirst").text(data.first_date);
        $(div_id + " #ircLast").text(data.last_date);
        $(div_id + " #ircSent").text(data.irc_sent);
        $(div_id + " #ircRepositories").text(data.irc_repositories);
        if (data.repositories === 1) $(div_id + " #ircRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "dockerhub_pulls", "dockerhub_starred", radius)
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End",
            pulls: "Pulls",
            starred: "Starred"
        };
        return id_label
    };
    this.getTitle = function() {
        return "DockerHub"
    }
}
DockerHub.prototype = new DataSource("dockerhub");

function Releases() {
    var self = this;
    this.basic_metrics = {
        releases_modules: {
            name: "Modules created",
            desc: "Number of modules created on the forge",
            column: "modules"
        },
        releases_authors: {
            name: "Module authors",
            desc: "Module authors",
            column: "authors"
        },
        releases_releases: {
            name: "Number of module releases",
            desc: "Number of module releases",
            column: "releases"
        }
    };
    this.getMainMetric = function() {
        return "releases_modules"
    };
    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + " .irc_info").hide();
            return
        }
        var url = "";
        if (this.global_data.repositories === 1) {
            url = this.global_data.url
        } else {
            url = Report.getProjectData().irc_url
        }
        if (this.global_data.type) $(div_id + " #irc_type").text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined) {
            $(div_id + " #irc_url").attr("href", url);
            $(div_id + " #irc_name").text("IRC " + this.global_data.type)
        } else {
            $(div_id + " #irc_url").attr("href", Report.getProjectData().irc_url);
            $(div_id + " #irc_name").text(Report.getProjectData().irc_name);
            $(div_id + " #irc_type").text(Report.getProjectData().irc_type)
        }
        var data = this.getGlobalData();
        $(div_id + " #ircFirst").text(data.first_date);
        $(div_id + " #ircLast").text(data.last_date);
        $(div_id + " #ircSent").text(data.irc_sent);
        $(div_id + " #ircRepositories").text(data.irc_repositories);
        if (data.repositories === 1) $(div_id + " #ircRepositories").hide()
    };
    this.displayBubbles = function(divid, radius) {
        if (false) Viz.displayBubbles(divid, "releases_modules", "releases_releases", radius)
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End",
            modules: "Modules created",
            releases: "Module releases created",
            authors: "Persons creating/updating modules"
        };
        return id_label
    };
    this.getTitle = function() {
        return "Releases"
    }
}
Releases.prototype = new DataSource("releases");

function Meetup() {
    var self = this;
    this.events = {};
    this.top_groups = {};
    this.basic_metrics = {
        eventizer_events: {
            divid: "eventizer_events",
            action: "attendees",
            column: "events",
            name: "Meetup meetings",
            desc: "Meetup meetings"
        },
        eventizer_attendees: {
            divid: "eventizer_attendees",
            column: "attendees",
            action: "events",
            name: "Meetup RSVPs",
            desc: "Meetup RSVPs"
        },
        eventizer_rsvps: {
            divid: "eventizer_rsvps",
            column: "rsvps",
            action: "events",
            name: "Meetup RSVPs",
            desc: "Meetup RSVPs"
        },
        eventizer_members: {
            divid: "eventizer_members",
            column: "members",
            name: "Meetup members",
            desc: "Meetup members"
        },
        eventizer_cities: {
            name: "Cities with Meetup events",
            action: "events",
            desc: "Cities where events took place"
        },
        eventizer_groups: {
            divid: "eventizer_groups",
            column: "groups",
            name: "Active Meetup groups",
            desc: "Active Meetup groups"
        }
    };
    this.getMainMetric = function() {
        return "eventizer_events"
    };
    this.getSummaryLabels = function() {
        var id_label = {
            first_date: "Start",
            last_date: "End"
        };
        return id_label
    };
    this.displayData = function(divid) {
        return ""
    };
    this.getTitle = function() {
        return "Meetup events"
    };
    this.displayTablePastEvents = function(div, headers, columns, limit) {
        loadMeetupEventsData(function(data) {
            data = filterOutFuture(data);
            data = applyLimit(data, limit);
            data = makeUpPastDate(data);
            data = replaceNull(data);
            Table.simpleTable(div, data, headers, columns)
        })
    };
    this.displayTableFutureEvents = function(div, headers, columns, limit) {
        loadMeetupEventsData(function(data) {
            data = extractFuture(data);
            data = reverseOrder(data);
            data = applyLimit(data, limit);
            data = makeUpFutureDate(data);
            data = replaceNull(data);
            Table.simpleTable(div, data, headers, columns)
        })
    };

    function replaceNull(data) {
        $.each(data.city, function(id, value) {
            if (value === null) {
                data.city[id] = "-"
            }
        });
        $.each(data.country, function(id, value) {
            if (value === null) {
                data.country[id] = "-"
            }
        });
        return data
    }

    function makeUpPastDate(data) {
        $.each(data.date, function(id, value) {
            data.date[id] = moment(value, "YYYY-MM-DD hh:mm:ss").format("MMMM Do YYYY, h:mm a")
        });
        return data
    }

    function makeUpFutureDate(data) {
        $.each(data.date, function(id, value) {
            data.date[id] = moment(value, "YYYY-MM-DD hh:mm:ss").fromNow()
        });
        return data
    }

    function reverseOrder(data) {
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id, value) {
            newobj[value] = data[value].reverse()
        });
        return newobj
    }

    function numberFutureEvents(data) {
        var d = new Date,
            now = d.getTime(),
            offset = 0;
        $.each(data.date, function(id, value) {
            var aux_date = new Date(value);
            when = aux_date.getTime();
            if (when <= now) {
                offset = id;
                return false
            }
        });
        return offset
    }

    function extractFuture(data) {
        var offset = numberFutureEvents(data);
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id, value) {
            newobj[value] = data[value].slice(0, offset)
        });
        return newobj
    }

    function filterOutFuture(data) {
        var offset = numberFutureEvents(data);
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id, value) {
            var array_len = data[value].length;
            newobj[value] = data[value].slice(offset, array_len)
        });
        return newobj
    }

    function applyLimit(data, limit) {
        var keys = Object.keys(data),
            newobj = {},
            myarray = [];
        if (limit > data[keys[0]].length) {
            return data
        }
        $.each(keys, function(id, value) {
            myarray = [];
            for (i = 0; i < limit; i++) {
                myarray.push(data[value][i]);
                if (limit === data[value].length - 1) {
                    break
                }
            }
            newobj[value] = myarray
        });
        return newobj
    }

    function buildLink(data) {
        if (data.hasOwnProperty("event_name") && data.hasOwnProperty("event_id") && data.hasOwnProperty("group_id")) {
            $.each(data.event_name, function(id, value) {
                data.event_name[id] = '<a href="http://www.meetup.com/' + data.group_id[id] + "/events/" + data.event_id[id] + '">' + data.event_name[id] + '&nbsp;<i class="fa fa-external-link"></i></a>'
            })
        }
        if (data.hasOwnProperty("group_name") && data.hasOwnProperty("group_id")) {
            $.each(data.event_name, function(id, value) {
                data.group_name[id] = '<a href="./meetup-group.html?repository=' + data.group_name[id] + '">' + data.group_name[id] + "</a>"
            })
        }
        return data
    }

    function loadMeetupEventsData(cb) {
        var json_file = "data/json/eventizer-events.json";
        $.when($.getJSON(json_file)).done(function(json_data) {
            this.events = json_data;
            this.events = buildLink(this.events);
            cb(this.events)
        }).fail(function() {
            console.log("Meetup events disabled. Missing " + json_file)
        })
    }
}
Meetup.prototype = new DataSource("eventizer");
var Identity = {};
(function() {
    var unique_list = "unique-sortable";

    function sortSelList(list_divid, list, name) {
        var connect = "";
        if (list_divid === unique_list) connect = "";
        else connect = unique_list;
        $("#" + name).sortable({
            handle: ".handle",
            connectWith: "#" + connect,
            start: function(e, info) {
                info.item.siblings(".ui-selected").appendTo(info.item)
            },
            stop: function(e, info) {
                if (info.item.parent()[0].id === unique_list) info.item.find(".handle").remove();
                info.item.parent().append(info.item.find("li"));
                info.item.parent().find("li").addClass("mjs-nestedSortable-leaf")
            }
        }).selectable().find("li").prepend("<div class='handle'></div>")
    }
    Identity.showListNested = function(list_divid, ds) {
        list = "<ol id=" + unique_list + ' class="nested_sortable" ';
        list += 'style="padding: 5px; background: #eee;"></ol>';
        $("#" + list_divid).append(list);
        $("#" + unique_list).nestedSortable({
            forcePlaceholderSize: true,
            handle: "div",
            helper: "clone",
            items: "li",
            tolerance: "pointer",
            toleranceElement: "> div",
            maxLevels: 2,
            isTree: true,
            expandOnHover: 700,
            startCollapsed: true
        });
        $(".disclose").on("click", function() {
            $(this).closest("li").toggleClass("mjs-nestedSortable-collapsed").toggleClass("mjs-nestedSortable-expanded")
        })
    };

    function showFilter(ds, filter_data) {
        $("#" + ds.getName() + "filter").autocomplete({
            source: filter_data,
            select: function(event, ui) {
                $("#" + ds.getName() + "filter").val("");
                $("#" + ds.getName() + "_people_" + ui.item.value).addClass("ui-selected");
                return false
            }
        })
    }
    Identity.showList = function(list_divid, ds) {
        var list = "";
        var people = ds.getPeopleData();
        var filter_data = [];
        list = '<ol id="' + ds.getName() + '-sortable" class="sortable">';
        for (var i = 0; i < people.id.length; i++) {
            var value = people.id[i];
            if (typeof value === "string") {
                value = value.replace("@", "_at_").replace(".", "_")
            }
            filter_data.push({
                value: value,
                label: people.name[i]
            });
            list += '<li id="' + ds.getName() + "_people_" + value + '" ';
            list += 'class="ui-widget-content ui-selectee">';
            list += '<div><span class="disclose"><span></span></span>';
            list += people.id[i] + " " + people.name[i];
            list += "</div></li>"
        }
        list += "</ol>";
        $("#" + list_divid).append("<input id='" + ds.getName() + "filter'>");
        showFilter(ds, filter_data);
        $("#" + list_divid).append(list);
        sortSelList(list_divid, list, ds.getName() + "-sortable")
    }
})();
var Charts = {};
(function() {
    Charts.plotLinesChart = plotLinesChart;

    function plotLinesChart(div_id, line_names, raw_data) {
        var flt_data = buildFlotrData(line_names, raw_data);
        var config = getChartConfig(flt_data, raw_data.strdate);
        if (raw_data.max) {
            config.yaxis.max = raw_data.max
        }
        if (flt_data.length > 1) config.legend.show = true;
        config.subtitle = composeTitle(line_names);
        flt_data = decorateLines(flt_data);
        plotFlotr2LinesChart(div_id, flt_data, config)
    }

    function buildFlotrData(line_names, raw_data) {
        var aux = [];
        $.each(raw_data.lines_data, function(id, array) {
            var line = [];
            $.each(array, function(subid, value) {
                line[line.length] = [raw_data.unixtime[subid], value]
            });
            var aux2 = {};
            aux2.data = line;
            aux2.label = line_names[id];
            aux[aux.length] = aux2
        });
        return aux
    }

    function decorateLines(flotr2_data) {
        if (Utils.isReleasePage() === false) {
            if (flotr2_data.length === 1) {
                flotr2_data = lastLineValueToPoint(flotr2_data);
                flotr2_data = addEmptyValue(flotr2_data)
            } else if (flotr2_data.length > 1) {
                flotr2_data = dropLastLineValue(flotr2_data)
            }
        }
        return flotr2_data
    }

    function lastLineValueToPoint(flotr2_data) {
        if (flotr2_data.length !== 1) return flotr2_data;
        var last = flotr2_data[0].data.length;
        var dots = [];
        var utime = 0;
        for (var i = 0; i < last - 1; i++) {
            utime = parseInt(flotr2_data[0].data[i][0], 10);
            dots.push([utime, undefined])
        }
        utime = parseInt(flotr2_data[0].data[last - 1][0], 10);
        dots.push([utime, flotr2_data[0].data[last - 1][1]]);
        var dot_graph = {
            data: dots
        };
        dot_graph.points = {
            show: true,
            radius: 3,
            lineWidth: 1,
            fillColor: null,
            shadowSize: 0
        };
        flotr2_data.push(dot_graph);
        flotr2_data[0].data[last - 1][1] = undefined;
        flotr2_data[1].label = flotr2_data[0].label;
        return flotr2_data
    }

    function composeTitle(unit_names) {
        return unit_names.join(" & ")
    }

    function addEmptyValue(flotr2_data) {
        var second = parseInt(flotr2_data[0].data[1][0], 10);
        var first = parseInt(flotr2_data[0].data[0][0], 10);
        var step = second - first;
        var narrays = flotr2_data.length;
        var last_date = 0;
        for (var i = 0; i < narrays; i++) {
            var last = flotr2_data[i].data.length - 1;
            last_date = parseInt(flotr2_data[i].data[last][0], 10);
            flotr2_data[i].data.push([last_date + step, undefined])
        }
        return flotr2_data
    }

    function dropLastLineValue(flotr2_data) {
        if (flotr2_data.length === 0) return flotr2_data;
        if (flotr2_data.length > 1) {
            for (var j = 0; j < flotr2_data.length; j++) {
                var last = flotr2_data[j].data.length - 1;
                flotr2_data[j].data[last][1] = undefined
            }
        }
        return flotr2_data
    }

    function plotFlotr2LinesChart(div_id, flotr2_data, config) {
        if (flotr2_data.length === 0) return;
        var container = document.getElementById(div_id);

        function drawGraph(opts) {
            var o = Flotr._.extend(Flotr._.clone(config), opts || {});
            return Flotr.draw(container, flotr2_data, o)
        }
        graph = drawGraph();
        Flotr.EventAdapter.observe(container, "flotr:select", function(area) {
            var zoom_options = {
                xaxis: {
                    minorTickFreq: 4,
                    mode: "time",
                    timeUnit: "second",
                    timeFormat: "%b %y",
                    min: area.x1,
                    max: area.x2
                },
                yaxis: {
                    min: area.y1,
                    autoscale: true
                },
                grid: {
                    verticalLines: true,
                    color: "#000000",
                    outlineWidth: 1,
                    outline: "s"
                }
            };
            zoom_options.subtitle = composeRangeText(config.subtitle, area.xfirst, area.xsecond);
            var new_lines_data_object = JSON.parse(JSON.stringify(flotr2_data));
            var y_max_value = getMax(new_lines_data_object, area.x1, area.x2);
            zoom_options.yaxis.max = y_max_value + y_max_value * .2;
            graph = drawGraph(zoom_options)
        });
        Flotr.EventAdapter.observe(container, "flotr:click", function() {
            drawGraph()
        });
        $(window).resize(function() {
            drawGraph()
        })
    }

    function getChartConfig(flotr2_data, strdates, title) {
        var legend_div = null;
        var config = {
            subtitle: title,
            legend: {
                show: false,
                container: legend_div
            },
            xaxis: {
                minorTickFreq: 4,
                mode: "time",
                timeUnit: "second",
                timeFormat: "%b %y",
                margin: true
            },
            yaxis: {
                min: null,
                noTicks: 2,
                autoscale: true
            },
            grid: {
                verticalLines: false,
                color: "#000000",
                outlineWidth: 1,
                outline: "s"
            },
            mouse: {
                container: legend_div,
                track: true,
                trackY: false,
                relative: true,
                margin: 20,
                position: "n",
                trackFormatter: function(o) {
                    var label = strdates[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i = 0; i < flotr2_data.length; i++) {
                        var value = flotr2_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (flotr2_data.length > 1) {
                            if (flotr2_data[i].label !== undefined) {
                                value_name = flotr2_data[i].label;
                                label += value_name + ":"
                            }
                        }
                        label += "<strong>" + Report.formatValue(value) + "</strong><br>"
                    }
                    return label
                }
            },
            selection: {
                mode: "x",
                fps: 10
            },
            shadowSize: 4
        };
        return config
    }

    function composeRangeText(former_title, starting_utime, end_utime) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var date = new Date(parseInt(starting_utime, 10) * 1e3);
        var starting_date = months[date.getMonth()] + " " + date.getFullYear();
        date = new Date(parseInt(end_utime, 10) * 1e3);
        var end_date = months[date.getMonth()] + " " + date.getFullYear();
        return former_title + " ( " + starting_date + " - " + end_date + " )"
    }

    function getMax(flotr2_data, from_unixstamp, to_unixstamp) {
        from_unixstamp = Math.round(from_unixstamp);
        to_unixstamp = Math.round(to_unixstamp);
        var narrays = flotr2_data.length;
        var aux_array = [];
        for (var i = 0; i < narrays; i++) {
            for (var z = flotr2_data[i].length - 1; z > 0; z--) {
                var aux_value = flotr2_data[i][z][0];
                var cond = aux_value < from_unixstamp || aux_value > to_unixstamp;
                if (cond) {
                    flotr2_data[i].splice(z, 1)
                }
            }
        }
        var res = [];
        for (i = 0; i < narrays; i++) {
            aux_array = flotr2_data[i].data;
            aux_array = sortBiArray(aux_array);
            res.push(aux_array[aux_array.length - 1][1])
        }
        res.sort(function(a, b) {
            return a - b
        });
        return res[res.length - 1]
    }

    function sortBiArray(bi_array) {
        bi_array.sort(function(a, b) {
            return a[1] > b[1] || b[1] === undefined ? 1 : -1
        });
        return bi_array
    }
})();
String.prototype.supplant = function(o) {
    return this.replace(/{([^{}]*)}/g, function(a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a
    })
};
var Table = {};
(function() {
    Table.displayTopTable = displayTopTable;
    Table.simpleTable = displaySimpleTable;
    Table.gerritTable = displayGerritTable;
    Table.meetupGroupsTable = displayMeetupGroupsTable;

    function displaySimpleTable(div, data, headers, cols) {
        var tables, aux_html, random_id;
        random_id = "myTable" + Math.floor(Math.random() * 9999 + 1);
        tables = '<table id="' + random_id + '" class="table table-striped tablesorter">';
        aux_html = composeSimpleHeaders(headers);
        aux_html += "<tbody>";
        var first_col = handleWeirdJSON(data, cols);
        aux_html += composeSimpleRows(first_col, cols, data);
        aux_html += "</tbody>";
        tables += aux_html;
        tables += "</table>";
        tables += "<script>$(document).ready(function(){" + '$("#' + random_id + '").tablesorter();}' + "); </script>";
        $("#" + div.id).append(tables)
    }

    function handleWeirdJSON(data, cols) {
        var first_col, aux_col;
        if (typeof data[cols[0]] !== "object") {
            aux_col = [];
            aux_col[0] = data[cols[0]];
            first_col = aux_col
        } else {
            first_col = data[cols[0]]
        }
        return first_col
    }

    function composeSimpleRows(first_col, cols, data) {
        var aux_html = "";
        $.each(first_col, function(id, value) {
            aux_html += "<tr>";
            var cont = id + 1;
            aux_html += "<td>" + cont + "</td>";
            $.each(cols, function(subid, name) {
                if (typeof data[name] !== "object") {
                    aux_html += "<td>" + data[name] + "</td>"
                } else {
                    aux_html += "<td>" + data[name][id] + "</td>"
                }
            });
            aux_html += "</tr>"
        });
        return aux_html
    }

    function displayGerritTable(div, data, headers, cols) {
        var tables, aux_html, random_id, gerrit_site = Report.getGerritSite();
        random_id = "myTable" + Math.floor(Math.random() * 9999 + 1);
        tables = '<table id="' + random_id + '" class="table table-striped tablesorter">';
        aux_html = composeSimpleHeaders(headers);
        aux_html += "<tbody>";
        var first_col = handleWeirdJSON(data, cols);
        $.each(first_col, function(id, value) {
            aux_html += "<tr>";
            var cont = id + 1,
                get_var;
            aux_html += "<td>" + cont + "</td>";
            $.each(cols, function(subid, name) {
                if (typeof data[name] !== "object") {
                    if (name === "gerrit_issue_id") {
                        get_var = gerrit_site + "/r/#/c/" + data[name];
                        aux_html += '<td><a href="' + get_var + '">' + data[name] + "</a></td>"
                    } else if (name === "project_name") {
                        get_var = data[name].replace(/\//g, "_");
                        aux_html += '<td><a href="repository.html?repository=' + get_var + '&ds=scr">' + data[name] + "</a></td>"
                    } else {
                        aux_html += "<td>" + data[name] + "</td>"
                    }
                } else {
                    if (name === "gerrit_issue_id") {
                        get_var = gerrit_site + "/r/#/c/" + data[name][id];
                        aux_html += '<td><a href="' + get_var + '">' + data[name][id] + "</a></td>"
                    } else if (name === "project_name") {
                        get_var = data[name][id].replace(/\//g, "_");
                        aux_html += '<td><a href="repository.html?repository=' + get_var + '&ds=scr">' + data[name][id] + "</a></td>"
                    } else {
                        aux_html += "<td>" + data[name][id] + "</td>"
                    }
                }
            });
            aux_html += "</tr>"
        });
        aux_html += "</tbody>";
        tables += aux_html;
        tables += "</table>";
        tables += "<script>$(document).ready(function(){" + '$("#' + random_id + '").tablesorter();}' + "); </script>";
        $("#" + div.id).append(tables)
    }

    function displayMeetupGroupsTable(div, data, headers, cols, ratio, ratio_header) {
        var ratio_array = [],
            denominator, numerator, aux_ratio;
        if (ratio !== undefined) {
            numerator = ratio[0];
            denominator = ratio[1];
            $.each(data.name, function(id, value) {
                aux_ratio = data[numerator][id] / data[denominator][id];
                aux_ratio = Math.round(aux_ratio * 10) / 10;
                ratio_array.push(aux_ratio)
            });
            data.ratio = ratio_array;
            if (ratio_header !== undefined) {
                headers.push(ratio_header)
            } else {
                headers.push("Ratio")
            }
            cols.push("ratio")
        }
        displaySimpleTable(div, data, headers, cols)
    }

    function composeSimpleHeaders(headers) {
        var aux_html;
        aux_html = "<thead><th>#</th>";
        $.each(headers, function(id, value) {
            aux_html += "<th>" + value + "</th>"
        });
        aux_html += "</thead>";
        return aux_html
    }

    function displayTopTable(div, data, opts) {
        var first = true,
            gen_tabs = true,
            tabs = "",
            tables = "",
            periods;
        if (opts.period !== "all") {
            gen_tabs = false;
            periods = [opts.period];
            tables += getHTMLTitleFromPeriod(opts.period)
        } else {
            tabs += composeTopTabs(data, opts.metric, opts.class_name);
            periods = getSortedPeriods()
        }
        periods = getSortedPeriods();
        if (opts.height !== undefined) {
            tables += '<div class="tab-content" style="height: ' + opts.height + 'px !important;overflow-y: scroll;overflow-x: hidden;">'
        } else {
            tables += '<div class="tab-content">'
        }
        var var_names = getTopVarsFromMetric(opts.metric, opts.ds_name);
        for (var k = 0; k < periods.length; k++) {
            html = "";
            var key = opts.metric + "." + periods[k];
            if (periods[k] !== opts.period && opts.period !== "all") {
                continue
            }
            if (data[key]) {
                var data_period = periods[k];
                if (data_period === "") {
                    data_period = "all"
                }
                if (first === true) {
                    html = " active in";
                    first = false
                }
                var data_period_nows = data_period.replace(/\ /g, "");
                tables += '<div class="tab-pane fade' + html + '" id="' + opts.class_name + opts.metric + data_period_nows + '">';
                tables += '<table class="table table-striped">';
                opts.action = opts.desc_metrics[opts.ds_name + "_" + opts.metric].action;
                opts.unit = opts.desc_metrics[opts.ds_name + "_" + opts.metric].column;
                unit = opts.desc_metrics[opts.ds_name + "_" + opts.metric].action;
                title = opts.desc_metrics[opts.ds_name + "_" + opts.metric].name;
                if (opts.metric === "threads" && opts.ds_name === "mls") {
                    tables += "<thead><th>#</th>";
                    tables += "<th> Subject </th>";
                    tables += "<th> Creator </th>";
                    tables += "<th> Messages </th>";
                    tables += "</thead><tbody>";
                    tables += composeTopRowsThreads(data[key], opts.limit, opts.links_enabled);
                    tables += "</tbody>"
                } else if (opts.ds_name === "downloads") {
                    tables += composeTopRowsDownloads(opts, data[key])
                } else if (opts.ds_name === "eventizer" && opts.metric === "rsvps") {
                    tables += "<thead><th>#</th><th>" + title.capitalize() + "&nbsp;by number of meetings</th>";
                    tables += "<th> Meetings </th>";
                    tables += "</thead><tbody>";
                    tables += composeTopRowsMeetup(data[key], opts.limit, opts.links_enabled);
                    tables += "</tbody>"
                } else if (opts.ds_name === "eventizer" && opts.metric === "events") {
                    tables += "<thead><th>#</th><th>" + title.capitalize() + "&nbsp;by number of RSVPs</th>";
                    tables += "<th> RSVPs </th>";
                    tables += "<th> Date </th>";
                    tables += "</thead><tbody>";
                    tables += composeTopRowsMeetup2(data[key], opts.limit, opts.links_enabled);
                    tables += "</tbody>"
                } else {
                    tables += "<thead><th>#</th><th>" + title.capitalize() + "</th>";
                    if (unit !== undefined) tables += "<th>" + unit.capitalize() + "</th>";
                    if (data[key].organization !== undefined) {
                        tables += "<th>Organization</th>"
                    }
                    tables += "</thead><tbody>";
                    tables += composeTopRowsPeople(data[key], opts.limit, opts.links_enabled, var_names);
                    tables += "</tbody>"
                }
                tables += "</table>";
                tables += "</div>"
            }
        }
        tables += "</div>";
        $("#" + div.id).append(tabs + tables);
        if (gen_tabs === true) {
            script = "<script>$('#myTab a').click(function (e) {e.preventDefault();$(this).tab('show');});</script>";
            $("#" + div.id).append(script)
        }
    }

    function composeTopRowsPeople(people_data, limit, people_links, var_names) {
        var rows_html = "";
        if (people_data[var_names.id] === undefined) {
            return rows_html
        }
        for (var j = 0; j < people_data[var_names.id].length; j++) {
            if (limit && limit <= j) break;
            var metric_value = people_data[var_names.action][j];
            rows_html += "<tr><td>" + (j + 1) + "</td>";
            rows_html += "<td>";
            if (people_links) {
                rows_html += '<a href="people.html?id=' + people_data[var_names.id][j];
                get_params = Utils.paramsInURL();
                if (get_params.length > 0) rows_html += "&" + get_params;
                rows_html += '">';
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j]) + "</a>"
            } else {
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j])
            }
            rows_html += "</td>";
            rows_html += "<td>" + metric_value + "</td>";
            if (people_data.organization !== undefined) {
                org = people_data.organization[j];
                if (org === null) {
                    org = "-"
                }
                rows_html += "<td>" + org + "</td>"
            }
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopRowsThreads(threads_data, limit, threads_links) {
        var rows_html = "";
        for (var i = 0; i < threads_data.subject.length; i++) {
            if (limit && limit <= i) break;
            rows_html += "<tr><td>" + (i + 1) + "</td>";
            if (threads_links === true) {
                var url = "http://www.google.com/search?output=search&q=X&btnI=1";
                if (Report.getThreadsSite() !== undefined) {
                    url = "http://www.google.com/search?output=search&q=X%20site%3AY&btnI=1";
                    url = url.replace(/Y/g, Report.getThreadsSite())
                } else if (threads_data.hasOwnProperty("url") && threads_data.url[i].length > 0) {
                    url = "http://www.google.com/search?output=search&q=X%20site%3AY&btnI=1";
                    url = url.replace(/Y/g, threads_data.url[i])
                }
                url = url.replace(/X/g, threads_data.subject[i]);
                rows_html += "<td>";
                rows_html += '<a target="_blank" href="' + url + '">';
                rows_html += threads_data.subject[i] + "</a>";
                rows_html += '&nbsp;<i class="fa fa-external-link"></i></td>'
            } else {
                rows_html += "<td>" + threads_data.subject[i] + "</td>"
            }
            rows_html += "<td>" + threads_data.initiator_name[i] + "</td>";
            rows_html += "<td>" + threads_data.length[i] + "</td>";
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopRowsDownloads(opts, data) {
        var tables = "",
            headers = [];
        if (opts.metric === "packages") {
            headers = ["Packages Downloaded", "Downloads"];
            tables += composeTopRows2Cols(data, opts, headers)
        } else if (opts.metric === "ips") {
            headers = ["IP Addresses", "Downloads"];
            tables += composeTopRows2Cols(data, opts, headers)
        } else if (opts.metric === "pages") {
            headers = ["Page name", "Visits"];
            tables += composeTopRows2Cols(data, opts, headers)
        } else if (opts.metric === "countries") {
            headers = ["Country", "Visits"];
            tables += composeTopRows2Cols(data, opts, headers)
        }
        return tables
    }

    function composeTopRows2Cols(data, opts, headers) {
        var rows_html = "";
        rows_html = "<thead><tr><th>#</th>";
        rows_html += "<th>&nbsp;" + headers[0] + "&nbsp;</th>";
        rows_html += "<th>&nbsp;" + headers[1] + "&nbsp;</th>";
        rows_html += "</tr></thead><tbody>";
        for (var i = 0; i < data[opts.unit].length; i++) {
            if (opts.limit && opts.limit <= i) break;
            rows_html += '<tr><td class="col-md-1">' + (i + 1) + "</td>";
            rows_html += '<td class="col-md-8">' + data[opts.unit][i] + "</td>";
            rows_html += '<td class="col-md-3">' + data[opts.action][i] + "</td>";
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopRowsMeetup(data, limit, people_links) {
        var rows_html = "";
        for (var i = 0; i < data.name.length; i++) {
            if (limit && limit !== 0 && limit <= i) break;
            rows_html += "<tr><td>" + (i + 1) + "</td>";
            rows_html += "<td>" + data.name[i] + "</td>";
            rows_html += "<td>" + data.events[i] + "</td>";
            rows_html += "</tr>"
        }
        return rows_html
    }

    function composeTopRowsMeetup2(data, limit, people_links) {
        var rows_html = "";
        data = fixArrayStringError(data);
        for (var i = 0; i < data.name.length; i++) {
            if (limit && limit !== 0 && limit <= i) break;
            rows_html += "<tr><td>" + (i + 1) + "</td>";
            rows_html += '<td><a href="' + data.url[i] + '">' + data.name[i] + '&nbsp;<i class="fa fa-external-link"></i></a></td>';
            rows_html += "<td>" + data.rsvps[i] + "</td>";
            rows_html += "<td>" + data.time[i] + "</td>";
            rows_html += "</tr>"
        }
        return rows_html
    }

    function fixArrayStringError(myobj) {
        var keys = Object.keys(myobj),
            myarray = [];
        if (typeof myobj[keys[0]] !== "object") {
            console.log("Incorrect data. Expected an array and found an string, trying to convert ..");
            $.each(keys, function(id, value) {
                myarray = [];
                myarray.push(myobj[value]);
                myobj[value] = myarray
            })
        }
        return myobj
    }

    function getSortedPeriods() {
        return ["last month", "last year", ""]
    }

    function getTitleFromPeriod(period) {
        if (period === "last month") {
            return "Last 30 days"
        } else if (period === "last year") {
            return "Last 365 days"
        } else {
            return "Complete history"
        }
    }

    function getHTMLTitleFromPeriod(period) {
        return '<div class="toptable-title">' + getTitleFromPeriod(period) + "</div>"
    }

    function composeTopTabs(data, metric, class_name) {
        var first = true,
            tabs_html = '<ul id="myTab" class="nav nav-tabs">',
            periods = getSortedPeriods();
        $.each(periods, function(id, p) {
            aux_obj = {
                html: ""
            };
            if (p === "") {
                p = "all";
                aux_obj.pretty_period = "Complete history"
            } else if (p === "last month") {
                aux_obj.pretty_period = "Last 30 days"
            } else if (p === "last year") {
                aux_obj.pretty_period = "Last 365 days"
            }
            aux_obj.myhref = class_name + metric + p.replace(/\ /g, "");
            if (first === true) {
                aux_obj.html = ' class="active"';
                first = false
            }
            var aux_html = '<li{html}><a href="#{myhref}" data-toogle="tab">{pretty_period}</a></li>';
            tabs_html += aux_html.supplant(aux_obj)
        });
        tabs_html += "</ul>";
        return tabs_html
    }

    function getTopVarsFromMetric(metric, ds_name) {
        var var_names = {};
        var_names.id = "id";
        if (metric === "senders" && (ds_name === "mls" || ds_name === "irc")) {
            var_names.name = "senders";
            var_names.action = "sent"
        }
        if (metric === "authors" && ds_name === "scm") {
            var_names.name = "authors";
            var_names.action = "commits"
        }
        if (ds_name === "its") {
            if (metric === "closers") {
                var_names.name = "closers";
                var_names.action = "closed"
            } else if (metric === "resolvers") {
                var_names.name = "resolvers";
                var_names.action = "resolved"
            }
        }
        if (metric === "closers" && ds_name === "its_1") {
            var_names.name = "closers";
            var_names.action = "closed"
        }
        if (ds_name === "scr") {
            if (metric === "mergers") {
                var_names.name = "mergers";
                var_names.action = "merged"
            }
            if (metric === "openers") {
                var_names.name = "openers";
                var_names.action = "opened"
            }
            if (metric === "submitters") {
                var_names.name = "openers";
                var_names.action = "opened"
            }
            if (metric === "reviewers") {
                var_names.name = "reviewers";
                var_names.action = "reviews"
            }
            if (metric === "participants") {
                var_names.name = "identifier";
                var_names.action = "events"
            }
            if (metric === "active_core_reviewers") {
                var_names.name = "identifier";
                var_names.action = "reviews"
            }
        }
        if (ds_name === "downloads") {
            if (metric === "ips") {
                var_names.name = "ips";
                var_names.action = "downloads"
            }
            if (metric === "packages") {
                var_names.name = "packages";
                var_names.action = "downloads"
            }
            if (metric === "pages") {
                var_names.name = "page";
                var_names.action = "visits"
            }
        }
        if (ds_name === "mediawiki") {
            if (metric === "authors") {
                var_names.name = "authors";
                var_names.action = "reviews"
            }
        }
        if (ds_name === "qaforums") {
            if (metric === "senders" || metric === "asenders" || metric === "qsenders") {
                var_names.name = "senders";
                var_names.action = "sent"
            } else if (metric === "participants") {
                var_names.name = "name";
                var_names.action = "messages_sent"
            }
        }
        if (ds_name === "releases") {
            if (metric === "authors") {
                var_names.name = "username";
                var_names.action = "releases"
            }
        }
        if (ds_name === "eventizer") {
            if (metric === "cities") {
                var_names.name = "city";
                var_names.action = "events"
            } else if (metric === "events") {
                var_names.name = "name";
                var_names.action = "rsvps"
            } else if (metric === "repos") {
                var_names.name = "name";
                var_names.action = "rsvps"
            } else if (metric === "rsvps") {
                var_names.name = "name";
                var_names.action = "events"
            }
        }
        if (ds_name === "dockerhub") {
            if (metric === "pulls") {
                var_names.name = "name";
                var_names.action = "pulls"
            }
        }
        return var_names
    }
})();
var Demographics = {};
(function() {
    var data_dg = {};
    Demographics.widget = function() {
        var divs = $(".DemographicsCompany"),
            ds_name, company_name, DS, period;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds_name = "";
                ds_name = $(this).data("data-source");
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                period = $(this).data("period");
                company_name = Utils.getParameter("company");
                loadDemographicsData(div, ds_name, company_name, period, displayDemographics)
            })
        }
    };

    function loadDemographicsData(div, ds_name, company_name, period, cb) {
        var suffix = ds_name.toLowerCase(),
            preffix, ag_file, b_file;
        preffix = "data/json/" + company_name + "-" + suffix + "-com-demographics-";
        ag_file = preffix + "aging.json";
        b_file = preffix + "birth.json";
        $.when($.getJSON(ag_file), $.getJSON(b_file)).done(function(ag_data, b_data) {
            data_dg[company_name] = {};
            data_dg[company_name][ds_name] = {
                aging: undefined,
                birth: undefined
            };
            data_dg[company_name][ds_name].aging = ag_data[0];
            data_dg[company_name][ds_name].birth = b_data[0];
            cb(div, ds_name, company_name, period)
        }).fail(function() {
            console.log("Demographics Company widget disabled. Missing " + ds_name + " files for company " + company_name)
        })
    }

    function displayDemographics(div, ds_name, company_name, period) {
        if (!div.id) div.id = "Parsed" + getRandomId();
        if (data_dg[company_name] !== undefined && data_dg[company_name][ds_name] !== undefined) {
            Viz.displayDemographicsChart(div.id, data_dg[company_name][ds_name], period)
        }
    }

    function getRandomId() {
        return Math.floor(Math.random() * 1e3 + 1)
    }
})();
var Glossary = {};
(function() {
    var metrics_data = {},
        menu_data = {};
    Glossary.widget = function() {
        var divs = $(".glossary"),
            ds_name;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                div.id = "glossary";
                loadGlossaryData(function() {
                    displayGlossary(div.id)
                })
            })
        }
    };

    function getAvailableSections() {
        var sections = [];
        $.each(menu_data, function(id, value) {
            if (metrics_data.hasOwnProperty(id)) {
                sections.push(id)
            }
        });
        return sections
    }

    function addIconEvent() {
        $(document).ready(function() {
            $(".collapse").on("shown.bs.collapse", function() {
                $(this).parent().find(".fa-plus").removeClass("fa-plus").addClass("fa-minus")
            }).on("hidden.bs.collapse", function() {
                $(this).parent().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus")
            })
        })
    }

    function displayGlossary(div_id) {
        var sections = getAvailableSections();
        var html = "";
        $.each(sections, function(id, value) {
            html += displayGlossaryFor(value)
        });
        $("#" + div_id).append(html);
        addIconEvent()
    }

    function displayGlossaryFor(ds_name) {
        var html = "";
        html += '<div class="col-md-6">';
        html += '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">';
        html += '<div class="panel panel-default">';
        html += '<div class="panel-heading" role="tab" id="heading' + ds_name + '">';
        html += '<h4 class="panel-title">';
        html += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapse' + ds_name + '">';
        html += '<span class="fa fa-plus"></span>';
        html += "&nbsp;&nbsp;" + metrics_data[ds_name].desc.name;
        html += "</a></h4></div>";
        html += '<div id="collapse' + ds_name + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + ds_name + '">';
        html += '<div class="panel-body">';
        html += "<p>" + metrics_data[ds_name].desc.desc + "</p>";
        html += '<table class="table">';
        for (var metric in metrics_data[ds_name]) {
            if (metric != "desc") {
                html += "<tr><td>" + metrics_data[ds_name][metric].name + "</td><td>" + metrics_data[ds_name][metric].desc + "</td></tr>"
            }
        }
        html += "</table>";
        html += "</div></div></div></div>";
        html += "</div>";
        return html
    }

    function loadGlossaryData(cb) {
        var json_file = "data/metrics.json",
            menu_file = "config/menu-elements.json";
        $.when($.getJSON(json_file, function(json_data) {
            metrics_data = json_data
        }), $.getJSON(menu_file, function(json_data) {
            menu_data = json_data.menu
        })).then(function() {
            cb()
        })
    }

    function loadGlossaryData2(div, ds_name) {
        var metrics;
        metrics = "data/metrics.json";
        $.when($.getJSON(metrics)).done(function(data, b_data) {
            $.each(data[ds_name], function(id, d) {
                data_metrics[ds_name][d.column] = d
            });
            html = '<div class="panel-heading" role="tab" id="headingTable' + ds_name + '">';
            html += '<span class="collapsed" data-toggle="collapse" data-parent="#accordion"';
            html += 'href="#collapseTable' + ds_name + '" aria-expanded="false" aria-controls="collapseTable' + ds_name + '">';
            html += "<h2><a>" + data_metrics[ds_name].desc.name + "</a></h2>" + data_metrics[ds_name].desc.desc + "</span></div>";
            html += '<div id="collapseTable' + ds_name + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTable' + ds_name + '">';
            html += '<div class="panel-body"  word-break: break-all; word-wrap: break-word; overflow: auto;"><hr>';
            html += '<table class="table">';
            for (var metric in data_metrics[ds_name]) {
                if (metric != "desc") {
                    html += "<tr><td>" + data_metrics[ds_name][metric].name + "</td><td>" + data_metrics[ds_name][metric].desc + "</td></tr>"
                }
            }
            html += "</table>";
            html += "</div></div>";
            $("#" + div.id).append(html)
        }).fail(function() {
            console.log("Glossary widget disabled. Missing " + ds_name)
        })
    }
})();
Loader.data_ready(function() {
    Glossary.widget()
});
vizjslib_git_revision = "017aeb2b765ab121c4403b8a7ecea3633ca38600";
vizjslib_git_tag = "16.01-16-g017aeb2";
