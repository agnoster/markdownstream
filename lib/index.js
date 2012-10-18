var stream = require('stream')
  , Lexer = require('./lexer')

function MarkdownStream(options) {

    this.writable = true
    this.buffer = ''
    this.lexer = new Lexer

    this.emitter = (function(self) {
        return function(data) { self.emit('data', data) }
    })(this)
}

MarkdownStream.prototype = new stream()

MarkdownStream.prototype.processData = function(data) {

    this.buffer += data
    this.buffer = this.lexer.lex(this.buffer, this.emitter)

    return true
}

MarkdownStream.prototype.end = function(data) {

    if (data) this.processData(data)
    this.lexer.flush(this.buffer, this.emitter)
    this.emit('end')
}

MarkdownStream.prototype.write = function(data) {

    return this.processData(data)
}

MarkdownStream.sync = function(doc) {

    var m = new MarkdownStream()
      , chunks = []

    m.on('data', function(c) { chunks.push(c) })
    m.write(doc)
    m.end()

    return chunks
}

module.exports = MarkdownStream
