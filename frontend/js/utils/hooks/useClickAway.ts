import * as React from 'react'

const useClickAway = <T extends HTMLElement>(
  ref: {
    current: T | null
  },
  onClickAway: () => void,
  deps: ReadonlyArray<any> = [],
) => {
  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as any as Node)) {
        onClickAway()
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, onClickAway, ...deps],
  )
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [handleClickOutside])
}

export default useClickAway
