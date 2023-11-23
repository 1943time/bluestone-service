import {NextRequest, NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import prisma from '@/app/api/prisma'
import {join} from 'path'
import {publicPath, verifySign} from '@/app/api/utils'
import {existsSync} from 'fs'
import {unlink} from 'fs/promises'

export async function GET(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const path = req.nextUrl.searchParams.get('path')
  const filePath = req.nextUrl.searchParams.get('filePath')
  if (filePath) {
    const record = await prisma.book.findUnique({
      where: {deviceId_filePath: {deviceId, filePath}},
      select: {id: true, filePath: true, name: true, config: true, path: true}
    })
    return NextResponse.json({
      book: record ? {
        ...record,
        config: record?.config ? JSON.parse(record.config) : {}
      } : null
    })
  } else if (path) {
    const record = await prisma.book.findUnique({
      where: {path},
      select: {id: true, filePath: true, name: true, config: true, path: true}
    })
    return NextResponse.json({
      book: record ? {
        ...record,
        config: record?.config ? JSON.parse(record.config) : {}
      } : null
    })
  } else {
    const page = +(req.nextUrl.searchParams.get('page') || 1)
    const pageSize = +(req.nextUrl.searchParams.get('pageSize') || 1)
    const where:Prisma.BookWhereInput = {}
    if (req.nextUrl.searchParams.get('all') === 'true') where.deviceId = deviceId
    const list = await prisma.book.findMany({
      where,
      select: {id: true, name: true, filePath: true, path: true, views: true, device: {select: {name: true}}, config: true},
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const total = await prisma.book.count({where})
    return NextResponse.json({
      list: list.map(l => {
        return {
          ...l,
          config: l.config ? JSON.parse(l.config) : {}
        }
      }),
      total
    })
  }
}

export async function POST(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const data: {
    id?: string
    path: string
    filePath: string
    name: string
    config: string
  } = await req.json()

  let book = data.id ? await prisma.book.findUnique({
    where: {id: data.id},
    select: {id: true, filePath: true, path: true, name: true}
  }) : null
  if (book) {
    if (data.name) {
      book = await prisma.book.update({
        where: {id: book.id},
        data: {filePath: data.filePath, name: data.name, path: data.path, config: JSON.stringify(data.config)},
        select: {id: true, filePath: true, path: true, name: true}
      })
    }
    const chapters = await prisma.chapter.findMany({
      where: {bookId: book.id},
      select: {id: true, path: true, hash: true}
    })
    const files = await prisma.file.findMany({
      where: {bookId: book.id},
      select: {id: true, name: true, filePath: true, hash: true}
    })
    return NextResponse.json({book, chapters, files})
  } else {
    book = await prisma.book.create({
      data: {
        filePath: data.filePath,
        name: data.name,
        path: data.path,
        config: JSON.stringify(data.config),
        device: {connect: {id: deviceId}}
      },
      select: {id: true, filePath: true, path: true, name: true}
    })
    return NextResponse.json({book, chapters: [], files: []})
  }
}

export async function PUT(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const data: {
    removeDocs: string[]
    removeFiles: string[]
    addChapters: {
      schema: string,
      path: string
      hash: string
    }[]
    map: string
    texts: string
    bookId: string
  } = await req.json()
  const res = await prisma.$transaction(async ctx => {
    const book = await ctx.book.update({
      where: {id: data.bookId},
      data: {map: data.map, texts: data.texts},
      select: {id: true, path: true, name: true, filePath: true, config: true}
    })
    if (data.removeDocs.length) {
      await ctx.chapter.deleteMany({
        where: {bookId: book.id, id: {in: data.removeDocs}}
      })
    }
    if (data.addChapters.length) {
      await Promise.all(data.addChapters.map(c => {
        return ctx.chapter.create({
          data: {hash: c.hash, path: c.path, book: {connect: {id: data.bookId}}, schema: c.schema}
        })
      }))
    }
    if (data.removeFiles.length) {
      const files = await ctx.file.findMany({
        where: {bookId: book.id, id: {in: data.removeFiles}},
        select: {name: true}
      })
      if (files.length) {
        await ctx.file.deleteMany({
          where: {id: {in: data.removeFiles}, bookId: book.id}
        })
        for (let f of files) {
          const path = join(publicPath, 'files', f.name)
          if (existsSync(path)) {
            await unlink(path)
          }
        }
      }
    }
    return book
  })
  return NextResponse.json({
    book: {
      ...res,
      config: JSON.parse(res.config || '{}')
    }
  })
}

export async function DELETE(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const id = req.nextUrl.searchParams.get('id')!
  await prisma.$transaction(async ctx => {

    await ctx.chapter.deleteMany({
      where: {bookId: id}
    })

    const files = await ctx.file.findMany({
      where: {bookId: id},
      select: {name: true}
    })
    await ctx.file.deleteMany({
      where: {bookId: id}
    })

    await ctx.book.delete({
      where: {id}
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
