var stream = require('stream')
  , Lexer = require('./lexer')
  , debug = require('debug')('markdownstream')

function MarkdownStream(options) {

    this.writable = true
    this.buffer = ''

    this.emitter = this.emitter.bind(this)
    this.lexer = new Lexer(this.emitter)
}

MarkdownStream.prototype = new stream()

MarkdownStream.prototype.emitter = function emitter(data) {
  this.emit('data', data)
}

MarkdownStream.prototype.processData = function(data) {

    this.buffer += data
    this.buffer = this.lexer.lex(this.buffer)

    return true
}

MarkdownStream.prototype.end = function(data) {

    if (data) this.processData(data)
    this.lexer.flush(this.buffer)
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
