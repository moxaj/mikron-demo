(ns mikron-demo.client
  (:require [mikron-demo.websocket :as ws]
            [mikron-demo.common :as common]
            [cljs.pprint :as pprint]))

(def ws-atom (atom nil))

(def websocket-callbacks
  {:on-message  (fn [event] (println "Message received:")
                            (pprint/pprint (:value (common/unpack (.-data event))))
                            (println (str "Size: " (.-byteLength (.-data event)) " bytes"))
                            (ws/send! @ws-atom (.-data event)))
   :on-open     (fn []      (println "Channel opened"))
   :on-error    (fn [event] (println "Channel error: " (.-data event)))
   :on-close    (fn []      (println "Channel closed"))
   :binary-type "arraybuffer"})

(defn init-ws! []
  (reset! ws-atom (ws/open (str "ws://" (.-host js/location))
                           websocket-callbacks)))

(defn init-app! []
  (enable-console-print!)
  (init-ws!))

(.addEventListener js/window "load" init-app!)
