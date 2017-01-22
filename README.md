# mikron.demo

This is a simple demo project demonstrating the cross-platform usage of [mikron](https://github.com/moxaj/mikron).

Instructions:

1. `lein do clean, cljsbuild once, run -m mikron-demo.server`
2. visit `localhost:8080`

What happens:

1. the **client**, upon loading, opens a websocket connection to the **server**
2. the **server** generates a message, packs it, and sends it to the **client**
3. the **client** unpacks the received message, prints it, packs it, and sends it back to the **server**
4. the **server** unpacks the received message and compares it to the original

## License

Copyright © 2016 Viktor Magyari

Distributed under the Eclipse Public License either version 1.0.
