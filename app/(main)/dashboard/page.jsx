import React from 'react'

const Dashboard = () => {
  return (
    <div>
      Dashboard
    </div>
  )
}

export default Dashboard





// the problem is that when we visit localhost3000/dashboard 
// we'll se the page even when the uer if logged out and that we dont want , we want only logged in user to see the dashb   
// to solve this we have to go to the middleware.jsx file that we created during settting up of our auth
// in that middware file we have put our desired address that we need to be protected so we change -  matcher: '/protected/:path*', to  matcher: '/dashboard/:path*',
// so any search such as dashboard/hello will take us back to the login page