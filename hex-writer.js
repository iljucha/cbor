var Writer = require("./writer")
var BinaryHex = require("./binaryhex")

function HexWriter(finalFormat) {
    this._hex = ""
    this.finalFormat = finalFormat || "hex"
}

HexWriter.prototype = Object.create(Writer.prototype)

HexWriter.prototype.writeByte = function (value) {
    if (value < 0 || value > 255) {
        throw new Error("Byte value out of range: " + value)
    }
    let hex = value.toString(16)
    if (hex.length == 1) {
        hex = "0" + hex
    }
    this._hex += hex
}

HexWriter.prototype.canWriteBinary = function (chunk) {
    return chunk instanceof BinaryHex || (typeof Buffer === "function" && chunk instanceof Buffer)
}

HexWriter.prototype.writeBinary = function (chunk, lengthFunction) {
    if (chunk instanceof BinaryHex) {
        lengthFunction(chunk.length())
        this._hex += chunk._hex
    } else if (typeof Buffer === "function" && chunk instanceof Buffer) {
        lengthFunction(chunk.length)
        this._hex += chunk.toString("hex")
    } else {
        throw new TypeError("HexWriter only accepts BinaryHex or Buffers")
    }
}

HexWriter.prototype.result = function () {
    if (this.finalFormat === "buffer" && typeof Buffer === "function") {
        return Buffer.from(this._hex, "hex")
    }
    return new BinaryHex(this._hex).toString(this.finalFormat)
}

HexWriter.prototype.writeString = function (string, lengthFunction) {
    let buffer = BinaryHex.fromUtf8String(string)
    lengthFunction(buffer.length())
    this._hex += buffer._hex
}

module.exports = HexWriter