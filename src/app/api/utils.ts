import {customAlphabet} from 'nanoid'
import {join} from 'path'
import {readFileSync} from 'fs'
import process from 'process'
import {NextRequest} from 'next/server'
import {createHmac} from 'crypto'
import {getEnvs} from '@/app/env'
export const publicPath = join(process.cwd(), 'public')
export const nid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 13)

export const getPackageJson = () =>{
  try {
    const json = readFileSync(join(process.cwd(), 'package.json'), {encoding: 'utf-8'})
    if (json) return JSON.parse(json) as {version: string}
  } catch (e) {
    return null
  }
}

export const verifySign = async (req: NextRequest) => {
  const sign = req.headers.get('authorization') || ''
  const time = +(req.headers.get('time') || '')
  if (time && time < (Date.now() - 5 * 60 * 1000)) return false
  const deviceId = req.headers.get('device-id') || ''
  const env = await getEnvs()
  return createHmac('sha1', env!.secret).update(deviceId + time.toString(16) + req.nextUrl.pathname).digest('hex') === sign
}
