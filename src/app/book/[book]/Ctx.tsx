'use client'

import {useParams, useRouter} from 'next/navigation'
import {useSetState} from 'react-use'
import React, {useCallback, useEffect, useMemo} from 'react'
import {TreeContext} from '@/utils'
import {BsContext} from '@/app/ctx'
export const getOffsetBody = (el: HTMLElement) => {
  let top = 0
  while (el.offsetParent) {
    top += el.offsetTop
    el = el.offsetParent as HTMLElement
  }
  return top
}

const getOpenPaths = (path: string = '') => {
  const stack = path.split('/')
  stack.pop()
  let paths: string[] = []
  while (stack.length) {
    paths.push(stack.join('/'))
    stack.pop()
  }
  return paths
}
const getFirstPath = (map: any[]) => {
  const stack = map.slice()
  while (stack.length) {
    const item = stack.shift()!
    if (!item.folder) {
      return item.path
    } else {
      stack.unshift(...item.children || [])
    }
  }
}

export function BookContext(props: {
  map: any[],
  children: React.ReactNode
  preferences: Record<string, any>
}) {
  const params = useParams()
  const path = (params.path as string[])?.map(p => decodeURIComponent(p)).join('/')
  const [state, setState] = useSetState({
    openKeys: path ? getOpenPaths(path) : [] as string[],
    currentPath: path || '',
    position: ''
  })
  const docs = useMemo(() => {
    let docs: any[] = []
    const stack = props.map.slice()
    while (stack.length) {
      const item = stack.shift()!
      if (!item.folder) {
        docs.push(item)
      } else {
        stack.unshift(...item.children || [])
      }
    }
    return docs
  }, [])

  const router = useRouter()
  useEffect(() => {
    if (!params.path?.length) {
      toFirstPath()
    }
  }, [])

  const toFirstPath = useCallback(() => {
    const path = getFirstPath(props.map)
    setState({openKeys: path ? getOpenPaths(path) : [], currentPath: path})
    router.replace(`/book/${params.book}/${path}`)
  }, [])

  const toPosition = useCallback((position: string) => {
    const target = document.querySelector(`[data-index="${position}"]`) as HTMLElement
    if (target) {
      const top = getOffsetBody(target) - 100
      window.scroll({
        top,
        behavior: 'auto'
      })
      target.classList.add('high-block')
      setTimeout(() => {
        target.classList.remove('high-block')
      }, 2000)
    }
    setState({position: ''})
  }, [])

  useEffect(() => {
    setState({currentPath: path, openKeys: Array.from(new Set([...state.openKeys, ...getOpenPaths(path)]))})
  }, [path])

  return (
    <BsContext preferences={props.preferences}>
      <TreeContext.Provider value={{
        ...state,
        map: props.map,
        docs: docs,
        toPosition,
        setState,
        toFirstChapter: toFirstPath,
        selectPath: path => {
          setState({currentPath: path})
        },
        togglePath: key => {
          if (state.openKeys.includes(key)) {
            setState({openKeys: state.openKeys.filter(k => k !== key)})
          } else {
            setState({openKeys: [...state.openKeys, key]})
          }
        }
      }}>
        {props.children}
      </TreeContext.Provider>
    </BsContext>
  )
}
