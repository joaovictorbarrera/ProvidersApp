import React from 'react'
import "./Format.css"

function Format() {
  return (
    <div id="format-page">
        <h1>Format</h1>
        <table>
            <thead>
                <tr><th>cols</th>
                <th>type</th>
                <th>example</th>
            </tr></thead>
            <tbody>
                <tr>
                    <td>Provider</td>
                    <td>string</td>
                    <td>ACNE</td>
                </tr>
                <tr>
                    <td>Department</td>
                    <td>DEVELOPMENT-DEP | INFRASTRUCTURE-DEP | CORP-DEP</td>
                    <td>DEVELOPMENT-DEP</td>
                </tr>
                <tr>
                    <td>Date signed</td>
                    <td>date: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                <tr>
                    <td>Duration</td>
                    <td>Number of months</td>
                    <td>18</td>
                </tr>
                <tr>
                    <td>Date Planning Starts</td>
                    <td>data: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td>String: started | not-started | sent | concluded</td>
                    <td>started</td>
                </tr>
                <tr>
                    <td>Date prices offer received</td>
                    <td>date: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                <tr>
                    <td>Date prices map finished</td>
                    <td>date: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                <tr>
                    <td>Date sent to analysis</td>
                    <td>date: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                <tr>
                    <td>Date concluded</td>
                    <td>date: YYYY/MM/DD</td>
                    <td>2002/10/14</td>
                </tr>
                
            </tbody>
        </table>
    </div>
  )
}

export default Format