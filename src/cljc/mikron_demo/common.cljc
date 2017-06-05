(ns mikron-demo.common
  (:require [mikron.runtime.core :as mikron]))

(defn int->string [n]
  (str n))

(defn string->int [s]
  #?(:clj  (Integer/parseInt s)
     :cljs (js/parseInt s)))

(mikron/defschema ::message
  [:tuple [:byte :short :int :long :float :double :boolean :char
           :ubyte :ushort :uint :varint
           :string :keyword :symbol :any :nil :binary
           [:list :byte]
           [:vector :int]
           [:set :short]
           [:set {:sorted-by <} :short]
           [:set {:sorted-by >} :int]
           [:map :byte :long]
           [:map {:sorted-by <} :long :byte]
           [:map {:sorted-by >} :short :uint]
           [:optional :byte]
           [:enum #{:cat :dog :measurement :error}]
           [:tuple [:int :float :double]]
           [:record {:a :int :b :short :c :byte}]
           [:multi number? {true :int false [:enum #{:hi :there}]}]
           [:wrapped string->int int->string :int]
           #mikron-demo/example-template [:byte :keyword :string]]]
  :processor-types #{:pack :unpack :gen :valid?})
