#!/bin/bash
curl -OL  https://github.com/1943time/bs-service/releases/latest/download/bluestone-service.tar.gz
tar zxf bluestone-service.tar.gz
rm -rf bluestone-service.tar.gz
cd bluestone-service
npm i
npm i pm2 -g
npm run init
