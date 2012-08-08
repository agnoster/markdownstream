var Stream = require('stream')

// new
function MarkdownStream(options) {

    var ctx = {}
    this.writable = true
    this.buffer = ''
}

MarkdownStream.prototype = new Stream

MarkdownStream.prototype.processData = function(data) {
    
    this.emit('data', data)
    this.buffer += data
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
