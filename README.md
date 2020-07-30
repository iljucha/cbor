# CBOR
Simple extendable BOR encoder/ decoder.

## Supported types
* Booleans
* Strings
* Numbers (js floats)
* Array Buffer
* JSON Objects
* null
* undefined
* RegExp
* Arrays
* Map
* Set
* BigInt

## Usage
```javascript
import CBOR from "@iljucha/cbor"

var object = {
  string: "Hello",
  number: 12345,
  regexp: /World/gim,
  arr: ["string", 100, BigInt(10), /regtest/i],
  bigint: BigInt(420),
  set: new Set(["test", 3531]),
  map: new Map([["key1", 599], ["key2", "value"]])
}

var encoded = CBOR.encode(object)
var decoded = CBOR.decode(encoded)

CBOR.addEncoder(5, value => {
	// check what you want to encode + your encoder
})
CBOR.addDecoder(5, value => /** your decoder */)
```
