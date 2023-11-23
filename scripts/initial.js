const {exec} = require('child_process')
const { join } = require('path')
const { existsSync, mkdirSync, cpSync} = require('fs')

const e = exec('prisma db push', {cwd: join(__dirname, '..')})
e.stdout.on('data', data => console.log(data.toString()))
e.stderr.on('data', data => console.log(data.toString()))
e.on('exit', () => {
  const filesDir = join(__dirname, '../public/files')
  const shikiDir = join(__dirname, '../public/shiki')
  if (!existsSync(filesDir)) mkdirSync(filesDir)
  if (!existsSync(shikiDir)) {
    mkdirSync(shikiDir)
    cpSync(join(__dirname, '../node_modules/shiki/dist/onig.wasm'), join(shikiDir, 'onig.wasm'))
    cpSync(join(__dirname, '../node_modules/shiki/languages'), join(shikiDir, 'languages'), {recursive: true})
    cpSync(join(__dirname, '../node_modules/shiki/themes'), join(shikiDir, 'themes'), {recursive: true})
  }
  console.log('Initialization successful')
})
