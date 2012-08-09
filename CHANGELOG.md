# Changelog

## 0.0.2

* Added heading detection
* New synchronous API for when a stream is overkill, and you just want an array of tokens

## 0.0.1

* Pass-through of files as a read-write stream
* Detecting code blocks, both indented and fenced, plus fence tags
* Re-rendering code blocks (switching indent/fenced modes, changing content, changing tags)
* Testing with fakeStreams, node-tap, and on travis-ci for node 0.6 and 0.8
