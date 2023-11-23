import {Header} from '@/ui/Header'
import {Article} from '@/ui/render/Article'
import {Leading} from '@/ui/Leading'
import {Highlight} from '@/ui/render/Hihglight'
import {DocSearch} from '@/ui/DocSearch'
import {Metadata} from 'next'
import prisma from '@/app/api/prisma'
import {BsContext} from '@/app/ctx'
import {redirect} from 'next/navigation'
import {parse} from 'path'
export async function generateMetadata(props: {params: any}): Promise<Metadata> {
  const doc = await prisma.doc.findUnique({
    where: {name: props.params.path},
    select: {filePath: true}
  })
  return {
    title: doc ? '3' + parse(doc.filePath).name : ''
  }
}

async function getData(name: string) {
  const doc = await prisma.doc.findUnique({
    where: {name},
    select: {schema: true, name: true, password: true, filePath: true, device: {select: {config: true}}}
  })
  if (doc) {
    await prisma.doc.update({
      where: {name},
      data: {views: {increment: 1}}
    })
    let preferences = {}
    try {
      preferences = JSON.parse(doc.device.config).preferences || {}
    } catch (e) {}
    return {
      password: !!doc.password,
      name: doc.name,
      docName: parse(doc.filePath).name,
      schema: JSON.parse(doc.schema),
      preferences
    }
  }
  return null
}

export default async function ({params}: {params: {path: string}}) {
  const data = await getData(params.path)
  if (!data?.schema?.length) redirect('/not-found')
  return (
    <BsContext preferences={data.preferences}>
      <Header title={data.docName}/>
      <div className={'doc-container'}>
        <div className={'content'}>
          <Article schema={data.schema}/>
        </div>
        <Leading schema={data.schema}/>
        <Highlight/>
        <DocSearch/>
      </div>
    </BsContext>
  )
}

