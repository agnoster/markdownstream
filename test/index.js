var test = require('tap').test
  , MarkdownStream = require('../lib/')
  , fs = require('fs')
  , fakeStream = require('./fakestream')
  , doc = fs.readFileSync('./test/test1.md', 'utf8')

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
      , code = []
      , codeparsed = []
      , fcode = []

    input.pipe(parser)
    parser.on('data', function(data, metadata) {
        
        buffer += data
        if (metadata.token == 'code_block' && !metadata.fenced) {
            code.push(data)
            codeparsed.push(metadata.content)
        }
        if (metadata.token == 'code_block' && metadata.fenced) {
            fcode.push(metadata)
        }
        output.write(data)
    })

    parser.on('end', function() {

        output.end()
        t.equal(buffer, doc, "Buffer should be unchanged")
        t.equal(output.output, doc, "Output should be unchanged")
        t.deepEqual(code, ["    IC1\n    IC1\n\n    IC1\n", "    \n    IC2\n    \n"])
        t.deepEqual(codeparsed, ["IC1\nIC1\n\nIC1\n", "\nIC2\n\n"])
        t.deepEqual(fcode, [{ token: 'code_block', content: 'FC1\n\nFC1\n\n', tags: '', fenced: true }
                       ,{ token: 'code_block', content: 'FC2\nFC2\n\n    FC2\n', tags: 'foo', fenced: true }])
        t.end()
    })

    input.resume()
})
