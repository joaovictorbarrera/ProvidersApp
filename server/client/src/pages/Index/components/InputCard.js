import React, { useEffect, useRef, useState } from 'react'
import {useNavigate} from "react-router-dom"
import AnimatedDots from "../../../components/AnimatedDots"
import convertPathToFilename from '../../../services/convertPathToFilename'
import apiGET from '../../../services/api/apiGET'
import apiPOST from '../../../services/api/apiPOST'
import apiDELETE from '../../../services/api/apiDELETE'
import urlEnum from '../../../services/api/urlEnum'
import useGet from '../../../hooks/useGet'
import { AiOutlineCloudUpload } from "react-icons/ai"

function InputCard() {
    const [error, setError] = useState()
    const [loadingMessage, setLoadingMessage] = useState(false)

    const [selectOpen, setSelectOpen] = useState(false)
    const navigate = useNavigate()

    function handleProcessFile(filename) {
        setLoadingMessage("Processing")
        apiGET(`${urlEnum.RESULT_URL}/${filename}`)
        .then(result => {
            setLoadingMessage(null)
            if (result.error) return setError(result.error)

            navigate("/result", {state: {...result.data, filename}})
        })
    }

    return (
    <article id='index-input-card' className='white-card'>
        <header>
            <h3>Upload a formatted CSV File:</h3>
        </header>

        {selectOpen &&
        <FileSelector setError={setError} setSelectOpen={setSelectOpen}
        setLoadingMessage={setLoadingMessage} handleProcessFile={handleProcessFile}
        />}

        <IndexForm error={error} setSelectOpen={setSelectOpen}
        handleProcessFile={handleProcessFile} setLoadingMessage={setLoadingMessage} setError={setError}
        />

        {loadingMessage && <AnimatedDots text={loadingMessage} />}
    </article>
    )
}

function FileSelector({setError, setSelectOpen, handleProcessFile}) {
    const [data, error, loading, refreshFilesList] = useGet(urlEnum.FILES_URL)

    const files = data == null ? [] : data

    useEffect(() => {
        if (error) {
            setError(error)
            setSelectOpen(false)
        }
    }, [error, setError, setSelectOpen])

    function handleSelect(e) {
        const filename = convertPathToFilename(e.target.querySelector("span").innerText)
        setSelectOpen(false)
        handleProcessFile(filename)
    }

    function handleDeleteFile(filename) {
        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            apiDELETE(`${urlEnum.FILES_URL}/${filename}`)
            .then(result => {
                if (result.error) {
                    setSelectOpen(false)
                    return setError(result.error)
                }

                refreshFilesList()
            })
        }
    }

    function handleGetSample() {
        apiPOST(urlEnum.FILES_URL, JSON.stringify({sample: true}))
        .then(result => {
            refreshFilesList()
        })
    }

    return (
    <div id="index-file-selector">
        <ul>
            {loading ? <li><AnimatedDots text={"Loading"} /></li> : files.map(filename =>
            <li
            className="file-entries"
            onDoubleClick={handleSelect}
            key={JSON.stringify(filename)}>
                <span style={{pointerEvents: "none"}}>{filename}</span>
                <button className='delete-file-button' onClick={() => handleDeleteFile(filename)} >&#10006;</button>
            </li>)}
        </ul>
        <div style={{display: "flex", gap: "1rem"}}>
            <button className='orange-button' type='button' onClick={handleGetSample}>Get Sample File</button>
            <button className='orange-button' type='button' onClick={() => setSelectOpen(false)}>Close</button>
        </div>
    </div>
    )
}

function IndexForm({setSelectOpen, handleProcessFile, error, setLoadingMessage, setError}) {
    const [selectedFilename, setSelectedFilename] = useState("")
    const fileSelectorRef = useRef()

    function handleSubmit(e) {
        e.preventDefault()
        setLoadingMessage("Loading")

        apiPOST(urlEnum.FILES_URL, new FormData(e.target))
        .then(result => {
            setLoadingMessage(null)
            if (result.error) return setError(result.error)

            handleProcessFile(selectedFilename)
        })

    }
    return (
        <form id='index-file-buttons' onSubmit={handleSubmit} encType="multipart/form-data">
            <span>{error}</span>
            <span>{selectedFilename}</span>

            <button onClick={() => fileSelectorRef.current.click()} className='orange-button' type='button'>
                <AiOutlineCloudUpload />Upload File
            </button>

            <button className='orange-button' type='button' onClick={() => setSelectOpen(true)}>Select</button>

            <button className='orange-button' type='submit'>Submit</button>

            <input onChange={e => setSelectedFilename(convertPathToFilename(e.target.value))} ref={fileSelectorRef}
            id="file-upload-button" type="file" name="user-csv-input"
            accept=".csv" style={{opacity:"0", position:"absolute", left:"-9000px", tabIndex:"-1"}} placeholder="enter file" required/>
        </form>
    )
}

export default InputCard
