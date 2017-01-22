(ns mikron-demo.server
  (:require [clojure.pprint :as pprint]
            [mikron-demo.common :as common]
            [mikron.core :as mikron]
            [immutant.web :as web]
            [immutant.web.async :as async]
            [immutant.web.middleware :as web-middleware]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as ring])
  (:import [java.util Arrays]))

(def sent-value (atom nil))

(defn equal? [x y]
  (if (not= (type x) (Class/forName "[B"))
    (= x y)
    (Arrays/equals ^bytes x ^bytes y)))

(defn on-open [channel]
  (println "Channed opened.")
  (let [value (mikron/gen common/message)]
    (reset! sent-value value)
    (async/send! channel (mikron/pack common/message value))
    (println "Value sent.")))

(defn on-message [channel message]
  (let [{:keys [value]} (mikron/unpack common/message message)]
    (println "Value received.")
    (println "Equals to sent: " (every? true? (map equal? value @sent-value)))))

(defn on-close [channel {:keys [code reason]}]
  (println "Channel closed."))

(def websocket-callbacks
  {:on-open    on-open
   :on-message on-message
   :on-close   on-close})

(defroutes my-routes
  (GET "/" [] (ring/resource-response "index.html" {:root "public"}))
  (route/resources "/"))

(def app (-> my-routes
             (web-middleware/wrap-session {:timeout 20})
             (web-middleware/wrap-websocket websocket-callbacks)))

(def server (atom nil))

(defn -main []
  (swap! server (fn [value]
                  (when value
                    (web/stop value))
                  (web/run app :port 8080))))
