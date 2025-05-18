import { useUser } from '@stackframe/stack'
import { useMutation } from 'convex/react'
import React, { useContext, useEffect ,useState } from 'react' 
import {api} from "@/convex/_generated/api"
import { UserContext } from './_context/UserContext'

const AuthProvider = ({children}) => {
    const user = useUser()  // getting the user data from user.js from inssde the convex folder
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData, setuserData] = useState()

    useEffect(() => {
      // console.log(user);     
      user&&CreateNewUser();      // call the createtnewuser func only when user i.e. userdata is availabel
    }, [user])

    const CreateNewUser=async()=>{
        const result = await CreateUser({
            name:user?.displayName,
            email:user.primaryEmail   //both these are taken displayName,primaryEmail are takn from the console log 
        })
        console.log(result);
        setuserData(result)
    }
    
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