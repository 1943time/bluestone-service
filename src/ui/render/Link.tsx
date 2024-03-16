'use client'

import {useParams} from 'next/navigation'
import {useMemo} from 'react'

export function ALink(props: {url: string, text: string}) {
  const params = useParams()
  const url = useMemo(() => {
    if (props.url.startsWith('http')) return props.url as string
    if (props.url.startsWith('#')) return props.url
    if (params.book) {
      return `/book/${params.book}/` + props.url
    }
    return props.url
  }, [props.url])
  return (
    <a
      href={url} target={props.url.startsWith('http') ? '_blank' : ''}
      rel={'noreferrer'}
      className={'text-indigo-500 dark:hover:text-indigo-600 duration-200 hover:text-indigo-400'}>{props.text}</a>
  )
}
