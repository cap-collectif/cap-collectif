import { useEffect, useRef } from 'react'

type UseFocusOnLoadMoreOptions = {
  itemIds: string[]
  isLoadingNext: boolean
  idPrefix?: string
  focusSelector?: string
  getElement?: (id: string, idPrefix: string) => HTMLElement | null
}

const defaultGetElement = (id: string, idPrefix: string) => {
  const element = document.getElementById(`${idPrefix}${id}`)
  return element instanceof HTMLElement ? element : null
}

export const useFocusOnLoadMore = ({
  itemIds,
  isLoadingNext,
  idPrefix = '',
  focusSelector,
  getElement = defaultGetElement,
}: UseFocusOnLoadMoreOptions) => {
  const prevCountRef = useRef(0)
  const pendingFocusRef = useRef(false)

  useEffect(() => {
    if (!pendingFocusRef.current) {
      prevCountRef.current = itemIds.length
      return
    }

    if (isLoadingNext) {
      return
    }

    const previousCount = prevCountRef.current

    if (itemIds.length > previousCount) {
      const nextId = itemIds[previousCount]
      const element = nextId ? getElement(nextId, idPrefix) : null

      let focusTarget: HTMLElement | null = null

      if (element && focusSelector) {
        const candidate = element.querySelector(focusSelector)
        focusTarget = candidate instanceof HTMLElement ? candidate : null
      }

      if (!focusTarget && element) {
        const isFocusable = element.matches?.('a,button,[tabindex]:not([tabindex="-1"])') ?? false
        focusTarget = isFocusable ? element : null
      }

      if (focusTarget) {
        requestAnimationFrame(() => {
          focusTarget.focus()
          focusTarget.scrollIntoView({ block: 'start' })
        })
      }
    }

    pendingFocusRef.current = false
    prevCountRef.current = itemIds.length
  }, [focusSelector, getElement, idPrefix, isLoadingNext, itemIds])

  const markPendingFocus = () => {
    pendingFocusRef.current = true
  }

  return { markPendingFocus }
}
