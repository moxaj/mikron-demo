cd ../mikron
call lein install
cd ../mikron-demo
rmdir /S /Q "resources/public/js"
call lein cljsbuild once browser
