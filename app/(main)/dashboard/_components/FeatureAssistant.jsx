"use client"
import { Button } from '@/components/ui/button'
import { CoachingOptions } from '@/services/Options'
import { useUser } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'
import { BlurFade } from '@/components/magicui/blur-fade'
import UserInputDialog from './UserInputDialog'

const FeatureAssistant = () => {
    const user = useUser()
    return (
        <div>
            <div className='flex justify-between items-center'>
                <div className=''>
                    <h2 className='font-medium text-lg text-gray-600'>My Workspace</h2>
                    <h2 className='text-3xl font-bold'>Welcome back, {user?.displayName} </h2>
                </div>
                <Button className="bg-orange-700 text-white shadow-lg shadow-orange-900/40 hover:bg-orange-600 transition-color hover:shadow-orange-900/60 transition-shadow">
                    Profile
                </Button>

            </div>


            {/* <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 mt-10'>
                {CoachingOptions.map((option, index) => (
                    <BlurFade key={option.icon} delay={0.5 + index * 0.05} inView>
                        <UserInputDialog coachingOption={option}>
                            <div key={index} className='p-3 bg-secondary rounded-2xl flex flex-col justify-center items-center w-[150px]'>
                                <Image src={option.icon} alt={option.name}
                                    height={150}
                                    width={150}
                                    className='h-[70px] w-[70px]
                       hover:rotate-12 cursor-pointer transition-all'/>
                                <h2 className='font-semibold mt-2'>{option.name}</h2>
                            </div>
                        </UserInputDialog>

                    </BlurFade>
                ))}
            </div> */}







            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 mt-10">
  {CoachingOptions.map((option, index) => (
    <BlurFade key={option.icon} delay={0.5 + index * 0.05} inView>
      <div className="p-3 bg-secondary rounded-2xl flex flex-col justify-center items-center w-[150px]">
        <UserInputDialog coachingOption={option}>
          <div className=" flex flex-col justify-center items-center w-[150px] cursor-pointer ">
            <Image
              src={option.icon}
              alt={option.name}
              height={150}
              width={150}
              className="h-[70px] w-[70px]
              transition-all hover:rotate-12"
            />
            <h2 className="font-semibold mt-2">{option.name}</h2>
          </div>
        </UserInputDialog>
      </div>
    </BlurFade>
  ))}
</div>


        </div>
    )
}

export default FeatureAssistant
