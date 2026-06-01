import * as React from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import ContextContainer from './Context.style'

export type DropResult = {
  source: {
    droppableId: string
    index: number
  }
  destination: {
    droppableId: string
    index: number
  } | null
  draggableId: string
  combine?: {
    draggableId: string
    droppableId: string
    index?: number
  } | null
  reason?: 'DROP' | 'CANCEL'
}

export type DragUpdate = {
  source: {
    droppableId: string
    index: number
  }
  destination: {
    droppableId: string
    index: number
  } | null
  draggableId: string
  combine?: {
    draggableId: string
    droppableId: string
    index?: number
  } | null
}

export type DragStart = {
  draggableId: string
  source: {
    droppableId: string
    index: number
  }
}

export type ResponderProvided = {
  announce: (message: string) => void
}

type OnDragEndResponder = (result: DropResult, provided?: ResponderProvided) => void
type OnDragUpdateResponder = (update: DragUpdate, provided?: ResponderProvided) => void
type OnDragStartResponder = (start: DragStart, provided?: ResponderProvided) => void

type ContextProps = {
  onDragEnd: OnDragEndResponder
  children: JSX.Element | JSX.Element[] | string
  onDragUpdate?: OnDragUpdateResponder
  onDragStart?: OnDragStartResponder
  isDisabled?: boolean
}

type DragnDropContextType = {
  contextId: string
  isDisabled?: boolean
  onDragEnd: OnDragEndResponder
  onDragUpdate?: OnDragUpdateResponder
  onDragStart?: OnDragStartResponder
  registerDroppable: (id: string, element: HTMLElement) => void
  unregisterDroppable: (id: string) => void
  getDroppableItems: (droppableId: string) => string[]
  registerDraggable: (droppableId: string, draggableId: string, index: number) => void
  unregisterDraggable: (droppableId: string, draggableId: string) => void
}

type DropTarget = {
  element?: Element
  data: Record<string, any>
}

export const DragnDropContext = React.createContext<DragnDropContextType | null>(null)

let dragnDropContextCount = 0

const getContextDropTarget = (dropTargets: Array<DropTarget>, contextId: string, sourceDraggableId: string) => {
  const contextDropTargets = dropTargets.filter(dropTarget => dropTarget.data.contextId === contextId)

  return (
    contextDropTargets.find(
      dropTarget =>
        dropTarget.data.draggableId !== sourceDraggableId &&
        (dropTarget.data.draggableId || typeof dropTarget.data.index === 'number'),
    ) ??
    contextDropTargets.find(dropTarget => dropTarget.data.draggableId !== sourceDraggableId) ??
    contextDropTargets[0]
  )
}

const getDropTargetIndex = (dropTarget: DropTarget, clientY?: number) => {
  if (typeof dropTarget.data.index === 'number') return dropTarget.data.index
  if (typeof clientY !== 'number' || !(dropTarget.element instanceof HTMLElement)) return null

  const children = Array.from(dropTarget.element.children)
  const index = children.findIndex(child => {
    const rect = child.getBoundingClientRect()
    return clientY < rect.top + rect.height / 2
  })

  if (index !== -1) return index

  return children.length > 0 ? children.length - 1 : null
}

const Context = ({ children, onDragEnd, onDragUpdate, onDragStart, isDisabled }: ContextProps) => {
  const [contextId] = React.useState(() => `dragndrop-context-${dragnDropContextCount++}`)
  const droppablesRef = React.useRef<Map<string, HTMLElement>>(new Map())
  const draggablesRef = React.useRef<Map<string, Map<string, number>>>(new Map())

  const registerDroppable = React.useCallback((id: string, element: HTMLElement) => {
    droppablesRef.current.set(id, element)
  }, [])

  const unregisterDroppable = React.useCallback((id: string) => {
    droppablesRef.current.delete(id)
    draggablesRef.current.delete(id)
  }, [])

  const registerDraggable = React.useCallback((droppableId: string, draggableId: string, index: number) => {
    if (!draggablesRef.current.has(droppableId)) {
      draggablesRef.current.set(droppableId, new Map())
    }
    draggablesRef.current.get(droppableId)?.set(draggableId, index)
  }, [])

  const unregisterDraggable = React.useCallback((droppableId: string, draggableId: string) => {
    draggablesRef.current.get(droppableId)?.delete(draggableId)
  }, [])

  const getDroppableItems = React.useCallback((droppableId: string) => {
    const items = draggablesRef.current.get(droppableId)
    if (!items) return []
    return Array.from(items.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id)
  }, [])

  React.useEffect(() => {
    if (isDisabled) return

    const cleanup = monitorForElements({
      canMonitor: ({ source }) => source.data.contextId === contextId,
      onDragStart: ({ source }) => {
        const sourceData = source.data as { contextId?: string; draggableId: string; droppableId: string; index: number }
        if (sourceData.contextId !== contextId) return

        if (onDragStart) {
          const provided: ResponderProvided = {
            announce: (message: string) => {
              // Screen reader announcement
              const announcement = document.createElement('div')
              announcement.setAttribute('role', 'status')
              announcement.setAttribute('aria-live', 'polite')
              announcement.setAttribute('aria-atomic', 'true')
              announcement.style.position = 'absolute'
              announcement.style.width = '1px'
              announcement.style.height = '1px'
              announcement.style.padding = '0'
              announcement.style.margin = '-1px'
              announcement.style.overflow = 'hidden'
              announcement.style.clip = 'rect(0, 0, 0, 0)'
              announcement.style.whiteSpace = 'nowrap'
              announcement.style.border = '0'
              announcement.textContent = message
              document.body.appendChild(announcement)
              setTimeout(() => announcement.remove(), 1000)
            },
          }
          onDragStart(
            {
              draggableId: sourceData.draggableId,
              source: {
                droppableId: sourceData.droppableId,
                index: sourceData.index,
              },
            },
            provided
          )
        }
      },
      onDrag: ({ source, location }) => {
        if (!onDragUpdate) return

        const sourceData = source.data as { contextId?: string; draggableId: string; droppableId: string; index: number }
        if (sourceData.contextId !== contextId) return

        const dropTarget = getContextDropTarget(location.current.dropTargets, contextId, sourceData.draggableId)

        if (dropTarget) {
          const targetData = dropTarget.data as { droppableId: string; index?: number; draggableId?: string }

          const provided: ResponderProvided = {
            announce: () => {},
          }

          // Check if we're combining (hovering over another draggable)
          if (targetData.draggableId && targetData.draggableId !== sourceData.draggableId) {
            onDragUpdate(
              {
                draggableId: sourceData.draggableId,
                source: {
                  droppableId: sourceData.droppableId,
                  index: sourceData.index,
                },
                destination: null,
                combine: {
                  draggableId: targetData.draggableId,
                  droppableId: targetData.droppableId,
                  index: targetData.index,
                },
              },
              provided
            )
          } else {
            onDragUpdate(
              {
                draggableId: sourceData.draggableId,
                source: {
                  droppableId: sourceData.droppableId,
                  index: sourceData.index,
                },
                destination: {
                  droppableId: targetData.droppableId,
                  index: getDropTargetIndex(dropTarget, location.current.input?.clientY) ?? 0,
                },
                combine: null,
              },
              provided
            )
          }
        }
      },
      onDrop: ({ source, location }) => {
        const sourceData = source.data as { contextId?: string; draggableId: string; droppableId: string; index: number }
        if (sourceData.contextId !== contextId) return

        const dropTarget = getContextDropTarget(location.current.dropTargets, contextId, sourceData.draggableId)

        const provided: ResponderProvided = {
          announce: (message: string) => {
            const announcement = document.createElement('div')
            announcement.setAttribute('role', 'status')
            announcement.setAttribute('aria-live', 'polite')
            announcement.setAttribute('aria-atomic', 'true')
            announcement.style.position = 'absolute'
            announcement.style.width = '1px'
            announcement.style.height = '1px'
            announcement.style.padding = '0'
            announcement.style.margin = '-1px'
            announcement.style.overflow = 'hidden'
            announcement.style.clip = 'rect(0, 0, 0, 0)'
            announcement.style.whiteSpace = 'nowrap'
            announcement.style.border = '0'
            announcement.textContent = message
            document.body.appendChild(announcement)
            setTimeout(() => announcement.remove(), 1000)
          },
        }

        if (!dropTarget) {
          onDragEnd(
            {
              draggableId: sourceData.draggableId,
              source: {
                droppableId: sourceData.droppableId,
                index: sourceData.index,
              },
              destination: null,
              reason: 'DROP',
            },
            provided
          )
          return
        }

        const targetData = dropTarget.data as { droppableId: string; index?: number; draggableId?: string }

        // Check if we're combining (dropping onto another draggable)
        if (targetData.draggableId && targetData.draggableId !== sourceData.draggableId) {
          onDragEnd(
            {
              draggableId: sourceData.draggableId,
              source: {
                droppableId: sourceData.droppableId,
                index: sourceData.index,
              },
              destination: null,
              combine: {
                draggableId: targetData.draggableId,
                droppableId: targetData.droppableId,
                index: targetData.index,
              },
              reason: 'DROP',
            },
            provided
          )
        } else {
          const destinationIndex = getDropTargetIndex(dropTarget, location.current.input?.clientY) ?? sourceData.index
          onDragEnd(
            {
              draggableId: sourceData.draggableId,
              source: {
                droppableId: sourceData.droppableId,
                index: sourceData.index,
              },
              destination: {
                droppableId: targetData.droppableId,
                index: destinationIndex,
              },
              reason: 'DROP',
            },
            provided
          )
        }
      },
    })

    return cleanup
  }, [onDragEnd, onDragUpdate, onDragStart, isDisabled, contextId])

  const contextValue = React.useMemo(
    () => ({
      contextId,
      isDisabled,
      onDragEnd,
      onDragUpdate,
      onDragStart,
      registerDroppable,
      unregisterDroppable,
      getDroppableItems,
      registerDraggable,
      unregisterDraggable,
    }),
    [contextId, isDisabled, onDragEnd, onDragUpdate, onDragStart, registerDroppable, unregisterDroppable, getDroppableItems, registerDraggable, unregisterDraggable]
  )

  return (
    <DragnDropContext.Provider value={contextValue}>
      <ContextContainer>{children}</ContextContainer>
    </DragnDropContext.Provider>
  )
}

export default Context
