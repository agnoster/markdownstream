var stream = require('stream')

function lex(buffer, ctx, cb) {

    var found = true

    while (found) {

        found = false

        if (ctx.fcode) {

            buffer = buffer.replace(lex.code_fence, function(data, content) {

                found = true
                ctx.data += data
                cb(ctx.data, { token: "code_block", fenced: true, content: ctx.fcode.content, tags: ctx.fcode.tags })

                ctx.fcode = null

                return ''
            })
            if (found) continue

            buffer = buffer.replace(lex.other, function(data) {

                found = true
                ctx.fcode.content += data
                ctx.data += data
                return ''
            })
            continue;
        }

        if (ctx.code) {
                
            buffer = buffer.replace(lex.codeblock, function(data, content) {
                
                if (ctx.code.blanks.length > 0) {
                    
                    ctx.code.content += Array(ctx.code.blanks.length + 1).join("\n")
                    ctx.data += ctx.code.blanks.join('')
                    ctx.code.blanks = []
                }

                found = true
                ctx.code.content += content
                ctx.data += data
                return ''
            })
            if (found) continue

            buffer = buffer.replace(lex.blankline, function(data, content) {
                
                found = true
                ctx.code.blanks.push(data)
                return ''
            })
            if (found) continue

            if (buffer.match(/\n/)) { // not code!

                cb(ctx.data, { token: "code_block", content: ctx.code.content })
                if (ctx.code.blanks) {
                    
                    cb(ctx.code.blanks.join(''), { token: "blank" })
                }

                ctx.data = ''
                ctx.code = null
            } else {

                continue;
            }
        }

        buffer = buffer.replace(lex.codeblock, function(data, content) {

            found = true
            ctx.data = data
            ctx.code = { content: content, blanks: [] }
            return ''
        })
        if (found) continue

        buffer = buffer.replace(lex.code_fence, function(data, content) {

            found = true
            ctx.fcode = { content: '', tags: content }
            ctx.data = data
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
lex.blankline = /^[ \t]*\n/

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
