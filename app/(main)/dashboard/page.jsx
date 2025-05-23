import React from 'react'
import FeatureAssistant from './_components/FeatureAssistant'
import History from './_components/History'
import Feedback from './_components/Feedback'

const Dashboard = () => {
  return (
    <div>
      <FeatureAssistant/>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-20'>
        <History/>
        <Feedback/>
      </div>
    </div>
  )
}

export default Dashboard





// the problem is that when we visit localhost3000/dashboard 
// we'll se the page even when the uer if logged out and that we dont want , we want only logged in user to see the dashb   
// to solve this we have to go to the middleware.jsx file that we created during settting up of our auth
// in that middware file we have put our desired address that we need to be protected so we change -  matcher: '/protected/:path*', to  matcher: '/dashboard/:path*',
// so any search such as dashboard/hello will take us back to the login page