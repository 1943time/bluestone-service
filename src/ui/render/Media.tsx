import {mediaType} from '@/common'
import {useMemo} from 'react'
import {writeFileSync} from 'fs'

export function Media({node}: {
  node: any
}) {
  const type = useMemo(() => mediaType(node.url), [])
  const url = /^\w+:\/\//.test(node.url) ? node.url : `/stream/${node.url}`
  return (
    <div
      className={'py-2'}
    >
      <div
        className={`group cursor-default relative flex justify-center mb-2 rounded`}
        data-be={'media'}
      >
        <div
          className={'w-full h-full flex justify-center'}
          style={{height: node.height}}
        >
          {type === 'video' &&
            <video
              src={url} controls={true} className={'rounded h-full'}
            />
          }
          {type === 'audio' &&
            <audio
              controls={true} src={url}
            />
          }
          {type === 'document' &&
            <object
              data={url}
              className={'w-full h-full rounded'}
            />
          }
          {(type === 'image' || type === 'other') &&
            <img
              src={url} alt={'image'}
              referrerPolicy={'no-referrer'}
              // @ts-ignore
              className={'align-text-bottom h-full rounded border border-transparent min-w-[20px] min-h-[20px] block object-contain'}
            />
          }
        </div>
      </div>
    </div>
  )
}
