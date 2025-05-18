// we created app/_context folder for the state management of the user info we are getting form the db so that it can be passed to diff files
// under app we name the foler _context because if we dont use _underscore at the start then nextjs would consider as a route

import { createContext } from "react";


export const UserContext = createContext()
