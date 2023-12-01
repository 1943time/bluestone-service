import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/app/api/prisma'
import {nid, publicPath, verifySign} from '@/app/api/utils'
import {existsSync} from 'fs'
import {join} from 'path'
import {unlink} from 'fs/promises'
import {Prisma} from '@prisma/client'

export async function GET(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message: 'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const page = +(req.nextUrl.searchParams.get('page') || 1)
  const pageSize = +(req.nextUrl.searchParams.get('pageSize') || 1)
  const where: Prisma.DocWhereInput = {}
  if (!req.nextUrl.searchParams.get('all')) where.deviceId = deviceId
  const list = await prisma.doc.findMany({
    where,
    select: {id: true, name: true, filePath: true, views: true, hash: true, device: {select: {name: true}}},
    skip: (page - 1) * pageSize,
    take: pageSize
  })
  const total = await prisma.doc.count({where})
  return NextResponse.json({
    list, total
  })
}

export async function POST(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message: 'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const data: { filePath: string } = await req.json()
  let doc = await prisma.doc.findUnique({
    where: {deviceId_filePath: {filePath: data.filePath, deviceId}},
    select: {id: true, filePath: true, modifyTime: true, hash: true, name: true, views: true}
  })
  let deps: any[] = []
  if (!doc) {
    doc = await prisma.doc.create({
      data: {
        filePath: data.filePath,
        name: nid(),
        device: {connect: {id: deviceId}}
      },
      select: {id: true, filePath: true, modifyTime: true, hash: true, name: true, views: true}
    })
  } else {
    deps = await prisma.file.findMany({
      where: {
        docId: doc.id
      },
      select: {
        id: true, name: true, filePath: true, hash: true
      }
    })
  }
  return NextResponse.json({doc: doc, deps})
}

export async function PUT(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message: 'Incorrect signature'}, {status: 403})
  const data: {
    id: string, schema: string, remove: string[], hash: string
  } = await req.json()

  await prisma.$transaction(async ctx => {
    const doc = await ctx.doc.update({
      where: {id: data.id},
      data: {
        schema: data.schema, hash: data.hash
      },
      select: {id: true, name: true}
    })
    if (data.remove.length) {
      const files = await ctx.file.findMany({
        where: {id: {in: data.remove}, docId: doc.id},
        select: {name: true}
      })
      if (files.length) {
        await ctx.file.deleteMany({
          where: {id: {in: data.remove}, docId: doc.id}
        })
        for (let f of files) {
          const path = join(publicPath, 'files', f.name)
          if (existsSync(path)) {
            await unlink(path)
          }
        }
      }
    }
  })
  return NextResponse.json({success: true})
}

export async function DELETE(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message: 'Incorrect signature'}, {status: 403})
  const id = req.nextUrl.searchParams.get('id')!
  await prisma.$transaction(async ctx => {
    const doc = await ctx.doc.findUnique({
      where: {id: id},
      select: {id: true, name: true}
    })

    const files = await ctx.file.findMany({
      where: {docId: doc!.id},
      select: {name: true}
    })

    await ctx.file.deleteMany({
      where: {docId: doc!.id}
    })

    await ctx.doc.delete({
      where: {id: doc!.id}
    })
    if (files.length) {
      for (let f of files) {
        const path = join(publicPath, 'files', f.name)
        if (existsSync(path)) {
          await unlink(path)
        }
      }
    }
  })
  return NextResponse.json({success: true})
}
