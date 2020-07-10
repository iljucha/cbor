import Reader from "./reader.js"

export default class BufferReader extends Reader {
    buffer
    pos = 0

    constructor(buffer) {
        super()
        this.buffer = buffer
    }

    peekByte() {
        return this.buffer[this.pos]
    }

    readByte() {
        return this.buffer[this.pos++]
    }

    readUint16() {
        let result = this.buffer.readUInt16BE(this.pos)
        this.pos += 2
        return result
    }

    readUint32() {
        let result = this.buffer.readUInt32BE(this.pos)
        this.pos += 4
        return result
    }

    readFloat32() {
        let result = this.buffer.readFloatBE(this.pos)
        this.pos += 4
        return result
    }

    readFloat64() {
        let result = this.buffer.readDoubleBE(this.pos)
        this.pos += 8
        return result
    }

    readChunk(length) {
        let result = Buffer.alloc(length)
        this.buffer.copy(result, 0, this.pos, this.pos += length)
        return result
    }
}