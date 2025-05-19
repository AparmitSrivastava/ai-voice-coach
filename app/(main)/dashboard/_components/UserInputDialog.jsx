import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CoachingOptions } from '@/services/Options'
import { Textarea } from "@/components/ui/textarea"



const UserInputDialog = ({children , coachingOption}) => {
    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{coachingOption.name}</DialogTitle>
                    <DialogDescription asChild>
                        <div className='mt-4'>
                        <h2 className='font-semibold text-black mt-5'>Enter a topic to master your skill in {coachingOption.name}</h2>
                        <Textarea placeholder="Enter your topic here" className="mt-2" />
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserInputDialog
