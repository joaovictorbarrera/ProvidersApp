import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import "./Result.css"
import Tables from './components/Tables';
import Graphs from './components/Graphs';
import useDownloadFile from '../../hooks/useDownloadFile'
import urlEnum from '../../services/api/urlEnum';

function Result() {
  const location = useLocation()
  const navigate = useNavigate()

  const [data, setData] = useState({graphs: [], tables: [], filename: null})
  const download = useDownloadFile()

  useEffect(() => {
    if (location && location.state) setData(location.state)
    else navigate("/")
  }, [location, navigate])

  function handleDownloadExcel() {
    if (window.confirm(`Do you want to download the excel version?`)) {
      const filename = data.filename
      const excelName = filename.split(".")[0] + ".xlsx"
      download(`${urlEnum.EXCEL_URL}/${filename}`, excelName)
      .then(result => {
        if (result.error) window.alert(result.error)
      })
    }
  }

  return ( 
    <div id="result-page">
      <ul id="result-options">
        <li><button type="button" className='orange-button' onClick={handleDownloadExcel}>Download Excel</button></li>
      </ul>
      <ul id="result-tables-container">
        <Tables tables={data.tables}/>
      </ul>
      
      <div className="result-graphs-container">
        <Graphs graphs={data.graphs}/>
      </div>

    </div>
  )
}

export default Result