"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { CoachingExpert } from '@/services/Options'
import { api } from '@/convex/_generated/api'
import Image from 'next/image'
import { UserButton } from '@stackframe/stack'
import { Button } from '@/components/ui/button'

const page = () => {
  const { roomid } = useParams() //this how we extract the id 
  console.log(roomid);
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid })
  const [expert, setexpert] = useState()

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name == DiscussionRoomData.expertName)
      console.log(Expert);
      setexpert(Expert)
    }
  }, [DiscussionRoomData]) // if we dont use useeffect then error will come saying that expert is undef coz it takes time to call the data from diff file so we have to do this



  return (
    <div>
      <h2 className="text-2xl font-bold">{DiscussionRoomData?.coachingOption}</h2>
      <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>



        <div className='lg:col-span-2'>
          <div className=' h-[60vh] border rounded-4xl bg-secondary flex flex-col items-center justify-center relative'>
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt="avatar"
                width={200}
                height={200}
                className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
              />
            )}

            <h2 className='text-[20px] text-orange-700 font-semibold'>{expert?.name}</h2>

            <div className='p-5 px-10 rounded-lg bg-gray-200 absolute bottom-7 right-8'>
              <UserButton />
            </div>

          </div>

          <div className='mt-5 flex justify-center items-center'>
              <Button>Connect</Button>
          </div>



        </div>


        <div className='h-[60vh] border rounded-4xl bg-secondary flex flex-col items-center justify-center relative'>
          <h2>Chat Section</h2>

        </div>



      </div>
    </div>
  )
}

export default page


// read about discussion-room folder , [roomid] in the notes.md line 120
// http://localhost:3000/discussion-room/1 or any other http://localhost:3000/discussion-room/1463746384 will redirect to the page.jsx