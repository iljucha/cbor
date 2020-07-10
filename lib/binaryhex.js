export default class BinaryHex {
    _hex

    constructor(hex) {
        this._hex = hex
    }

    length() {
        return this._hex.length / 2
    }

    toString(format) {
        if (!format || format === "hex" || format === 16) {
            return this._hex
        }
        if (format === "utf-8") {
            let encoded = ""
            let i = 0, length = this._hex.length
            for (i; i < length; i += 2) {
                encoded += "%" + this._hex.substring(i, i + 2)
            }
            return decodeURIComponent(encoded)
        }
        if (format === "latin") {
            let encoded = []
            let i = 0, length = this._hex.length
            for (i; i < length; i += 2) {
                encoded.push(parseInt(this._hex.substring(i, i + 2), 16))
            }
            return String.fromCharCode.apply(String, encoded)
        }
        throw new Error("Unrecognised format: " + format)
    }

    static fromLatinString(latinString) {
        let hex = "", pair
        let i = 0, latinStringLength = latinString.length
        for (i; i < latinStringLength; i++) {
            pair = latinString.charCodeAt(i).toString(16)
            if (pair.length === 1) {
                pair = "0" + pair
            }
            hex += pair
        }
        return new BinaryHex(hex)
    }

    static fromUtf8String(utf8String) {
        let encoded = encodeURIComponent(utf8String)
        let hex = "", i = 0, length, hexPair
        for (i; i < length; i++) {
            if (encoded.charAt(i) === "%") {
                hex += encoded.substring(i + 1, i + 3)
                i += 2
            }
            else {
                hexPair = encoded.charCodeAt(i).toString(16)
                if (hexPair.length < 2) {
                    hexPair = "0" + hexPair
                }
                hex += hexPair
            }
        }
        return new BinaryHex(hex)
    }
}
