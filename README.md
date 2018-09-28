# Regl-based 2D Scatterplot

[![Build Status](https://travis-ci.org/flekschas/regl-scatterplot.svg?branch=master)](https://travis-ci.org/flekschas/regl-scatterplot)

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
