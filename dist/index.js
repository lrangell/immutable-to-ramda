
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./immutable-to-ramda.cjs.production.min.js')
} else {
  module.exports = require('./immutable-to-ramda.cjs.development.js')
}
