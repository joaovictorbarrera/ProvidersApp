fetch("result-content")
.then(res => {
    if (!res.ok) throw Error(res.statusText)
    return res.json()
})
.then(res => {
    const components = JSON.parse(res.message)
    createTables(components)
    document.querySelector('#excel-a-reference').href = components.excel
    createGraphs(components)
})
.catch(err => {
    console.log(err)
    alert("EMPTY CSV OR ERROR PROCESSING CSV") 
    window.location.href = "/"
})

function createGraphs(components) {
    const graphList = document.querySelector(".graphs-container")
    Object.keys(components).forEach(key => {
        if(key.includes("graph")) {
            const graphComponent = components[key]
            const graphElement = getGraph(graphComponent)
            graphList.append(graphElement) 
        }
    })
}

function getGraph(graphComponent) {
    const graphElement = document.createElement("div")
    graphElement.classList.add("graph")
    graphElement.append(document.createRange().createContextualFragment(graphComponent))
    return graphElement
}

function createTables(components) {
    const tableList = document.querySelector(".tables-container")
    Object.keys(components).forEach(key => {
        if(key.includes("table")) {
            const tableComponent = components[key]
            const tableHeader = getTableHeader(tableComponent)
            const tableElement = getTableElement(tableComponent)
            tableList.append(tableHeader)
            tableList.append(tableElement)
        }
    })
}

function getTableHeader(tableComponent) {
    const header = document.createElement("h2")
    header.innerText = tableComponent.name
    header.classList.add("table-title")
    return header
}

function getTableElement(tableComponent) {
    const tableElement = document.createElement("div")
    tableElement.innerHTML = tableComponent.table
    tableElement.classList.add("table-div")
    paint_lights(tableElement)
    return tableElement
}

function paint_lights(tableElement) {
    const tds = tableElement.querySelectorAll("td")
    for(const td of tds) {
        if(td.innerText.startsWith("Red")) {
            td.style.backgroundColor = "red"
            td.style.color = "white"
            td.innerText = td.innerText.replace("Red", "")
        }
        else if(td.innerText.startsWith("Green")) {
            td.style.backgroundColor = "green"
            td.style.color = "white"
            td.innerText = td.innerText.replace("Green", "")
        }
        else if(td.innerText.startsWith("Yellow")) {
            td.style.backgroundColor = "yellow"
            td.innerText = td.innerText.replace("Yellow", "")
        }
        else if(td.innerText.startsWith("Purple")) {
            td.style.backgroundColor = "purple"
            td.style.color = "white"
            td.innerText = td.innerText.replace("Purple", "")
        }
    }
}