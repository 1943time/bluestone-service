'use client'
import {useLayoutEffect, useMemo, useRef} from 'react'
import {getKatex} from '@/utils'

export default function Katex({node, inline}: { node: any, inline?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    getKatex().then(k => {
      k.render(node.code, ref.current!, {
        strict: false,
        output: 'mathml',
        throwOnError: false,
        displayMode: !inline,
        macros: {
          '\\f': '#1f(#2)'
        }
      })
    })
  }, [])
  if (inline) return <span ref={ref}></span>
  return (
    <div ref={ref} className={`mb-4`}></div>
  )
}

