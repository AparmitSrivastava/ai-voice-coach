// import React from 'react'

// const Chatbox = ({ conversation }) => {
//     return (
//         <div>
//             <div className="h-[60vh] border rounded-xl bg-secondary flex flex-col relative p-4 overflow-auto">
                
//                     {conversation.map((item, index) => (
//                         <div key={`${item.role}-${index}-${item.content}`}  className={`flex ${item.role=='user' && 'justify-end'}`}>
//                             {item?.role == "assistant" ?
//                                 <h2 className='p-1 px-2 text-white mt-1 bg-primary inline-block rounded-md'>{item?.content}</h2>
//                                 :
//                                  <h2 className='p-1 px-2 mt-1 bg-gray-200 inline-block rounded-md'>{item?.content}</h2>
//                             }

//                         </div>
//                     ))}
                
//             </div>
//             <h2 className="mt-5 text-gray-400 text-sm">
//                 At the end of the session we will automatically generate notes/feedback from your conversation
//             </h2>
//         </div>
//     )
// }

// export default Chatbox




import React from 'react'

const Chatbox = ({ conversation }) => {
  return (
    <div>
      <div className="h-[60vh] border rounded-xl bg-secondary flex flex-col relative p-4 overflow-auto">
        {conversation.map((item, index) => (
          <div
            key={`msg-${index}`}
            className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <h2
              className={`p-1 px-2 mt-1 inline-block rounded-md ${
                item.role === 'assistant'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {item.content}
            </h2>
          </div>
        ))}
      </div>

      <h2 className="mt-5 text-gray-400 text-sm">
        At the end of the session we will automatically generate notes/feedback from your conversation
      </h2>
    </div>
  )
}

export default Chatbox
