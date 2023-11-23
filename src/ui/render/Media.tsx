import {mediaType} from '@/common'
import {useMemo} from 'react'

export function Media({node}: {
  node: any
}) {
  const type = useMemo(() => mediaType(node.url), [])
  const url = /^\w+:\/\//.test(node.url) ? node.url : `/stream/${node.url}`
  return (
    <>
      {type === 'video' &&
        <video src={url} controls={true} preload={'true'}></video>
      }
      {type === 'image' &&
        <img alt={node.alt} src={url}/>
      }
      {type === 'document' &&
        <object data={url} className={'w-full h-auto'}/>
      }
    </>
  )
}
