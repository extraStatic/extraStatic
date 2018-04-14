const app = require('../app')

class ExtraStaticServer {
  constructor(config) {
    this.config = config
    this.app = app
  }

  start() {
    let port = this.config.get('port')
    this.app.listen(port)
  }
}

module.exports = ExtraStaticServer