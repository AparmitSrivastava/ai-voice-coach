  "use client"
  import React, { useState, useEffect, useRef } from 'react'
  import { useParams } from 'next/navigation'
  import { useQuery } from 'convex/react'
  import { CoachingExpert } from '@/services/Options'
  import { api } from '@/convex/_generated/api'
  import Image from 'next/image'
  import { UserButton } from '@stackframe/stack'
  import { Button } from '@/components/ui/button'



  let RecordRTCConstructor = useRef(null); // this will hold the real constructor

const page = () => {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const [expert, setexpert] = useState();
  const [enableMic, setenableMic] = useState(false);
  const recorder = useRef();
  let silenceTimeout;

  // 👇 load RecordRTC dynamically ONCE on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("recordrtc").then((mod) => {
        RecordRTCConstructor = mod.default;
      });
    }
  }, []);

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name == DiscussionRoomData.expertName);
      setexpert(Expert);
    }
  }, [DiscussionRoomData]);

  const ConnectToServer = () => {
    setenableMic(true);

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          if (!RecordRTCConstructor) {
            console.error("RecordRTC not loaded yet.");
            return;
          }

          recorder.current = new RecordRTCConstructor(stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=pcm',
            recorderType: RecordRTCConstructor.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              clearTimeout(silenceTimeout);
              const buffer = await blob.arrayBuffer();
              silenceTimeout = setTimeout(() => {
                console.log('User stopped talking');
              }, 2000);
            },
          });

          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };

  const disconnect = (e) => {
    e.preventDefault();
    recorder.current?.pauseRecording();
    recorder.current = null;
    setenableMic(false);
  };













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








