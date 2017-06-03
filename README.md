# mikron.demo

This is a simple demo project demonstrating the cross-platform usage of [mikron](https://github.com/moxaj/mikron).

To run:

1. Install [boot](https://github.com/boot-clj/boot) if you don't already have it
2. Run `boot run`
3. Visit `localhost:8080`, and open the developer console

To connect to the cljs repl:
1. Run `boot repl -c`
2. Inside the repl, enter `(boot-cljs-repl/start-repl)`

What happens:

1. the **client**, upon loading, opens a websocket connection to the **server**
2. the **server** generates a message, packs it, and sends it to the **client**
3. the **client** unpacks the received message, prints it, packs it, and sends it back to the **server**
4. the **server** unpacks the received message and compares it to the original

## License

Copyright © 2017 Viktor Magyari

Distributed under the Eclipse Public License either version 1.0.
