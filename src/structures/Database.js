const { connect } = require('mongoose')

module.exports = class {
  init() {
    return new Promise(resolve => {
      connect(process.env.MONGO_SRV).then(resolve)
    })
  }
}