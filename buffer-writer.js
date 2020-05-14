import Writer from "./writer.js"

export default class BufferWriter extends Writer {
    constructor(stringFormat) {
        super()
        this.byteLength = 0
        this.defaultBufferLength = 16384
        this.latestBuffer = Buffer.alloc(this.defaultBufferLength)
        this.latestBufferOffset = 0
        this.completeBuffers = []
        this.stringFormat = stringFormat
    }

    writeByte(value) {
        this.latestBuffer[this.latestBufferOffset++] = value
        if (this.latestBufferOffset >= this.latestBuffer.length) {
            this.completeBuffers.push(this.latestBuffer)
            this.latestBuffer = Buffer.alloc(this.defaultBufferLength)
            this.latestBufferOffset = 0
        }
        this.byteLength++
    }

    writeFloat32(value) {
        let buffer = Buffer.alloc(4)
        buffer.writeFloatBE(value, 0)
        this.writeBuffer(buffer)
    }

    writeFloat64(value) {
        let buffer = Buffer.alloc(8)
        buffer.writeDoubleBE(value, 0)
        this.writeBuffer(buffer)
    }

    writeString(string, lengthFunc) {
        let buffer = Buffer.from(string, "utf-8")
        lengthFunc(buffer.length)
        this.writeBuffer(buffer)
    }

    canWriteBinary(data) {
        return data instanceof Buffer
    }

    writeBinary(buffer, lengthFunc) {
        lengthFunc(buffer.length)
        this.writeBuffer(buffer)
    }

    writeBuffer(chunk) {
        if (!(chunk instanceof Buffer)) {
            throw new TypeError("BufferWriter only accepts Buffers")
        }
        if (!this.latestBufferOffset) {
            this.completeBuffers.push(chunk)
        }
        else if (this.latestBuffer.length - this.latestBufferOffset >= chunk.length) {
            chunk.copy(this.latestBuffer, this.latestBufferOffset)
            this.latestBufferOffset += chunk.length
            if (this.latestBufferOffset >= this.latestBuffer.length) {
                this.completeBuffers.push(this.latestBuffer)
                this.latestBuffer = Buffer.alloc(this.defaultBufferLength)
                this.latestBufferOffset = 0
            }
        }
        else {
            this.completeBuffers.push(this.latestBuffer.slice(0, this.latestBufferOffset))
            this.completeBuffers.push(chunk)
            this.latestBuffer = Buffer.alloc(this.defaultBufferLength)
            this.latestBufferOffset = 0
        }
        this.byteLength += chunk.length
    }

    result() {
        let result = Buffer.alloc(this.byteLength)
        let offset = 0, buffer
        let i = 0, length = this.completeBuffers.length
        for (i; i < length; i++) {
            buffer = this.completeBuffers[i]
            buffer.copy(result, offset, 0, buffer.length)
            offset += buffer.length
        }
        if (this.latestBufferOffset) {
            this.latestBuffer.copy(result, offset, 0, this.latestBufferOffset)
        }
        if (this.stringFormat) {
            return result.toString(this.stringFormat)
        }
        return result
    }
}