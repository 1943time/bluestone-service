import {NextRequest, NextResponse} from 'next/server'
import {nid, publicPath, verifySign} from '@/app/api/utils'
import {extname, join} from 'path'
import {unlink, writeFile} from 'fs/promises'
import prisma from '@/app/api/prisma'
import {Prisma} from '@prisma/client'
import {existsSync} from 'fs'

const corsHeaders = {
  // 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, device-id, time, version'
}
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: corsHeaders
  })
}
export async function POST(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const form = await req.formData()
  const file = form.get('file') as File
  const filePath = form.get('filePath') as string
  const hash = form.get('hash') as string | undefined
  const docId = form.get('docId') as string
  const bookId = form.get('bookId') as string
  const name = nid() + extname(file.name)
  await writeFile(join(publicPath, 'files', name), Buffer.from(await file.arrayBuffer()))
  const data:Prisma.FileCreateArgs = {
    data: {
      filePath, name, size: file.size, hash, device: {connect: {id: deviceId}}
    },
    select: {name: true}
  }
  if (docId) data.data.doc =  {connect: {id: docId}}
  if (bookId) data.data.book =  {connect: {id: bookId}}
  await prisma.file.create(data)
  return NextResponse.json({name}, {
    headers: corsHeaders
  })
}

export async function GET(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const deviceId = req.headers.get('device-id')!
  const query = Object.fromEntries(req.nextUrl.searchParams)
  const page = +(query.page || 1)
  const pageSize = +(query.pageSize || 1)
  const where: Prisma.FileWhereInput = {}
  if (query.all === 'true') where.deviceId = deviceId
  if (req.nextUrl.searchParams.get('docId')) where.docId = req.nextUrl.searchParams.get('docId')!
  if (req.nextUrl.searchParams.get('bookId')) where.bookId = req.nextUrl.searchParams.get('bookId')!
  const total = await prisma.file.count({where})
  const list = await prisma.file.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true, name: true, filePath: true, size: true,
      device: {select: {id: true, name: true}},
      doc: {select: {id: true, filePath: true, name: true}},
      book: {select: {id: true, filePath: true, name: true, path: true}}
    }
  })

  return NextResponse.json({total, list})
}

export async function DELETE(req: NextRequest) {
  if (!await verifySign(req)) return NextResponse.json({message:  'Incorrect signature'}, {status: 403})
  const fileId = req.nextUrl.searchParams.get('fileId')!
  const file = await prisma.file.findUnique({
    where: {id: fileId},
    select: {id: true, name: true}
  })

  if (file) {
    const path = join(publicPath, 'files', file.name)
    if (existsSync(path)) {
      await unlink(path)
    }

    await prisma.file.delete({
      where: {id: file.id}
    })
  }

  return NextResponse.json({success: true})
}
