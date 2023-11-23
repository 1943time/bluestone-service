'use client'
import React, {Fragment, useCallback, useContext, useEffect, useRef} from 'react'
import {DocCtx, getOffsetBody} from '@/utils'
import Doc from '@/ui/icons/Doc'
import {useGetSetState} from 'react-use'
import {encodeHtml, getId, slugify} from '@/common'
import {useParams, useRouter} from 'next/navigation'

const highlight = (text: string, key: RegExp) => {
  text = encodeHtml(text)
  // @ts-ignore
  return `${text.replace(key, '<span class="font-semibold text-blue-500">$&</span>')}`
}

type Text = {
  path: string, text: string, type: string, html?: string
}

const symbolMap = new Map([
  ['head', '#'],
  ['paragraph', 'P'],
  ['table-cell', 'TD'],
  ['code-line', '< >']
])
const tagMap = new Map([
  ['h1', 'head'],
  ['h2', 'head'],
  ['h3', 'head'],
  ['h4', 'head'],
  ['h5', 'head'],
  ['td', 'table-cell'],
  ['th', 'table-cell'],
  ['p', 'paragraph'],
  ['figure', 'code-line']
])
export function DocSearch(props: {
}) {
  const ctx = useContext(DocCtx)
  const router = useRouter()
  const params = useParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useGetSetState({
    keyword: '',
    pageSize: 15,
    showResult: [] as Text[],
    index: 0,
    texts: [] as Text[],
    heads: [] as Text[]
  })

  useEffect(() => {
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ctx.setState!({openSearch: true})
      }
      if (e.key.toLowerCase() === 'escape') {
        ctx.setState!({openSearch: false})
      }
    })
    const texts = Array.from(document.querySelectorAll<HTMLElement>('[data-index]')).map(t => {
      return {path: t.dataset.index || '', text: t.dataset.text || t.innerText, type: tagMap.get(t.tagName.toLowerCase())!}
    }).filter(t => !!t.text)
    setState({
      texts,
      heads: texts.filter(t => t.type == 'head')
    })
  }, [])

  const close = useCallback(() => {
    ctx.setState!({
      openSearch: false
    })
  }, [])

  const search = useCallback((keyword: string) => {
    if (!keyword) {
      return setState({showResult: []})
    }
    const key = new RegExp(keyword.replace(/[*.?+$^\[]\(\)\{}\|\/]/g, '\\$&'), 'gi')
    const result = state().texts.filter(t => {
      return t.text.toLowerCase().includes(keyword.toLowerCase())
    }).map(t => {
      t.html = highlight(t.text, key)
      return t
    })
    setState({showResult: result})
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
              setState({keyword: query})
              search(query)
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
        {state().keyword && !state().showResult.length &&
          <div className={'text-sm text-center py-3 text-gray-400 px-5'}>
            No results for "<span className={'dark:text-gray-300 text-gray-500'}>{state().keyword}</span>"
          </div>
        }
        {!state().keyword && !state().heads.length &&
          <div className={'text-sm text-center py-3 text-gray-400 px-5'}>
            Type in keywords to search
          </div>
        }
        <div
          className={`p-2 break-all relative overflow-y-auto max-h-[calc(100vh_-_160px)] dark:text-gray-400 text-gray-600 ${(!state().keyword && !state().heads.length) || (!state().showResult.length && !!state().keyword) ? 'hidden' : ''}`}
          ref={scrollRef}>
          <div>
            {!state().showResult.length && !!state().heads.length &&
              <>
                {state().heads.map((r, i) =>
                  <div
                    className={'pr-2 pl-4 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 hover:text-gray-700 hover:bg-black/5'}
                    key={i}
                    onClick={() => {
                      const target = document.querySelector(`[data-index="${r.path}"]`) as HTMLElement
                      if (target) {
                        target.classList.add('high-block')
                        setTimeout(() => {
                          target.classList.remove('high-block')
                        }, 2000)
                        ctx.setState!({openSearch: false})
                      }
                      router.replace(`/doc/${params.path}#${slugify(r.text)}`)
                    }}
                  >
                    <div className={'flex leading-6 pl-4 border-l border-gray-400/30 py-1'}>
                    <span
                      className={'w-7 h-5 relative top-0.5 mr-2 flex-shrink-0 flex items-center justify-center rounded dark:border-gray-200/10 border text-xs border-gray-200'}
                    >
                      {symbolMap.get(r.type)}
                    </span>
                      <span className={'flex-1 text-sm leading-6'} dangerouslySetInnerHTML={{__html: slugify(r.text)}}/>
                    </div>
                  </div>
                )}
              </>
            }
            {state().showResult.map((r, i) =>
              <div
                className={'pr-2 pl-4 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 hover:text-gray-700 hover:bg-black/5'}
                key={i}
                onClick={() => {
                  const target = document.querySelector(`[data-index="${r.path}"]`) as HTMLElement
                  if (target) {
                    if (r.type !== 'head') {
                      const top = getOffsetBody(target) - 100
                      window.scroll({
                        top,
                        behavior: 'auto'
                      })
                    }
                    target.classList.add('high-block')
                    setTimeout(() => {
                      target.classList.remove('high-block')
                    }, 2000)
                    ctx.setState!({openSearch: false})
                    if (r.type === 'head') {
                      router.replace(`/doc/${(params.path as string[])?.join('/')}#${slugify(r.text)}`)
                    }
                  }
                }}
              >
                <div className={'flex leading-6 pl-4 border-l border-gray-400/30 py-1'}>
                  <span
                    className={'w-7 h-5 relative top-0.5 mr-2 flex-shrink-0 flex items-center justify-center rounded dark:border-gray-200/10 border text-xs border-gray-200'}
                  >
                    {symbolMap.get(r.type)}
                  </span>
                  <span className={'flex-1 text-sm leading-6'} dangerouslySetInnerHTML={{__html: r.html || ''}}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
