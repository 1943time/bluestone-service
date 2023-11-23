'use client'
import {useContext, useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {useSetState} from 'react-use'
import {DocCtx} from '@/utils'

export function Leading(props: {
  schema: any[]
  book?: boolean
}) {
  const ctx = useContext(DocCtx)
  const [state, setState] = useSetState({
    index: -1
  })
  const heads = useMemo(() => {
    setState({index: -1})
    return props.schema.filter(n => n.level > 1 && n.level < 5 && n.type === 'head').map(h => {
      return {id: h.id, title: h.title, level: h.level}
    })
  }, [props.schema])
  const reverseHeads = useMemo(() => heads.slice().reverse(), [heads])

  useEffect(() => {
    const scroll = (e: Event) => {
      if (!heads.length) return
      const top = document.documentElement.scrollTop
      const find = reverseHeads.some((h, i) => {
        const dom = document.querySelector(`#${h.id}`) as HTMLElement
        if (dom && top > dom.parentElement!.offsetTop - 66) {
          setState({index: heads.length - 1 - i})
          return true
        }
      })
      if (!find) setState({index: -1})
    }
    window.addEventListener('scroll', scroll)
    return () => {
      window.removeEventListener('scroll', scroll)
    }
  }, [props.schema])
  return (
    <div className={`leading-container ${ctx.showOutLine || props.book ? 'visible' : ''} ${props.book ? 'xl:block' : 'lg:block'}`}>
      <div className={`leading`}>
        {(!!heads.length || !props.book) &&
          <div className="leading-title">{props.book ? 'On this page' : 'Table of Contents'}</div>
        }
        <div className="leading-list">
          {heads.map((h, i) =>
            <Link
              className={`leading-item ${i === state.index ? 'active' : ''} block`} style={{paddingLeft: (h.level - 2) * 16}}
              key={i}
              href={`#${h.id}`}
            >
              {h.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
