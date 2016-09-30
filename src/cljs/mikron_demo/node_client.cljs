(ns mikron-demo.node-client
  (:require [cljs.nodejs :as nodejs]
            [mikron.buffer :as buffer]
            [mikron-demo.common :as common]))

(nodejs/enable-util-print!)

(defn -main [& args]
  (println (->> (common/gen :all)
                (common/pack :all)
                (common/unpack)
                :value)))

(set! *main-cli-fn* -main)
