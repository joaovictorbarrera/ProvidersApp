import React, { useState } from "react";
import "./Create.css"
import Sidebar from "./components/Sidebar"
import ProvidersTable from "./components/ProvidersTable"

function Create() {
  const [activeFileName, setActiveFileName] = useState(null)
  
  return (
    <div id="create-page">
      <Sidebar activeFileName={activeFileName} setActiveFileName={setActiveFileName}/>
      
      {
        activeFileName && <ProvidersTable activeFileName={activeFileName}/>
      }
    </div>
  );
}


export default Create;
