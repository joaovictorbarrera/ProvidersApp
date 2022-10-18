import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import "./DefaultLayout.css"
import { IoIosCreate } from "react-icons/io"
import { AiFillHome } from "react-icons/ai"

function DefaultLayout() {
    function handleActiveNavLink({isActive}) {
        return isActive ? {color: "var(--secondary)"} : null
    }

    return (
        <>
        <nav id='navbar'>
            <div id='logo'>
                <img alt="website logo" src="/acme-logo.png"/>
            </div>
            <ul id='navlinks'>
                <li><NavLink end style={handleActiveNavLink} to="/"><AiFillHome /></NavLink></li>
                <li><NavLink end style={handleActiveNavLink} to="/create"><IoIosCreate /></NavLink></li>
            </ul>
        </nav>
        <main>
            <Outlet />
        </main>
        </>
    )
}

export default DefaultLayout