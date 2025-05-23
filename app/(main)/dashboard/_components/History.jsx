"use client"
import { UserContext } from '@/app/_context/UserContext';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import { useConvex } from 'convex/react'
import Image from 'next/image';
import React, { useContext, useEffect , useState} from 'react'
import moment from 'moment';
import Link from 'next/link';

const History = () => {

  const convex = useConvex();
  const {userData}=useContext(UserContext)
  const [discussionRoomList, setdiscussionRoomList] = useState([])

  useEffect(() => {
    userData && GetDiscussionRooms()      // mthod is clled only when the user dat is available
  }, [userData])
  




  const GetDiscussionRooms = async()=>{
    const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom , {
      uid:userData?._id
    })
    console.log(result);
    setdiscussionRoomList(result)
  }

  const GetAbstractImages=(option)=>{
    const coachingOption = CoachingOptions.find(item=>item.name==option)
    return coachingOption?.abstract ?? '/ab1.png';
  }


  return (
    <div>
        <h2 className='font-bold text-xl text-black'>Previous Lectures</h2>
        {discussionRoomList?.length==0 &&  <h2 className='text-gray-400'>You don't have any previous lectures</h2>}
    
    <div className='mt-5'>
      {discussionRoomList.map((item,index)=> (item.coachingOption=='Topic Base Lecture' || item.coachingOption=='Learn Language' || item.coachingOption=='Meditation') &&   (
        <div key={index} className='border-b-[1px] pb-3 mb-4 group flex justify-center items-center cursor-pointer'>
          <div className='flex gap-7 items-center'>
            <Image src={GetAbstractImages(item.coachingOption)} alt='abstract'
            width={50} height={50} className='rounded-full h-[50px] w-[50px]'/>
            <div>
            <h2 className='font-bold'>{item.topic}</h2>
            <h2 className='text-gray-400'>{item.coachingOption}</h2>
            <h2 className='text-gray-400 text-sm'>{moment(item._creationTime).fromNow()}</h2>
          </div>
          </div>
          <Link href={"/view-summary/" + item._id}>
          <Button variant='outline' className='invisible group-hover:visible'>View Notes</Button>
       </Link>
           </div>
      ))}
    </div>
    
    </div>
  )
}

export default History


// we have to keep in mind that only qa prep and mock inter view has to come in feeback and rest have to come in notes