import { useState } from 'react'

export const clearQueryUrl = (url: URL): URL => {
  url.href = url.href.replace(url.search, '')
  return url
}
type UseStateQueryResult = [string, (value: string) => void]
export function useUrlState(key: string, defaultValue: string): UseStateQueryResult {
  const url = new URL(window.location.href)
  const initialValue = url.searchParams.get(key)
  const [value, setValue] = useState(initialValue || defaultValue)

  const handleValue = (newValue: string) => {
    const updatedUrl = new URL(window.location.href)
    updatedUrl.searchParams.set(key, newValue)
    window.history.replaceState(null, '', updatedUrl.toString())
    setValue(newValue)
  }

  return [value, handleValue]
}
export default useUrlState
