'use client'
import React, {ReactNode, useLayoutEffect} from 'react'
import {DocCtx, EnvCtx, isDark} from '@/utils'
import {useSetState, useUpdateEffect} from 'react-use'
import {bundledThemes} from 'shiki'
import Script from 'next/script'
const codeThemes = new Set(Object.keys(bundledThemes))


export function BsContext(props: {children: React.ReactNode, preferences: any}) {
  const [state, setState] = useSetState({
    theme: '',
    openMenu: false,
    openSearch: false,
    showOutLine: false,
    codeBg: '',
    codeDark: false
  })
  useLayoutEffect(() => {
    const codeTheme = codeThemes.has(props.preferences.codeTheme) ? props.preferences.codeTheme as any : 'slack-dark'
    bundledThemes[codeTheme as keyof typeof bundledThemes]?.().then(res => {
      setState({
        codeBg: res.default.colors?.['editor.background'],
        codeDark: res.default.type === 'dark'
      })
    })
    setState({
      codeDark: localStorage.getItem( 'theme') === 'dark'
    })
  }, [])
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
      codeBg: state.codeBg,
      codeDark: state.codeDark,
      preferences: {
        ...props.preferences,
        codeTheme: codeThemes.has(props.preferences.codeTheme) ? props.preferences.codeTheme as any : 'slack-dark'
      }
    }}>
      <Script>
        {`if (location.pathname.length > 1) {
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
      }`}
      </Script>
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
