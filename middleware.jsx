import { stackServerApp } from "./stack";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/handler/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // You can add your own route protection logic here
  // Make sure not to protect the root URL, as it would prevent users from accessing static Next.js files or Stack's /handler path
  matcher: '/dashboard/:path*',
};




// in that middware file we have put our desired address that we need to be protected so we change -  matcher: '/protected/:path*', to  matcher: '/dashboard/:path*',
// so any search such as dashboard/hello will take us back to the login page