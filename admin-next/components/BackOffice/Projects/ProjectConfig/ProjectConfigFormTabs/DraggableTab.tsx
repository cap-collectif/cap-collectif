import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { DraggableTab_tab$key } from '@relay/DraggableTab_tab.graphql'
import TabItem from './TabItem'
import { Edge, SavedValues } from './types'
import useDraggableElement from './useDraggableElement'

const FRAGMENT = graphql`
  fragment DraggableTab_tab on ProjectTab {
    id
    ...TabItem_tab
  }
`

type DraggableTabProps = {
  tab: DraggableTab_tab$key
  index: number
  isActive: boolean
  onSelect: (slug: string) => void
  onSaved: (values: SavedValues) => Promise<void>
  onDeleted: (tabId: string) => Promise<void>
}

const DraggableTab: React.FC<DraggableTabProps> = ({ tab: tabRef, index, isActive, onSelect, onSaved, onDeleted }) => {
  const tab = useFragment(FRAGMENT, tabRef)

  const elementRef = React.useRef<HTMLDivElement>(null)
  const dragHandleRef = React.useRef<HTMLSpanElement>(null)

  const { dropEdge } = useDraggableElement({
    id: tab.id,
    index,
    type: 'tab',
    allowedEdges: ['left', 'right'],
    elementRef,
    handleRef: dragHandleRef,
  })

  return (
    <div ref={elementRef}>
      <TabItem
        tab={tab}
        isActive={isActive}
        dropEdge={dropEdge as Edge | null}
        onSelect={onSelect}
        onSaved={onSaved}
        onDeleted={onDeleted}
        dragHandleRef={dragHandleRef}
      />
    </div>
  )
}

export default DraggableTab
