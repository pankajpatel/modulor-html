"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var html=require("@modulor-js/html"),directives=require("@modulor-js/html/directives");function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(e){return!1}}function _construct(e,t,r){return(_construct=isNativeReflectConstruct()?Reflect.construct:function(e,t,r){var n=[null];n.push.apply(n,t);var o=new(Function.bind.apply(e,n));return r&&_setPrototypeOf(o,r.prototype),o}).apply(null,arguments)}function _isNativeFunction(e){return-1!==Function.toString.call(e).indexOf("[native code]")}function _wrapNativeSuper(e){var r="function"==typeof Map?new Map:void 0;return(_wrapNativeSuper=function(e){if(null===e||!_isNativeFunction(e))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(e))return r.get(e);r.set(e,t)}function t(){return _construct(e,arguments,_getPrototypeOf(this).constructor)}return t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),_setPrototypeOf(t,e)})(e)}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _possibleConstructorReturn(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?_assertThisInitialized(e):t}function createElement(t){return function(){function e(){return _classCallCheck(this,e),_possibleConstructorReturn(this,_getPrototypeOf(e).apply(this,arguments))}return _inherits(e,_wrapNativeSuper(HTMLElement)),_createClass(e,[{key:"connectedCallback",value:function(){if(!this._props&&!this.hasAttribute("prerendered")){for(var e={children:directives.unsafeHtml(this.innerHTML)};0<this.attributes.length;){var t=this.attributes[0],r=t.value,n="class"===t.name?"className":t.name;Object.assign(e,_defineProperty({},n,this.types[n]?this.types[n](r):r)),this.removeAttribute(t.name)}this.props(e,!0)}}},{key:"props",value:function(e,t){html.render(this.render(this._props=e),this)}},{key:"render",value:function(e){return t(e)}},{key:"preventChildRendering",get:function(){return!0}},{key:"preventAttributeSet",get:function(){return!0}},{key:"types",get:function(){return{}}}]),e}()}var ModulorElement=createElement(function(){});exports.ModulorElement=ModulorElement,exports.createElement=createElement;