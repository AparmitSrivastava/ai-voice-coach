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
  const networkRetryCountRef = useRef(0)
  const maxNetworkRetries = 3
  const lastNetworkErrorTimeRef = useRef(0)
  const networkErrorCooldown = 2000 // 2 seconds cooldown between network error handling
  const conversationRef = useRef([]) // Ref to track latest conversation state




  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find((item) => item.name === DiscussionRoomData.expertName);
      setexpert(Expert);
    }
  }, [DiscussionRoomData]);





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
      console.log('[Web Speech API] Initializing speech recognition...')
      console.log('[Web Speech API] Browser support check:', {
        hasSpeechRecognition: 'SpeechRecognition' in window,
        hasWebkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      })
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.error('[Web Speech API] ERROR: SpeechRecognition API not available in this browser')
        toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
        setloading(false)
        setenableMic(false)
        return
      }
      
      const recognition = new SpeechRecognition()
      console.log('[Web Speech API] Recognition instance created successfully')
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      console.log('[Web Speech API] Configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      })

      let finalTranscript = ''

      recognition.onresult = (event) => {
        console.log('[Web Speech API] onresult event fired:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length
        })
        
        // User is speaking - show animation
        setIsUserSpeaking(true)
        
        // Clear any existing timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current)
          speechTimeoutRef.current = null
        }

        let interimTranscript = ''
        let newFinalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence
          const isFinal = event.results[i].isFinal
          
          console.log('[Web Speech API] Result:', {
            index: i,
            transcript: transcript,
            isFinal: isFinal,
            confidence: confidence
          })
          
          if (isFinal) {
            newFinalTranscript += transcript + ' '
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Update UI with interim results
        const displayText = finalTranscript + interimTranscript
        settranscribe(displayText)
        console.log('[Web Speech API] Transcript updated:', {
          final: finalTranscript,
          interim: interimTranscript,
          display: displayText
        })

        // Process new final transcripts (only the new ones to avoid duplicates)
        if (newFinalTranscript.trim()) {
          const userMessage = newFinalTranscript.trim()
          console.log('[Web Speech API] Processing final transcript:', userMessage)
          
          setconversation(prev => {
            // Check if this message was already added
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.role === 'user' && lastMessage.content === userMessage) {
              console.log('[Web Speech API] Message already in conversation, skipping duplicate')
              conversationRef.current = prev
              return prev
            }
            
            console.log('[Web Speech API] Adding user message to conversation')
            const newConversation = [...prev, {
              role: "user",
              content: userMessage
            }]
            conversationRef.current = newConversation
            return newConversation
          })
          
          updateUserTokenMethod(userMessage)
        }

        // Set timeout to detect when user stops speaking (3 seconds of silence)
        speechTimeoutRef.current = setTimeout(() => {
          console.log('[Web Speech API] 3 seconds of silence detected, triggering AI response')
          setIsUserSpeaking(false)
          
          // Trigger AI response - it will check conversation state internally
          console.log('[Web Speech API] Calling triggerAIResponse...')
          triggerAIResponse()
        }, 3000)
      }

      recognition.onerror = (event) => {
        // Comprehensive error logging for debugging
        const errorDetails = {
          error: event.error,
          message: event.message || 'No message provided',
          timestamp: new Date().toISOString(),
          recognitionState: recognitionRef.current ? 'active' : 'null',
          enableMic: enableMic,
          retryCount: networkRetryCountRef.current
        }
        
        console.error('[Web Speech API] ERROR DETAILS:', errorDetails)
        
        // Handle network errors with detailed logging
        if (event.error === 'network') {
          const now = Date.now()
          const timeSinceLastError = now - lastNetworkErrorTimeRef.current
          
          console.error('[Web Speech API] NETWORK ERROR:', {
            error: 'network',
            description: 'Failed to connect to speech recognition service. This usually means:',
            possibleCauses: [
              'No internet connection',
              'Firewall blocking Google speech recognition servers',
              'Corporate network restrictions',
              'VPN interference',
              'Browser blocking network requests'
            ],
            timeSinceLastError: `${timeSinceLastError}ms`,
            inCooldown: timeSinceLastError < networkErrorCooldown,
            retryCount: networkRetryCountRef.current,
            maxRetries: maxNetworkRetries
          })
          
          // If we just handled a network error recently, ignore this one (cooldown)
          if (timeSinceLastError < networkErrorCooldown && networkRetryCountRef.current > 0) {
            console.log('[Web Speech API] Network error ignored (cooldown period active)')
            return
          }
          
          lastNetworkErrorTimeRef.current = now
          networkRetryCountRef.current += 1
          
          console.warn(`[Web Speech API] Network error detected (attempt ${networkRetryCountRef.current}/${maxNetworkRetries}). Attempting recovery...`)
          setIsUserSpeaking(false)
          
          // Clear any pending timeouts
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current)
            speechTimeoutRef.current = null
          }
          
          // Only show error to user after multiple failures
          if (networkRetryCountRef.current === 2) {
            toast.warning('Experiencing network issues. Retrying...')
          }
          
          // If we've exceeded max retries, stop trying and show error
          if (networkRetryCountRef.current > maxNetworkRetries) {
            console.warn('[Network Error] Max retry attempts reached. Stopping automatic retries.')
            toast.error('Unable to connect to speech recognition service. Please check your internet connection and try reconnecting.')
            setloading(false)
            setenableMic(false)
            networkRetryCountRef.current = 0
            lastNetworkErrorTimeRef.current = 0
            return
          }
          
          // Try to restart recognition after a delay
          if (enableMic && recognitionRef.current) {
            // Use exponential backoff: longer delay for each retry
            const retryDelay = Math.min(1500 * networkRetryCountRef.current, 5000)
            
            setTimeout(() => {
              try {
                if (recognitionRef.current && enableMic) {
                  // Stop current recognition if it's running
                  try {
                    recognitionRef.current.stop()
                  } catch (stopError) {
                    // Ignore stop errors, might already be stopped
                    console.log('Stop error (ignored):', stopError.message)
                  }
                  
                  // Wait before restarting to allow network to recover
                  setTimeout(() => {
                    if (recognitionRef.current && enableMic) {
                      try {
                        recognitionRef.current.start()
                        console.log(`Recognition restarted after network error (attempt ${networkRetryCountRef.current})`)
                        // Note: retry count will be reset in onstart handler
                      } catch (startError) {
                        console.error('Failed to start recognition after network error:', startError)
                        // If start fails, it will trigger another error event
                      }
                    }
                  }, 1500) // Wait before restart
                }
              } catch (e) {
                console.error('Failed to restart recognition after network error:', e)
                // If restart fails completely, show user-friendly message after max retries
                if (networkRetryCountRef.current >= maxNetworkRetries) {
                  toast.error('Network connection issue. Please check your internet connection and try reconnecting.')
                  setloading(false)
                  setenableMic(false)
                  networkRetryCountRef.current = 0
                  lastNetworkErrorTimeRef.current = 0
                }
              }
            }, retryDelay) // Exponential backoff delay
          } else {
            // If recognition ref is not available, we can't retry
            if (networkRetryCountRef.current >= maxNetworkRetries) {
              toast.error('Network connection issue. Please check your internet connection and try reconnecting.')
              setloading(false)
              setenableMic(false)
              networkRetryCountRef.current = 0
              lastNetworkErrorTimeRef.current = 0
            }
          }
          return
        }
        
        // Handle specific error types with detailed logging
        if (event.error === 'not-allowed') {
          console.error('[Web Speech API] PERMISSION ERROR:', {
            error: 'not-allowed',
            description: 'Microphone permission denied by user or browser',
            solution: 'User needs to allow microphone access in browser settings',
            checkBrowserSettings: true
          })
          setloading(false)
          setenableMic(false)
          toast.error('Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.')
          return
        }
        
        if (event.error === 'no-microphone') {
          console.error('[Web Speech API] MICROPHONE ERROR:', {
            error: 'no-microphone',
            description: 'No microphone device found',
            solution: 'Connect a microphone device and try again',
            checkDevices: true
          })
          setloading(false)
          setenableMic(false)
          toast.error('No microphone found. Please connect a microphone and try again.')
          return
        }
        
        if (event.error === 'aborted') {
          console.log('[Web Speech API] Recognition aborted (user action or normal operation)')
          // User manually stopped, this is normal
          return
        }
        
        if (event.error === 'audio-capture') {
          console.error('[Web Speech API] AUDIO CAPTURE ERROR:', {
            error: 'audio-capture',
            description: 'Failed to capture audio from microphone',
            possibleCauses: [
              'Microphone is being used by another application',
              'Microphone hardware issue',
              'Browser audio capture failure'
            ]
          })
          // Don't show toast - might auto-recover
          return
        }
        
        if (event.error === 'service-not-allowed') {
          console.error('[Web Speech API] SERVICE ERROR:', {
            error: 'service-not-allowed',
            description: 'Speech recognition service not allowed',
            possibleCauses: [
              'Browser blocking speech recognition service',
              'Privacy settings preventing service access',
              'Browser extension blocking the service'
            ]
          })
          // Don't show toast - might auto-recover
          return
        }
        
        if (event.error === 'no-speech') {
          console.log('[Web Speech API] No speech detected (normal - user stopped speaking)')
          // This is handled separately above
          return
        }
        
        // Log any other unknown errors
        console.error('[Web Speech API] UNKNOWN ERROR:', {
          error: event.error,
          message: event.message,
          description: 'Unknown speech recognition error occurred',
          fullEvent: event
        })
        
        // For other errors, show a generic message but don't crash
        if (event.error !== 'audio-capture' && event.error !== 'service-not-allowed') {
          toast.error(`Speech recognition error: ${event.error}. Please try reconnecting if the issue persists.`)
        }
      }

      recognition.onstart = () => {
        // Recognition started successfully
        console.log('[Web Speech API] SUCCESS: Speech recognition started successfully')
        const wasRetrying = networkRetryCountRef.current > 0
        console.log('[Web Speech API] Connection state:', {
          wasRetrying: wasRetrying,
          retryCount: networkRetryCountRef.current,
          status: 'connected'
        })
        // Reset retry count and error timestamp on successful start
        networkRetryCountRef.current = 0
        lastNetworkErrorTimeRef.current = 0
        setloading(false)
        // Show success message - if it was a retry, show reconnected message
        if (wasRetrying) {
          toast.success('Reconnected successfully')
        } else {
          toast.success('Connected...')
        }
      }

      recognition.onend = () => {
        console.log('[Web Speech API] Recognition ended')
        // Restart recognition if still enabled
        if (enableMic && recognitionRef.current) {
          try {
            console.log('[Web Speech API] Attempting to restart recognition...')
            recognition.start()
            console.log('[Web Speech API] Recognition restart initiated')
          } catch (e) {
            // Recognition already started or ended
            console.warn('[Web Speech API] Recognition restart skipped:', {
              error: e.message,
              reason: 'Recognition may already be running or in an invalid state'
            })
          }
        } else {
          console.log('[Web Speech API] Recognition not restarted:', {
            enableMic: enableMic,
            hasRecognitionRef: !!recognitionRef.current,
            reason: 'Mic disabled or recognition ref cleared'
          })
        }
      }

      recognitionRef.current = recognition
      
      // Reset retry counter on new connection attempt
      networkRetryCountRef.current = 0
      
      // Add a small delay before starting to ensure everything is ready
      setTimeout(() => {
        try {
          console.log('[Web Speech API] Attempting to start recognition...')
          recognition.start()
          console.log('[Web Speech API] recognition.start() called successfully')
          // Don't set loading to false here - let onstart handler do it
          // This ensures we only show success when recognition actually starts
        } catch (startError) {
          console.error('[Web Speech API] CRITICAL ERROR: Failed to start recognition:', {
            error: startError,
            name: startError.name,
            message: startError.message,
            stack: startError.stack,
            possibleCauses: [
              'Recognition already started',
              'Browser security restrictions',
              'Invalid recognition state',
              'Network connectivity issue'
            ]
          })
          toast.error('Failed to start speech recognition. Please try again.')
          setloading(false)
          setenableMic(false)
          networkRetryCountRef.current = 0
        }
      }, 200) // Slightly longer delay to ensure everything is initialized
    } catch (error) {
      console.error('[Web Speech API] CRITICAL ERROR: Failed to initialize speech recognition:', {
        error: error,
        name: error.name,
        message: error.message,
        stack: error.stack,
        possibleCauses: [
          'Browser does not support Web Speech API',
          'Security restrictions preventing API access',
          'Network connectivity issues',
          'Browser extension blocking the API',
          'Invalid browser configuration'
        ],
        troubleshooting: [
          'Try using Chrome, Edge, or Safari',
          'Check browser security settings',
          'Disable browser extensions temporarily',
          'Ensure you are on HTTPS or localhost',
          'Check browser console for additional errors'
        ]
      })
      toast.error('Failed to start speech recognition. Please check the console for details.')
      setloading(false)
      setenableMic(false)
    }
  };




  // Function to trigger AI response after user stops speaking
  const triggerAIResponse = async () => {
    console.log('[AI Response] triggerAIResponse called')
    
    // Use ref to get latest conversation state (always up-to-date)
    const currentConversation = conversationRef.current
    console.log('[AI Response] Current conversation:', currentConversation)
    
    // Only trigger if there's a user message and we're not already processing
    if (!currentConversation || currentConversation.length === 0) {
      console.log('[AI Response] No conversation found')
      return
    }
    
    const lastMessage = currentConversation[currentConversation.length - 1]
    console.log('[AI Response] Last message:', lastMessage)
    
    if (lastMessage.role !== 'user') {
      console.log('[AI Response] Last message is not from user, skipping')
      return
    }
    
    // Check if we've already processed this message
    const hasResponse = currentConversation.some((msg, index) => 
      index > currentConversation.indexOf(lastMessage) && msg.role === 'assistant'
    )
    
    console.log('[AI Response] Has response already:', hasResponse)
    
    if (hasResponse) {
      console.log('[AI Response] Response already exists, skipping')
      return
    }
    
    console.log('[AI Response] Starting AI response generation...')
    
    try {
      setIsAISpeaking(true)
      console.log('[AI Response] Calling AIModel...')
      
      const lastTwoMsg = currentConversation.slice(-8);
      console.log('[AI Response] Sending to AI:', {
        topic: DiscussionRoomData?.topic,
        coachingOption: DiscussionRoomData?.coachingOption,
        messages: lastTwoMsg
      })
      
      const aiResp = await AIModel(
        DiscussionRoomData?.topic,
        DiscussionRoomData?.coachingOption,
        lastTwoMsg
      );
      
      console.log('[AI Response] AI response received:', aiResp)
      
      setconversation(prev => {
        console.log('[AI Response] Adding AI response to conversation')
        const newConversation = [...prev, aiResp]
        conversationRef.current = newConversation
        return newConversation
      })
      
      await updateUserTokenMethod(aiResp.content)
      
      try {
        console.log('[AI Response] Starting TTS for:', aiResp.content)
        // Use Gemini TTS API for speech generation
        await ConvertTextToSpeech(
          aiResp.content,
          () => {
            console.log('[AI Response] TTS started')
            setIsAISpeaking(true)
          },
          () => {
            console.log('[AI Response] TTS ended')
            setIsAISpeaking(false)
          }
        )
        console.log('[AI Response] TTS completed successfully')
      } catch (error) {
        console.error('[AI Response] TTS error:', error)
        toast.error('Unable to generate audio right now. Please try again.')
        setIsAISpeaking(false)
      }
    } catch (error) {
      console.error('[AI Response] AI model error:', error)
      const errorMessage = error?.message || 'Failed to get AI response. Please try again.'
      toast.error(errorMessage)
      setIsAISpeaking(false)
      
      // Add a fallback message to the conversation
      setconversation(prev => {
        const newConversation = [...prev, {
          role: "assistant",
          content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
        }]
        conversationRef.current = newConversation
        return newConversation
      });
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
    
    // Reset retry counter and error timestamp
    networkRetryCountRef.current = 0
    lastNetworkErrorTimeRef.current = 0
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors when stopping
        console.log('Error stopping recognition (ignored):', e.message)
      }
      recognitionRef.current = null
    }

    // Stop any ongoing audio playback
    // Note: Audio elements are handled individually, no global stop needed

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

            {/* Gemini TTS API handles audio playback */}
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


