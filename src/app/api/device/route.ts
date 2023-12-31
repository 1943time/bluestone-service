import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/app/api/prisma'
import {join} from 'path'
import {publicPath, verifySign} from '@/app/api/utils'
import {existsSync} from 'fs'
import {unlink} from 'fs/promises'
import {exec, execSync} from 'child_process'

export async function GET(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  if (req.nextUrl.searchParams.get('name')) {
    return NextResponse.json({
      device: prisma.device.findUnique({
        where: {name: req.nextUrl.searchParams.get('name')!},
        select: {id: true}
      })
    })
  }

  const page = +(req.nextUrl.searchParams.get('page') || 1)
  const pageSize = +(req.nextUrl.searchParams.get('pageSize') || 1)
  const total = await prisma.device.count()
  const list = await prisma.device.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {id: true, name: true, created: true}
  })
  return NextResponse.json({
    total, list
  })
}

export async function DELETE(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const id = req.nextUrl.searchParams.get('id')!
  if (!id) return NextResponse.json({message: 'book dose not exist'}, {status: 500})
  await prisma.$transaction(async ctx => {
    const files = await ctx.file.findMany({
      where: {deviceId: id},
      select: {name: true}
    })
    await ctx.file.deleteMany({
      where: {deviceId: id}
    })

    await ctx.doc.deleteMany({
      where: {deviceId: id}
    })

    const books = await ctx.book.findMany({
      where: {deviceId: id},
      select: {id: true}
    })
    if (books.length) {
      await ctx.chapter.deleteMany({
        where: {bookId: {in: books.map(b => b.id)}}
      })
    }

    await ctx.book.deleteMany({
      where: {deviceId: id}
    })

    if (files.length) {
      for (let f of files) {
        const path = join(publicPath, 'files', f.name)
        if (existsSync(path)) {
          await unlink(path)
        }
      }
    }

    await ctx.device.delete({
      where: {id}
    })
  })
  return NextResponse.json({success: true})
}

// upgrade
export async function POST(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  try {
    execSync('curl -OL https://github.com/1943time/bluestone-service/releases/latest/download/bluestone-service.tar.gz', {cwd: process.cwd()})
    execSync('tar zvxf bluestone-service.tar.gz', {cwd: process.cwd()})
    exec('node dist/scripts/upgrade.js', {cwd: process.cwd()})
    return NextResponse.json({success: true})
  } catch (e: any) {
    return NextResponse.json({message: `Upgrade failed：${e?.message},${e.stack}`})
  }
}

export async function PUT(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const data:{
    mode: 'updateDocs' | 'updateBooks',
    files: {from: string, to: string}[]
  } = await req.json()
  if (data.mode === 'updateDocs') {
    let docs: any[] = []
    for (let f of data.files) {
      docs.push(await prisma.doc.update({
        where: {deviceId_filePath: {filePath: f.from, deviceId}},
        data: {filePath: f.to},
        select: {id: true, filePath: true, modifyTime: true, hash: true, name: true, views: true}
      }))
    }
    return NextResponse.json({docs})
  }
  if (data.mode === 'updateBooks') {
    let books:any[] = []
    for (let f of data.files) {
      books.push(await prisma.book.update({
        where: {deviceId_filePath: {filePath: f.from, deviceId}},
        data: {filePath: f.to},
        select: {id: true, path: true, name: true, filePath: true, config: true}
      }))
    }
    return NextResponse.json({books})
  }
}
