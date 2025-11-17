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


export const ConvertTextToSpeech = async (text, onStart, onEnd) => {
  try {
    console.log("[TTS Frontend] Requesting TTS for text:", text.substring(0, 50) + "...");
    
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    console.log("[TTS Frontend] Response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[TTS Frontend] TTS API error:", {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      
      if (onEnd) onEnd();
      throw new Error(errorData.message || `TTS API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("[TTS Frontend] Response data keys:", Object.keys(data));

    if (!data.audioContent) {
      console.error("[TTS Frontend] TTS response missing audio:", data);
      if (onEnd) onEnd();
      throw new Error("No audio content in TTS response: " + JSON.stringify(data));
    }
    
    console.log("[TTS Frontend] Audio content received, length:", data.audioContent.length);

    // Create audio element from base64 data
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    
    // Set up event handlers
    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      if (onEnd) onEnd();
    };

    // Play the audio
    await audio.play();

  } catch (err) {
    console.error("TTS request failed:", err);
    if (onEnd) onEnd();
    throw err;
  }
};



// const ConvertTextToSpeech = async(text)=>{
//   const pollyClient = new PollyClient({
//     region:'us-east-1',
//     credentials:{
//       accessKeyId:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
//       secretAccessKey:process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
//     }
//   })

//   const command = new SynthesizeSpeechCommand({
//     Text:text,
//     OutputFormat:'mp3',
//     VoiceId:expertName
//   })

//   try{
//     const {AudioStream} = await pollyClient.send(command);
//     const audioArrayBuffer = await AudioStream.transformToByteArray();
//     const audioBlob = new Blob([audioArrayBuffer] , {type:'audio/mp3'})
//     const audioUrl = URL.createObjectURL(audioBlob)
//     return audioUrl;
//   }catch(e){
// console.log(e);

//   }
// }