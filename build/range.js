"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodesRange = NodesRange;
function NodesRange(startNode, stopNode) {
  var startOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var stopOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


  //@TODO: should be better here
  this.childNodes = [];
  this.firstChild = null;
  this.lastChild = null;

  this.startNode = startNode;
  this.stopNode = stopNode;

  if (!startNode || !stopNode) {
    return this;
  }

  if (startNode.parentNode !== stopNode.parentNode) {
    return this;
  }

  this.update();
  return this;
}

NodesRange.prototype.appendChild = function ($el) {
  this.stopNode.parentNode.insertBefore($el, this.stopNode);
  this.update();
};

NodesRange.prototype.removeChild = function ($el) {
  this.stopNode.parentNode.removeChild($el);
  var index = this.childNodes.indexOf($el);
  if (!~index) {
    return;
  }
  this.update();
};

NodesRange.prototype.replaceChild = function ($newElement, $oldElement) {
  var index = this.childNodes.indexOf($oldElement);
  if (!~index) {
    return;
  }
  $oldElement.parentNode.replaceChild($newElement, $oldElement);
  this.update();
};

NodesRange.prototype.extractContents = function () {
  var $fragment = document.createDocumentFragment();
  $fragment.appendChild(this.startNode);
  this.childNodes.reduce(function ($fragment, node) {
    $fragment.appendChild(node);
    return $fragment;
  }, $fragment);
  $fragment.appendChild(this.stopNode);
  //copy nodes here
  return $fragment;
};

NodesRange.prototype.update = function () {
  this.childNodes = [];
  for (var node = this.startNode.nextSibling; node && node !== this.stopNode; node = node.nextSibling) {
    this.childNodes.push(node);
  }

  this.firstChild = this.childNodes[0];
  this.lastChild = this.childNodes[this.childNodes.length - 1];
};

NodesRange.prototype.getByIndex = function (index) {};