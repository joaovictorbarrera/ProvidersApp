import { useCallback } from 'react'

function useDownloadFile() {
    const download = useCallback(async (URL, filename) => {
      const result = {error:false}

      await fetch(URL, {
        credentials:"include",
      })
      .then(res => {
        if (res.headers.get("Content-Type") === "application/json") return res.json()
        return res.blob()
      })
      .then(data => {
        if (data.constructor === {}.constructor) {
          if (data.error) result.error = data.message
          return
        }
        let url = window.URL.createObjectURL(data);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      })
      .catch(err => result.error = err)

      return result
    }, [])

    return download
}

export default useDownloadFile