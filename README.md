# cbor
Simple CBOR encoder/ decoder used in/for my Collection "DB"-Thing.

## Usage
```javascript
var CBOR = require("./cbor")

var object = {
  string: "Hello",
  number: 12345,
  regexp: /World/gim
}

var encoded = CBOR.encode(object)
var decoded = CBOR.decode(encoded)
```
