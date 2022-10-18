import React, { useState } from 'react'
import useDownloadFile from '../../../hooks/useDownloadFile'
import useGet from '../../../hooks/useGet'
import apiDELETE from '../../../services/api/apiDELETE'
import urlEnum from '../../../services/api/urlEnum'
import AddFile from "./AddFile"
import truncate from "../../../services/truncate.ts"
import AnimatedDots from '../../../components/AnimatedDots'
import { MdOutlineFileDownload } from "react-icons/md"
import { FiTrash2 } from "react-icons/fi"
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from "react-icons/bs"


function Sidebar({activeFileName, setActiveFileName}) {
    const download = useDownloadFile()
    const [data, error, loading, refreshFilesList] = useGet(urlEnum.FILES_URL, [])
    const files = data == null ? [] : data
    const [sidebarOpen, setSidebarOpen] = useState(true)

    function handleDeleteFile(e, filename) {
      e.stopPropagation()
      if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
          apiDELETE(`${urlEnum.FILES_URL}/${filename}`)
          .then(result => {
            refreshFilesList()
            if (filename === activeFileName) setActiveFileName(undefined)
            if (result.error) window.alert(result.error)
          })
      }
  }

  function handleDownloadFile(e, filename) {
    e.stopPropagation()
    if (window.confirm(`Do you want to download ${filename}?`)) {
      download(`${urlEnum.FILES_URL}/${filename}`, filename)
      .then(result => {
        if (result.error) window.alert(result.error)
      })
    }
  }
  
  return (
    <aside>
      {
        sidebarOpen ?
        <>
        <header>
          <button className='create-close-sidebar' onClick={() => setSidebarOpen(false)}>{<BsFillArrowLeftCircleFill />}</button>
          <h3>Choose File:</h3>
        </header>
        <ul className="create-file-list">
          <AddFile refresh={refreshFilesList}/>
          {loading ? <li className="create-file-entry"><AnimatedDots text={"Loading"}/></li> : 
          error ? <li>{error}</li> :
          files.map(filename => 
          <li onClick={() => setActiveFileName(filename)} 
          className={`create-file-entry ${filename === activeFileName ? "active" : ""}`} 
          key={JSON.stringify(filename)}>
            <button type="button" className='create-file-entry-button download' onClick={e => handleDownloadFile(e, filename)}><MdOutlineFileDownload /></button>
            <span>{truncate(filename, 15)}</span>
            <button type="button" className='create-file-entry-button delete' onClick={(e) => handleDeleteFile(e, filename)} ><FiTrash2 /></button>
          </li>)}
        </ul>
        </> :
        <>
          <button className='create-open-sidebar' onClick={() => setSidebarOpen(true)}>{<BsFillArrowRightCircleFill />}</button>
        </>
      }
    </aside>
  )
  }

export default Sidebar