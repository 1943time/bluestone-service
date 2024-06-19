import { useContext } from 'react'
import Link from 'next/link'
import { ILink } from '../icons/ILink'

export function Attachment({ node, path }: { node: any, path: number[] }) {
  const url = /^\w+:\/\//.test(node.url) ? node.url : `/stream/${node.url}`
  return (
    <div className={'mb-3 relative'}>
      <Link href={url} target={'_blank'} download={true} className={`attach`}>
        <div className={`file`}>
          <div className={'flex items-center justify-between'}>
            <div className={'flex items-center text-sm'}>
              <div
                className={
                  'px-1.5 py-0.5 rounded flex items-center bg-teal-500 text-white text-xs font-semibold'
                }
              >
                {node.name?.match(/\.(\w+)/)?.[1]}
              </div>
              <div className={'mx-3 break-all'}>{node.name}</div>
            </div>
            <div
              className={
                'p-1 flex items-center rounded text-sm text-black/80 dark:text-white/80 cursor-pointer'
              }
            >
              <ILink />
            </div>
          </div>
        </div>
      </Link>
      <div
        className={'absolute inset-0 pointer-events-none'}
        data-index={path.join('-')}
        data-text={node.name}
      ></div>
    </div>
  )
}
