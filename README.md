# Markdownstream

Streaming markdown parser that allows round-tripping and patching

Ever wanted to parse a markdown file, and *just* fix certain things? Like maybe extract all the code segments, or add numbering to the headers, or fix all the numberings of ordered lists?

Well, now you can.

    var MarkdownStream = require('markdownstream')
    parse = new MarkdownStream
    ... more to come ...

...

Actually, right *now* you can't, because I'm still working on it.

## Goals for 0.1:

* Read code blocks
* Round-trip a file, manipulating *only* the code blocks
* Expose a streaming API
* Read headers
