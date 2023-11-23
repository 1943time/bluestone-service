import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {join} from 'path'
import {readFile} from 'fs/promises'
import '../styles/editor.scss'
import {BsContext, EnvContext} from '@/app/ctx'
import {getEnvs} from '@/app/env'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: '',
  description: ''
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const env = await getEnvs()
  return (
    <html lang="en">
    <head>
      <link rel="icon" type="image/png" href={env?.favicon} />
    </head>
    <EnvContext ctx={env}>
      <body className={inter.className}>{children}</body>
    </EnvContext>
    </html>
  )
}
