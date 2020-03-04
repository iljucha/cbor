var Reader = require("./reader")

function BufferReader(buffer) {
    this.buffer = buffer
    this.pos = 0
}

BufferReader.prototype = Object.create(Reader.prototype)

BufferReader.prototype.peekByte = function () {
    return this.buffer[this.pos]
}

BufferReader.prototype.readByte = function () {
    return this.buffer[this.pos++]
}

BufferReader.prototype.readUint16 = function () {
    let result = this.buffer.readUInt16BE(this.pos)
    this.pos += 2
    return result
}

BufferReader.prototype.readUint32 = function () {
    let result = this.buffer.readUInt32BE(this.pos)
    this.pos += 4
    return result
}

BufferReader.prototype.readFloat32 = function () {
    let result = this.buffer.readFloatBE(this.pos)
    this.pos += 4
    return result
}

BufferReader.prototype.readFloat64 = function () {
    let result = this.buffer.readDoubleBE(this.pos)
    this.pos += 8
    return result
}

BufferReader.prototype.readChunk = function (length) {
    let result = Buffer.alloc(length)
    this.buffer.copy(result, 0, this.pos, this.pos += length)
    return result
}

module.exports = BufferReader