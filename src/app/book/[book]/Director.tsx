'use client'

import {useCallback, useContext, useEffect} from 'react'
import {DocCtx, TreeContext} from '@/utils'
import {useParams} from 'next/navigation'
import Link from 'next/link'
import ArrowRight from '@/ui/icons/ArrowRight'
import {useSetState} from 'react-use'
export function DirectoryFrame(props: {
  map: any[]
}) {
  const ctx = useContext(DocCtx)
  const [state, setState] = useSetState({
    visible: false,
    show: false
  })
  const close = useCallback(() => {
    setState({show: false})
    ctx.setState!({openMenu: false})
    setTimeout(() => {
      setState({visible: false})
    }, 300)
  }, [])
  useEffect(() => {
    if (ctx.openMenu) {
      setState({visible: true})
      setTimeout(() => {
        setState({show: true})
      }, 100)
    } else {
      close()
    }
  }, [ctx.openMenu])
  return (
    <>
      <div className={`director ${ctx.openMenu ? 'open' : ''}`}>
        <Directory map={props.map} level={0}/>
        <div className={'cover'}></div>
      </div>
      {state.visible &&
        <div
          className={`fixed inset-0 z-[210] bg-black/60 duration-300 ${state.show ? 'opacity-100' : 'opacity-0'}`}
          onClick={close}
        />
      }
    </>
  )
}
function Directory({map, level}: {
  map: any[]
  level: number
}) {
  const params = useParams()
  const tree = useContext(TreeContext)
  const ctx = useContext(DocCtx)
  return (
    <>
      {map.map((d, i) =>
        <div className={'d-item'} key={i}>
          {d.folder ? (
            <div
              className={`group flex items-center justify-between select-none d-title dir ${d.folder && tree.openKeys.includes(d.path) ? 'open' : ''}`}
              onClick={() => {
                tree.togglePath(d.path)
              }}
            >
              <span>{d.name}</span>
              <ArrowRight className={`w-[14px] h-[14px] text-gray-400 dark:group-hover:text-gray-100 group-hover:text-gray-600 duration-200 ${tree.openKeys.includes(d.path) ? 'rotate-90' : ''}`}/>
            </div>
          ) : (
            <Link
              className={`select-none d-title ${tree.currentPath === d.path ? 'active' : ''}`}
              shallow={true}
              onClick={() => {
                ctx.setState!({openMenu: false})
                tree.selectPath(d.path)
              }}
              href={`/book/${params.book}/${d.path}`}
            >
              {d.name}
            </Link>
          )}
          {d.folder && !!d.children?.length && tree.openKeys.includes(d.path) &&
            <div className={'d-sub'}>
              <Directory map={d.children} level={level + 1}/>
            </div>
          }
        </div>
      )}
    </>
  )
}
