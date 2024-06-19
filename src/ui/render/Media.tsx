import {mediaType} from '@/common'
import {useMemo} from 'react'

export function Media({ node }: { node: any }) {
  const type = useMemo(() => mediaType(node.url), [])
  const url = /^\w+:\/\//.test(node.url) ? node.url : `/stream/${node.url}`
  return (
    <div className={'mb-3'}>
      <div
        className={`group cursor-default relative flex justify-center rounded`}
        data-be={'media'}
      >
        <div className={'w-full flex justify-center'}>
          {type === 'video' && (
            <video
              src={url}
              controls={true}
              className={'rounded h-full'}
              style={{ height: node.height }}
            />
          )}
          {type === 'audio' && <audio controls={true} src={url} />}
          {type === 'other' && (
            <iframe
              src={url}
              className={`w-full h-full border-none rounded`}
              style={{ height: node.height || 260 }}
            />
          )}
          {type === 'image' && (
            <img
              src={url}
              alt={'image'}
              style={{ maxHeight: node.height }}
              referrerPolicy={'no-referrer'}
              // @ts-ignore
              className={
                'align-text-bottom h-full rounded border border-transparent min-w-[20px] min-h-[20px] block object-contain'
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
