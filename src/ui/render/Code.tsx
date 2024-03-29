'use client'
import {useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {copyToClipboard, DocCtx, highlight} from '@/utils'
import {CheckOutlined} from '@ant-design/icons'
import Copy from '@/ui/icons/Copy'
import {useSetState} from 'react-use'

export function Code(props: {
  node: any
  path: number[]
}) {
  const ref = useRef<HTMLPreElement>(null)
  const [state, setState] = useSetState({
    copied: false,
    ready: false
  })
  const ctx = useContext(DocCtx)
  useLayoutEffect(() => {
    highlight(props.node.code, props.node.language?.toLowerCase(), ctx.preferences?.codeTheme).then(res => {
      if (res) {
        ref.current!.innerHTML = res.replace(/<\/?pre[^>]*>/g, '')
      }
    })
    setState({ready: true})
  }, [])
  const lines = useMemo(() => {
    return props.node.code.split('\n') as string[]
  }, [])

  return (
    <div
      className={'code-container'}>
      <div
        className={`group ${ctx.codeDark ? 'dark' : 'light'} tab-${ctx.preferences?.codeTabSize || 4} code-highlight ${ctx.preferences?.codeLineNumber ? 'num' : ''}`}
        style={{
          background: ctx.codeBg
        }}
      >
        <div
          className={`absolute z-10 right-2 top-1 flex items-center select-none group-hover:hidden`}>
          <div
            className={'duration-200 hover:text-indigo-500 cursor-pointer text-gray-400 text-xs'}
          >
            {props.node.language ?
              <span>{props.node.katex ? 'formula' : props.node.language}</span> :
              <span>{''}</span>
            }
          </div>
        </div>
        {state.ready &&
          <div className={'absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 duration-200'}>
            <div
              onClick={() => {
                if (state.copied) return
                setState({copied: true})
                copyToClipboard(props.node.code)
                setTimeout(() => {
                  setState({copied: false})
                }, 2000)
              }}
              className={`duration-200 hover:border-gray-200/50 border-gray-200/30 text-gray-400
          flex items-center justify-center w-7 h-7 border rounded cursor-pointer`}>
              <div
                className={`duration-200 absolute -translate-x-full top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none ${state.copied ? '' : 'opacity-0'}`}>Copied
              </div>
              {state.copied ?
                <CheckOutlined/> :
                <Copy className={'w-4 h-4'}/>
              }
            </div>
          </div>
        }
        {!!ctx.preferences?.codeLineNumber &&
          <div className={'code-line-list'}>
            {Array.from(new Array(props.node.code.split('\n').length)).map((c, i) =>
              <div key={i}/>
            )}
          </div>
        }
        <pre
          ref={ref}
        >
        <code>{props.node.code}</code>
      </pre>
        <div className={'absolute top-3 w-full left-0 pointer-events-none'}>
          {lines.map((l, i) =>
            <figure key={i} className={'h-[22px]'} data-index={[...props.path, i].join('-')} data-text={l}/>
          )}
        </div>
      </div>
    </div>
  )
}
