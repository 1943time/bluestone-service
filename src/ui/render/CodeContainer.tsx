'use client'
import {Code} from '@/ui/render/Code'
import dynamic from 'next/dynamic'
import {escapeScript} from '@/common'
const Katex = dynamic(() => import('./Katex'))
const Mermaid = dynamic(() => import('./Mermaid'))
export function CodeContainer({node, path}: {node: any, path: number[]}) {
  return (
    <>
      {node.language === 'mermaid' &&
        <Mermaid node={node}/>
      }
      {node.language !== 'mermaid' && !node.katex && !node.render &&
        <Code node={node} path={path}/>
      }
      {node.language === 'html' && node.render &&
        <div dangerouslySetInnerHTML={{__html: escapeScript(node.children.map((c: any) => c.children[0].text).join('\n'))}} className={'mb-3'}></div>
      }
      {node.katex &&
        <Katex node={node}/>
      }
    </>
  )
}
