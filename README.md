# MarkDownStream [![build status](https://secure.travis-ci.org/agnoster/markdownstream.png)](http://travis-ci.org/agnoster/markdownstream)

Streaming markdown parser that will allows round-tripping and patching

Ever wanted to parse a markdown file, and *just* fix certain things? Like maybe extract all the code segments, or add numbering to the headers, or fix all the numberings of ordered lists?

Well, now you can.

...

Actually, right *now* you can't, because I'm still working on it.

## What you can do right now:

* Stream through a file
* Capture all code blocks, both in raw and parsed form

## Goals for 0.0.1:

* Read code blocks
* Round-trip a file, manipulating *only* the code blocks
* Expose a streaming API
* Read headers
