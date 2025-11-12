"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { CoachingExpert } from "@/services/Options";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { AIModel, ConvertTextToSpeech } from "@/services/GlobalServices";
import { Loader2Icon } from "lucide-react";
import Chatbox from "./_components/Chatbox";
import { toast } from "sonner";
import { UserContext } from "@/app/_context/UserContext";
import { calculateTokenCount } from "@/utils/tokenUtils";

const page = () => {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const [expert, setexpert] = useState();
  const [enableMic, setenableMic] = useState(false);
  const { userData, setuserData } = useContext(UserContext)
  const [loading, setloading] = useState(false)
  const UpdateConversion = useMutation(api.DiscussionRoom.UpdateConversation);
  const recognitionRef = useRef(null)
  const [transcribe, settranscribe] = useState('')
  const [conversation, setconversation] = useState([])
  const [enableFeedbackNotes, setenableFeedbackNotes] = useState(false)
  const updateUserToken = useMutation(api.users.UpdateUserToken)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const speechTimeoutRef = useRef(null)




  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find((item) => item.name === DiscussionRoomData.expertName);
      setexpert(Expert);
    }
  }, [DiscussionRoomData]);

  // Load voices when component mounts for TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])




  const ConnectToServer = async () => {
    if (typeof window === 'undefined' || (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Check if we're on HTTPS or localhost (required for microphone access)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      toast.error('Microphone access requires HTTPS. Please use a secure connection.')
      return
    }

    setenableMic(true);
    setloading(true)

    try {
      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop())
      } catch (permError) {
        console.error('Microphone permission denied:', permError)
        setloading(false)
        setenableMic(false)
        if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
          toast.error('Microphone permission denied. Please allow microphone access in your browser settings and try again.')
        } else if (permError.name === 'NotFoundError') {
          toast.error('No microphone found. Please connect a microphone and try again.')
        } else {
          toast.error('Failed to access microphone. Please check your browser settings.')
        }
        return
      }

      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      let finalTranscript = ''

      recognition.onresult = (event) => {
        // User is speaking - show animation
        setIsUserSpeaking(true)
        
        // Clear any existing timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current)
        }

        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Update UI with interim results
        settranscribe(finalTranscript + interimTranscript)

        // Process final transcripts
        if (finalTranscript.trim()) {
          const userMessage = finalTranscript.trim()
          setconversation(prev => [...prev, {
            role: "user",
            content: userMessage
          }]);
          updateUserTokenMethod(userMessage)
          finalTranscript = '' // Reset for next final transcript
        }

        // Set timeout to detect when user stops speaking (3 seconds of silence)
        speechTimeoutRef.current = setTimeout(() => {
          setIsUserSpeaking(false)
          // After 3 seconds of silence, trigger AI response
          triggerAIResponse()
        }, 3000)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        
        if (event.error === 'no-speech') {
          // User stopped speaking - wait 3 seconds then trigger AI response
          setIsUserSpeaking(false)
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current)
          }
          speechTimeoutRef.current = setTimeout(() => {
            triggerAIResponse()
          }, 3000)
          return
        }
        
        if (event.error === 'not-allowed') {
          setloading(false)
          setenableMic(false)
          toast.error('Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.')
          return
        }
        
        if (event.error === 'no-microphone') {
          setloading(false)
          setenableMic(false)
          toast.error('No microphone found. Please connect a microphone and try again.')
          return
        }
        
        if (event.error === 'aborted') {
          // User manually stopped, this is normal
          return
        }
        
        // For other errors, show a generic message
        toast.error(`Speech recognition error: ${event.error}. Please try again.`)
      }

      recognition.onend = () => {
        // Restart recognition if still enabled
        if (enableMic && recognitionRef.current) {
          try {
            recognition.start()
          } catch (e) {
            // Recognition already started or ended
            console.log('Recognition restart skipped:', e.message)
          }
        }
      }

      recognitionRef.current = recognition
      recognition.start()
      
      setloading(false)
      toast.success('Connected...')
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      toast.error('Failed to start speech recognition. Please try again.')
      setloading(false)
      setenableMic(false)
    }
  };




  // Function to trigger AI response after user stops speaking
  const triggerAIResponse = async () => {
    // Only trigger if there's a user message and we're not already processing
    if (conversation.length > 0 && conversation[conversation.length - 1].role === 'user') {
      // Check if we've already processed this message
      const lastMessage = conversation[conversation.length - 1]
      const hasResponse = conversation.some((msg, index) => 
        index > conversation.indexOf(lastMessage) && msg.role === 'assistant'
      )
      
      if (!hasResponse) {
        try {
          setIsAISpeaking(true)
          const lastTwoMsg = conversation.slice(-8);
          const aiResp = await AIModel(
            DiscussionRoomData.topic,
            DiscussionRoomData.coachingOption,
            lastTwoMsg
          );
          
          setconversation(prev => [...prev, aiResp]);
          await updateUserTokenMethod(aiResp.content)
          
          try {
            // Use Web Speech API for TTS (plays automatically)
            await ConvertTextToSpeech(
              aiResp.content, 
              DiscussionRoomData.expertName,
              () => setIsAISpeaking(true), // onStart
              () => setIsAISpeaking(false) // onEnd
            )
          } catch (error) {
            console.error('Failed to create audio from AI response', error)
            toast.error('Unable to generate audio right now. Please try again.')
            setIsAISpeaking(false)
          }
        } catch (error) {
          console.error('Failed to get AI response:', error)
          const errorMessage = error?.message || 'Failed to get AI response. Please try again.'
          toast.error(errorMessage)
          setIsAISpeaking(false)
          
          // Add a fallback message to the conversation
          setconversation(prev => [...prev, {
            role: "assistant",
            content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
          }]);
        }
      }
    }
  }








  const disconnect = async (e) => {
    e.preventDefault();
    setloading(true)
    
    // Clear any pending timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = null
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    // Stop any ongoing speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setIsUserSpeaking(false)
    setIsAISpeaking(false)
    setenableMic(false);
    toast.success('Disconnected')

    await UpdateConversion({      //calling the fnc
      id: DiscussionRoomData._id,
      conversation: conversation,
    })
    setloading(false)
    setenableFeedbackNotes(true)
  };

  

  const updateUserTokenMethod = async (text) => {
    if (!userData?._id) {
      return
    }

    const tokenCount = calculateTokenCount(text)
    if (tokenCount === 0) {
      return
    }

    const currentCredits = Number(userData?.credits ?? 0)
    const updatedCredits = Math.max(currentCredits - tokenCount, 0)

    try {
      await updateUserToken({
        id: userData._id,
        credits: updatedCredits,
      })

      setuserData((prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          credits: updatedCredits,
        }
      })
    } catch (error) {
      console.error('Failed to update user credits', error)
      toast('Unable to update credits right now. Please try again later.')
    }
  }







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
                className={`h-[80px] w-[80px] rounded-full object-cover ${
                  isUserSpeaking 
                    ? 'animate-pulse ring-4 ring-blue-500 ring-opacity-75' 
                    : isAISpeaking 
                    ? 'animate-pulse ring-4 ring-green-500 ring-opacity-75'
                    : 'animate-pulse'
                }`}
              />
            )}
            <h2 className="text-[20px] text-orange-700 font-semibold">{expert?.name}</h2>
            
            {/* Speaking indicators */}
            {isUserSpeaking && (
              <div className="mt-4 flex items-center gap-2 text-blue-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-medium">You're speaking...</span>
              </div>
            )}
            
            {isAISpeaking && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-medium">{expert?.name} is speaking...</span>
              </div>
            )}

            {/* Web Speech API handles audio playback automatically */}
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
          <Chatbox conversation={conversation}
            enableFeedbackNotes={enableFeedbackNotes}
            coachingOption={DiscussionRoomData?.coachingOption} />
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


