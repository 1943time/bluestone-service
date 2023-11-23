#!/bin/bash
curl -OL  https://github.com/1943time/bluestone-service/releases/latest/download/bluestone-service.tar.gz
tar zxf bluestone-service.tar.gz
mv dist bluestone-service
rm -rf bluestone-service.tar.gz
cd bluestone-service
npm i
npm i pm2 -g
npm run init
