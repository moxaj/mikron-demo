(ns mikron-demo.server
  (:require [clojure.pprint :as pprint]
            [mikron.runtime.core :as mikron]
            [mikron-demo.common :as common]
            [immutant.web :as web]
            [immutant.web.async :as async]
            [immutant.web.middleware :as web-middleware]
            [compojure.core :as compojure]
            [ring.util.response :as ring.response]
            [ring.middleware.resource :as ring.resource])
  (:import [java.util Arrays]))

(def sent-value
  "An atom holding the value of the last sent snapshot."
  (atom nil))

(defn equal?
  "Returns `true` if the arguments are equal, `false` otherwise."
  [x y]
  (if (not= (type x) (Class/forName "[B"))
    (= x y)
    (Arrays/equals ^bytes x ^bytes y)))

(defn on-open
  "'onopen' websocket callback handler."
  [channel]
  (println "Channed opened.")
  (let [value (mikron/gen ::common/message)]
    (reset! sent-value value)
    (async/send! channel (mikron/pack ::common/message value))
    (println "Value sent.")
    (pprint/pprint value)))

(defn on-message
  "'onmessage' websocket callback handler."
  [channel message]
  (let [value (mikron/unpack ::common/message message)]
    (println "Value received. Equal to sent: " (every? true? (map equal? value @sent-value)))))

(defn on-close
  "'onclose' websocket callback handler."
  [channel {:keys [code reason]}]
  (println "Channel closed."))

(def websocket-callbacks
  "Websocket callback handler mapping."
  {:on-open    on-open
   :on-message on-message
   :on-close   on-close})

(def handler
  "Ring handler."
  (-> (compojure/GET "/" [] (ring.response/content-type
                              (ring.response/resource-response "index.html" {:root "/"})
                              "text/html"))
      (ring.resource/wrap-resource "")
      (web-middleware/wrap-session {:timeout 20})
      (web-middleware/wrap-websocket websocket-callbacks)))

(defn run
  "Spins up the web server."
  []
  (web/run handler :port 8080))
