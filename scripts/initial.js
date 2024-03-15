const {exec} = require('child_process')
const { join } = require('path')
const { existsSync, mkdirSync, cpSync} = require('fs')

const e = exec('prisma db push', {cwd: join(__dirname, '..')})
e.stdout.on('data', data => console.log(data.toString()))
e.stderr.on('data', data => console.log(data.toString()))
e.on('exit', () => {
  const filesDir = join(__dirname, '../public/files')
  if (!existsSync(filesDir)) mkdirSync(filesDir)
  console.log('Initialization successful')
})
