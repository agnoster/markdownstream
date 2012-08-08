var stream = require('stream')

function FakeReadableStream(buffer, chunkSize, interval) {

    this.buffer = buffer
    this.chunkSize = chunkSize
    this.interval = interval
}

FakeReadableStream.prototype = new stream

FakeReadableStream.prototype.pause = function() {

    if (this.timer) clearTimeout(this.timer)
}

FakeReadableStream.prototype.ping = function() {

    var data = this.buffer.substr(0, this.chunkSize)
    if (!data) return this.emit('end')

    this.emit('data', data)
    this.buffer = this.buffer.substr(this.chunkSize)

    this.timer = setTimeout(this.ping.bind(this), this.interval)
}

FakeReadableStream.prototype.resume = function() {

    this.ping()
}


function FakeWritableStream(options) {

    this.writable = true
    this.output = ''
}

FakeWritableStream.prototype = new stream

FakeWritableStream.prototype.end = function(data) {

    if (data) this.output += data
    this.emit('end')
}

FakeWritableStream.prototype.write = function(data) {

    this.output += data
    return true
}

module.exports = { readable: FakeReadableStream, writable: FakeWritableStream }
