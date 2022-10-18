import { useState } from "react"
import useGet from "../../../hooks/useGet"
import apiPOST from "../../../services/api/apiPOST"
import apiDELETE from "../../../services/api/apiDELETE"
import urlEnum from "../../../services/api/urlEnum"
import AnimatedDots from "../../../components/AnimatedDots"
import { FiTrash2 } from "react-icons/fi"
import { IoMdAddCircleOutline } from "react-icons/io"

export default function ProvidersTable({activeFileName}) {
    const [data, error, loading, refreshLines] = useGet(`${urlEnum.CREATE_URL}/${activeFileName}`)
  
    const csvData = data == null ? [] : data
  
    function onSubmit(e) {
      e.preventDefault()
      const formData = new FormData(e.target)
      const csvLine = buildCSVLine(formData)
  
      apiPOST(
        `${urlEnum.CREATE_URL}/${activeFileName}`, 
        JSON.stringify({line: csvLine}), 
        {headers: 
          {
            "Content-Type":"application/json"
          }
        }
      )
      .then(result => {
        refreshLines()
        if (result.error) alert(result.error)
      })
  
    }
  
    function buildCSVLine(formData) {
      const commas = 9
  
      let values = [...formData.values()]

      values = values.map(value => value.includes(",") ? `"${value}"`: value)

      let csvLine = values.join(",")
  
      for (let i = 0; i < commas - (values.length - 1); i++) {
        csvLine += ","
      }
  
      return csvLine
    }

    function deleteLine(e) {
      if (window.confirm("Are you sure you want to delete this line?")) {
        const index = e.target.getAttribute('data-index')

        apiDELETE(`${urlEnum.CREATE_URL}/${activeFileName}?${new URLSearchParams({index})}`)
        .then(result => {
          refreshLines()
          if (result.error) alert(result.error)
        })
      }
    }

    function parseCSVData(row) {
      row = row + ","
      let left = 0
      const values = []
      let ignoreComma = false
      for (let runner = 0; runner < row.length; runner++) {
        const c = row[runner]

        if (c === '"') ignoreComma = !ignoreComma
        
        if (c === "," && !ignoreComma) {
          let value = row.substring(left, runner)
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1)
          }
          values.push(value)
          left = runner + 1
        }

      }

      return values
    }
  
    return (
    <div className="create-table-wrapper">
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <table className="create-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Department</th>
              <th>Date Signed</th>
              <th>Duration</th>
              <th>Planning Starts</th>
              <th>Status</th>
              <th>Offer Received</th>
              <th>Map Concluded</th>
              <th>Sent</th>
              <th>Conclusion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? 
            <tr><td><AnimatedDots text={"Loading"}/></td></tr> :
            error ? <tr><td>{error}</td></tr> :
            <>
            {csvData.map((row, rowIndex) => 
            <tr key={JSON.stringify(row)+rowIndex}>
              <td><button type="button" onClick={deleteLine} data-index={rowIndex} className="table-button red"><FiTrash2 /></button></td>
              {parseCSVData(row).map((item, itemIndex) => 
              <td key={itemIndex}>
                {!item ? "N/A" : item}
              </td>)}
            </tr>
            )}
  
            <AddNewRow />
            </>}
          </tbody>
        </table>
      </form>
    </div>
    )
  }
  
  function AddNewRow() {
    const [status, setStatus] = useState("not-started")
  
    return (
      <tr className="create-add-new-row">
        <td><button className="table-button green" type="submit"><IoMdAddCircleOutline /></button></td>
        <td><input placeholder="Enter name..." type="text" name="provider-name" required/></td>
        <td>
          <select defaultValue={"DEVELOPMENT-DEP"} name="provider-department" required>
            <option>DEVELOPMENT-DEP</option> 
            <option>INFRASTRUCTURE-DEP</option>
            <option>CORP-DEP</option>
          </select>
        </td>
        <td><input type="date" name="provider-date-signed" required/></td>
        <td><input placeholder="Enter duration in months..." type="number" name="provider-duration-months" required/></td>
        <td><input type="date" name="provider-date-planning-starts" required/></td>
        <td>
          <select value={status} onChange={e => setStatus(e.target.value)} name="provider-status" required>
            <option>not-started</option> 
            <option>started</option>
            <option>sent</option>
            <option>concluded</option>
          </select>
        </td>
        <td><input type="date" name="provider-date-offer-received" disabled={status === "not-started"}/></td>
        <td><input type="date" name="provider-date-prices-map-concluded" disabled={status === "not-started"}/></td>
        <td><input type="date" name="provider-date-sent-analysis" disabled={status !== "sent" && status !== "concluded"} required/></td>
        <td><input type="date" name="provider-date-conclusion" disabled={status !== "concluded"} required/></td>
      </tr>
    )
  }