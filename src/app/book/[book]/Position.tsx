'use client'
import {useContext, useEffect} from 'react'
import {TreeContext} from '@/utils'

export function Position() {
  const tree = useContext(TreeContext)
  useEffect(() => {
    if (tree.position) {
      setTimeout(() => {
        tree.toPosition(tree.position)
      }, 100)
    }
  }, [])
  return null
}
