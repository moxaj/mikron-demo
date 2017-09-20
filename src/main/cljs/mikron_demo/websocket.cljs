(ns mikron-demo.websocket)

(def field-map
  "Websocket callback name mapping."
  {:on-message  "onmessage"
   :on-open     "onopen"
   :on-error    "onerror"
   :on-close    "onclose"
   :binary-type "binaryType"})

(defn open!
  "Opens a websocket connection."
  [url args]
  (let [websocket (js/WebSocket. url)]
    (doseq [[field value] args]
      (when-let [js-field (field-map field)]
        (aset websocket js-field value)))
    websocket))

(defn open?
  "Returns `true` if the given websocket connection is open, `false` otherwise."
  [websocket]
  (and websocket (= 1 (.-readyState websocket))))

(defn send!
  "Sends a message through the websocket connection."
  [websocket message]
  (when (open? websocket)
    (.send websocket message)
    true))
