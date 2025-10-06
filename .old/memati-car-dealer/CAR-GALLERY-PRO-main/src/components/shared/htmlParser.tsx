import React from 'react'
import parse from "html-react-parser"
import sanitizeHtml from 'sanitize-html';
const HtmlParser = ({html}: {
    html: string;
}) => {
    const sanitized = sanitizeHtml(html)
    const parsed = parse(sanitized)
  return (
    <>{parsed}</>
  )
}

export default HtmlParser
