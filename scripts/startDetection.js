const fs = require('fs')
const path = require('path')
const filesDir = path.join(__dirname, '../public/files')
const shikiDir = path.join(__dirname, '../public/shiki')
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir)
if (!fs.existsSync(shikiDir)) {
  fs.mkdirSync(shikiDir)
  fs.cpSync(path.join(__dirname, '../node_modules/shiki/dist/onig.wasm'), path.join(shikiDir, 'onig.wasm'))
  fs.cpSync(path.join(__dirname, '../node_modules/shiki/languages'), path.join(shikiDir, 'languages'), {recursive: true})
  fs.cpSync(path.join(__dirname, '../node_modules/shiki/themes'), path.join(shikiDir, 'themes'), {recursive: true})
}
