var stream = require('stream')
  , lex = require('./lex')

function MarkdownStream(options) {

    this.ctx = {}
    this.writable = true
    this.buffer = ''

    this.emitter = (function(self) {
        return function(data, metadata) { self.emit('data', data, metadata) }
    })(this)
}

MarkdownStream.prototype = new stream

MarkdownStream.prototype.processData = function(data) {
    
    this.buffer += data
    this.buffer = lex(this.buffer, this.ctx, this.emitter)

    return true
}

MarkdownStream.prototype.end = function(data) {

    if (data) this.processData(data)
    this.emit('end')
}

MarkdownStream.prototype.write = function(data) {

    return this.processData(data)
}

module.exports = MarkdownStream
