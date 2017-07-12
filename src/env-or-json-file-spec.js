'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const snapshot = require('snap-shot')

/* global describe, it, beforeEach, afterEach */
describe('@cypress/env-or-json-file', () => {
  const { configFromEnvOrJsonFile } = require('.')

  it('is a function', () => {
    la(is.fn(configFromEnvOrJsonFile))
  })

  const config = {
    foo: 'bar',
    baz: 42
  }
  const configString = JSON.stringify(config)

  describe('loads from env variable', () => {
    beforeEach(() => {
      process.env.foo_json = configString
    })

    afterEach(() => {
      delete process.env.foo_json
    })

    it('simple config', () => {
      const loaded = configFromEnvOrJsonFile('foo.json')
      snapshot(loaded)
    })
  })

  describe('loads from file', () => {
    const sinon = require('sinon')
    const fs = require('fs')
    const path = require('path')

    beforeEach(() => {
      const fullPath = path.resolve('foo.json')
      sinon.stub(fs, 'existsSync').withArgs(fullPath).returns(true)
      sinon
        .stub(fs, 'readFileSync')
        .withArgs(fullPath, 'utf8')
        .returns(configString)
    })

    afterEach(() => {
      fs.existsSync.restore()
      fs.readFileSync.restore()
    })

    it('loads foo.json', () => {
      const loaded = configFromEnvOrJsonFile('foo.json')
      snapshot(loaded)
    })
  })
})
