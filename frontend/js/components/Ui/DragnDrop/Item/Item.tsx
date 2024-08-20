import * as React from 'react'
import type { DraggableProvided } from 'react-beautiful-dnd'
import { Draggable } from 'react-beautiful-dnd'
import ItemContainer from './Item.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'

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
}

const Item = ({ preview, children, id, position, isDisabled, onRemove, width, center, mobileTop }: ItemProps) => (
  <Draggable draggableId={id} key={id} index={position} isDragDisabled={!children || isDisabled}>
    {(provided: DraggableProvided) => (
      <ItemContainer
        width={width}
        center={center}
        mobileTop={mobileTop}
        isEmpty={!children}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        aria-labelledby="drag-instructions"
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
    )}
  </Draggable>
)

export default Item
