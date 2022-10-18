import React from 'react'
import InputCard from './components/InputCard'
import Info from './components/Info'
import "./Index.css"

function Index() {
  return (
    <div id="index-page">
    <header>
        <h1>Providers App</h1>
        <p>This app will process and nicely display data from your company's providers and contracts.</p>
    </header>
    <section>
        <InputCard /> 
        <Info />
    </section>
    </div>
  )
}

export default Index