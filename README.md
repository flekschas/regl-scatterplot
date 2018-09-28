# Regl-based 2D Scatterplot

[![npm version](https://img.shields.io/npm/v/regl-scatterplot.svg)](https://www.npmjs.com/package/regl-scatterplot)
[![build status](https://travis-ci.org/flekschas/regl-scatterplot.svg?branch=master)](https://travis-ci.org/flekschas/regl-scatterplot)
[![code style prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![regl-scatterplot demo](https://img.shields.io/badge/demo-online-6ae3c7.svg)](https://flekschas.github.io/regl-scatterplot/)

> A highly scalable scatterplot rendered with WebGL using [Regl](https://github.com/regl-project/regl)

## Install

```
npm -i regl-scatterplot
```

## Getting started

```javascript
import createScatterplot from 'regl-scatterplot';

const canvas = document.querySelector('#canvas');

let { width, height } = canvas.getBoundingClientRect();

const scatterplot = createScatterplot({
  canvas, width, height, pointSize: 5,
});

const points = new Array(10000)
  .fill()
  .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2, color]);

scatterplot.draw(points);
```

See a complete example at [example/index.js](example/index.js).

## API

_Coming soon_
