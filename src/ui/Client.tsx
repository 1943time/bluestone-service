'use client'
import React, {useEffect, useState} from 'react'
export function Client(props: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  return (
    <div>
      {ready && props.children}
    </div>
  )
}
