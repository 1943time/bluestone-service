import 'client-only'
import {createContext} from 'react'
import * as Katex from 'katex'

import {bundledLanguages, codeToHtml, bundledThemes} from 'shiki'

export const allLanguages = Object.keys(bundledLanguages)
export const langSet = new Set(allLanguages)
export const codeThemes = new Set(Object.keys(bundledThemes))

export const highlight = async (code: string, lang: string, theme?: string) => {
  if (langSet.has(lang?.toLowerCase())) {
    return codeToHtml(code, {
      theme: codeThemes.has(theme?.toLowerCase() || '') ? theme?.toLowerCase() as any : 'slack-dark',
      lang: lang
    })
  } else {
    return null
  }
}

let k: typeof Katex
export const getKatex = async () => {
  if (k) return k
  k = await import('./ui/render/loadKatex').then(res => {
    // @ts-ignore
    return res.Katex.default
  })
  return k
}

export async function copyToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null

    document.body.appendChild(element)
    element.select()

    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand('copy')
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}

export const DocCtx = createContext<{
  context?: {
    secret: '',
  }
  codeBg?: string
  theme?: string
  codeDark?: boolean
  openMenu: boolean
  openSearch: boolean
  showOutLine?: boolean
  setState: (state: {theme?: string, openMenu?: boolean, openSearch?: boolean, showOutLine?: boolean}) => void
  preferences?: Record<any, any>,
}>({
  openMenu: false,
  openSearch: false,
  setState: () => {}
})

export const EnvCtx = createContext({
  ['home-site']: '',
  ['favicon']: ''
})

export const TreeContext = createContext({
  openKeys: [] as string[],
  currentPath: '',
  map: [] as any[],
  docs: [] as any[],
  position: '',
  setState: (state: {position?: string, openSearch?: boolean}) => {},
  toPosition: (position: string) => {},
  selectPath: (path: string) => {},
  togglePath: (path: string) => {},
  toFirstChapter: () => {}
})


export const isDark = () => window.matchMedia && window.matchMedia?.("(prefers-color-scheme: dark)").matches


export const sizeUnit = (size: string | number) => {
  size = +size
  if (size > 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' gb'
  if (size > 1024) return (size / 1024).toFixed(2) + ' mb'
  return size + ' kb'
}

export const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export const isMac = () => /macintosh|mac os x/i.test(navigator.userAgent)

export const getOffsetBody = (el: HTMLElement) => {
  let top = 0
  while (el.offsetParent) {
    top += el.offsetTop
    el = el.offsetParent as HTMLElement
  }
  return top
}
