import fs, {existsSync, Stats} from 'fs'
import {NextRequest, NextResponse} from 'next/server'
import {join} from 'path'
import {ReadableOptions} from 'stream'
import {publicPath} from '@/app/api/utils'
import mime from 'mime-types'
function streamFile(path: string, options?: ReadableOptions): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options)

  return new ReadableStream({
    start(controller) {
      downloadStream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
      downloadStream.on('end', () => controller.close())
      downloadStream.on('error', (error: NodeJS.ErrnoException) => controller.error(error))
    },
    cancel() {
      downloadStream.destroy()
    }
  })
}

export async function GET(req: NextRequest, { params }: { params: { file: string } }): Promise<NextResponse> {
  const path = join(publicPath, 'files', params.file)
  const mimeType = mime.lookup(path)
  if (!params.file || !existsSync(path) || !mimeType) return new NextResponse('null')
  const stats: Stats = await fs.promises.stat(path)
  const data: ReadableStream<Uint8Array> = streamFile(path)
  return new NextResponse(data, {
    status: 200,
    headers: new Headers({
      'content-type': mimeType,
      'content-length': stats.size + '',
      'cache-control': 'max-age=315360000'
    })
  })
}
