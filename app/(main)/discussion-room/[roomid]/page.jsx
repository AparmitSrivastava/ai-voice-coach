"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { CoachingExpert } from "@/services/Options";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { AIModel, getToken } from "@/services/GlobalServices";
import { RealtimeTranscriber } from "assemblyai";
import { Loader2Icon } from "lucide-react";
import Chatbox from "./_components/Chatbox";

const page = () => {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const [expert, setexpert] = useState();
  const [enableMic, setenableMic] = useState(false);
  const recorder = useRef();
  const recordRTCRef = useRef(null);
  const [loading, setloading] = useState(false)
  let silenceTimeout;
  let waitForPause;
  const UpdateConversion = useMutation(api.DiscussionRoom.UpdateConversation);
  const realtimeTranscriber = useRef(null)
  const [transcribe, settranscribe] = useState()
  const [conversation, setconversation] = useState([])
  const [audioUrl, setaudioUrl] = useState()
  let texts = {}
  const [enableFeedbackNotes, setenableFeedbackNotes] = useState(false)




  useEffect(() => {
    if (typeof window !== "undefined") {
      import("recordrtc").then((mod) => {
        recordRTCRef.current = mod.default;
      });
    }
  }, []);

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find((item) => item.name === DiscussionRoomData.expertName);
      setexpert(Expert);
    }
  }, [DiscussionRoomData]);




  const ConnectToServer = async () => {
    setenableMic(true);
    setloading(true)
    // init assembly ai
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),     //we need to create a token each time and this token is created on the server side so making a new folder api , then inside it folder - getToken in the app directory
      sample: 16_000
    })

    // making the socket part
    realtimeTranscriber.current.on('transcript', async (transcript) => {
      console.log(transcript);

      let msg = ''

      if (transcript.message_type == 'FinalTranscript') {
        setconversation(prev => [...prev, {
          role: "user",
          content: transcript.text
        }]);
      }

      texts[transcript.audio_start] = transcript?.text
      const keys = Object.keys(texts)
      keys.sort((a, b) => a - b)

      for (const key of keys) {
        if (texts[key]) {
          msg += `${texts[key]}`
        }
      }

      settranscribe(msg)
    })

    await realtimeTranscriber.current.connect() //connect with the assemblyAi
    setloading(false)

    // CODE TO GET MICROPHONE ACCESS
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          if (!recordRTCRef.current) {
            console.error("RecordRTC not loaded yet.");
            return;
          }

          recorder.current = new recordRTCRef.current(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm",
            recorderType: recordRTCRef.current.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              if (!realtimeTranscriber.current) return;
              // Reset the silence detection timer on audio input
              clearTimeout(silenceTimeout);

              const buffer = await blob.arrayBuffer();
              console.log(buffer)

              realtimeTranscriber.current.sendAudio(buffer), //sending the encoded audio to the socket part

                // Restart the silence detection timer
                silenceTimeout = setTimeout(() => {
                  console.log("User stopped talking");
                  // Handle user stopped talking (e.g., send final transcript, stop recording, etc.)
                }, 2000);
            },
          });

          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };




 useEffect(() => {
  async function fetchData() {
    if (
      conversation.length > 0 &&
      conversation[conversation.length - 1].role === 'user'
    ) {
      const lastTwoMsg = conversation.slice(-8);
      const aiResp = await AIModel(
        DiscussionRoomData.topic,
        DiscussionRoomData.coachingOption,
        lastTwoMsg
      );
      const url = await ConvertTextToSpeech(aiResp.content , DiscussionRoomData.expertName)
      console.log(url);
      setaudioUrl(url)
      setconversation(prev => [...prev, aiResp]);
    }
  }
  fetchData();
}, [conversation]);


  




  // const disconnect = async(e) => {
  //   e.preventDefault();
  //   await realtimeTranscriber.current.close()
  //   recorder.current?.pauseRecording();
  //   recorder.current = null;
  //   setenableMic(false);
  // };
  const disconnect = async (e) => {
    e.preventDefault();
    setloading(true)
    if (realtimeTranscriber.current) {
      await realtimeTranscriber.current.close();
    }
    recorder.current?.pauseRecording();
    recorder.current = null;
    setenableMic(false);

    await UpdateConversion({      //calling the fnc
      id:DiscussionRoomData._id,  
      conversation:conversation,
    })

    setloading(false)
    setenableFeedbackNotes(true)
  };








  return (
    <div className="-mt-12">
      <h2 className="text-2xl font-bold">{DiscussionRoomData?.coachingOption}</h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="h-[60vh] border rounded-4xl bg-secondary flex flex-col items-center justify-center relative">
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt="avatar"
                width={200}
                height={200}
                className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
              />
            )}
            <h2 className="text-[20px] text-orange-700 font-semibold">{expert?.name}</h2>

            <audio src={audioUrl} type="audio/mp3" autoPlay/>
            <div className="p-5 px-10 rounded-lg bg-gray-200 absolute bottom-7 right-8">
              <UserButton />
            </div>
          </div>
          <div className="mt-5 flex justify-center items-center">
            {!enableMic ? (
              <Button onClick={ConnectToServer} disabled={loading} > {loading && <Loader2Icon className="animate-spin" />}  Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect} disabled={loading}>  {loading && <Loader2Icon className="animate-spin" />} Disconnect</Button>
            )}
          </div>
        </div>
        <div>
          <Chatbox conversation={conversation} enableFeedbackNotes={enableFeedbackNotes}/>
        </div>
      </div>


      <div>
        <h2>{transcribe}</h2>
      </div>

    </div>
  );
};

export default page;



// // read about discussion-room folder , [roomid] in the notes.md line 120
// // http://localhost:3000/discussion-room/1 or any other http://localhost:3000/discussion-room/1463746384 will redirect to the page.jsx


