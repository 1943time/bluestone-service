'use client'
import SetTheme from '@/ui/SetTheme'
import {FrownOutlined} from '@ant-design/icons'

export default function Error() {
  return (
    <>
      <SetTheme/>
      <div className={'flex justify-center flex-col items-center h-screen text-gray-700 dark:text-gray-200 pb-10'}>
        <span className={'text-xl font-medium mt-5 flex items-center'}>
          <FrownOutlined className={'mr-1'}/>
          Sorry, the server experienced a little glitch
        </span>
      </div>
    </>
  )
}
