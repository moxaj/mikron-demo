(ns seria-demo.websocket)

(def field-map {:on-message  "onmessage"
                :on-open     "onopen"
                :on-error    "onerror"
                :on-close    "onclose"
                :binary-type "binaryType"})

(defn open [url args]
  (let [websocket (js/WebSocket. url)]
    (run! (fn [[field value]]
            (when-let [js-field (field-map field)]
              (aset websocket js-field value)))
          args)
    websocket))

(defn open? [websocket]
  (and websocket (= 1 (.-readyState websocket))))

(defn send! [websocket message]
  (if (open? websocket)
    (do (.send websocket message)
        true)
    false))
