(ns mikron-demo.client
  (:require [clojure.pprint :as pprint]
            [mikron.core :refer [pack unpack]]
            [mikron-demo.common]
            [mikron-demo.websocket :as ws]))

(def ws-atom (promise nil))

(defn on-open []
  (println "Channel opened."))

(defn on-message [event]
  (let [{:keys [value schema]} (unpack (.-data event))]
    (println "Value received: " schema)
    (pprint/pprint value)
    (ws/send! @ws-atom (pack schema value))))

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
  (deliver ws-atom (ws/open (str "ws://" (.-host js/location))
                            websocket-callbacks)))

(defn init-app! []
  (enable-console-print!)
  (init-ws!))

(.addEventListener js/window "load" init-app!)
