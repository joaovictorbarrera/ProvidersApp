// prevent negative values on vigencia box
document.querySelector("#duration").addEventListener("change", (event) => {
    if (parseInt(event.target.value) <= 0) {
         event.target.value = 1
    }
})

document.getElementById("submit-data").addEventListener("click", submit_data)

// when page loads, gets the available files
fetch("uploaded-files").then(res => {
    if (!res.ok) throw Error(res.statusText)
    return res.json()
})
.then(res => load_available_files(res))
.catch(err => console.log(err))

function load_available_files(res) {
    // gets a list of file names
    const availableFiles = JSON.parse(res.message)
    const list = document.getElementsByClassName('create-choose-list')[0]

    // for each filename, create a list item
    availableFiles.forEach(filename => {
        const entry = document.createElement('li')
        entry.className = "create-choose-list-item"
        entry.innerText = filename
        // when a file is clicked, fetch its data and mark it as active
        entry.addEventListener('click', event => {
            const clickedItem = event.target
            activate_file(clickedItem)
        })
        list.append(entry)
    })
}

function submit_data() {
    const selectedFile = document.querySelector(".active-file")
    if(selectedFile == null) {
        alert("Choose a file!")
        return
    }
    const form = document.querySelector("form")
    const inputs = [...form.querySelectorAll("input, select")]
    const valid = inputs.every(input => input.reportValidity())
    
    if(valid) {
        const request = {}
        inputs.forEach(input => {
            request[input.name] = input.value
        })
        // console.log(request)
        fetch("/csv-data/" + selectedFile.innerText, {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(request)
        })
        .then(res => {
            if (!res.ok) throw Error(res.statusText)
            return res.json()
        })
        .then(res => {
            console.log(res.message)
            activate_file(selectedFile)
            form.reset()
        })
        .catch(err => console.log(err))
    }
}

// takes an element and activates it, fetches its data and displays
function activate_file(clickedItem) {
    // grays out all list items
    for(item of document.getElementsByClassName("create-choose-list-item")) {
        item.style.backgroundColor = "rgb(0,80,81)"
        item.className = "create-choose-list-item"
    }
    // greens out clicked item
    clickedItem.style.backgroundColor = "rgb(221,79,5)"
    clickedItem.className = "create-choose-list-item active-file"
    // fetches the selected item's data
    fetch("csv-data/"+clickedItem.innerText)
    .then(res => {
        if (!res.ok) throw Error(res.statusText)
        return res.json()
    })
    .then(res => {
        // get the preview element and delete anything that 
        // was previously in it
        const preview = document.getElementById("preview")
        while(preview.firstChild) {
            preview.removeChild(preview.firstChild)
        }
        // for each csv data line, create a list element in the preview
        res.message.forEach(line => {
            const lineElement = document.createElement("li")
            lineElement.className = "preview-entry"

            // li contains an element for the text
            // and an element for the delete button
            const lineText = document.createElement("span")
            lineText.innerText = line
            lineText.className = "preview-line-text"
            lineElement.append(lineText)

            const deleteButton = document.createElement("span")
            deleteButton.innerText = '\u00D7'
            deleteButton.className = "preview-line-delete"
            // when the delete button is clicked, send deletion to the server
            // and re-activate_files the current file (reloads all preview lines)
            deleteButton.addEventListener("click", delete_line_data)
            lineElement.append(deleteButton)
            preview.append(lineElement)
        })
    })
    .catch(err => console.log(err))
}

function delete_line_data(event) {
    if(confirm("Do you wish to delete this line?")) {
        const line = event.target.parentElement.querySelector(".preview-line-text").innerText
        const selectedFile = document.querySelector(".active-file")
        // TODO MOIKAFSNKOJIFASOJKINSFANKJOFASOHIFASOHIAFSHOINASFNOIAFSGONKJASFONKSFAMOIKAFSNKOJIFASOJKINSFANKJOFASOHIFASOHIAFSHOINASFNOIAFSGONKJASFONKSFA
        // implement line index delete
        // send line number and not the line content
        fetch("csv-data/"+selectedFile.innerText, {
            method:"DELETE",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(line)
        })
        .then(res => {
            if (!res.ok) throw Error(res.statusText)
            return res.json()
        })
        .then(res => {
            console.log(res.message)
            activate_file(selectedFile)
        })
        .catch(err => console.log(err))
    }
}


function updateInputs() {
    const date_offer_received = document.getElementById("date-offer-received")
    const date_prices_map = document.getElementById("date-prices-map")
    const date_sent = document.getElementById("date-sent")
    const date_concluded = document.getElementById("date-concluded")
    const date_sent_label = document.getElementById("date-sent-label")
    const date_concluded_label = document.getElementById("date-concluded-label")

    var status = document.getElementById("dropdown-status");
    console.log("Status: " + status.value);
    switch(status.value) {
        case "not-started":
            setBoxes(true,true,true,true);
            break;
        case "started":
            setBoxes(false,false,true,true);
            break;
        case "sent":
            setBoxes(false,false,false,true);
            break;
        case "concluded":
            setBoxes(false,false,false,false);
            break;
    }

    function setBoxes(a,b,c,d) {
        date_offer_received.disabled = a;
        date_prices_map.disabled = b;
        date_sent.disabled = c;
        date_concluded.disabled = d;
    
        date_sent.required = !c;
        date_concluded.required = !d;
        c ? date_sent_label.className = "" : date_sent_label.className = "required"
        d ? date_concluded_label.className = "" : date_concluded_label.className = "required"

        a ? date_offer_received.placeholder = "" : date_offer_received.placeholder = "optional";
        b ? date_prices_map.placeholder = "" : date_prices_map.placeholder = "optional";
        c ? date_sent.placeholder = "" : date_sent.placeholder = "*required";
        d ? date_concluded.placeholder = "" : date_concluded.placeholder = "*required";
    }
}