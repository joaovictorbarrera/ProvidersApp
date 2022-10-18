export default function convertPathToFilename(path) {
    const parts = path.split("\\")
    return parts[parts.length - 1]
}