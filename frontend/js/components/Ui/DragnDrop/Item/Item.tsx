import * as React from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import ItemContainer from './Item.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import { DragnDropContext } from '../Context/Context'

type ItemProps = {
  id: string
  position: number
  children?: JSX.Element | JSX.Element[] | string
  preview?: JSX.Element | JSX.Element[] | string
  isDisabled?: boolean
  onRemove?: (...args: Array<any>) => any
  width?: string
  center?: boolean
  mobileTop?: boolean
  droppableId?: string
  isCombineEnabled?: boolean
  isCombineOnly?: boolean
}

const Item = ({
  preview,
  children,
  id,
  position,
  isDisabled,
  onRemove,
  width,
  center,
  mobileTop,
  droppableId = 'default',
  isCombineEnabled,
  isCombineOnly,
}: ItemProps) => {
  const itemRef = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(DragnDropContext)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    const element = itemRef.current
    if (!element) return

    const isDragDisabled = !children || isDisabled || context?.isDisabled

    if (context) {
      context.registerDraggable(droppableId, id, position)
    }

    const cleanups: (() => void)[] = []

    if (!isDragDisabled) {
      cleanups.push(
        draggable({
          element,
          getInitialData: () => ({
            draggableId: id,
            droppableId,
            index: position,
          }),
          onDragStart: () => setIsDragging(true),
          onDrop: () => setIsDragging(false),
        }),
      )
    }

    if (isCombineEnabled || isCombineOnly) {
      // Combine mode: drop target with draggableId triggers combine logic in Context
      cleanups.push(
        dropTargetForElements({
          element,
          getData: () => ({
            draggableId: id,
            droppableId,
            index: position,
          }),
          canDrop: ({ source }) => {
            // Don't allow dropping on itself
            const sourceData = source.data as { draggableId: string }
            return sourceData.draggableId !== id
          },
        }),
      )
    } else {
      // Reorder mode: drop target without draggableId so Context computes destination by index
      cleanups.push(
        dropTargetForElements({
          element,
          getData: () => ({
            droppableId,
            index: position,
          }),
          canDrop: ({ source }) => {
            // Don't allow dropping on itself
            const sourceData = source.data as { draggableId: string }
            return sourceData.draggableId !== id
          },
        }),
      )
    }

    return () => {
      cleanups.forEach(cleanup => cleanup())
      if (context) {
        context.unregisterDraggable(droppableId, id)
      }
    }
  }, [id, position, children, isDisabled, droppableId, isCombineEnabled, isCombineOnly, context])

  return (
    <ItemContainer
      width={width}
      center={center}
      mobileTop={mobileTop}
      isEmpty={!children}
      ref={itemRef}
      aria-labelledby="drag-instructions"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: !children || isDisabled ? 'default' : 'grab',
      }}
    >
      {preview}

      {children && (
        <>
          <Icon name={ICON_NAME.menu} className="icon-menu" />

          {children}

          {onRemove && (
            <button type="button" onClick={onRemove} className="btn-remove-choice">
              <Icon name={ICON_NAME.close} size={10} color={colors.darkGray} />
            </button>
          )}
        </>
      )}
    </ItemContainer>
  )
}

export default Item
