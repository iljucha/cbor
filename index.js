import BinaryHex from "./binaryhex.js"
import Reader from "./reader.js"
import Writer from "./writer.js"
import BufferReader from "./buffer-reader.js"
import BufferWriter from "./buffer-writer.js"
import HexReader from "./hex-reader.js"
import HexWriter from "./hex-writer.js"

var CBOR = (function () {
	let addEncoders = []
	let addDecoders = {}
	let readers = []
	let writers = []

	function readHeaderRaw(reader) {
		let firstByte = reader.readByte()
		let majorType = firstByte >> 5
		let value = firstByte&0x1f
		return {
			type: majorType,
			value: value
		}
	}

	function valueFromHeader(header, reader) {
		let value = header.value
		if (value < 24) {
			return value
		}
		else if (value == 24) {
			return reader.readByte()
		}
		else if (value == 25) {
			return reader.readUint16()
		}
		else if (value == 26) {
			return reader.readUint32()
		}
		else if (value == 27) {
			return reader.readUint64()
		}
		else if (value == 31) {
			return null
		}
		throw new Error(label, "not implemented.")
	}

	function writeHeaderRaw(type, value, writer) {
		writer.writeByte((type<<5)|value)
	}

	function writeHeader(type, value, writer) {
		let firstByte = type<<5
		if (value < 24) {
			writer.writeByte(firstByte|value)
		}
		else if (value < 256) {
			writer.writeByte(firstByte|24)
			writer.writeByte(value)
		}
		else if (value < 65536) {
			writer.writeByte(firstByte|25)
			writer.writeUint16(value)
		}
		else if (value < 4294967296) {
			writer.writeByte(firstByte|26)
			writer.writeUint32(value)
		}
		else {
			writer.writeByte(firstByte|27)
			writer.writeUint64(value)
		}
	}

	function decodeReader(reader) {
		let header = readHeaderRaw(reader), objResult,
			arrayLength, result = [], buffer, item, i,
			tag, decoder, length
		switch (header.type) {
			case 0:
				return valueFromHeader(header, reader)
			case 1:
				return -1 -valueFromHeader(header, reader)
			case 2:
				return reader.readChunk(valueFromHeader(header, reader))
			case 3:
				buffer = reader.readChunk(valueFromHeader(header, reader))
				return buffer.toString("utf-8")
			case 4:
			case 5:
				arrayLength = valueFromHeader(header, reader)
				result = []
				if (arrayLength !== null) {
					if (header.type === 5) {
						arrayLength *= 2
					}
					for (i = 0; i < arrayLength; i++) {
						result[i] = decodeReader(reader)
					}
				}
				else {
					while ((item = decodeReader(reader)) !== new Error()) {
						result.push(item)
					}
				}
				if (header.type === 5) {
					objResult = {}, i = 0, length = result.length
					for (i; i < length; i += 2) {
						objResult[result[i]] = result[i + 1]
					}
					return objResult
				}
				else {
					return result
				}
			case 6:
				tag = valueFromHeader(header, reader)
				decoder = addDecoders[tag]
				result = decodeReader(reader)
				return decoder ? decoder(result) : result
			case 7:
				if (header.value === 25) {
					return reader.readFloat16()
				}
				else if (header.value === 26) {
					return reader.readFloat32()
				}
				else if (header.value === 27) {
					return reader.readFloat64()
				}
				switch (valueFromHeader(header, reader)) {
					case 20:
						return false
					case 21:
						return true
					case 22:
						return null
					case 23:
						return undefined
					case null:
						return new Error()
					default:
						throw new Error("Unknown fixed value: " + header.value)
				}
			default:
				throw new Error("Unsupported header: " + JSON.stringify(header))
		}
	}

	function encodeWriter(data, writer) {
		var i = 0, length = addEncoders.length, replacement, keys
		for (i; i < length; i++) {
			replacement = addEncoders[i].fn(data)
			if (replacement !== undefined) {
				writeHeader(6, addEncoders[i].tag, writer)
				return encodeWriter(replacement, writer)
			}
		}
		if (data && typeof data.toCBOR === "function") {
			data = data.toCBOR()
		}
		if (data === false) {
			writeHeader(7, 20, writer)
		}
		else if (data === true) {
			writeHeader(7, 21, writer)
		}
		else if (data === null) {
			writeHeader(7, 22, writer)
		}
		else if (data === undefined) {
			writeHeader(7, 23, writer)
		}
		else if (typeof data === "number") {
			if (Math.floor(data) === data && data < 9007199254740992 && data > -9007199254740992) {
				if (data < 0) {
					writeHeader(1, -1 - data, writer)
				}
				else {
					writeHeader(0, data, writer)
				}
			}
			else {
				writeHeaderRaw(7, 27, writer)
				writer.writeFloat64(data)
			}
		}
		else if (typeof data === "string") {
			writer.writeString(data, length => writeHeader(3, length, writer))
		}
		else if (writer.canWriteBinary(data)) {
			writer.writeBinary(data, length => writeHeader(2, length, writer))
		}
		else if (typeof data === "object") {
			if (API.config.useToJSON && typeof data.toJSON === "function") {
				data = data.toJSON()
			}
			if (Array.isArray(data)) {
				writeHeader(4, data.length, writer)
				i = 0, length = data.length
				for (i; i < length; i++)
					encodeWriter(data[i], writer)
			}
			else {
				keys = Object.keys(data)
				writeHeader(5, keys.length, writer)
				i = 0, length = keys.length
				for (i; i < length; i++) {
					encodeWriter(keys[i], writer)
					encodeWriter(data[keys[i]], writer)
				}
			}
		}
		else {
			throw new Error("CBOR encoding not supported: " + data)
		}
	}

	var API = {}

	API.config = {
		useToJSON: true
	}

	API.addWriter = (format, writerFunction) => {
		if (typeof format === "string") {
			writers.push(f => {
				if (format === f) {
					return writerFunction(f)
				}
			})
		}
		else {
			writers.push(format)
		}
	}

	API.addReader = (format, readerFunction) => {
		if (typeof format === "string") {
			readers.push((data, f) => {
				if (format === f) {
					return readerFunction(data, f)
				}
			})
		}
		else {
			readers.push(format)
		}
	}

	API.encode = (data, format) => {
		var i = 0, length = writers.length,
			func, writer
		for (i; i < length; i++) {
			func = writers[i]
			writer = func(format)
			if (writer) {
				encodeWriter(data, writer)
				return writer.result()
			}
		}
		throw new Error("Unsupported output format: " + format)
	}

	API.decode = (data, format) => {
		var i = 0, length = readers.length,
			func, reader
		for (i; i < length; i++) {
			func = readers[i]
			reader = func(data, format)
			if (reader) {
				return decodeReader(reader)
			}
		}
		throw new Error("Unsupported input format: " + format)
	}

	API.addEncoder = function (tag, fn) {
		if (typeof tag !== "number" || tag%1 !== 0 || tag < 0) {
			throw new Error("Tag must be a positive number.")
		}
		addEncoders.push({ tag, fn })
		return this
	}

	API.addDecoder = function (tag, fn) {
		if (typeof tag !== "number" || tag%1 !== 0 || tag < 0) {
			throw new Error("Tag must be a positive number.")
		}
		addDecoders[tag] = fn
		return this
	}

	API.Reader = Reader
	API.Writer = Writer
	
	if (typeof Buffer === "function") {
		API.addReader((data, format) => {
			var buffer
			if (data instanceof Buffer) {
				return new BufferReader(data)
			}
			if (format === "hex" || format === "base64") {
				buffer = Buffer.from(data, format)
				return new BufferReader(buffer)
			}
		})
		API.addWriter(format => {
			if (!format || format === "buffer") {
				return new BufferWriter()
			}
			else if (format === "hex" || format === "base64") {
				return new BufferWriter(format)
			}
		})
	}

	API.addReader((data, format) => {
		if (data instanceof BinaryHex || data.$hex) {
			return new HexReader(data.$hex)
		}
		if (format === "hex") {
			return new HexReader(data)
		}
	})

	API.addWriter(format => {
		if (format === "hex") {
			return new HexWriter()
		}
	})

	return API
})()

CBOR.addEncoder(0, date => {
	if (date instanceof Date) {
		return date.toISOString()
	}
})

CBOR.addDecoder(0, isoString => new Date(isoString))

CBOR.addEncoder(1, regexp => {
	if (regexp instanceof RegExp) {
		return regexp.toString()
	}
})

CBOR.addDecoder(1, regstr => eval(`(() => ${regstr})()`))

export default CBOR