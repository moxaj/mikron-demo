(ns mikron-demo.common
  (:require [mikron.core :as mikron]))

(mikron/defprocessors [pack gen unpack]
  {:schemas {:body     [:record {:user-data [:record {:id :int}]
                                 :position  :coord
                                 :angle     :float
                                 :body-type [:enum [:dynamic :static :kinetic]]
                                 :fixtures  [:list :fixture]}]
             :fixture  [:record {:user-data [:record {:color :int}]
                                 :coords    [:list :coord]}]
             :coord    [:tuple [:float :float]]
             :snapshot [:record {:time   :long
                                 :bodies [:list :body]}]}})
