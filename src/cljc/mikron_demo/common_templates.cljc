(ns mikron-demo.common-templates
  (:require [mikron.runtime.core :as mikron]))

(mikron/deftemplate :mikron-demo.common/demo-template
  (fn [schemas]
    `[:tuple [~@(interleave schemas schemas)]]))
