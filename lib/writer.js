export default class Writer {
    canWriteBinary(chunk) {
        return false
    }

    writeUint16(value) {
        this.writeByte((value >> 8) & 0xff)
        this.writeByte(value & 0xff)
        return
    }

    writeUint32(value) {
        this.writeUint16((value >> 16) & 0xffff)
        this.writeUint16(value & 0xffff)
    }
    
    writeUint64(value) {
        if (value >= 9007199254740992 || value <= -9007199254740992) {
            throw new Error("Cannot encode Uint64 of:" + value + "magnitude to big (floating point errors)")
        }
        this.writeUint32(Math.floor(value / 4294967296))
        this.writeUint32(value % 4294967296)
    }
}