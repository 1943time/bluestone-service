import React from 'react'
import {Header} from '@/ui/Header'
import {Search} from '@/ui/Search'
import NotFound from '@/app/not-found'
import {Metadata} from 'next'
import {BookContext} from '@/app/book/[book]/Ctx'
import {DirectoryFrame} from '@/app/book/[book]/Director'
import prisma from '@/app/api/prisma'

const getBookTitle = (book: string) => {
  return prisma.book.findUnique({
    where: {path: book},
    select: {name: true}
  })
}

const getBook = async (book: string) => {
  return prisma.book.findUnique({
    where: {path: book},
    select: {map: true, name: true, device: {select: {config: true}}}
  })
}
export async function generateMetadata(props: {params: any}): Promise<Metadata> {
  const res = await getBookTitle(props.params.book)
  return {
    title: res?.name
  }
}
export default async function (props: {children: React.ReactNode, params: {path: string[], book: string}}) {
  const data = await getBook(props.params.book)
  const map = JSON.parse(data?.map || '[]')
  return (
    <>
      {!!data &&
        <BookContext map={map} preferences={JSON.parse(data.device.config || '{}').preferences || {}}>
          <Header title={data.name} book={true}/>
          <div className={'doc-container'}>
            <DirectoryFrame map={map}/>
            {props.children}
          </div>
          <Search/>
        </BookContext>
      }
      {!data &&
        <NotFound/>
      }
    </>
  )
}
