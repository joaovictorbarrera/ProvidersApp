import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{textAlign: "center"}}>
      <h1>404 Not Found - <Link to="/">Home</Link></h1>
      </div>
  )
}

export default NotFound