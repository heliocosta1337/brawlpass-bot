class Command {
  constructor(client, options) {
    this.client = client
    this.name = options.name
    this.description = options.description
    this.options = options.args
  }
}

module.exports = Command