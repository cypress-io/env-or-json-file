const path = require('path')
const fs = require('fs')
const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('env-or-json-file')

// environment variables set via shell have restrictions
// so remove invalid characters from the filename
// that cannot be there
function filenameToShellVariable (filename) {
  la(is.unemptyString(filename), 'missing filename to convert')
  const basename = path.basename(filename)
  const rep = '_'
  // replace all separators with _ or similar character
  return basename
    .replace(/\//g, rep)
    .replace(/\\/g, rep)
    .replace(/\./g, rep)
    .replace(/-/g, rep)
}

function maybeLoadFromVariable (filename) {
  const key = filenameToShellVariable(filename)
  debug('checking environment variable "%s"', key)
  if (process.env[key]) {
    debug('loading from variable', key)
    return JSON.parse(process.env[key])
  }
}

function loadFromFile (key) {
  const pathToConfig = path.resolve(key)

  if (!fs.existsSync(pathToConfig)) {
    debug('cannot find file', pathToConfig)
    return
  }

  try {
    debug('loading file', pathToConfig)
    return JSON.parse(fs.readFileSync(pathToConfig, 'utf8'))
  } catch (err) {
    console.error('Could not load file', pathToConfig)
  }
}

function configFromEnvOrJsonFile (filename) {
  la(is.unemptyString(filename), 'expected env key / filename', filename)
  const config = maybeLoadFromVariable(filename)
  if (config) {
    return config
  }
  return loadFromFile(filename)
}

module.exports = {
  configFromEnvOrJsonFile,
  filenameToShellVariable
}
