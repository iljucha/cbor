# cbor
Simple CBOR encoder/ decoder used in/for my Collection "DB"-Thing.

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

## Usage
```javascript
import CBOR = from "./cbor/index.js"

var object = {
  string: "Hello",
  number: 12345,
  regexp: /World/gim
}

var encoded = CBOR.encode(object)
var decoded = CBOR.decode(encoded)
```
