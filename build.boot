(set-env!
  :resource-paths #{"src/clj" "src/cljc" "src/cljs" "resources"}
  :dependencies   '[[org.clojure/clojure         "1.9.0-alpha17"]
                    [org.clojure/clojurescript   "1.9.562"]
                    [moxaj/mikron                "0.6.3-SNAPSHOT"]

                    [adzerk/boot-cljs            "1.7.228-2"]
                    [adzerk/boot-cljs-repl       "0.3.0"]
                    [adzerk/boot-reload          "0.5.1"]

                    [com.cemerick/piggieback     "0.2.1"]
                    [weasel                      "0.7.0"]
                    [org.clojure/tools.nrepl     "0.2.12"]

                    [org.immutant/immutant       "2.1.5"]
                    [ring/ring-core              "1.5.0"]
                    [compojure                   "1.5.1"]])

(require '[mikron-demo.server :as demo.server]
         '[adzerk.boot-cljs :as boot-cljs]
         '[adzerk.boot-cljs-repl :as boot-cljs-repl]
         '[adzerk.boot-reload :as boot-reload])

(deftask dev
  "Dev task for proto-repl."
  []
  (merge-env! :init-ns        'user
              :resource-paths #{"dev"}
              :dependencies   '[[org.clojure/tools.namespace "0.2.11"]
                                [proto-repl "0.3.1"]])
  (require 'clojure.tools.namespace.repl)
  (apply (resolve 'clojure.tools.namespace.repl/set-refresh-dirs) (get-env :directories))
  identity)

(deftask run []
  (comp (with-pass-thru _ (demo.server/run))
        (watch)
        (boot-reload/reload)
        (boot-cljs-repl/cljs-repl)
        (boot-cljs/cljs :compiler-options {:static-fns true}
                        :source-map       true
                        :optimizations    :none)
        (speak)))
