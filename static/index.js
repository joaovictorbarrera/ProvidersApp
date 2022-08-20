// event listener for custom file button
document.querySelector("#cloud-button").addEventListener('click', () => {
    console.log("Log: File Input Window Clicked");
    document.querySelector("#file-upload-button").click()
})

// opened popup
document.getElementById("choose-open").addEventListener('click', open_popup)

// closed popup
document.getElementById("choose-close").addEventListener('click', close_popup)

// update text for file name box
document.querySelector("#file-upload-button").addEventListener('change', update_filename_box)

// opens the popup and gets the files
function open_popup() {
    // show popup
    document.getElementsByClassName("choose-popup")[0].style.display = "flex"

    // fetch the available files
    fetch("uploaded-files")
    .then(res => {
        if (!res.ok) throw Error(res.statusText)
        return res.json()
    })
    .then(create_list)
    .catch(err => console.log(err))
}

function create_list(res) {
    // gets the list of choices
    const choose_list = document.getElementsByClassName("choose-list")[0]

    // remove all choices if they exist
    while(choose_list.firstChild) {
        choose_list.removeChild(choose_list.firstChild)
    }
    // for each available file, setup
    const availableFiles = JSON.parse(res.message)
    availableFiles.forEach(filename => {
        // creates list item, which will contain the text and delete button
        entry = document.createElement('li')
        entry.className = "choose-list-item"
        
        // creates element for the text and sets for this filename
        text = document.createElement('p')
        text.innerText = filename
        text.className = "disableSelect"
        entry.append(text)

        // creates delete button
        deleteButton = document.createElement('span')
        deleteButton.className = 'choose-list-item-delete'
        deleteButton.innerText = '\u00D7'
        // delete button was clicked
        deleteButton.addEventListener('click', delete_file)
        entry.append(deleteButton)

        // choice was double clicked
        entry.addEventListener('dblclick', load_file)
        choose_list.appendChild(entry)
    })
}

function load_file(event) {
    // fix if clicked on top of text instead of free area
    let name = null
    if(!event.target.querySelector("p")) {
        name = event.target.innerText
    } else {
        name = event.target.querySelector("p").innerText
    }
    // sends the selected file name to the server
    fetch('/uploaded-files', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(name)
    })
    // redirects user to result page
    .then(() => location.href = '/result')
}

function delete_file(event) {
    // confirms that the user wants to delete this file

    if(confirm("Deseja deletar?")) {
        // fetch delete for this file
        fetch('/uploaded-files', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(event.target.parentElement.querySelector('p').innerText)
        })
        // recalls itself to update the available files
        .then(() => {
            open_popup()
        })
    }
}

function update_filename_box() {
    let file_name = document.querySelector("#file-upload-button").value.split('\\');
    file_name = file_name[file_name.length - 1];
    console.log(file_name);
    document.querySelector("#filename-box").innerText = file_name;
}

function close_popup() {
    // hide popup
    document.getElementsByClassName("choose-popup")[0].style.display = "none"

    // remove all children
    const entryList = document.getElementsByClassName("choose-list")[0]
    while(entryList.firstChild) {
        entryList.removeChild(entryList.firstChild)
    }
}