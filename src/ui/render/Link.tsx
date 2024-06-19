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
      href={url}
      target={props.url.startsWith('http') ? '_blank' : ''}
      rel={'noreferrer'}
      className={
        'text-black/70 hover:text-black/90 dark:text-white/70 hover:dark:text-white/90 duration-200 underline'
      }
    >
      {props.text}
    </a>
  )
}
