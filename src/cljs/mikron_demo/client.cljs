(ns mikron-demo.client
  (:require [mikron-demo.websocket :as ws]
            [mikron-demo.common :as common]
            [cljs.pprint :as pprint]))

(def ws-atom (atom nil))

(defn on-open []
  (println "Channel opened."))

(defn on-message [event]
  (let [{:keys [value schema]} (common/unpack (.-data event))]
    (println "Value received: " schema)
    (pprint/pprint value)
    (ws/send! @ws-atom (common/pack schema value))))

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
  (reset! ws-atom (ws/open (str "ws://" (.-host js/location))
                           websocket-callbacks)))

(defn init-app! []
  (enable-console-print!)
  (init-ws!))

(.addEventListener js/window "load" init-app!)
