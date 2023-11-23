'use client'
import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {DocCtx} from '@/utils'
import mermaid from 'mermaid'

export default function Mermaid(props: {
  node: any
}) {
  const id = useMemo(() => 'm' + Math.floor(Math.random() * 1000), [])
  const ctx = useContext(DocCtx)
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const initial = async () => {
    mermaid.initialize({
      theme: ctx.theme! || localStorage.getItem('theme')!
    })
    const res = await mermaid.render(id, props.node.code)
    ref.current!.innerHTML = res.svg
    setReady(true)
  }
  useEffect(() => {
    initial()
  }, [ctx.theme])
  return (
    <div className={`mermaid-container pre ${!ready ? 'hide' : ''}`} ref={ref}></div>
  )
}
