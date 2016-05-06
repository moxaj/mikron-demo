# mikron-demo

This is a simple demo project demonstrating the cross-platform usage of
[mikron](https://github.com/moxaj/mikron). Simply fire up the server, visit
`localhost:8080`, open the developer tab, and refresh the page.

Whenever a client connects, the server generates a `snapshot` and sends it to
the client. The client logs it to the browser console, and sends it back to the
server. Upon receiving the original message, the server prints it to the standard
output.

## License

Copyright © 2016 Viktor Magyari

Distributed under the Eclipse Public License either version 1.0.
