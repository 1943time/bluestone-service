import {readFileSync} from 'fs'
import {join} from 'path'
interface IEnv {
  secret: string
  ['home-site']: string
  favicon: string
}
let env: null | IEnv = null
export async function getEnvs():Promise<null | IEnv> {
  try {
    const pc = readFileSync(join(process.cwd(), 'package.json'), {encoding: 'utf-8'})
    env = JSON.parse(pc).bluestone
    return env
  } catch (e) {
    console.error(e)
    return null
  }
}
