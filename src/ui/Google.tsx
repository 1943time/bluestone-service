'use client'
import {useServerInsertedHTML} from 'next/navigation'

export function Google() {
  useServerInsertedHTML(() => {
    return (
      <>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-982P7Z8C7J"></script>
        <script dangerouslySetInnerHTML={{__html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date())
        gtag('config', 'G-982P7Z8C7J')
      `}}>
        </script>
      </>
    )
  })
  return null
}
