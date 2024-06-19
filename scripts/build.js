const { join} = require('path')
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
cpSync(join(__dirname, '../Dockerfile'), join(dist, 'Dockerfile'))
cpSync(join(__dirname, '../.dockerignore'), join(dist, '.dockerignore'))

const packageJson = {
  name: 'bluestone',
  version: pkjson.version,
  scripts: {
    start: 'node scripts/initial.js && next start -p 80'
  },
  bluestone: pkjson.bluestone,
  dependencies: {
    '@prisma/client': '5.5.2',
    next: pkjson.dependencies.next
  },
  devDependencies: {
    prisma: '5.5.2'
  }
}

writeFileSync(join(dist, 'package.json'), JSON.stringify(packageJson, null, 2), {encoding: 'utf-8'})
