"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { CoachingExpert } from '@/services/Options'
import { api } from '@/convex/_generated/api'
import Image from 'next/image'
import { UserButton } from '@stackframe/stack'
import { Button } from '@/components/ui/button'
// import RecordRTC from 'recordrtc'
const RecordRTC = dynamic(()=>import("recordrtc"), {ssr:false})

const page = () => {
  const { roomid } = useParams() //this how we extract the id 
  console.log(roomid);
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid })
  const [expert, setexpert] = useState()
  const [enableMic, setenableMic] = useState(false)
  const recorder = useRef()
  let silenceTimeout



  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name == DiscussionRoomData.expertName)
      console.log(Expert);
      setexpert(Expert)
    }
  }, [DiscussionRoomData]) // if we dont use useeffect then error will come saying that expert is undef coz it takes time to call the data from diff file so we have to do this


  const ConnectToServer = () => {
    // CODE TO GET MICROPHONE ACCESS
    setenableMic(true)
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=pcm',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              // if (!realtimeTranscriber.current) return;
              // Reset the silence detection timer on audio input
              clearTimeout(silenceTimeout);

              const buffer = await blob.arrayBuffer();

              //console.log(buffer)

              // Restart the silence detection timer
              silenceTimeout = setTimeout(() => {
                console.log('User stopped talking');
                // Handle user stopped talking (e.g., send final transcript, stop recording, etc.)
              }, 2000);
            },
          });
          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  }


  const disconenct = (e)=>{
    e.preventDefault();
    recorder.current.pauseRecording()
    recorder.current=null;
    setenableMic(false)
  }



  return (
    <div className='-mt-12'>
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
            {
              !enableMic ? <Button onClick={ConnectToServer} >Connect</Button>
                :
                <Button variant='destructive' onClick={disconnect}>Disconnect</Button>
            }
          </div>



        </div>

        <div>
          <div className='h-[60vh] border rounded-4xl bg-secondary flex flex-col items-center justify-center relative'>
            <h2>Chat Section</h2>
          </div>
          <h2 className='mt-5 text-gray-400 text-sm'>At the end of the sessiom we will automatically generate notes/feedback from your conversation</h2>
        </div>


      </div>
    </div>
  )
}

export default page


// read about discussion-room folder , [roomid] in the notes.md line 120
// http://localhost:3000/discussion-room/1 or any other http://localhost:3000/discussion-room/1463746384 will redirect to the page.jsx