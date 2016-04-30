(defproject seria-demo "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url  "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.7.170"]
                 [org.immutant/immutant "2.1.1"]
                 [ring/ring-core "1.4.0"]
                 [compojure "1.4.0"]
                 [moxaj/seria "0.2.21"]]
  :plugins [[lein-cljsbuild "1.1.1"]]
  :source-paths ["src/cljc" "src/clj"]
  :cljsbuild {:builds [{:id           "id"
                        :source-paths ["src/cljs" "src/cljc"]
                        :compiler     {:asset-path     "js/out"
                                       :output-to      "resources/public/js/app.js"
                                       :output-dir     "resources/public/js/out"
                                       :optimizations  :advanced
                                       :parallel-build true
                                       :pretty-print   false
                                       :main           "seria-demo.client"}}]})
