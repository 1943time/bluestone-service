'use client'

import {useCallback, useEffect} from 'react'
import {getKatex} from '@/utils'

export function Highlight(props: {
  theme?: string
}) {
  const click = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLDivElement
    if (!el) return
    if (el.dataset.fnc) {
      const target = document.querySelector(`[data-fnd-name="${el.dataset.fncName}"]`) as HTMLElement
      if (target) {
        window.scroll({
          top: target.getBoundingClientRect().top + document.documentElement.scrollTop - 64
        })
      }
    }
    if (el.dataset.fnd) {
      const target = document.querySelector(`[data-fnc-name="${el.dataset.fndName}"]`) as HTMLElement
      if (target) {
        window.scroll({
          top: target.getBoundingClientRect().top + document.documentElement.scrollTop - 64
        })
      }
    }
  }, [])
  useEffect(() => {
    const inlineMath = document.querySelectorAll('.inline-math')
    if (inlineMath.length) {
      getKatex().then(k => {
        inlineMath.forEach((el) => {
          k.render((el as HTMLElement).dataset.math || '', el as HTMLElement, {
            strict: false,
            output: 'html',
            throwOnError: false,
            macros: {
              '\\f': '#1f(#2)'
            }
          })
        })
      })
    }
    window.addEventListener('click', click)
  }, [])
  return null
}
