import Writer from "./writer.js"
import BinaryHex from "./binaryhex.js"

export default class HexWriter extends Writer {
    hex = ""
    finalFormat

    constructor(finalFormat) {
        super()
        this.finalFormat = finalFormat || "hex"
    }

    writeByte(value) {
        if (value < 0 || value > 255) {
            throw new Error("Byte value out of range: " + value)
        }
        let hex = value.toString(16)
        if (hex.length == 1) {
            hex = "0" + hex
        }
        this._hex += hex
    }

    canWriteBinary(chunk) {
        return chunk instanceof BinaryHex || (typeof Buffer === "function" && chunk instanceof Buffer)
    }

    writeBinary(chunk, lengthFunction) {
        if (chunk instanceof BinaryHex) {
            lengthFunction(chunk.length())
            this._hex += chunk._hex
        }
        else if (typeof Buffer === "function" && chunk instanceof Buffer) {
            lengthFunction(chunk.length)
            this._hex += chunk.toString("hex")
        }
        else {
            throw new TypeError("HexWriter only accepts BinaryHex or Buffers")
        }
    }

    result() {
        if (this.finalFormat === "buffer" && typeof Buffer === "function") {
            return Buffer.from(this._hex, "hex")
        }
        return new BinaryHex(this._hex).toString(this.finalFormat)
    }

    writeString(string, lengthFunction) {
        let buffer = BinaryHex.fromUtf8String(string)
        lengthFunction(buffer.length())
        this._hex += buffer._hex
    }
}