import {NextRequest, NextResponse} from 'next/server'
import {createHmac} from 'crypto'
import prisma from '@/app/api/prisma'
import process from 'process'
import {getPackageJson} from '@/app/api/utils'
import {getEnvs} from '@/app/env'
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('mode') === 'bookTexts') {
    const texts = await prisma.book.findUnique({
      where: {path: req.nextUrl.searchParams.get('bookPath')!},
      select: {texts: true, modifyTime: true}
    })
    // Save network consumption
    const time = String(texts?.modifyTime.getTime())
    if (texts?.modifyTime && time === req.nextUrl.searchParams.get('time')) {
      return NextResponse.json({texts: null, time: null})
    }
    return NextResponse.json({texts: texts?.texts, time})
  }
  return NextResponse.json({
    version: getPackageJson()?.version
  })
}

export async function POST(req: NextRequest) {
  const data:{
    machineId: string
    name: string
    time: number
    sign: string
    preferences: Record<string, any>
  } = await req.json()
  const env = await getEnvs()
  if (Date.now() - data.time > 5 * 60000) {
    return NextResponse.json({message: 'secret is incorrect'}, {status: 401})
  }
  if (data.sign !== createHmac('sha1',  env?.secret|| '').update(data.machineId + data.time.toString(16)).digest('hex')) {
    return NextResponse.json({message: 'secret is incorrect'}, {status: 401})
  }

  let record = await prisma.device.findUnique({
    where: {id: data.machineId},
    select: {id: true}
  })

  if (!record) {
    record = await prisma.device.create({
      data: {
        name: data.name,
        id: data.machineId,
        config: JSON.stringify({
          preferences: data.preferences
        })
      },
      select: {id: true}
    })
  } else {
    await prisma.device.update({
      where: {id: data.machineId},
      data: {
        name: data.name,
        config: JSON.stringify({
          preferences: data.preferences
        })
      }
    })
  }
  return NextResponse.json({deviceId: record.id})
}
