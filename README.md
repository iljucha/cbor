# cbor
Simple CBOR encoder/ decoder used in/for my Collection "DB"-Thing.

Simple usage:

var object = {
  string: "Hello",
  number: 12345,
  regexp: /World/gim
}

var encoded = CBOR.encode(object)
var decoded = CBOR.decode(encoded)
