import { useEffect } from 'react'

const useScript = (url: string) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    if (document.body) document.body.appendChild(script)
    return () => {
      if (document.body) document.body.removeChild(script)
    }
  }, [url])
}

export default useScript
