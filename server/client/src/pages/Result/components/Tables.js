import React from 'react'
import parse from 'html-react-parser';

function Tables({tables}) {
    function paintLights(tableWithWrapper, lights) {
        const table = tableWithWrapper.querySelector("table")

        let colIndex
        table.querySelectorAll("th").forEach((header, index) => {
            if (header.innerText === "days-remaining") {
            colIndex = index
            }
        })
        if (!colIndex) return

        table.querySelectorAll(`td:nth-child(${colIndex + 1})`).forEach((td, index) => {
            td.dataset.light = lights[index]
        })

    }

    function createTableWithWrapper(html) {
        const div = document.createElement("div")
        div.innerHTML = html
        return div
    }

    function processTableContent(html, lights) {
        const tableWithWrapper = createTableWithWrapper(html)
        paintLights(tableWithWrapper, lights)
        return parse(tableWithWrapper.innerHTML)
    }

    return (
        <>
        {tables.map(table =>
            <li className="result-table-wrapper" key={table.name}>
                <header className='result-table-header'>{`status: ${table.name}`}</header>
                {processTableContent(table.tableContent, table.lights)}
            </li>
        )}
        </>
    )
}

export default Tables