import { Reader } from "./reader.js"
import { BinaryHex } from "./binaryhex.js"

export function HexReader(hex) {
	this.hex = hex
	this.pos = 0
}

HexReader.prototype = Object.create(Reader.prototype)

HexReader.prototype.peekByte = function () {
	let pair = this.hex.substring(this.pos, 2)
	return parseInt(pair, 16)
}

HexReader.prototype.readByte = function () {
	let pair = this.hex.substring(this.pos, this.pos + 2)
	this.pos += 2
	return parseInt(pair, 16)
}

HexReader.prototype.readChunk = function (length) {
	let hex = this.hex.substring(this.pos, this.pos + length*2)
	this.pos += length*2
	if (typeof Buffer === "function") {
		return Buffer.from(hex, "hex")
	}
	return new BinaryHex(hex)
}