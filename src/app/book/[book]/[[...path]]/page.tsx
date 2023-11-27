import {Article} from '@/ui/render/Article'
import {Leading} from '@/ui/Leading'
import {Highlight} from '@/ui/render/Hihglight'
import {Position} from '@/app/book/[book]/Position'
import {Pagination} from '@/app/book/[book]/[[...path]]/Pagination'
import {BackToFirst} from '@/app/book/[book]/[[...path]]/Back'
import prisma from '@/app/api/prisma'
const getChapter = async (bookPath: string, path: string) => {
  const chapter = await prisma.chapter.findFirst({
    where: {
      book: {path: bookPath}, path
    },
    select: {schema: true, bookId: true}
  })
  if (chapter) {
    await prisma.book.update({
      where: {id: chapter.bookId},
      data: {views: {increment: 1}}
    })
    return {schema: JSON.parse(chapter.schema)}
  }
  return null
}
export default async function ({params}: { params: { path: string[], book: string } }) {
  const data = await getChapter(decodeURIComponent(params.book), params.path?.length ? params.path.map(d => decodeURIComponent(d)).join('/') : '')
  return (
    <>
      <div className={'content'}>
        {!!data &&
          <>
            <Article schema={data.schema} prePath={`/book/${params.book}/`}/>
            <Position/>
            <Pagination/>
          </>
        }
        {!data && !!params.path?.length &&
          <BackToFirst/>
        }
      </div>
      <Leading schema={data?.schema || []} book={true}/>
      <Highlight/>
    </>
  )
}
