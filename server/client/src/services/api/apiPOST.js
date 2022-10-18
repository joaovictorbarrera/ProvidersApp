export default async function apiPOST(URL, payload, options={}) {
    const result = {error:false}

    try {
        let res = await fetch(URL, {
            credentials: "include",
            method:"POST",
            body: payload,
            ...options
        })
        res = await res.json()
        if (res.error) result.error = res.message
    } catch (err) {
        result.error = err.message
    }

    return result
}