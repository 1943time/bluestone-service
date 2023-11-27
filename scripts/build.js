const { join , dirname} = require('path')
const { existsSync, rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } = require('fs')
const dist = join(__dirname, '../dist')
if (existsSync(dist)) rmSync(dist, {recursive: true, force: true})
const pc = readFileSync(join(__dirname, '../package.json'), {encoding: 'utf-8'})
const pkjson = JSON.parse(pc)
mkdirSync(dist)
cpSync(
  join(__dirname, '../.next'),
  join(dist, '.next'),
  {
    recursive: true,
    force: true,
    filter: (source) => !source.includes('/cache')
  }
)

mkdirSync(join(dist, 'public'))
cpSync(join(__dirname, '../public/favicon.png'), join(dist, 'public/favicon.png'))

mkdirSync(join(dist, 'prisma'))
cpSync(join(__dirname, '../prisma/schema.prisma'), join(dist, 'prisma/schema.prisma'))
cpSync(join(__dirname, '../ecosystem.config.js'), join(dist, 'ecosystem.config.js'))
mkdirSync(join(dist, 'scripts'))
cpSync(join(__dirname, 'initial.js'), join(dist, 'scripts/initial.js'))
cpSync(join(__dirname, 'upgrade.js'), join(dist, 'scripts/upgrade.js'))

const packageJson = {
  name: 'bluestone',
  version: pkjson.version,
  scripts: {
    start: 'next start -p 80',
    init: "node scripts/initial.js"
  },
  bluestone: pkjson.bluestone,
  dependencies: {
    '@prisma/client': '5.5.2',
    next: '14.0.1',
    shiki: '0.14.5'
  },
  devDependencies: {
    prisma: '5.5.2'
  }
}

writeFileSync(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2), {encoding: 'utf-8'})
