# modulor-html
 
<img align="center" width="95" height="95"
     alt="Philosopher’s stone, logo of PostCSS"
     src="./logo.svg">
<span>&nbsp;&nbsp;&nbsp;Missing template engine for Web Components</span>

```js
import { html, render } from '@modulor-js/html';

customElements.define('my-component', class extends HTMLElement {
  set props({ first, second }){
    render(html`
      <div>first: ${first}</div>
      <div>second: ${second}</div>
    `, this);
  }
});

const first = 'foo';

render(html`
  <my-component first="${first}" second="bar"></my-conponent>
`, document.getElementById('root'));
```


...and much more

```js
import { html, render } from '@modulor-js/html';

const tpl = (date) => html`
  <span>Time: ${date.toLocaleTimeString()}</span>
`;

setInterval(() => {
  render(tpl(new Date()), document.getElementById('root'));
}, 1000);
```

[api and examples](./API.md)

## Goals

  - Can be used in production and is already battle tested

  - Designed to be compatible with CustomElements

  - Small size (**3.2kb** minigzipped)

  - High performance

  - Native js syntax for templates ([tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals))


## Installation

```sh
npm install --save @modulor-js/html
```


## Browser support

IE >= 11 and all evergreens


## Webpack loader

In real life templates can (and will) be way bigger and more complex so you might want to split them out of js code

For this case there is [`modulor-html-loader`](https://github.com/modulor-js/modulor-html-loader)


## Build / Test

`npm run build`: build the app

`npm run test`: test the app


## Benchmark

`npm run benchmark`: runs node-based benchmarks

`npm run benchmark:browser`: runs benchmarks in browser


## Issues / Bugs

Found a bug or issue? Please [report it](https://github.com/modulor-js/modulor-html/issues/new)
