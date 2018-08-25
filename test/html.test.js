import 'web-components-polyfill';

import { html, render, stopNode, Template, containersMap } from '../src/html';
import { r } from '../src/directives';


const template = (scope) => r`
  <div foo="${scope.foo}" bar="${scope.bar}${scope.foo}" class="foo ${scope.classes}">
    <span>${scope.text}</span>
    i am ${scope.text} ok ${scope.foo} !
    ${scope.element}
    ${scope.arr.map(item => html`
      <div id="test-${item}">
      </div>
    `)}
    ${scope.promiseArray.then(items => items.map(item => html`
      <span>${item}</span>
    `))}
    <!-- foo ${scope.text} -->
    <input type="text" value="${scope.foo}" ${scope.checked ? 'checked' : ''}/>
    <custom-comp value="${scope.complex}">
      <div>${scope.promiseVal}</div>
    </custom-comp>
    <script></script>
  </div>
`;


const snapshot = (scope) => `<div class="foo ${scope.classes}" foo="${scope.foo}" bar="${scope.bar}${scope.foo}">
    <span>${scope.text}</span>
    i am ${scope.text} ok ${scope.foo} !
    ${scope.element.outerHTML}
    ${scope.arr.map(item => `<div id="test-${item}">
      </div>
    `).join('')}
    <span>foo</span>
    <span>bar</span>
    
    <!-- foo ${scope.text} -->
    <input type="text">
    <custom-comp>
      <div>promise result</div>
    </custom-comp>
    <script></script>
  </div>
`;

const container = document.createElement('div');

customElements.define('custom-comp', class extends HTMLElement {
  constructor(){
    super();
    //console.log('constructor');
  }
  connectedCallback(){
    //console.log('connected');
  }
  set value(val){
    this._value = val;
  }
  get value(){
    return this._value;
  }
});


describe('basic',() => {
  it('matches snapshot', async () => {

    const scope = {
      foo: 'bar',
      bar: 12,
      text: 'text',
      classes: 'blah',
      checked: false,
      complex: { a: 'wow' },
      element: document.createElement('div'),
      arr: [1, 2],
      promiseVal: Promise.resolve('promise result'),
      promiseArray: Promise.resolve(['foo', 'bar']),
    };

    container.appendChild(template(scope));

    await new Promise(resolve => setTimeout(resolve, 1));

    document.body.appendChild(container);

    expect(container.querySelector('input').value).toEqual(scope.foo);
    expect(container.querySelector('input').checked).toEqual(scope.checked);
    expect(container.querySelector('custom-comp').value).toEqual(scope.complex);
    expect(container.innerHTML).toBe(snapshot(scope));
  });
});

describe('tables', () => {

  const template = (rows, cols = []) => html`
    <table>${rows.map(i => html`
      <tr>${cols.map(j => html`<td>number: ${i}</td>`)}</tr>
    `)}</table>
  `;

  //'`'
  const fixture = (rows, cols = []) => `<table>${rows.map(i => `<tr>${cols.map(j => `<td>number: ${i}</td>`).join('')}</tr>
    `).join('')}</table>
  `;
  //'`'

  const $container = document.createElement('div');

  it('renders correctly', () => {
    const value1 = [1, 2, 3];
    render(template(value1), $container);
    expect($container.innerHTML).toBe(fixture(value1));

    const value2 = [1, 2, 3, 6];
    render(template(value2), $container);
    expect($container.innerHTML).toBe(fixture(value2));

    const value3 = [[1, 2], [3,4]];
    render(template(value3[0], value3[1]), $container);
    expect($container.innerHTML).toBe(fixture(value3[0], value3[1]));

    const value4 = [1];
    render(template(value1), $container);
    expect($container.innerHTML).toBe(fixture(value1));
  });
});

describe('transitions', () => {

  const tpl = html`
    for ${1} bar
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
  `;

  const snapshot1 = `for 1 bar
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
    <div bar="bla">
      <span attr-one="1"></span>
    </div>
  `;

  const tpl2 = html`
    foo ${1} bar
    ${['foo', 'bar'].map((tt) => html`
      <div bar="${tt}">
      </div>
    `)}
    ${Promise.resolve('ok')}
  `;

  const snapshot2 = `foo 1 bar
    <div bar="foo">
      </div>
    <div bar="bar">
      </div>
    
    ok
  `;

  it('basic', async () => {
    const container = document.createElement('div');
    render(tpl, container);

    expect(container.innerHTML).toBe(snapshot1);

    render(tpl2, container);

    await new Promise(resolve => setTimeout(resolve, 1));

    expect(container.innerHTML).toBe(snapshot2);
  });

  it('basic update', () => {

    const tpl = (text) => html`${text}`;

    const container = document.createElement('div');

    render(tpl('foo'), container);
    expect(container.innerHTML).toBe('foo');

    render(tpl('bar'), container);
    expect(container.innerHTML).toBe('bar');

    render(tpl('foo'), container);
    expect(container.innerHTML).toBe('foo');
  });

  it('falsy values', async () => {
    const container = document.createElement('div');

    const tpl = (scope) => html`
      ${scope.a}
      <span>${scope.b}</span>
      <div>${scope.c}</div>
    `;

    const snapshot1 = `0
      <span>false</span>
      <div></div>
    `;

    render(tpl({ a: 0, b: false }), container);
    expect(container.innerHTML).toBe(snapshot1);

    const snapshot2 = `1
      <span></span>
      <div>null</div>
    `;

    render(tpl({ a: 1, c: null }), container);
    expect(container.innerHTML).toBe(snapshot2);

    const snapshot3 = `
      <span>test</span>
      <div>0</div>
    `;

    render(tpl({ b: 'test', c: 0 }), container);
    expect(container.innerHTML).toBe(snapshot3);
  });


  it('elements', () => {

    const container = document.createElement('div');

    const element = document.createElement('div');
    element.id = 'my-element';

    const tpl = (scope) => html`
      <div>
        <span class="foo"></span>
        ${scope.element}
        <span class="bar"></span>
      </div>
    `;

    const snapshot1 = (scope) => `<div>
        <span class="foo"></span>
        ${scope.element.outerHTML}
        <span class="bar"></span>
      </div>
    `;

    render(tpl({ element }), container);

    expect(container.innerHTML).toBe(snapshot1({ element }));
    expect(container.contains(element)).toBe(true);
    expect(container.querySelector('#my-element')).toBe(element);

    render(tpl({ element }), container);

    expect(container.innerHTML).toBe(snapshot1({ element }));
    expect(container.contains(element)).toBe(true);
    expect(container.querySelector('#my-element')).toBe(element);
  });

  it('stopNode handling', () => {

    const container = document.createElement('div');

    const tpl = html`
      <div id="my-element" ${stopNode}>
        <span></span>
      </div>
    `;

    const snapshot1 = `<div id="my-element">
        <span></span>
      </div>
    `;

    render(tpl, container);

    expect(container.innerHTML).toBe(snapshot1);

    const $testElement = document.createElement('div');
    $testElement.setAttribute('foo', 'bar');
    container.querySelector('#my-element').appendChild($testElement);

    const snapshot2 = `<div id="my-element">
        <span></span>
      ${$testElement.outerHTML}</div>
    `;

    render(tpl, container);

    expect(container.innerHTML).toBe(snapshot2);
  });

  it('promise', async () => {

    const container = document.createElement('div');

    const tpl = (scope) => html`${scope}`;

    const promiseResult = Promise.resolve('async value');

    render(tpl('test'), container);
    expect(container.innerHTML).toBe('test');

    render(tpl(promiseResult), container);
   
    render(tpl('test2'), container);
    expect(container.innerHTML).toBe('test2');

    await promiseResult;

    expect(container.innerHTML).toBe('async value');
  });

});

describe('function', () => {

  it('only render', () => {

    const tpl = (scope) => html`${scope}`;

    const fn = jest.fn();

    render(tpl(fn));
    expect(fn).toHaveBeenCalled();
  });

  it('update', () => {

    const container = document.createElement('div');

    const tpl = (scope) => html`${scope}`;

    const functionSpy = jest.fn();
    const updateSpy = jest.fn();

    const getFns = () => {
      return (target, prevResult) => {
        functionSpy(prevResult);
        return 'test';
      }
    }

    render(tpl(getFns()), container);
    expect(functionSpy).toHaveBeenCalled();

    functionSpy.mockReset();
    updateSpy.mockReset();

    render(tpl(getFns()), container);
    expect(functionSpy).toHaveBeenCalledWith('test');
  });

});

describe('element', () => {

  it('replace element with element', () => {

    const container = document.createElement('div');

    const element1 = document.createElement('div');
    const element2 = document.createElement('div');

    const tpl = (scope) => html`${scope}`;

    render(tpl(element1), container);
    expect(container.contains(element1)).toBe(true);

    render(tpl(element2), container);
    expect(container.contains(element1)).toBe(false);
    expect(container.contains(element2)).toBe(true);
  });

  it('replace element with fragment', () => {

    const container = document.createElement('div');

    const element = document.createElement('div');
    const fragment = document.createDocumentFragment();

    const subElement1 = document.createElement('div');
    const subElement2 = document.createElement('div');

    fragment.appendChild(subElement1);
    fragment.appendChild(subElement2);

    const tpl = (scope) => html`${scope}`;

    render(tpl(element), container);
    expect(container.contains(element)).toBe(true);

    render(tpl(fragment), container);
    expect(container.contains(element)).toBe(false);
    expect(container.contains(subElement1)).toBe(true);
    expect(container.contains(subElement2)).toBe(true);
  });

  it('replace fragment with element', () => {

    const container = document.createElement('div');

    const fragment = document.createDocumentFragment();

    const subElement1 = document.createElement('div');
    const subElement2 = document.createElement('div');

    fragment.appendChild(subElement1);
    fragment.appendChild(subElement2);

    const element = document.createElement('div');

    const tpl = (scope) => html`${scope}`;

    render(tpl(fragment), container);
    expect(container.contains(subElement1)).toBe(true);
    expect(container.contains(subElement2)).toBe(true);

    render(tpl(element), container);
    expect(container.contains(element)).toBe(true);
    expect(container.contains(subElement1)).toBe(false);
    expect(container.contains(subElement2)).toBe(false);
  });

});

describe('ternary operator', () => {
  it('case 1', () => {
    const $container = document.createElement('div');

    const tpl = (scope) => html`
      ${scope ? html`
        <span></span>
      ` : html`
        <div class="foo1"></div>
        <div class="foo2"></div>
      `}`;

    const snapshot1 = `<div class="foo1"></div>
        <div class="foo2"></div>
      `;

    const snapshot2 = `<span></span>
      `;

    tpl(false)($container);
    expect($container.innerHTML).toBe(snapshot1);
    tpl(true)($container);
    expect($container.innerHTML).toBe(snapshot2);
    tpl(false)($container);
    expect($container.innerHTML).toBe(snapshot1);
    tpl(true)($container);
    expect($container.innerHTML).toBe(snapshot2);
  });

  it('case 2', () => {
    const $container = document.createElement('div');

    const tpl = (show) => html`${show ? html`<span>ok</span>`: ''}`;
    const snapshot = '<span>ok</span>';

    render(tpl(true), $container);
    expect($container.innerHTML).toBe(snapshot);
    render(tpl(false), $container);
    expect($container.innerHTML).toBe('');
    render(tpl(true), $container);
    expect($container.innerHTML).toBe(snapshot);
  });

  it('case 3', () => {
    const $container = document.createElement('div');

    const tpl = (scope) => html`
      ${scope.a ? html`
        ${scope.b ? html`
          foo
        ` : void 0}
        ${scope.c ? html`
          bar
        ` : void 0}
        baz
      ` : void 0}
    `;

    render(tpl({ a: 1, b: 1 }), $container);
    expect($container.innerHTML).toBe(`foo
        
        
        baz
      
    `);

    render(tpl({ a: 1, c: 1 }), $container);
    expect($container.innerHTML).toBe(`
        bar
        
        baz
      
    `);

    render(tpl({ a: 1 }), $container);
    expect($container.innerHTML).toBe(`
        
        baz
      
    `);

    render(tpl({ a: 1, c: 1 }), $container);
    expect($container.innerHTML).toBe(`
        bar
        
        baz
      
    `);

    render(tpl({ a: 1, b: 1 }), $container);
    expect($container.innerHTML).toBe(`foo
        
        
        baz
      
    `);
  });

  it('case 4', () => {
    const $container = document.createElement('div');

    const tpl = (scope) => html`
      ${scope ? html`
        <span>${scope}</span>
      ` : html`
        <div class="foo1"></div>
        <div class="foo2"></div>
      `}`;

    const snapshot1 = `<div class="foo1"></div>
        <div class="foo2"></div>
      `;

    const snapshot2 = (scope) => `<span>${scope}</span>
      `;

    tpl(true)($container);
    expect($container.innerHTML).toBe(snapshot2(true));
    tpl(false)($container);
    expect($container.innerHTML).toBe(snapshot1);
    tpl('foo')($container);
    expect($container.innerHTML).toBe(snapshot2('foo'));
    tpl(48)($container);
    expect($container.innerHTML).toBe(snapshot2(48));
    tpl(false)($container);
    expect($container.innerHTML).toBe(snapshot1);
  });
});


describe('comment section', () => {

  it('static value', () => {
    const $container = document.createElement('div');

    const tpl = () => html`1 <!-- foo -->`;

    render(tpl(), $container);
    expect($container.innerHTML).toBe('1 <!-- foo -->');
  });

  it('dynamic value', () => {
    const $container = document.createElement('div');

    const tpl = (scope) => html`1 <!-- foo ${scope} -->`;

    render(tpl('bar'), $container);
    expect($container.innerHTML).toBe('1 <!-- foo bar -->');

    render(tpl('baz'), $container);
    expect($container.innerHTML).toBe('1 <!-- foo baz -->');
  });

});
