export default class Reader {
    readFloat16() {
        let hlf = this.readUint16()
        let exp = (hlf & 0x7fff) >> 10
        let man = hlf & 0x3ff
        let neg = hlf & 0x8000
        if (exp === 0x1f) {
            if (man === 0) {
                return neg ? -Infinity : Infinity
            }
            return NaN
        }
        let mag = exp ? Math.pow(2, exp - 25) * (1024 + man) : Math.pow(2, -24) * man
        return neg ? -mag : mag
    }

    readFloat32() {
        let num = this.readUint32()
        let exp = (num & 0x7fffffff) >> 23
        let man = num & 0x7fffff
        let neg = num & 0x80000000
        if (exp === 0xff) {
            if (man === 0) {
                return neg ? -Infinity : Infinity
            }
            return NaN
        }
        let mag = exp ? Math.pow(2, exp - 23 - 127) * (8388608 + man) : Math.pow(2, -23 - 126) * man
        return neg ? -mag : mag
    }

    readFloat64() {
        let int1 = this.readUint32(), int2 = this.readUint32()
        let exp = (int1 >> 20) & 0x7ff
        let man = (int1 & 0xfffff) * 4294967296 + int2
        let neg = int1 & 0x80000000
        if (exp === 0x7ff) {
            if (man === 0) {
                return neg ? -Infinity : Infinity
            }
            return NaN
        }
        let mag = exp ? Math.pow(2, exp - 52 - 1023) * (4503599627370496 + man) : Math.pow(2, -52 - 1022) * man
        return neg ? -mag : mag
    }

    readUint16() {
        return this.readByte() * 256 + this.readByte()
    }

    readUint32() {
        return this.readUint16() * 65536 + this.readUint16()
    }

    readUint64() {
        return this.readUint32() * 4294967296 + this.readUint32()
    }
}