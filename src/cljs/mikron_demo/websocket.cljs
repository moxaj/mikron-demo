(ns mikron-demo.websocket)

(def field-map {:on-message  "onmessage"
                :on-open     "onopen"
                :on-error    "onerror"
                :on-close    "onclose"
                :binary-type "binaryType"})

(defn open! [url args]
  (let [websocket (js/WebSocket. url)]
    (doseq [[field value] args]
      (when-let [js-field (field-map field)]
        (aset websocket js-field value)))
    websocket))

(defn open? [websocket]
  (and websocket (= 1 (.-readyState websocket))))

(defn send! [websocket message]
  (when (open? websocket)
    (.send websocket message)
    true))
