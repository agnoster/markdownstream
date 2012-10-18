var chunk = require('./chunk')
  , debug = require('debug')('markdownstream:lexer')

function Lexer(cb) {
  this.ctx = {}
  this.line = 0
  this.cb = cb
}

Lexer.prototype = {}

Lexer.prototype.flush = function(buffer) {

  // process as much with the regular lexer as possible
  this.lex(buffer, this.cb)

  if (this.ctx.code) {

    this.cb(new chunk.code_block(this.ctx.data, { content: this.ctx.code.content }))
    if (this.ctx.code.blanks) {

      this.cb(new chunk.plain(this.ctx.code.blanks.join(''), { blank: true }))
    }

  } else {

    if (buffer) this.emit('plain', buffer)
  }

  return ''
}

Lexer.prototype.emit = function(type, data, metadata) {
  this.cb(new chunk[type](data, metadata))
}

Lexer.prototype.lex = function(buffer) {
    var found = true
      , ctx = this.ctx
      , cb = this.cb

    while (found) {

        found = false

        if (ctx.fcode) {

            buffer = buffer.replace(pattern.code_fence, function(data, content) {

                found = true
                ctx.data += data
                cb(new chunk.code_block(ctx.data, {
                  fenced: true,
                  content: ctx.fcode.content,
                  tags: ctx.fcode.tags
                }))

                ctx.fcode = null

                return ''
            })
            if (found) continue

            buffer = buffer.replace(pattern.other, function(data) {

                found = true
                ctx.fcode.content += data
                ctx.data += data
                return ''
            })
            continue;
        }

        if (ctx.code) {

            buffer = buffer.replace(pattern.codeblock, function(data, content) {

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

            buffer = buffer.replace(pattern.blankline, function(data, content) {

                found = true
                ctx.code.blanks.push(data)
                return ''
            })
            if (found) continue

            if (buffer.match(/\n/)) { // not code!

                cb(new chunk.code_block(ctx.data, {
                  content: ctx.code.content
                }))
                if (ctx.code.blanks) {

                    cb(new chunk.plain(ctx.code.blanks.join(''), {
                      blank: true
                    }))
                }

                ctx.data = ''
                ctx.code = null
            } else {

                continue;
            }
        }

        buffer = buffer.replace(pattern.codeblock, function(data, content) {

            found = true
            ctx.data = data
            ctx.code = { content: content, blanks: [] }
            return ''
        })
        if (found) continue

        buffer = buffer.replace(pattern.code_fence, function(data, content) {

            found = true
            ctx.fcode = { content: '', tags: content }
            ctx.data = data
            return ''
        })
        if (found) continue

        buffer = buffer.replace(pattern.heading, function(data, indent, content) {

            found = true
            cb(new chunk.heading(data, { content: content, level: indent.length }))
            return ''
        })
        if (found) continue

        buffer = buffer.replace(pattern.other, function(data) {

            found = true
            cb(new chunk.plain(data))
            return ''
        })
        if (found) continue
    }

    return buffer
}

var pattern = {}
pattern.code_fence = /^```([^\n]*)\n/
pattern.codeblock  = /^ {4}([^\n]*\n)/
pattern.heading    = /^(\#{1,6})[ \t]+(.*?)\s*\#*\n/
pattern.other      = /^.*\n/
pattern.blankline  = /^[ \t]*\n/

module.exports = Lexer
