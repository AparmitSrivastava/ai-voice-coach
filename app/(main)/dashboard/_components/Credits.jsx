import { UserContext } from '@/app/_context/UserContext'
import { useUser } from '@stackframe/stack'
import Image from 'next/image'
import React, { useContext } from 'react'
import { Progress } from "@/components/ui/progress"
import { Button } from '@/components/ui/button'
import { Wallet2 } from 'lucide-react'


const Credits = () => {
    const { userData } = useContext(UserContext)
    const user = useUser();

    const CalculateProgress=()=>{
        if(userData?.subscriptionId){
            return Number(userData.credits / 50000) * 100
        }
    }

    return (
        <div>
            <div className='flex gap-5 items-center'>
                <Image src={user?.profileImageUrl} width={60} height={60} alt='profilepic'
                    className='rounded-full' />
                <div>
                    <h2 className='text-lg font-bold'>{user?.displayName}</h2>
                    <h2 className='text-gray-500'>{user?.primaryEmail}</h2>
                </div>
            </div>
            <hr className='my-3' />
            <div>
                <h2 className='font-bold'>Token Usage</h2>
                {/* <h2>{userData.credits}/{userData?.subscriptionId ? '50,000' : '5000'}</h2> */}
                <h2>{userData.credits}/{userData?.subscriptionId ? '50,000' : '50000'}</h2>
                <Progress value={CalculateProgress} className="my-4 [&>div]:bg-orange-500" />

                <div className='flex justify-between items-center mt-3'>
                    <h2 className='font-bold'>Current Plan</h2>
                    <h2 className='p-1 bg-secondary rounded-lg px-2'>
                        {userData?.subscriptionId ? 'Paid Plan' : 'Free Plan'}
                        </h2>
                </div>

                <div className='mt-5 p-5 border-2 rounded-2xl'>
                    <div className='justify-between flex'>
                        <div>
                            <h2 className='font-bold'>Pro Plan</h2>
                            <h2>50,000 Tokens</h2>
                        </div>
                        <h2 className='font-bold'>$5/month</h2>
                    </div>
                    <hr className='my-3'/>
                    <Button className='w-full bg-orange-700 hover:bg-orange-500'> <Wallet2/> Upgrade $5</Button>
                     
                </div>

            </div>
        </div>
    )
}

export default Credits
