import { NodesRange } from './range';

const templatesCache = {};

const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

const ITERATIONS_THRESHOLD = 1000;

function same(nodeA, nodeB){
  if(!nodeA || !nodeB){
    return false;
  }
  if(nodeA.nodeType !== nodeB.nodeType){
    return false;
  }
  if(nodeA.tagName && nodeB.tagName && nodeA.tagName === nodeB.tagName){
    return true;
  }
  return nodeA.isEqualNode(nodeB);
};

function isSameTextNode(nodeA, nodeB){
  if(nodeA.nodeType === NODE_TYPES.TEXT_NODE && nodeA.nodeType === NODE_TYPES.TEXT_NODE && nodeA.textContent === nodeB.textContent){
    return true;
  }
  return false;
};

//hash function taken from https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
  var hash = 5381,
      i    = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0;
};

function regExpEscape(literalString){
  return literalString.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
};

function getChunkType(chunk){
  if(chunk instanceof Node){
    return 'element'
  } else if(chunk instanceof Promise){
    return 'futureResult'
  } else if(chunk instanceof Template){
    return 'template'
  }
  return 'text';
}


export function Template(options){
  Object.assign(this, options);
  return this;
};

Template.prototype.parse = function(...args){
  [this.template, this.dataMap] = this.prepareLiterals(...args);

  this.templateId = hash(this.template);
  const cached = templatesCache[this.templateId];

  if(typeof cached === 'undefined'){
    this.container = this.generateContainer(this.template);
    templatesCache[this.templateId] = this.container;
  } else {
    this.container = cached;
  }
  return this;
}

Template.prototype.processTextNodeChunks = function(chunks, dataMap = this.dataMap){
  return chunks.reduce((acc, chunk) => {
    if(!`${chunk}`.length){
      return acc;
    }
    const match = chunk.match(new RegExp(`^${this.getTokenRegExp(true)}$`));
    const value = match ? dataMap[chunk] : chunk;
    if(typeof value === 'undefined'){ return acc; }
    const chunkType = getChunkType(value);
    if(chunkType !== 'text'){
      const $el = document.createComment(``);
      $el.isSpecialChunk = true;
      $el[chunkType] = value;
      $el.chunkType = chunkType;
      $el.templateId = this.templateId;
      $el.chunkId = match[2];
      return acc.concat($el);
    }
    return acc.concat(value);
  }, []);
};

Template.prototype.copyTextNodeChunks = function(chunks, dataMap = this.dataMap, container = document.createDocumentFragment()){
  return [].concat(chunks).reduce((container, chunk) => {
    if(chunk.isSpecialChunk){
      container.appendChild(chunk);
      return container;
    }
    const chunkType = getChunkType(chunk);
    if(chunkType === 'text'){
      container.appendChild(document.createTextNode(chunk));
    } else {
      const $el = document.createComment(``);
      $el[chunkType] = chunk;
      $el.isSpecialChunk = true;
      $el.chunkType = chunkType;
      $el.templateId = this.templateId;
      container.appendChild($el);
    }
    return container;
  }, container);
};

//@TODO support promise in attributes
Template.prototype.copyAttributes = function(target, source, dataMap = this.dataMap){
  const newAttrs = [];
  const attrs = source.attributes;
  if(!attrs.length){ return; }
  for(let i = 0; i < attrs.length; i++){
    const { name, value } = attrs[i];
    const preparedName = this.replaceTokens(name);
    const preparedValue = new RegExp(`^${this.getTokenRegExp()}$`).test(value) ? dataMap[value] : this.replaceTokens(value);
    if(preparedName === ''){ return; }
    newAttrs.push(preparedName);
    if(value !== '' && preparedName in target){
      target[preparedName] = preparedValue;
      continue;
    }
    target.setAttribute(preparedName, preparedValue);
  }

  //@TODO refactor here
  const targetAttrs = target.attributes;
  for(let j = 0; j < targetAttrs.length; j++){
    const attrName = targetAttrs[j].name;
    if(!~newAttrs.indexOf(attrName)){
      target.removeAttribute(attrName);
    }
  }
};

Template.prototype.loop = function($source, $target, debug){

  for(let i = 0, offset = 0;; i++){

    if(i > ITERATIONS_THRESHOLD){
      console.log('too much recursion');
      break;
    }

    const $sourceElement = $source.childNodes[i];
    const $targetElement = $target.childNodes[i + offset]; //probably offset is not needed

    //no further elements, end of loop
    if(!$sourceElement && !$targetElement){
      break;
    }

    //element doesn't exist anymore
    if(!$sourceElement){
      $target.removeChild($targetElement);
      i--;
      continue;
    }

    if(!$targetElement || !same($sourceElement, $targetElement)){
      //@TODO strange behaviour here, have to make it a closure
      const fn = ($target, $targetElement) => ($el) => {
        if(!$targetElement){
          //element should be newly created
          return $target.appendChild($el);
        }
        //replace old node with new one
        return $target.replaceChild($el, $targetElement);
      };
      const domFn = fn($target, $targetElement);
      const getRange = ($targetElement, replacementType) => {

        if($targetElement && $targetElement.range && $targetElement.replacementType === replacementType && $targetElement.templateId === this.templateId){
          return $targetElement.range;
        } else {
          const range = new NodesRange(document.createTextNode(''), document.createTextNode(''));
          const { startNode } = range;
          startNode.range = range;
          startNode.replacementType = replacementType;
          startNode.templateId = this.templateId;
          domFn(range.extractContents());
          return range;
        }
      }
      switch($sourceElement.nodeType){
        case NODE_TYPES.TEXT_NODE:
          const content = $sourceElement.textContent;
          const chunks = content.split(new RegExp(this.getTokenRegExp(), 'ig'));

          if(chunks.length === 1){
            domFn(document.createTextNode($sourceElement.textContent));
            break;
          }

          let range = getRange($targetElement, 'textContent');
          const processedChunks = this.processTextNodeChunks(chunks);
          const $processedChunksFragment = this.copyTextNodeChunks(processedChunks);
          this.loop($processedChunksFragment, range);
          offset += range.childNodes.length + 1;
          break;
        case NODE_TYPES.COMMENT_NODE:
          if($sourceElement.isSpecialChunk){
            const type = $sourceElement.chunkType;
            const range = getRange($targetElement, type);

            if(type === 'futureResult'){
              $sourceElement.futureResult.then((response) => {
                const $frag = this.copyTextNodeChunks(response);
                this.loop($frag, range);
                //update range for future promise resolves
                //@TODO write better explanation
                range.update();
                return $frag;
              });
              offset += range.childNodes.length + 1;

              break;
            }
            if(type === 'template'){
              $sourceElement.template.render(range);
              offset += range.childNodes.length + 1;

              break;
            }
            if(type === 'element'){
              const $frag = document.createDocumentFragment();
              $frag.appendChild($sourceElement.element);

              //@TODO probably better to simply replace elements in range with ones from $frag
              this.loop($frag, range);
              offset += range.childNodes.length + 1;

              break;
            }
          }
          domFn(document.createComment(this.replaceTokens($sourceElement.textContent)));
          break;
        case NODE_TYPES.ELEMENT_NODE:
          const newChild = document.createElement($sourceElement.tagName.toLowerCase());
          domFn(newChild);

          this.loop($sourceElement, newChild);

          //set attributes after whole subtree has build,
          //because node content might be needed before setter being executed
          this.copyAttributes(newChild, $sourceElement);
          break;
      }
      continue;
    }

    //at this point we are sure both elements exist

    //same text
    if(isSameTextNode($sourceElement, $targetElement)){
      continue;
    }

    //same node
    if(same($sourceElement, $targetElement)){
      this.copyAttributes($targetElement, $sourceElement);
      this.loop($sourceElement, $targetElement);
      continue;
    }
  }
  return $target;
};

Template.prototype.render = function(target = document.createDocumentFragment()){
  return this.loop(this.container, target);
};

Template.prototype.parser = new DOMParser();

Template.prototype.generateContainer = function(markup){
  return this.parser.parseFromString(markup, "text/html").body;
};

Template.prototype.prepareLiterals = function([firstChunk, ...restChunks], ...interpolations){
  return restChunks.reduce(([acc, dataMap], chunk, index) => {
    const keyName = this.generateTokenName(index);
    dataMap[keyName] = interpolations[index];
    return [acc.concat(keyName).concat(chunk), dataMap];
  }, [firstChunk, {}]);
};

Template.prototype.generateTokenName = function(index){
  return `${this.PREFIX}${index}${this.POSTFIX}`;
};

Template.prototype.replaceTokens = function(text, dataMap = this.dataMap){
  return text.replace(new RegExp(this.getTokenRegExp(), 'ig'), (token, index) => {
    return dataMap[token];
  });
};

Template.prototype.getTokenRegExp = function(groupMatches){
  const indexRegex = `${groupMatches ? '(' : ''}\\d+${groupMatches ? ')' : ''}`;
  return `(${regExpEscape(this.PREFIX)}${indexRegex}${regExpEscape(this.POSTFIX)})`;
};

Template.prototype.PREFIX  = `{modulor_html_chunk_${+new Date()}:`;
Template.prototype.POSTFIX = '}';


export const html = (...args) => (new Template({})).parse(...args);

export const render = (template, target) => template.render(target);
export const r = (...args) => render(html(...args));


//@TODO make sub containers stop nodes in order to avoid their rerender (in case of components)
//@TODO implement stop node attribute (e.g. <div ${stopNode}></div>)
//@TODO think about collecting new nodes to append into fragment and appending the whole fragment later
//@TODO handle undefined values when set attributes
//@TODO maybe store templateId as string?
//@TODO maybe converting special nodes to comment and then replacing it is not good idea?
//@TODO handle variables in tag names (e.g. html`<${myTag}/>`)