import { useLayoutEffect, useState } from 'react'
type DOMRect = {
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
}
export const useBoundingRect = (
  ref: any,
): [DOMRect, (newValue: DOMRect) => void | ((arg0: (newValue: DOMRect) => void) => void)] => {
  const [boundings, setBoundings] = useState<DOMRect>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  })
  useLayoutEffect(() => {
    if (ref.current) {
      setBoundings(ref.current.getBoundingClientRect())
    }
  }, [ref])
  return [boundings, setBoundings]
}
