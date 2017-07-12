'use strict'


/* global describe, it */
const envOrJsonFile = require('.')

describe('@cypress/env-or-json-file', () => {
  it('write this test', () => {
    console.assert(envOrJsonFile, 'should export something')
  })
})
