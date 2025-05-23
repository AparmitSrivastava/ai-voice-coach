"use client"
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React from 'react'
import { CoachingOptions } from '@/services/Options';
import { api } from '@/convex/_generated/api';
import moment from 'moment';
import Chatbox from '../../discussion-room/[roomid]/_components/ChatBox';
import SummaryBox from '../_components/SummaryBox';

const ViewSummary = () => {
    const { roomid } = useParams()
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
    console.log(DiscussionRoomData);

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find(item => item.name == option)
        return coachingOption?.abstract ?? '/ab1.png';
    }

    return (
        <div className='-mt-10'>
            <div className='flex justify-between items-end'>
                <div className='flex items-center gap-7'>
                    <Image src={GetAbstractImages(DiscussionRoomData.coachingOption)} alt='abstract' width={100} height={100}
                        className='rounded-full w-[70px] h-[70px]'
                    />
                    <div>
                        <h2 className='font-bold text-lg'>{DiscussionRoomData.topic}</h2>
                        <h2 className='text-gray-400'>{DiscussionRoomData.coachingOption}</h2>
                    </div>
                </div>
                <h2 className='text-gray-400'>{moment(DiscussionRoomData?._creationTime).fromNow()}</h2>
            </div>


            <div className='grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5 '>
                <div className='col-span-3'>
                    <h2 className='text-lg font-bold mb-6'>Summary of your conversation</h2>
                    <SummaryBox summary={DiscussionRoomData?.summary}/>
                </div>
                <div className='col-span-2'>
                    <h2 className='text-lg font-bold mb-6'>Your conversation</h2>
                   { DiscussionRoomData?.conversation && <Chatbox conversation={DiscussionRoomData?.conversation}
                   coachingOption={DiscussionRoomData?.coachingOption}
                   enableFeedbackNotes={false}
                   />}
                </div>
            </div>


        </div>
    )
}

export default ViewSummary
