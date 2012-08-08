var test = require('tap').test
  , MarkdownStream = require('./')
  , fs = require('fs')
  , fakeStream = require('./fakestream')
  , doc = fs.readFileSync('./README.md', 'utf8')

test("can round-trip a markdown document", function(t) {

    var parser = new MarkdownStream()
      , input = new fakeStream.readable(doc, 10, 10)
      , output = new fakeStream.writable()

    input.pipe(parser).pipe(output)
    input.resume()

    input.on('end', function(){

        t.equal(doc, output.output)
        t.end()
    })
})
