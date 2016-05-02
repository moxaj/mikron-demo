(ns seria-demo.server
  (:require [immutant.web :as web]
            [immutant.web.async :as async]
            [immutant.web.middleware :as web-middleware]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as ring]
            [seria-demo.common :as common]
            [clojure.pprint :as pprint]))

(def websocket-callbacks
  {:on-open    (fn [channel]
                 (println "Channel opened")
                 (async/send! channel (common/make-data)))
   :on-close   (fn [channel {:keys [code reason]}]
                 (println "Channel closed:" code reason))
   :on-message (fn [channel message]
                 (println "Message received:")
                 (pprint/pprint (:value (common/unpack message)))
                 (println (format "Size: %d bytes" (count (seq message)))))})

(defroutes my-routes
  (GET "/" [] (ring/resource-response "index.html" {:root "public"}))
  (route/resources "/"))

(def app (-> my-routes
             (web-middleware/wrap-session {:timeout 20})
             (web-middleware/wrap-websocket websocket-callbacks)))

(def server (atom nil))

(defn restart-server []
  (when @server
    (swap! server web/stop))
  (reset! server (web/run app :port 8080))
  "Server running!")

(restart-server)
