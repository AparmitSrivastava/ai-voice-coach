import { test } from 'node:test'
import assert from 'node:assert/strict'
import tokenUtils from '../utils/tokenUtils.js'

const { calculateTokenCount } = tokenUtils

test('calculateTokenCount handles non-string input', () => {
  assert.equal(calculateTokenCount(null), 0)
  assert.equal(calculateTokenCount(undefined), 0)
  assert.equal(calculateTokenCount(42), 0)
})

test('calculateTokenCount returns 0 for empty or whitespace-only strings', () => {
  assert.equal(calculateTokenCount(''), 0)
  assert.equal(calculateTokenCount('   '), 0)
})

test('calculateTokenCount counts word tokens', () => {
  assert.equal(calculateTokenCount('hello world'), 2)
  assert.equal(calculateTokenCount('multiple   spaces here'), 3)
  assert.equal(calculateTokenCount('line\nbreaks\tand tabs'), 4)
})

test('calculateTokenCount trims punctuation gracefully', () => {
  assert.equal(calculateTokenCount('Hello, world!'), 2)
})

