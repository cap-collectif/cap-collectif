import * as React from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import TabItem from './TabItem'
import { Tab, Edge } from './types'

type DraggableTabProps = {
  tab: Tab
  index: number
  isActive: boolean
  onSelect: (id: string) => void
  onSaved: (updated: Tab) => Promise<void>
  onDeleted: (tabId: string) => Promise<void>
}

const DraggableTab: React.FC<DraggableTabProps> = ({ tab, index, isActive, onSelect, onSaved, onDeleted }) => {
  const tabRef = React.useRef<HTMLDivElement>(null)
  const dragHandleRef = React.useRef<HTMLSpanElement>(null)
  const [dropEdge, setDropEdge] = React.useState<Edge | null>(null)

  React.useEffect(() => {
    const el = tabRef.current
    const handle = dragHandleRef.current
    if (!el && !isActive) return

    const cleanups: Array<() => void> = [
      dropTargetForElements({
        element: el,
        getData: ({ input }) =>
          attachClosestEdge({ id: tab.id, index }, { input, element: el, allowedEdges: ['left', 'right'] }),
        onDragEnter: ({ self }) => setDropEdge(extractClosestEdge(self.data) as Edge),
        onDrag: ({ self }) => setDropEdge(extractClosestEdge(self.data) as Edge),
        onDragLeave: () => setDropEdge(null),
        onDrop: () => setDropEdge(null),
      }),
    ]

    if (handle) {
      cleanups.push(
        draggable({
          element: el,
          dragHandle: handle,
          getInitialData: () => ({ id: tab.id, index }),
        }),
      )
    }

    return combine(...cleanups)
  }, [tab.id, index, isActive])

  return (
    <div ref={tabRef}>
      <TabItem
        tab={tab}
        isActive={isActive}
        dropEdge={dropEdge}
        onSelect={onSelect}
        onSaved={onSaved}
        onDeleted={onDeleted}
        dragHandleRef={dragHandleRef}
      />
    </div>
  )
}

export default DraggableTab
