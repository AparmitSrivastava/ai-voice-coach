import { mutation } from "./_generated/server";
import {v} from "convex/values"

// we are going to insert the user into our database 
 export const CreateUser = mutation({               //mutation is a Convex function used to define server-side write operations (i.e., things that change the database).You use it to create database actions like inserting, updating, or deleting data.
    args:{
        name:v.string(),
        email:v.string()
    },
    handler:async(ctx,args)=>{                                   //ctx - context.
        // if user already exists 
        const userData = await ctx.db.query('users')
        .filter(e=>e.eq(e.field('email') , args.email))
        .collect();

        // if user isnt registered then add new user
        if(userData?.length==0){

            const data = {
                name:args.name,
                email:args.email,
                credits:50000
            }

            const result = ctx.db.insert('users' , {...data })
            console.log(result);
            return data        // not returning result coz it'll return the id
        }

        return userData[0]      //if user is there already then simply return it after completeing the 12-14 logic 
    }
 })

//  after this file we work on authprovider.jsx where stroing of user info is done


       
//ctx.db gives you access to Convex's database functions.
// query() is a Convex method used to read from a table (collection).
// It starts a query chain which you can filter, sort, and then execute.

// 1.   args is what the frontend sends (name, email, etc.)
// 2.   ctx gives access to database and auth
// 3.   handler runs your logic when this mutation is called

// // in Convex:
// Use mutation → when you want to create, update, or delete data.
//  Use query → when you only want to read/fetch data from the database.