'use client'
import {useContext, useEffect, useRef, useState} from 'react'
import {DocCtx, EnvCtx, isDark, isMac} from '@/utils'
import {MenuOutlined, MoreOutlined, SearchOutlined, UnorderedListOutlined} from '@ant-design/icons'
import Link from 'next/link'
import Light from '@/ui/icons/Light'
import Dark from '@/ui/icons/Dark'
import {useSetState} from 'react-use'
import Article from '@/ui/icons/Article'
import IBook from '@/ui/icons/IBook'
export function Header(props: {
  title: string
  book?: boolean
}) {
  const ctx = useContext(DocCtx)
  const env = useContext(EnvCtx)
  const popRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useSetState({
    popOpen: false,
    reportOpen: false,
    ready: false,
    isMac: false
  })
  const [theme, setTheme] = useState('')
  useEffect(() => {
    setTheme(ctx.theme || localStorage.getItem('theme')!)
  }, [ctx.theme])
  useEffect(() => {
    window.addEventListener('click', e => {
      if (!(e.target as HTMLElement).contains(popRef.current!)) {
        setState({popOpen: false})
      }
    })
    setState({
      ready: true,
      isMac: isMac()
    })
  }, [])
  if (!state.ready) return null
  return (
    <header className="header">
      <div className={`header-content ${!!props.book ? 'max-w-[1400px]' : ''}`}>
        <div
          className="header-name"
        >
          {props.book ?
            <>
              <IBook className={'w-5 h-5 fill-gray-700 dark:fill-gray-300 hidden lg:block'}/>
              <div
                className={'lg:hidden'}
                onClick={(e) => {
                  e.stopPropagation()
                  ctx.setState!({openMenu: !ctx.openMenu})
                }}
              >
                <MenuOutlined className={'text-xl dark:text-gray-200 text-gray-500 duration-200 lg:hidden'}/>
              </div>
              <span className={'mx-2 dark:text-gray-200/30 font-light text-gray-300'}>/</span>
            </> :
            null
          }
          {!props.book &&
            <Article className={'w-5 h-5 fill-gray-700 dark:fill-gray-300 mr-1'}/>
          }
          <Link className={'max-w-[calc(100vw_-_170px)] truncate'} href={''}>
            {decodeURIComponent(props.title)}
          </Link>
        </div>
        <div className={'items-center flex'}>
          {!!props.book &&
            <>
              <div
                onClick={() => {
                  ctx.setState!({openSearch: true})
                }}
                className={`dark:bg-black/30 bg-gray-200/70 text-gray-500 rounded duration-200 dark:text-gray-200/50 dark:hover:text-gray-200/70
                text-sm px-3 h-8 leading-8 w-56  relative cursor-pointer ${!props.book ? '' : 'lg:block hidden'}`}
              >
                Search
                <div
                  className={'absolute right-5 top-1/2 h-5 flex items-center -m-2.5 rounded dark:bg-black/30 bg-white px-2 border dark:border-white/20 border-gray-200'}>
                  {state.isMac ?
                    <kbd className={'text-base mr-0.5'}>⌘</kbd> :
                    <kbd className={'text-xs mr-1'}>Ctrl</kbd>
                  }
                  <kbd className={'text-xs'}>K</kbd>
                </div>
              </div>
            </>
          }
          <div
            className={`header-icon flex p-1.5 ${props.book ? 'lg:hidden' : ''}`}
            onClick={() => {
              ctx.setState({
                openSearch: true
              })
            }}
          >
            <SearchOutlined/>
          </div>
          {!props.book &&
            <div
              className={`header-icon lg:flex ml-1 hidden p-1.5 ${ctx.showOutLine ? 'bg-gray-200/80 hover:bg-gray-200/80 dark:bg-black/30 dark:hover:bg-black/30' : ''}`}
              onClick={() => {
                ctx.setState({
                  showOutLine: !ctx.showOutLine
                })
              }}
            >
              <UnorderedListOutlined />
            </div>
          }
          <div
            className={`header-icon flex text-xl ml-1 relative py-1 px-0.5`}
            ref={popRef}
            onClick={(e) => {
              e.stopPropagation()
              setState({popOpen: true})
            }}
          >
            <MoreOutlined/>
            <div
              className={`${state.popOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} duration-200
              absolute top-9 right-0 def-bg dark:text-gray-300 text-gray-600 border rounded text-sm font-normal p-2 w-56 shadow-lg dark:shadow-black/30
              dark:border-gray-200/20  border-gray-200 shadow-gray-400/30
              `}
            >
              <div
                className={'flex items-center whitespace-nowrap px-2 py-1.5 dark:hover:bg-gray-200/10 hover:bg-gray-200/50 rounded'}
                onClick={(e) => {
                  ctx.setState!({
                    theme: theme === 'dark' ? 'light' : 'dark'
                  })
                }}
              >
                {theme !== 'dark' ?
                  <Dark className={'w-4 h-4 fill-gray-600 ml-0.5'}/> :
                  <Light className={'w-4 h-4 fill-gray-300 ml-0.5'}/>
                }
                <span className={'ml-2'}>{theme !== 'dark' ? 'Dark mode' : 'Light mode'}</span>
              </div>
            </div>
          </div>
          <div className={'h-5 w-[1px] dark:bg-gray-200/20 bg-gray-200 ml-1 mr-3'}></div>
          <Link
            href={env['home-site']}
            className={'w-7 h-7 flex items-center justify-center'} target={'_blank'}>
            <img src={env.favicon} alt=""
                 className={`w-6 h-6 dark:shadow-none shadow shadow-gray-300 rounded dark:grayscale duration-300 dark:hover:grayscale-0`}/>
          </Link>
        </div>
      </div>
    </header>
  )
}
