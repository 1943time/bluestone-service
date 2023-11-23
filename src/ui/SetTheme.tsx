'use client'
import {useServerInsertedHTML} from 'next/navigation'
import React from 'react'

export default function SetTheme() {
  useServerInsertedHTML(() =>
    <script dangerouslySetInnerHTML={{__html: `
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
    `}}/>
  )
  return null
}
