export default async function apiDELETE(URL) {
    const result = {error:false}

    try {
        let res = await fetch(URL, {
            credentials: "include",
            method:"DELETE",
        })
        res = await res.json()
        if (res.error) result.error = res.message
    } catch (err) {
        result.error = err.message
    }

    return result
}