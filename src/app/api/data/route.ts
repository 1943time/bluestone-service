import prisma from '@/app/api/prisma'
import {NextRequest, NextResponse} from 'next/server'
import {verifySign} from '@/app/api/utils'

export async function GET(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const mode = req.nextUrl.searchParams.get('mode') || 'all'
  const deviceId = req.headers.get('device-id')!
  if (mode === 'all') {
    const docs = await prisma.doc.findMany({
      where: {deviceId},
      select: {id: true, filePath: true, modifyTime: true, hash: true, name: true}
    })
    const books = await prisma.book.findMany({
      where: {deviceId},
      select: {id: true, path: true, name: true, filePath: true, config: true}
    })
    return NextResponse.json({
      docs: docs,
      books: books,
    })
  }

  if (mode === 'docs') {
    const files = req.nextUrl.searchParams.get('files')!.split(',')
    const docs = await prisma.doc.findMany({
      where: {filePath: {in: files}, deviceId},
      select: {id: true, name: true, filePath: true}
    })
    return NextResponse.json({docs})
  }
}

export async function POST(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const json = await req.json()
  const deviceId = req.headers.get('device-id')!
  if (json.mode === 'preferences') {
    const data = await prisma.device.findUnique({
      where: {id: deviceId},
      select: {config: true}
    })
    let config: any = {}
    if (data?.config) {
      config = JSON.parse(data.config)
    }

    config.preferences = {
      ...config.preferences,
      ...json.data
    }

    await prisma.device.update({
      where: {id: deviceId},
      data: {config: JSON.stringify(config)}
    })
    return NextResponse.json({success: true})
  }
}
