import React, { useEffect } from 'react'

function Graphs({graphs}) {
    useEffect(() => {
        const graphWrapper = document.querySelectorAll(".result-graph-wrapper")
    
        graphWrapper.forEach((wrapper, index) => {
          const fragment = document.createRange().createContextualFragment(graphs[index]);
          wrapper.append(fragment)
        })
    
    }, [graphs])
    
    return (
        <>
        {graphs.map(graph => 
        <div key={JSON.stringify(graph)} className='result-graph-wrapper'></div>
        )}
        </>
    )
}

export default Graphs