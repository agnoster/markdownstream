var stream = require('stream')

function lex(buffer, ctx, cb) {

    var found = true

    while (found) {

        found = false

        if (ctx.fenced_code) {

            buffer = buffer.replace(lex.code_fence, function(data, content) {

                found = true
                ctx.data += data
                cb(ctx.data, { token: "fenced_code", content: ctx.content })

                ctx.fenced_code = null
                ctx.data = null
                ctx.content = null

                return ''
            })
            if (found) continue

            buffer = buffer.replace(lex.other, function(data) {

                found = true
                ctx.content += data
                ctx.data += data
                return ''
            })
            continue;
        }

        buffer = buffer.replace(lex.codeblock, function(data, content) {

            found = true
            cb(data, { token: "codeblock", content: content })
            return ''
        })
        if (found) continue

        buffer = buffer.replace(lex.code_fence, function(data, content) {

            found = true
            ctx.fenced_code = true
            ctx.content = ''
            ctx.data = data
            ctx.code_tags = content
            return ''
        })
        if (found) continue

        buffer = buffer.replace(lex.other, function(data) {

            found = true
            cb(data, { token: "raw" })
            return ''
        })
        if (found) continue
    }

    return buffer
}

lex.code_fence = /^```([^\n]*)\n/
lex.codeblock = /^    ([^\n]*\n)/
lex.other = /^.*\n/

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
