'use client'

export function ALink(props: {url: string, text: string}) {
  return (
    <a
      href={props.url} target={props.url.startsWith('http') ? '_blank' : ''}
      rel={'noreferrer'}
      className={'text-sky-500 dark:hover:text-sky-600 duration-200 hover:text-sky-400'}>{props.text}</a>
  )
}
