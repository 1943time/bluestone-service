'use client'

import {useContext, useMemo} from 'react'
import {TreeContext} from '@/utils'
import {useParams} from 'next/navigation'
import Link from 'next/link'

export function Pagination() {
  const tree = useContext(TreeContext)
  const params = useParams()
  const index = useMemo(() => {
    return tree.docs.findIndex(t => t.path === (params.path as string[])?.map(d => decodeURIComponent(d)).join('/'))
  }, [])
  const paths = useMemo(() => {
    return {
      prev: `/book/${params.book}/${tree.docs[index - 1]?.path}`,
      next: `/book/${params.book}/${tree.docs[index + 1]?.path}`
    }
  }, [index])
  if (tree.docs.length < 2) return null
  return (
    <div className="mt-10">
      <div className="h-[1px] w-full dark:bg-gray-600/50 bg-gray-300"></div>
      <div className="flex justify-between mt-4 md:space-x-10 flex-col md:flex-row">
        {index > 0 ? (
          <Link
            className="flex-1 md:mb-0 mb-3" href={paths.prev}
            onClick={() => {
              tree.selectPath(tree.docs[index - 1]?.path)}
            }
          >
            <div className="paging group">
              <span className="text-xs dark:text-zinc-400 text-zinc-600">Previous page</span>
              <span className="paging-name truncate w-full">{paths.prev.split('/').pop()}</span>
            </div>
          </Link>
        ) : (
          <div className={'flex-1'}></div>
        )}
        {index < tree.docs.length - 1 ? (
          <Link
            className="flex-1 md:mb-0 mb-3" href={paths.next}
            onClick={() => {
              tree.selectPath(tree.docs[index + 1]?.path)
            }}
          >
            <div className="paging group">
              <span className="text-xs dark:text-zinc-400 text-zinc-600">Next page</span>
              <span className="paging-name truncate w-full">{paths.next.split('/').pop()}</span>
            </div>
          </Link>
        ) : (
          <div className={'flex-1'}></div>
        )}
      </div>
    </div>
  )
}
