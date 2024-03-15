const fs = require('fs')
const path = require('path')
const filesDir = path.join(__dirname, '../public/files')
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir)
