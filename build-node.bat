cd ../mikron
call lein install
cd ../mikron-demo
rmdir /S /Q node
call lein cljsbuild once node
