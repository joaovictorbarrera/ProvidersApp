export default async function apiGET(URL) {
    const result = {error:false, data:null}

    try {
        let res = await fetch(URL, {
            method:"GET",
            credentials:"include"
        })
    
        res = await res.json()
        if (res.error || !res.data) result.error = res.message
        else {
            result.data = JSON.parse(res.data)
        }
    } catch (err) {
        result.error = err.message
    }

    return result
}