// for creating the table
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"

export default defineSchema({       // this is line is syntax -A function that registers all your tables into the Convex project
    users:defineTable({             // users is the name of the table that we are giving and define table is a func
        name:v.string(),            // mentioning the all the columns we want
        email:v.string(),
        credits:v.number(),
        subscriptionId:v.optional(v.string())
    }),

    DiscussionRoom:defineTable({
        coachingOption:v.string(),
        topic:v.string(),
        expertName:v.string(),
        conversation:v.optional(v.any()),
        summary:v.optional(v.any())
    })
})

// after writing this much if we visit out convex dashboard- we''ll find the "users" table created
// 1. we did not create id colymn coz convex will automatically gener. the unique id for each of the record