'use client'

import {useContext, useMemo} from 'react'
import {TreeContext} from '@/utils'
import {useParams} from 'next/navigation'
import Link from 'next/link'
import ArrowRight from '../../../../ui/icons/ArrowRight'
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
    <div className='mt-10'>
      <div className='h-[1px] w-full dark:bg-gray-600/30 bg-gray-200'></div>
      <div className='flex justify-between items-start mt-6 md:space-x-10'>
        {index > 0 ? (
          <Link
            className={'paging-item group'}
            href={paths.prev}
            onClick={() => {
              tree.selectPath(tree.docs[index - 1]?.path)
            }}
          >
            <span
              className={
                'tip group-hover:text-gray-600 dark:group-hover:text-gray-200 pl-5'
              }
            >
              Previous
            </span>
            <div className={'name flex'}>
              <ArrowRight
                className={`w-[14px] h-[14px] mr-1 rotate-180 flex-shrink-0`}
              />
              <span>{paths.prev.split('/').pop()}</span>
            </div>
          </Link>
        ) : (
          <div></div>
        )}
        {index < tree.docs.length - 1 ? (
          <Link
            className={'paging-item group'}
            href={paths.next}
            onClick={() => {
              tree.selectPath(tree.docs[index + 1]?.path)
            }}
          >
            <span
              className={
                'tip group-hover:text-gray-600 dark:group-hover:text-gray-200 pr-5'
              }
            >
              Next
            </span>
            <div className={'name'}>
              <span>{paths.next.split('/').pop()}</span>
              <ArrowRight className={`w-[14px] h-[14px] ml-1`} />
            </div>
          </Link>
        ) : (
          <div className={'flex-1'}></div>
        )}
      </div>
    </div>
  )
}
