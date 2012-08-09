// 
// Base Chunk type that others inherit from
//
function Chunk(data, metadata) {
    this.data = data || ''
    this.original = this.data

    for (var i in metadata)
        if (metadata.hasOwnProperty(i) && !this.hasOwnProperty(i))
            this[i] = metadata[i]
}

Chunk.prototype = new Buffer('', 'utf8')

Chunk.prototype.toString = function() {
    return this.data
}

// Override this to change how a chunk should be rendered
Chunk.prototype.render = function() {
    return this.data
}

// Re-render the current string representation
Chunk.prototype.refresh = function() {
    this.data = this.render()
}


//
// Code Chunk
//
function CodeBlock() {
    // super
    Chunk.apply(this, arguments)
    this.type = 'code_block'
}

CodeBlock.prototype = new Chunk

CodeBlock.prototype.render = function() {
    if (this.fenced || this.tags) {
        return "```" + (this.tags || '') + "\n" + this.content + "```\n"
    } else {
        var output = this.content.split(/\n/).join("\n    ")
        output = "    " + output.replace(/    $/, '')
        return output
    }
}


//
// Heading Chunk
//
function Heading() {
    // super
    Chunk.apply(this, arguments)
    this.type = 'heading'
}

Heading.prototype = new Chunk

Heading.prototype.render = function() {
    return Array(this.level + 1).join("#") + " " + this.content
}

module.exports = { plain: Chunk, code_block: CodeBlock, heading: Heading }
