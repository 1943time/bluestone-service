'use client'
import SetTheme from '@/ui/SetTheme'
import {useContext} from 'react'
import {EnvCtx} from '@/utils'

export default function NotFound() {
  const env = useContext(EnvCtx)
  return (
    <>
      <SetTheme/>
      <div className={'flex justify-center flex-col items-center h-screen text-gray-700 dark:text-gray-200 pb-10'}>
        <div className={'flex items-center'}>
          <img src={env?.favicon} className={'w-6 h-6'}/>
          <span className={'text-lg font-medium ml-2'}>No related content found</span>
        </div>
      </div>
    </>
  )
}
