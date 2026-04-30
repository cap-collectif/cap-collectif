import * as React from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

type Item = { id: string; title: string; cover?: string }
type Option = { value: string; label: string; cover?: string }

type UseDraggableItemListArgs = {
  initialItems: Item[]
  type: string
  tabId: string
  onSave: (items: Item[]) => Promise<boolean>
}

const useDraggableItemList = ({ initialItems, type, tabId, onSave }: UseDraggableItemListArgs) => {
  const [localItems, setLocalItems] = React.useState<Item[]>(initialItems)
  const localItemsRef = React.useRef(localItems)
  localItemsRef.current = localItems

  const [selectValue, setSelectValue] = React.useState<Option | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)

  const onSaveRef = React.useRef(onSave)
  onSaveRef.current = onSave

  const prevInitialIdsRef = React.useRef<string>('')
  const initialItemsKey = initialItems.map(i => i.id).join(',')
  if (prevInitialIdsRef.current !== initialItemsKey) {
    prevInitialIdsRef.current = initialItemsKey
    // Sync only when the actual item set changes (server confirmation), not on
    // every render caused by an unstable inline array reference at the call site.
    setLocalItems(initialItems)
  }

  const handleAdd = async (selected: Option | null) => {
    if (!selected || localItems.some(i => i.id === selected.value)) return
    const previous = localItems
    const newItems = [...localItems, { id: selected.value, title: selected.label, cover: selected.cover }]
    setLocalItems(newItems)
    setIsAdding(true)
    const ok = await onSave(newItems)
    setIsAdding(false)
    setSelectValue(null)
    if (!ok) setLocalItems(previous)
  }

  const handleRemove = async (id: string) => {
    const previous = localItems
    const newItems = localItems.filter(i => i.id !== id)
    setLocalItems(newItems)
    const ok = await onSave(newItems)
    if (!ok) setLocalItems(previous)
  }

  React.useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== type) return
        const destination = location.current.dropTargets[0]
        if (!destination) return
        const sourceIndex = source.data.index as number
        const destIndex = destination.data.index as number
        const edge = extractClosestEdge(destination.data) as 'top' | 'bottom'
        let newIndex = edge === 'bottom' ? destIndex + 1 : destIndex
        if (sourceIndex < newIndex) newIndex -= 1
        if (sourceIndex === newIndex) return
        const current = localItemsRef.current
        const reordered = [...current]
        const [moved] = reordered.splice(sourceIndex, 1)
        reordered.splice(newIndex, 0, moved)
        setLocalItems(reordered)
        onSaveRef.current(reordered).then(ok => {
          if (!ok) setLocalItems(current)
        })
      },
    })
  }, [tabId, type])

  return { localItems, selectValue, isAdding, handleAdd, handleRemove }
}

export default useDraggableItemList
