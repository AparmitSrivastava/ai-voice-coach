import React , {useState} from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CoachingExpert, CoachingOptions } from '@/services/Options'
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'


const UserInputDialog = ({ children, coachingOption }) => {

    const [selectedExpert, setselectedExpert] = useState()
    const [topic, settopic] = useState()
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom)
    const [loading, setloading] = useState(false)
    const [showDialog, setshowDialog] = useState(false) // for closing the dialog after next button is clicked
    const router = useRouter()
    
    const OnClickNext=async()=>{
        setloading(true)
        const result = await  createDiscussionRoom ({
            topic:topic,
            coachingOption:coachingOption?.name,
            expertName:selectedExpert    
        })
        console.log(result)
        setloading(false)
        setshowDialog(false)
        router.push('/discussion-room/'+ result)    // pushing the path name and navigating to the discroom screen as soon as next button is clicked 
     }



    return (
        <Dialog open={showDialog} onOpenChange={setshowDialog} >
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">{coachingOption.name}</DialogTitle>
                    <DialogDescription asChild>
                        <div className='mt-4'>
                            <h2 className='text-black text-lg'>Enter a topic to master your skill in {coachingOption.name}</h2>
                            <Textarea placeholder="Enter your topic here" className="mt-2"
                            onChange={(e)=>{settopic(e.target.value)}} />

                            <h2 className='text-black mt-5 mb-2 text-lg'>Select your coaching expert</h2>
                            <div className='grid grid-cols-3 md:grid-cols-5 gap-6'>
                                {CoachingExpert.map((expert, index) => (
                                    <div key={index} onClick={()=>setselectedExpert(expert.name)}>
                                        <Image src={expert.avatar} alt={expert.name}
                                            // key={index}
                                            width={100}
                                            height={100}
                                            className={`rounded-2xl h-[80px] w-[80px] object-cover hover:scale-105 transition-all cursor-pointer p-2 border-primary ${selectedExpert == expert.name && 'border-2'}`} />
                                            <h2 className='text-center'>{expert.name}</h2>
                                    </div>
                                ))}
                            </div>


                            

                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserInputDialog
