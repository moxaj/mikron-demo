(defproject mikron-demo "0.1.0-SNAPSHOT"
  :description "mikron demo project"
  :url "https://github.com/moxaj/mikron-demo"
  :license {:name "Eclipse Public License"
            :url  "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.9.0-alpha11"]
                 [org.clojure/clojurescript "1.9.225"]
                 [org.immutant/immutant "2.1.5"]
                 [ring/ring-core "1.5.0"]
                 [compojure "1.5.1"]
                 [moxaj/mikron "0.3.0"]]
  :plugins [[lein-cljsbuild "1.1.4"]]
  :source-paths ["src/cljc" "src/clj"]
  :cljsbuild {:builds [{:id           "browser"
                        :source-paths ["src/cljs" "src/cljc"]
                        :compiler     {:asset-path     "js/out"
                                       :output-to      "resources/public/js/app.js"
                                       :output-dir     "resources/public/js/out"
                                       :optimizations  :none
                                       :parallel-build true
                                       :pretty-print   false
                                       :main           "mikron-demo.client"}}
                       {:id            "node"
                        :source-paths  ["src/cljs" "src/cljc"]
                        :compiler      {:output-to      "node/main.js"
                                        :output-dir     "node"
                                        :target         :nodejs
                                        :optimizations  :none
                                        :parallel-build true
                                        :pretty-print   false
                                        :main           "mikron-demo.node-client"}}]})
