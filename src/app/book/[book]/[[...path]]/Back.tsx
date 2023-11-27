'use client'
import {useContext, useEffect, useState} from 'react'
import {EnvCtx, TreeContext} from '@/utils'

export function BackToFirst() {
  const tree = useContext(TreeContext)
  const env = useContext(EnvCtx)
  return (
    <div className={'flex justify-center mt-20 flex-col items-center'}>
      <div className={'flex items-center'}>
        <img src={env.favicon} className={'w-6 h-6 mr-2'}/>
        <span className={'text-xl font-semibold'}>Document not found</span>
      </div>
      <span
        className={'mt-2 text-sm text-sky-500 duration-200 dark:hover:text-sky-600 cursor-pointer hover:text-sky-400'}
        onClick={tree.toFirstChapter}
      >
        Back to first chapter
      </span>
    </div>
  )
}
