const postcss = require('postcss')
const Processor = require('./processor')

let processor

module.exports = postcss.plugin('postcss-animate-to-json', (opts = { }) => {

  processor = processor || new Processor(opts)

  processor.saveJson()

  return (root) => {

    processor.transform(root)

    processor.saveJson()
  }
})
