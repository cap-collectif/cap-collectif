import * as React from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'

type AllowedEdge = 'top' | 'bottom' | 'left' | 'right'

type UseDraggableElementArgs = {
  id: string
  index: number
  type: string
  allowedEdges: AllowedEdge[]
  elementRef: React.RefObject<HTMLElement | null>
  /** When provided, dragging is only enabled via this handle element. */
  handleRef?: React.RefObject<HTMLElement | null>
}

const useDraggableElement = ({ id, index, type, allowedEdges, elementRef, handleRef }: UseDraggableElementArgs) => {
  const [dropEdge, setDropEdge] = React.useState<AllowedEdge | null>(null)

  React.useEffect(() => {
    const el = elementRef.current
    if (!el) return
    const handle = handleRef?.current

    const cleanups: Array<() => void> = [
      dropTargetForElements({
        element: el,
        getData: ({ input }) =>
          attachClosestEdge({ id, index }, { input, element: el, allowedEdges }),
        onDragEnter: ({ self }) => setDropEdge(extractClosestEdge(self.data) as AllowedEdge),
        onDrag: ({ self }) => setDropEdge(extractClosestEdge(self.data) as AllowedEdge),
        onDragLeave: () => setDropEdge(null),
        onDrop: () => setDropEdge(null),
      }),
    ]

    if (!handleRef || handle) {
      cleanups.push(
        draggable({
          element: el,
          ...(handle ? { dragHandle: handle } : {}),
          getInitialData: () => ({ type, id, index }),
        }),
      )
    }

    return combine(...cleanups)
  }, [id, index, type])

  return { dropEdge }
}

export default useDraggableElement
