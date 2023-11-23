'use client'
import React, {Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef} from 'react'
import {DocCtx, TreeContext} from '@/utils'
import Doc from '@/ui/icons/Doc'
import {useDebounce, useGetSetState} from 'react-use'
import {useParams, useRouter} from 'next/navigation'
import {encodeHtml, slugify} from '@/common'

const highlight = (text: string, key: RegExp) => {
  text = encodeHtml(text)
  // @ts-ignore
  return `${text.replace(key, '<span class="font-semibold text-blue-500">$&</span>')}`
}

type Text = {
  path: number[], text: string, type: string, html?: string
}
type Result = {
  doc: string, text: Text[], showText: Text[]
}
const symbolMap = new Map([
  ['head', '#'],
  ['paragraph', 'P'],
  ['table-cell', 'TD'],
  ['code-line', '< >']
])

export function Search() {
  const tree = useContext(TreeContext)
  const ctx = useContext(DocCtx)
  const timer = useRef(0)
  const [state, setState] = useGetSetState({
    keyword: '',
    result: [] as Result[],
    searching: false,
    data: [] as {
      path: string
      texts: Text[]
    }[]
  })
  const docsResult = useMemo(() => {
    return tree.docs.map(d => {
      return {doc: d.path}
    })
  }, [])
  const router = useRouter()
  const params = useParams()
  const paramsRef = useRef(params)
  paramsRef.current = params
  const search = useCallback( () => {
    if (!state().keyword) {
      return setState({result: []})
    }
    const key = new RegExp(state().keyword.replace(/[*.?+$^\[]\(\)\{}\|\/]/g, '\\$&'), 'gi')
    const result = state().data.filter(d => {
      return d.texts.some(t => key.test(t.text.toLowerCase()))
    }).map(t => {
      const text = t.texts.filter(t => key.test(t.text)).map(st => {
        return {
          path: st.path,
          type: st.type,
          text: st.text,
          html: highlight(st.text, key)
        }
      })
      return {
        doc: t.path,
        text: text,
        showText: text.slice(0, 5)
      }
    })
    setState({result, searching: false})
  }, [])

  useDebounce(search, 300, [state().keyword])

  const showMore = useCallback((index: number) => {
    const item = state().result[index]
    item.showText = item.text
    setState({
      result: state().result.slice()
    })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase()
      if (key === 'escape') {
        ctx.setState!({openSearch: false})
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        ctx.setState!({openSearch: true})
      }
    })
    let cacheData = {
      texts: '',
      time: ''
    }
    const cache = localStorage.getItem(`bookPath-${params.book}`)
    if (cache) {
      cacheData = JSON.parse(cache)
    }
    fetch(`/api/bluestone?mode=bookTexts&bookPath=${params.book}&time=${cacheData.time}`, {
      cache: 'no-cache'
    }).then(async res => {
      const data = await res.json()
      if (data.texts) {
        setState({
          data: JSON.parse(data.texts)
        })
        localStorage.setItem(`book-texts-${params.book}`, JSON.stringify({
          texts: data.texts,
          time: data.time
        }))
      } else if (cacheData.texts) {
        setState({
          data: JSON.parse(cacheData.texts)
        })
      }
    })
  }, [])

  const close = useCallback(() => {
    ctx.setState!({
      openSearch: false
    })
  }, [])

  const selectResult = useCallback((path: string, options: {
    position?: string
    hash?: string
  }) => {
    if ((paramsRef.current.path as string[])?.join('/') === path && !options.hash) {
      tree.toPosition(options.position || '')
    } else {
      router.push(`/book/${params.book}/${path}${options.hash ? `#${options.hash}` : ''}`)
      tree.selectPath(path)
      tree.setState({
        position: options.position
      })
    }
    ctx.setState!({openSearch: false})
  }, [])
  if (!ctx.openSearch) return null
  return (
    <div
      className={'z-[200] fixed inset-0 dark:bg-black/30 bg-black/10 overflow-hidden'}
      onClick={close}
    >
      <div
        className={'w-[600px] min-h-[100px] mt-20 modal-panel rounded-lg mx-auto max-w-[calc(100vw_-_40px)]'}
        onClick={e => e.stopPropagation()}
      >
        <div className={'flex items-center'}>
          <input
            className={'bg-transparent flex-1 outline-none h-10 w-full px-4 dark:text-gray-200 text-gray-600 dark:placeholder-gray-200/30 placeholder-gray-300'}
            placeholder={'Search'}
            autoFocus={true}
            value={state().keyword}
            onChange={e => {
              const query = e.target.value
              setState({keyword: query, searching: true})
              clearTimeout(timer.current)
              timer.current = window.setTimeout(() => {
                search()
              }, 300)
            }}
          />
          <button
            type={'button'}
            className={'border rounded px-1 dark:border-gray-200/10 mr-2 text-xs text-gray-400 py-0.5 hover:text-gray-500 dark:hover:text-gray-300'}
            onClick={close}
          >
            Esc
          </button>
        </div>
        <div className={'h-[1px] bg-gray-200 dark:bg-gray-200/20'}/>
        {state().keyword && !state().result.length && !state().searching &&
          <div className={'text-sm text-center py-3 text-gray-400 px-5 '}>
            No results for "<span className={'dark:text-gray-300 text-gray-500'}>{state().keyword}</span>"
          </div>
        }
        <div
          className={`p-2 break-all relative overflow-y-auto max-h-[calc(100vh_-_160px)] dark:text-gray-400 text-gray-600 ${state().keyword && !state().result.length ? 'hidden' : ''}`}>
          <div>
            {!state().keyword && !state().result.length &&
              <>
                {docsResult.map(d =>
                  <div
                    key={d.doc}
                    onClick={() => {
                      selectResult(d.doc, {})
                    }}
                    className={'flex items-center py-1 px-2 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 group hover:text-gray-700 hover:bg-black/5'}>
                    <Doc className={'w-5 h-5 dark:fill-gray-400 dark:group-hover:fill-gray-300 fill-gray-500 group-hover:fill-gray-600'}/>
                    <span className={'ml-2 font-semibold text-sm'}>{d.doc.split('/').pop()}</span>
                  </div>
                )}
              </>
            }
            {state().keyword && !!state().result.length &&
              <>
                {state().result.map((d, index) =>
                  <Fragment key={d.doc}>
                    <div
                      className={'flex text-sm items-center py-1 px-2 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 hover:text-gray-700 hover:bg-black/5'}
                      onClick={() => selectResult(d.doc, {})}
                    >
                      <Doc className={'w-5 h-5 dark:fill-gray-400 dark:group-hover:fill-gray-300'}/>
                      <span className={'ml-2 font-semibold'}>{d.doc!.split('/').pop()}</span>
                    </div>
                    <>
                      {d.showText?.map((t, i) =>
                        <div
                          className={'pr-2 pl-4 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 hover:text-gray-700 hover:bg-black/5'}
                          key={i}
                          onClick={() => {
                            if (t.type === 'head') {
                              selectResult(d.doc, {
                                position: t.path.join('-'),
                                hash: slugify(t.text)
                              })
                            } else {
                              selectResult(d.doc, {
                                position: t.path.join('-')
                              })
                            }
                          }}
                        >
                          <div className={'flex leading-6 pl-4 border-l border-gray-400/30 py-1'}>
                          <span
                            className={'w-7 h-5 relative top-0.5 mr-2 flex-shrink-0 flex items-center justify-center rounded dark:border-gray-200/10 border text-xs border-gray-200'}
                          >
                            {symbolMap.get(t.type)}
                          </span>
                            <span className={'flex-1 text-sm leading-6'} dangerouslySetInnerHTML={{__html: t.html || ''}}/>
                          </div>
                        </div>
                      )}
                      {d.text?.length > 5 && d.showText?.length < 6 &&
                        <div
                          className={'pr-2 pl-4'}
                          onClick={() => {
                            showMore(index)
                          }}
                        >
                      <span
                        className={'leading-6 pl-[52px] border-l border-gray-400/30 py-1 text-blue-500 cursor-pointer text-sm duration-200 dark:hover:text-blue-600 hover:text-blue-400'
                        }>
                        show more...
                      </span>
                        </div>
                      }
                    </>
                  </Fragment>
                )}
              </>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
