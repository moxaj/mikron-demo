(ns mikron-demo.server
  (:require [immutant.web :as web]
            [immutant.web.async :as async]
            [immutant.web.middleware :as web-middleware]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.util.response :as ring]
            [mikron-demo.common :as common]
            [clojure.pprint :as pprint]
            [clojure.walk :as walk]))

(def sent-value (atom nil))

(defn on-open [channel]
  (println "Channed opened.")
  (let [value (common/gen :all)]
    (reset! sent-value value)
    (async/send! channel (common/pack :all value))
    (println "Value sent.")))

(defn on-message [channel message]
  (let [{:keys [value schema]} (common/unpack message)]
    (println "Value received.")
    (println "Equal to sent: " (= value @sent-value))))

(defn on-close [channel {:keys [code reason]}]
  (println "Channel closed: " code ", " reason "."))

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

(swap! server (fn [value]
                (when value
                  (web/stop value))
                (web/run app :port 8080)))
