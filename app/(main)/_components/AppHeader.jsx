import React from 'react'
import Image from 'next/image'
import { UserButton } from '@stackframe/stack'

const AppHeader = () => {
  return (
    <div className='p-3 shadow-md flex justify-between'>
        <Image src={'/logo.svg'} width={150} height={150} alt='logo'/>
        <UserButton/>
    </div>
  )
}

export default AppHeader
