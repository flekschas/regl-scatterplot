/* eslint no-console: 1, no-undef: 1, no-unused-vars: 1 */

import '@babel/polyfill';
import { expect, test } from 'vitest';

import { checkSupport } from '../src';

import {
  toRgba,
  isNormFloatArray,
  isValidBBox,
  isSameRgbas,
} from '../src/utils';

const EPS = 1e-7;

test('isValidBBox()', () => {
  expect(isValidBBox([1, 2, 3, 4])).toBe(true);
  // x range is zero
  expect(isValidBBox([1, 2, 1, 4])).toBe(false);
  // y range is zero
  expect(isValidBBox([1, 2, 3, 2])).toBe(false);
  // infinity
  expect(isValidBBox([1, Infinity, 3, 2])).toBe(false);
  // -infinity
  expect(isValidBBox([1, -Infinity, 3, 2])).toBe(false);
  // NaN
  expect(isValidBBox([1, Number.NaN, 3, 2])).toBe(false);
});

test('isNormFloatArray()', () => {
  expect(isNormFloatArray([255, 0, 0, 255])).toBe(false);
  expect(isNormFloatArray([1, 2, 3, 4])).toBe(false);
  expect(isNormFloatArray([0, 0, 0, 0.5])).toBe(true);
  expect(isNormFloatArray([0.5, 1, 0.005, 1])).toBe(true);

  // Inconclusive
  // [0, 0, 0, 1] could be [0, 0, 0, 1] or [0, 0, 0, 1/255]
  expect(isNormFloatArray([0, 0, 0, 1])).toBe(true);
  // [1, 1, 1, 1] could be [1, 1, 1, 1] or [1/255, 1/255, 1/255, 1/255]
  expect(isNormFloatArray([1, 1, 1, 1])).toBe(true);
});

test('toRgba()', () => {
  expect(toRgba('#ff0000')).toEqual([255, 0, 0, 255]);
  expect(toRgba('#ff0000', true)).toEqual([1, 0, 0, 1]);
  expect(toRgba([255, 0, 0])).toEqual([255, 0, 0, 255]);
  expect(toRgba([1, 0, 0], true)).toEqual([1, 0, 0, 1]);
  expect(toRgba([255, 0, 0, 153])).toEqual([255, 0, 0, 153]);
  expect(toRgba([153, 0, 0, 153], true)).toEqual([0.6, 0, 0, 0.6]);
  expect(toRgba([1, 0, 0, 0.6])).toEqual([255, 0, 0, 153]);
  expect(toRgba([0, 0, 0, 0.1], true)).toEqual([0, 0, 0, 0.1]);
  expect(toRgba([1, 0, 0, 0.6])).toEqual([255, 0, 0, 153]);
});

test('checkSupport()', () => {
  expect(checkSupport() === true || checkSupport() === false).toBe(true);
});

test('isSameRgbas()', () => {
  expect(isSameRgbas('#ff0000', [[0, 1, 1, 1]])).toBe(false);
  expect(isSameRgbas([[0, 1, 1, 1]], '#ff0000')).toBe(false);
  expect(isSameRgbas([0, 1, 1, 1], [0, 1, 1, 1])).toBe(false);
  expect(isSameRgbas([[0, 1, 1, 1], [1, 1, 0, 0]], [[0, 1, 1, 1]])).toBe(false);
  expect(isSameRgbas([[0, 1, 1, 1]], [[0, 1, 1, 1], [1, 1, 0, 0]])).toBe(false);
  expect(isSameRgbas([[0, 1, 1, 1]], [[1, 1, 1, 1]])).toBe(false);
  expect(isSameRgbas([[0, 1, 1, 1]], [[0, 1, 1, 1]])).toBe(true);
});
