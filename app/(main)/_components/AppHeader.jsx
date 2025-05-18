import React from 'react'
import Image from 'next/image'

const AppHeader = () => {
  return (
    <div>
        <Image src={'/logo.svg'} width={100} height={100}/>
    </div>
  )
}

export default AppHeader
