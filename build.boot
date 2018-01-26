(set-env!
  :resource-paths #{"src/main/clj"
                    "src/main/cljc"
                    "src/main/cljs"
                    "src/main/resources"}
  :dependencies   '[;; Clojure and ClojureScript
                    [org.clojure/clojure         "1.9.0"]
                    [org.clojure/clojurescript   "1.9.946"]

                    ;; mikron
                    [moxaj/mikron                "0.6.4-SNAPSHOT"]

                    ;; web server
                    [org.immutant/immutant       "2.1.5" :scope "test"]
                    [ring/ring-core              "1.5.0" :scope "test"]
                    [compojure                   "1.5.1" :scope "test"]

                    ;; tooling
                    [adzerk/boot-cljs            "1.7.228-2" :scope "test"]
                    [adzerk/boot-cljs-repl       "0.3.0" :scope "test"]
                    [adzerk/boot-reload          "0.5.1" :scope "test"]

                    [com.cemerick/piggieback     "0.2.1" :scope "test"]
                    [weasel                      "0.7.0" :scope "test"]
                    [org.clojure/tools.nrepl     "0.2.12" :scope "test"]])

(require '[mikron-demo.server :as demo.server]
         '[adzerk.boot-cljs :as boot-cljs]
         '[adzerk.boot-cljs-repl :as boot-cljs-repl]
         '[adzerk.boot-reload :as boot-reload])

(deftask dev
  "Dev task for proto-repl."
  []
  (merge-env! :init-ns        'user
              :resource-paths #{"src/dev/cljc"}
              :dependencies   '[[org.clojure/tools.namespace "0.2.11"]
                                [proto-repl "0.3.1"]])
  (require 'clojure.tools.namespace.repl)
  (apply (resolve 'clojure.tools.namespace.repl/set-refresh-dirs) (get-env :directories))
  identity)

(deftask run
  "Compiles the cljs project and serves it."
  []
  (comp (with-pass-thru _ (demo.server/run))
        (watch)
        (boot-reload/reload)
        (boot-cljs-repl/cljs-repl)
        (boot-cljs/cljs :compiler-options {:static-fns true}
                        :source-map       true
                        :optimizations    :none)
        (speak)))
