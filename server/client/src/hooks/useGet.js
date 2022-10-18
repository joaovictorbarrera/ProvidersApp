import { useEffect, useState } from 'react'
import useRefresh from './useRefresh'

function useGet(url) {
    const [updator, refresh] = useRefresh()
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      setLoading(true)
      const abortController = new AbortController()
      fetch(url, {
        method:"GET",
        credentials:"include",
        signal: abortController.signal
      })
      .then(res => res.json())
      .then(res => {
        setLoading(false)
        if (res.error || !res.data) {
          setData(null)
          setError(res.message)
        }
        else {
          setData(JSON.parse(res.data))
          setError(null)
        }
      })
      .catch(err => {
        if (err.message === 'The user aborted a request.') return
        
        setData(null)
        setLoading(false)
        setError(err.message)
      })

      return () => abortController.abort()
    }, [url, updator])

    return [data, error, loading, refresh]
}

export default useGet