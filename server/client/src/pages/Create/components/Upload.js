import React, { useRef, useState } from 'react'
import convertPathToFilename from '../../../services/convertPathToFilename'
import {AiOutlineCloudUpload} from "react-icons/ai"

function Upload({handleSubmit}) {
    const [filename, setFilename] = useState("")
    const inputFileRef = useRef()
    const [submitOn, setSubmitOn] = useState(false)

    function handleFileSelected(e) {
        setFilename(convertPathToFilename(e.target.value))
        setSubmitOn(true)
    }

    return (
        <form onSubmit={handleSubmit}>
            <span>{filename}</span>
            <div>
                <button type="button" onClick={() => inputFileRef.current.click()}><AiOutlineCloudUpload />Choose</button>
                {submitOn && <button type="submit">Submit</button>}
            </div>
            <input ref={inputFileRef} onChange={handleFileSelected} type="file" name="user-csv-input" accept='.csv' 
            style={{opacity:"0", position:"absolute", left:"-9000px", tabIndex:"-1"}} required/>
        </form>
    )
}

export default Upload