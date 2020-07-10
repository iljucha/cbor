import Reader from "./reader.js"
import BinaryHex from "./binaryhex.js"

export default class HexReader extends Reader{
	pos = 0
	hex

	constructor(hex) {
		super()
		this.hex = hex
	}

	peekByte() {
		let pair = this.hex.substring(this.pos, 2)
		return parseInt(pair, 16)
	}

	readByte() {
		let pair = this.hex.substring(this.pos, this.pos + 2)
		this.pos += 2
		return parseInt(pair, 16)
	}

	readChunk(length) {
		let hex = this.hex.substring(this.pos, this.pos + length * 2)
		this.pos += length * 2
		if (typeof Buffer === "function") {
			return Buffer.from(hex, "hex")
		}
		return new BinaryHex(hex)
	}
}