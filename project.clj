(defproject mikron-demo "0.1.0-SNAPSHOT"
  :description "mikron demo project"
  :url "https://github.com/moxaj/mikron-demo"
  :license {:name "Eclipse Public License"
            :url  "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.8.51"]
                 [org.immutant/immutant "2.1.4"]
                 [ring/ring-core "1.4.0"]
                 [compojure "1.5.0"]
                 [moxaj/mikron "0.2.3"]]
  :plugins [[lein-cljsbuild "1.1.3"]]
  :source-paths ["src/cljc" "src/clj"]
  :cljsbuild {:builds [{:id           "id"
                        :source-paths ["src/cljs" "src/cljc"]
                        :compiler     {:asset-path     "js/out"
                                       :output-to      "resources/public/js/app.js"
                                       :output-dir     "resources/public/js/out"
                                       :optimizations  :advanced
                                       :parallel-build true
                                       :pretty-print   false
                                       :main           "mikron-demo.client"}}]})
