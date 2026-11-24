import * as React from 'react'

/**
 * Reserves the space covered by a banner fixed at the bottom of the viewport, so that the end
 * of the page and the focused elements are not hidden behind it (WCAG 2.4.11 Focus Not Obscured).
 */
const useReserveSpaceForFixedBanner = (bannerRef: React.RefObject<HTMLElement>, enabled = true): void => {
  React.useEffect(() => {
    const banner = bannerRef.current
    if (!enabled || !banner || typeof ResizeObserver === 'undefined') return

    const root = document.documentElement
    const observer = new ResizeObserver(() => {
      // offsetHeight is 0 while the banner is hidden (display: none)
      const height = banner.offsetHeight
      root.style.scrollPaddingBottom = height ? `${height}px` : ''
      document.body.style.paddingBottom = height ? `${height}px` : ''
    })
    observer.observe(banner)

    return () => {
      observer.disconnect()
      root.style.scrollPaddingBottom = ''
      document.body.style.paddingBottom = ''
    }
  }, [bannerRef, enabled])
}

export default useReserveSpaceForFixedBanner
