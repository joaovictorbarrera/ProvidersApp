import React, { useEffect, useRef, useState } from 'react'

function AnimatedDots({text}) {
    const [dots, setDots] = useState("")
    const loadingRef = useRef()

    useEffect(() => {
        setTimeout(() => {
            let value = dots
            if (value.includes("...")) value = setDots("")
            else setDots(olddots => olddots + ".")
        }, 300)
    }, [dots])

    return (
        <span ref={loadingRef} className='loading'>
            {`${text}${dots}`}
        </span>
    )
}

export default AnimatedDots