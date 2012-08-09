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
      , headings = []

    input.pipe(parser)
    parser.on('data', function(chunk) {
        
        buffer += chunk

        if (chunk.type == 'code_block') {
            if (chunk.fenced)
                fcode.push(chunk.toString())
            else
                code.push(chunk.toString())

            codeparsed.push(chunk.content)
        }

        if (chunk.type == 'heading') {
            
            headings.push(chunk.content)
        }

        output.write(chunk)
    })

    parser.on('end', function() {

        output.end()
        t.equal(buffer, doc, "Buffer should be unchanged")
        t.equal(output.output, doc, "Output should be unchanged")
        t.deepEqual(code, ["    IC1\n    IC1\n\n    IC1\n", "    \n    IC2\n    \n"])
        t.deepEqual(fcode, ["```\nFC1\n\nFC1\n\n```\n", "```foo\nFC2\nFC2\n\n    FC2\n```\n"])
        t.deepEqual(codeparsed, ["IC1\nIC1\n\nIC1\n", "\nIC2\n\n", "FC1\n\nFC1\n\n", "FC2\nFC2\n\n    FC2\n"])
        t.deepEqual(headings, ["H11", "H21", "H12"])
        t.end()
    })

    input.resume()
})

test("can re-write code blocks", function(t) {

    var parser = new MarkdownStream
      , output = ''

    parser.on('data', function(chunk) {

        if (chunk.type == 'code_block') {
            
            chunk.tags = 'foo'
            chunk.refresh()
        }
        output += chunk.toString()
    })

    parser.on('end', function() {

        t.equal(output, "# Hello\n\n```foo\nfoobar\ntest\n```\n\nThat's that!\n")
        t.end()
    })
    
    parser.write("# Hello\n\n    foobar\n    test\n\nThat's that!\n")
    parser.end()
})

test("can operate synchronously", function(t) {

    var output = MarkdownStream.sync(doc)

    t.equal(output.join(''), doc)
    t.end()
})
