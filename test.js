var test = require('tap').test
  , MarkdownStream = require('./')
  , fs = require('fs')
  , fakeStream = require('./fakestream')
  , doc = fs.readFileSync('./README.md', 'utf8')

test("can round-trip a markdown document", function(t) {

    var parser = new MarkdownStream
      , input = new fakeStream.readable(doc, 10, 10)
      , output = new fakeStream.writable

    input.pipe(parser).pipe(output)

    output.on('end', function() {

        t.equal(output.output, doc)
        t.end()
    })

    input.resume()
})

test("can emit events for a code block", function(t) {

    var parser = new MarkdownStream
      , input = new fakeStream.readable(doc, 10, 10)
      , output = new fakeStream.writable
      , buffer = ''
      , code = ''

    input.pipe(parser)
    parser.on('data', function(data, metadata) {
        
        buffer += data
        if (metadata.token == 'codeblock') {
            code += data
        }
        if (metadata.token == 'fenced_code') {
            console.log(metadata, data)
        }
        output.write(data)
    })

    parser.on('end', function() {

        output.end()
        t.equal(buffer, doc, "Buffer should be unchanged")
        t.equal(output.output, doc, "Output should be unchanged")
        t.equal(code, "    var MarkdownStream = require('markdownstream')\n    parse = new MarkdownStream\n    ... more to come ...\n", "Should get the code")
        t.end()
    })

    input.resume()
})
