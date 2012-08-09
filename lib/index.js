var stream = require('stream')
  , lex = require('./lex')

function MarkdownStream(options) {

    this.ctx = {}
    this.writable = true
    this.buffer = ''

    this.emitter = (function(self) {
        return function(data) { self.emit('data', data) }
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

MarkdownStream.sync = function(doc) {

    var m = new MarkdownStream
      , chunks = []

    m.on('data', function(c) { chunks.push(c) })
    m.write(doc)

    return chunks
}

module.exports = MarkdownStream
