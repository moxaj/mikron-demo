(ns mikron-demo.client
  (:require [clojure.pprint :as pprint]
            [mikron.runtime.core :as mikron]
            [mikron-demo.common :as common]
            [mikron-demo.websocket :as ws]))

(extend-type js/ArrayBuffer
  Object
  (toString [this]
    (str (js/Int8Array. this))))

(def ws-atom (atom nil))

(defn on-open []
  (println "Channel opened."))

(defn on-message [event]
  (let [value (mikron/unpack ::common/message (.-data event))]
    (println "Value received: ")
    (pprint/pprint value)
    (ws/send! @ws-atom (mikron/pack ::common/message value))))

(defn on-error [event]
  (println "Channel error: " (.-data event) "."))

(defn on-close []
  (println "Channel closed."))

(def websocket-callbacks
  {:on-open     on-open
   :on-message  on-message
   :on-error    on-error
   :on-close    on-close
   :binary-type "arraybuffer"})

(defn init-ws! []
  (reset! ws-atom (ws/open! (str "ws://" (.-host js/location))
                            websocket-callbacks)))

(defn init-app! []
  (enable-console-print!)
  (init-ws!))

(.addEventListener js/window "load" init-app!)
