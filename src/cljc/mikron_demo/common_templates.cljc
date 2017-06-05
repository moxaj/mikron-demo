(ns mikron-demo.common-templates)

(defn example-template [schemas]
  `[:tuple [~@(interleave schemas schemas)]])
