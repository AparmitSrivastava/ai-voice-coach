import { useUser } from '@stackframe/stack'
import { useMutation } from 'convex/react'
import React, { useContext, useEffect, useState, useCallback } from 'react' 
import {api} from "@/convex/_generated/api"
import { UserContext } from './_context/UserContext'

const AuthProvider = ({children}) => {
    const user = useUser()  // getting the user data from user.js from inssde the convex folder
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData, setuserData] = useState()

    const CreateNewUser = useCallback(async () => {
        // Provide fallback values if displayName or primaryEmail are null/undefined
        const userName = user?.displayName || user?.name || 'User'
        const userEmail = user?.primaryEmail || user?.email || ''
        
        // Only create user if we have a valid email
        if (!userEmail) {
            console.warn('Cannot create user: email is missing')
            return
        }
        
        try {
            const result = await CreateUser({
                name: userName,
                email: userEmail
            })
            // console.log(result); // Removed console.log to reduce noise
            setuserData(result)
        } catch (error) {
            console.error('Failed to create user:', error)
        }
    }, [user, CreateUser])

    useEffect(() => {
      // console.log(user);     
      if (user && !userData) {
          CreateNewUser();      // call the createtnewuser func only when user i.e. userdata is availabel
      }
    }, [user, userData, CreateNewUser])
    
  return (
    <div>
        <UserContext.Provider value={{userData,setuserData}}>
      {children}
    </UserContext.Provider>
    </div>
  )
}

export default AuthProvider

// once data is stored 
// we have to store it in a state sp that we can share it across files instead of passing it manually so we use useContext(state management hook)