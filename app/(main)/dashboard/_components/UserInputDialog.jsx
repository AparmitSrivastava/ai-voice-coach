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



const UserInputDialog = ({ children, coachingOption }) => {

    const [selectedExpert, setselectedExpert] = useState()
    const [topic, settopic] = useState()

    return (
        <Dialog>
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


                            <div className='flex gap-5 justify-end mt-5'>
                                <DialogClose asChild><Button variant={'ghost'}>Cancel</Button></DialogClose>
                                <Button disabled={(!topic || !selectedExpert)}>Next</Button>
                            </div>

                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserInputDialog
