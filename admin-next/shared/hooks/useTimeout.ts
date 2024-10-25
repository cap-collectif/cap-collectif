// https://github.com/jkomyno/usetimeout-react-hook/blob/fbd793e8a2b8c1101c56157194fb3db685bacc7f/src/useTimeout.ts
// and adapted it a bit
import { useEffect, useRef } from 'react'
export type CancelTimer = () => void
export type UseTimeout = (callback: () => void, timeout: number, deps?: any[]) => CancelTimer
export const useTimeout: UseTimeout = (callback, timeout, deps = []) => {
  const refCallback = useRef()
  const refTimer = useRef()
  useEffect(() => {
    // @ts-ignore
    refCallback.current = callback
  }, [callback])

  /**
   * The timer is restarted every time an item in `deps` changes.
   *
   */
  useEffect(() => {
    let timerID = null

    if (typeof window !== 'undefined') {
      timerID = window.setTimeout(refCallback.current as any as () => void, timeout)
      refTimer.current = timerID
    }

    // cleans the timer identified by timerID when the effect is unmounted.
    return () => {
      if (typeof window !== 'undefined' && timerID) {
        window.clearTimeout(timerID)
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  /**
   * Returns a function that can be used to cancel the current timeout.
   * It does so using `timeHandler.clearTimeout` without exposing the last
   * reference to the timer to the user.
   */
  function cancelTimer() {
    if (typeof window === 'undefined') return
    return window.clearTimeout(refTimer.current)
  }

  return cancelTimer
}
export default useTimeout
