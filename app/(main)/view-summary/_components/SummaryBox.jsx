import React from 'react'
import ReactMarkdown from "react-markdown"

const SummaryBox = ({summary}) => {
  return (
    <div className='h-[60vh] overflow-auto'>
      <ReactMarkdown className="text-base/8" > {summary} </ReactMarkdown>
    </div>
  )
}

export default SummaryBox


// npm i react-markdown imported to format the summary given by the aimodel