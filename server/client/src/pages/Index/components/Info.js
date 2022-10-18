import React from 'react'
import { Link } from 'react-router-dom'

function Info() {
  return (
    <article id="index-info" className='white-card'>
        <ul>
        <li>
            <h4>Github:</h4>
            <a href="https://github.com/joaovictorbarrera">github.com/joaovictorbarrera</a>
        </li>
        <li>
            <h4>Help:</h4>
            <Link to="/format">format</Link>
        </li>
        <li>
            <h4>Latest Build:</h4>
            <span>Providers App v2.0</span>
        </li>
        <li>
            <h4>Technical:</h4>
            <p>Front-end: <strong>React</strong></p>
            <p>Back-end: <strong>Python</strong></p>
        </li>
        </ul>
    </article>
  )
}

export default Info