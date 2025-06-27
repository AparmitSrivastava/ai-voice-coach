import { AIModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices'
import {React , useState} from 'react'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useParams } from 'next/navigation'
import { UpdateSummary } from '@/convex/DiscussionRoom'
import { toast } from 'sonner'

const Chatbox = ({ conversation , enableFeedbackNotes , coachingOption }) => {
  const [loading, setloading] = useState(false)
  const updateSummary = useMutation(api.DiscussionRoom.UpdateSummary)
  const { roomid } =useParams()

  const GenerateFeedbackNotes = async() =>  {
    setloading(true)
    
    try{
    const result = await AIModelToGenerateFeedbackAndNotes(coachingOption , conversation)
    console.log(result.content);
    
    await updateSummary({
      id:roomid,
      summary:result.content,
    })
    setloading(false)
    toast('Feedback/Notes saved!')
  }
  catch(e){
      setloading(false)
       toast('Internal server error, try again!')
  }
}


  return (
    <div>
      <div className="h-[60vh] border rounded-xl bg-secondary flex flex-col relative p-4 overflow-auto">
        {conversation.map((item, index) => (
          <div
            key={`msg-${index}`}
            className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <h2
              className={`p-1 px-2 mt-1 inline-block rounded-md ${
                item.role === 'assistant'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {item.content}
            </h2>
          </div>
        ))}
      </div>

      { !enableFeedbackNotes ? 
      <h2 className="mt-5 text-gray-400 text-sm"></h2>
      :
      <Button onClick={GenerateFeedbackNotes} disabled={loading} className='mt-5 w-full' >
        {loading && <LoaderCircle className='animate-spin'/>}
        Generate Feedback/Notes</Button>
      }
    </div>
  )
}

export default Chatbox
