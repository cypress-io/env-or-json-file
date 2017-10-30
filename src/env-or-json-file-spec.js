'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const path = require('path')
const os = require('os')

const isWindows = os.platform() === 'win32'

// quick and dirty deep comparison
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* global describe, it, beforeEach, afterEach */
describe('@cypress/env-or-json-file', () => {
  const { configFromEnvOrJsonFile, filenameToShellVariable } = require('.')

  describe('filename to shell variable', () => {
    it('forms string removing slashes', () => {
      const filename = path.join('scripts', 'support', '.credentials.json')
      const result = filenameToShellVariable(filename)
      la(result === '_credentials_json', result)
    })

    if (!isWindows) {
      it('removes windows back slashes', () => {
        const filename = 'foo\\bar\\baz'
        const result = filenameToShellVariable(filename)
        la(result === 'foo_bar_baz', result)
      })
    }
  })

  it('is a function', () => {
    la(is.fn(configFromEnvOrJsonFile))
  })

  const config = {
    foo: 'bar',
    baz: 42
  }
  const configString = JSON.stringify(config)

  it('returns undefined if cannot load', () => {
    const loaded = configFromEnvOrJsonFile('does not exist')
    la(loaded === undefined, 'loaded something', loaded)
  })

  describe('loads from env variable', () => {
    beforeEach(() => {
      process.env.foo_json = configString
    })

    afterEach(() => {
      delete process.env.foo_json
    })

    it('simple config', () => {
      const loaded = configFromEnvOrJsonFile('foo.json')
      la(isEqual(loaded, config), 'wrong config', loaded)
    })
  })

  describe('loads from file', () => {
    const sinon = require('sinon')
    const fs = require('fs')
    const path = require('path')

    beforeEach(() => {
      const fullPath = path.resolve('foo.json')
      sinon
        .stub(fs, 'existsSync')
        .withArgs(fullPath)
        .returns(true)
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
      la(isEqual(loaded, config), 'wrong config', loaded)
    })
  })
})
