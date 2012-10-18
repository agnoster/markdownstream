var chunk = require('./chunk')

function lex(buffer, ctx, cb) {

    var found = true

    while (found) {

        found = false

        if (ctx.fcode) {

            buffer = buffer.replace(lex.code_fence, function(data, content) {

                found = true
                ctx.data += data
                cb(new chunk.code_block(ctx.data, { fenced: true, content: ctx.fcode.content, tags: ctx.fcode.tags }))

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

                cb(new chunk.code_block(ctx.data, { content: ctx.code.content }))
                if (ctx.code.blanks) {

                    cb(new chunk.plain(ctx.code.blanks.join(''), { blank: true }))
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

        buffer = buffer.replace(lex.heading, function(data, indent, content) {

            found = true
            cb(new chunk.heading(data, { content: content, level: indent.length }))
            return ''
        })
        if (found) continue

        buffer = buffer.replace(lex.other, function(data) {

            found = true
            cb(new chunk.plain(data))
            return ''
        })
        if (found) continue
    }

    return buffer
}

lex.flush = function(buffer, ctx, cb) {

    // process as much with the regular lexer as possible
    lex(buffer, ctx, cb)

    if (ctx.code) {

        console.log('flushing code')
        cb(new chunk.code_block(ctx.data, { content: ctx.code.content }))
        if (ctx.code.blanks) {

            cb(new chunk.plain(ctx.code.blanks.join(''), { blank: true }))
        }

    } else {

        if (buffer) cb(new chunk.plain(buffer))
    }

    return ''
}

lex.code_fence = /^```([^\n]*)\n/
lex.codeblock  = /^    ([^\n]*\n)/
lex.heading    = /^(\#{1,6})[ \t]+(.*?)\s*\#*\n/
lex.other      = /^.*\n/
lex.blankline  = /^[ \t]*\n/

module.exports = lex
