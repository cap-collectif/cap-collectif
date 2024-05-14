// @ts-nocheck
/* eslint-disable */
// we need to use useEffect for mount and unmount, without the dependency array
import { useRef, useEffect, useState } from 'react'

const useShowMore = (
  overflowEnable?: boolean,
  length: number,
): [React.MutableRefObject<any>, React.MutableRefObject<any>, React.MutableRefObject<any>, number, boolean] => {
  const [shouldDisplaySeeMore, setShouldDisplaySeeMore] = useState(overflowEnable || false)
  const [overflowIndex, setOverflowIndex] = useState(length)
  const containerRef = useRef<any | null>(null)
  const seeMoreRef = useRef<any | null>(null)
  const itemsWidth: Array<number> = []

  const getSeeMoreWidth = (): number => {
    if (seeMoreRef && seeMoreRef.current) {
      return seeMoreRef.current.getBoundingClientRect().width
    }

    return 0
  }

  const getContainerWidth = (): number => {
    if (containerRef && containerRef.current) {
      return containerRef.current.getBoundingClientRect().width
    }

    return 0
  }

  const getTotalItemsWidth = (): number => itemsWidth.reduce((acc, val) => acc + val, 0)

  const handleItemWidth = (element: HTMLElement | null | undefined) => {
    if (element) {
      itemsWidth.push(element.offsetWidth)
    }
  }

  const getOverflowIndex = (initWidth: number, maxWidth: number): number => {
    if (itemsWidth) {
      let counter: number = initWidth
      let maxIndex = length

      // Break the loop when accumulation of items width is greater than container size
      // Then, save the index to get the maximum number of items to display
      for (let index = 0; index < maxIndex; index++) {
        counter += itemsWidth[index]

        if (counter >= maxWidth) {
          maxIndex = index
          break
        }
      }

      return maxIndex
    }

    return length
  }

  const handleOverflow = () => {
    const seeMoreWidth = getSeeMoreWidth()
    const totalItemsWidth = getTotalItemsWidth()
    const containerWidth = getContainerWidth()

    if (totalItemsWidth > containerWidth) {
      const index = getOverflowIndex(seeMoreWidth, containerWidth)
      setOverflowIndex(index)
      setShouldDisplaySeeMore(index < length)
    } else {
      setShouldDisplaySeeMore(false)
      setOverflowIndex(length)
    }
  }

  useEffect(() => {
    if (overflowEnable) {
      handleOverflow()
      window.addEventListener('resize', handleOverflow)
    }

    return () => {
      if (overflowEnable) {
        window.removeEventListener('resize', handleOverflow)
      }
    }
  }, [])
  return [
    containerRef,
    seeMoreRef,
    handleItemWidth,
    overflowEnable ? overflowIndex : length,
    overflowEnable ? shouldDisplaySeeMore : false,
  ]
}

export default useShowMore
