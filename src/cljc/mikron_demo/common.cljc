(ns mikron-demo.common
  (:require [mikron.core :refer [defprocessors]]))

(defn int->string [n]
  (str n))

(defn string->int [s]
  #?(:clj  (Integer/parseInt s)
     :cljs (js/parseInt s)))

(defprocessors {:pack pack :gen gen :unpack unpack}
  {:schemas
   {:body     [:record {:user-data [:record {:id :int}]
                        :position  :coord
                        :angle     :float
                        :body-type [:enum [:dynamic :static :kinetic]]
                        :fixtures  [:list :fixture]}]
    :fixture  [:record {:user-data [:record {:color :int}]
                        :coords    [:list :coord]}]
    :coord    [:tuple [:float :float]]
    :snapshot [:record {:time   :long
                        :bodies [:list :body]}]
    :all      [:tuple [:byte :short :int :long :float :double :boolean :char
                       :ubyte :ushort :uint
                       ; :varint
                       :string :keyword :symbol :date :any :nil
                       ; :binary
                       [:list :byte]
                       [:vector :int]
                       [:set :short]
                       [:set {:sorted-by :default} :short]
                       [:set {:sorted-by >} :int]
                       [:map :byte :long]
                       [:map {:sorted-by :default} :long :byte]
                       [:map {:sorted-by >} :short :uint]
                       [:optional :byte]
                       [:enum [:cat :dog :measurement :error]]
                       [:tuple [:int :float :double]]
                       [:record {:a :int :b :short :c :byte}]
                       [:multi number? {true :int false [:enum [:hi :there]]}]
                       [:wrapped string->int int->string :int]
                       :snapshot]]}})
