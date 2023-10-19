import { useState, useEffect } from 'react'

export const useOnScreen = (ref: { current?: null | HTMLElement }) => {
  const [isIntersecting, setIntersecting] = useState(false)
  const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting))
  useEffect(() => {
    if (!ref.current) return
    observer.observe(ref.current)
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect()
    } // eslint-disable-next-line
  }, [])
  return isIntersecting
}
export default useOnScreen
