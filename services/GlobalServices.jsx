import OpenAI from "openai"
import { CoachingOptions } from './Options';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser:true
})



const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate limit')
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
        console.log(`Rate limit hit. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      throw error
    }
  }
}

export const AIModel = async(topic,coachingOption , lastTwoConversation)=>{
  
  const option = CoachingOptions.find((item)=>item.name === coachingOption)
  const PROMPT = (option.prompt).replace('{user_topic}' , topic)

  try {
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {role:'assistant' , content:PROMPT},
          ...lastTwoConversation
        ],
      })
    })
    
    return completion.choices[0].message
  } catch (error) {
    console.error('AIModel error:', error)
    
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again. The AI service is temporarily busy.')
    }
    
    if (error?.status === 401 || error?.message?.includes('401')) {
      throw new Error('API key is invalid or expired. Please check your configuration.')
    }
    
    if (error?.status === 500 || error?.message?.includes('500')) {
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.')
    }
    
    throw new Error(error?.message || 'Failed to get AI response. Please try again.')
  }
}


export const AIModelToGenerateFeedbackAndNotes = async(coachingOption , conversation)=>{
  
  const option = CoachingOptions.find((item)=>item.name === coachingOption)
  const PROMPT = (option.summeryPrompt)

  try {
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          ...conversation,
          {role:'assistant' , content:PROMPT},
        ],
      })
    })
    
    return completion.choices[0].message
  } catch (error) {
    console.error('AIModelToGenerateFeedbackAndNotes error:', error)
    
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }
    
    if (error?.status === 401 || error?.message?.includes('401')) {
      throw new Error('API key is invalid or expired. Please check your configuration.')
    }
    
    throw new Error(error?.message || 'Failed to generate feedback. Please try again.')
  }
}


export const ConvertTextToSpeech = async (text, voiceId, onStart, onEnd) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis is not supported in this browser'))
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a voice matching the voiceId (e.g., "Joanna", "Salli", "Joey")
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes(voiceId?.toLowerCase() || '') ||
      voice.lang.includes('en')
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    } else if (voices.length > 0) {
      // Fallback to first available English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0]
      utterance.voice = englishVoice
    }

    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      if (onStart) onStart()
    }

    utterance.onend = () => {
      if (onEnd) onEnd()
      resolve('completed')
    }

    utterance.onerror = (error) => {
      if (onEnd) onEnd()
      reject(new Error(`Speech synthesis error: ${error.error}`))
    }

    window.speechSynthesis.speak(utterance)
  })
}