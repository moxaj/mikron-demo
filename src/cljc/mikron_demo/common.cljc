(ns mikron-demo.common
  (:require [mikron.core :refer [defprocessors]]))

(defn int->string [n]
  (str n))

(defn string->int [s]
  #?(:clj  (Integer/parseInt s)
     :cljs (js/parseInt s)))

(defprocessors
  {:schemas
   {::message
    [:tuple [:byte :short :int :long :float :double :boolean :char
             :ubyte :ushort :uint :varint
             :string :keyword :symbol :date :any :nil :binary
             [:list :byte]
             [:vector :int]
             [:set :short]
             [:set {:sorted-by <} :short]
             [:set {:sorted-by >} :int]
             [:map :byte :long]
             [:map {:sorted-by <} :long :byte]
             [:map {:sorted-by >} :short :uint]
             [:optional :byte]
             [:enum [:cat :dog :measurement :error]]
             [:tuple [:int :float :double]]
             [:record {:a :int :b :short :c :byte}]
             [:multi number? {true :int false [:enum [:hi :there]]}]
             [:wrapped string->int int->string :int]]]}})
