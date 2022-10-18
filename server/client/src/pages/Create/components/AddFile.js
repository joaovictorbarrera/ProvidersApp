import React, { useCallback, useMemo, useState } from 'react'
import apiPOST from '../../../services/api/apiPOST'
import urlEnum from '../../../services/api/urlEnum'
import Upload from './Upload'
import { IoMdAddCircleOutline } from "react-icons/io"
import { IoArrowBackCircle } from "react-icons/io5"

function AddFile({refresh}) {
    const [state, setState] = useState(undefined)
    const [error, setError] = useState(false)

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        setState(undefined)

        // create file
        apiPOST(urlEnum.FILES_URL, new FormData(e.target))
        .then(result => {
            refresh()
            setError(!!result.error)
        })
    }, [refresh])

    const steps = useMemo(() => {
        return {
            "selecting": 
            <div>
                <button type="button" onClick={() => setState("upload")}>Upload</button>
                <button type="button" onClick={() => setState("create-new")}>New</button>
            </div>,
            "create-new":
            <form className="create-new-file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <label>
                    File Name:
                    <input type="text" name="filename"/>
                </label>
            </form>,
            "upload":
            <Upload handleSubmit={handleSubmit} />

        }
    }, [handleSubmit])

    function handleBack() {
        if (state !== "selecting") {
            setState("selecting")
        } else {
            setState(undefined)
        }
    }

    return (
        <li className={`create-add-file-section ${state ? `${state}` : ""} ${error ? "error" : ""}`}>
            {state === undefined ? 
            <p onClick={() => setState("selecting")} style={{display: "flex", alignItems: "center", justifyContent:"center"}}><IoMdAddCircleOutline /></p> 
            : <>
            {steps[state]}
            <button type="button" id="create-add-file-back-button" onClick={handleBack}><IoArrowBackCircle /></button>
            </>}
        </li>
    )
}

export default AddFile