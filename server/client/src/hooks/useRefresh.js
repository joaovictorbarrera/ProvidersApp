import { useCallback, useState } from "react"

export default function useRefresh() {
  const [updator, setUpdator] = useState({})

  return [updator, useCallback(() => setUpdator({}), [])]
}