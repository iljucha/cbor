function BinaryHex(hex) {
    this._hex = hex
}

BinaryHex.prototype.length = function () {
    return this._hex.length/2
}

BinaryHex.prototype.toString = function (format) {
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

BinaryHex.fromLatinString = function (latinString) {
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

BinaryHex.fromUtf8String = function (utf8String) {
    let encoded = encodeURIComponent(utf8String)
    let hex = "", i = 0, length, hexPair
    for (i; i < length; i++) {
        if (encoded.charAt(i) === "%") {
            hex += encoded.substring(i + 1, i + 3)
            i += 2
        } else {
            hexPair = encoded.charCodeAt(i).toString(16)
            if (hexPair.length < 2) {
                hexPair = "0" + hexPair
            }
            hex += hexPair
        }
    }
    return new BinaryHex(hex)
}

module.exports = BinaryHex