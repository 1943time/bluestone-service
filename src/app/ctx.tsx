'use client'
import {useServerInsertedHTML} from 'next/navigation'
import React, {ReactNode} from 'react'
import {DocCtx, EnvCtx, isDark} from '@/utils'
import {useSetState, useUpdateEffect} from 'react-use'


export function BsContext(props: {children: React.ReactNode, preferences: any}) {
  const [state, setState] = useSetState({
    theme: '',
    openMenu: false,
    openSearch: false,
    showOutLine: false
  })
  useServerInsertedHTML(() =>
    <script dangerouslySetInnerHTML={{__html: `
      if (location.pathname.length > 1) {
        var theme = localStorage.getItem('theme')
        if (!theme || theme === 'system') {
          var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          if (dark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
          } else {
            localStorage.setItem('theme', 'light')
          }
        } else if (theme === 'dark') {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        }
      }
    `}}/>
  )
  useUpdateEffect(() => {
    if (state.theme === 'dark' || (state.theme === 'system' && isDark())) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [state.theme])
  return (
    <DocCtx.Provider value={{
      ...state,
      setState,
      openSearch: state.openSearch,
      preferences: props.preferences
    }}>
      {props.children}
    </DocCtx.Provider>
  )
}

export function EnvContext(props: {ctx: any, children: ReactNode}) {
  return (
    <EnvCtx.Provider value={props.ctx}>
      {props.children}
    </EnvCtx.Provider>
  )
}
