import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import React from 'react'
import Credits from "./Credits"

const ProfileDialog = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='bg-orange-100'>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription asChild>
            <Credits />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

  )
}

export default ProfileDialog
