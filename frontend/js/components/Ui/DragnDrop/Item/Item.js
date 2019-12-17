// @flow
import * as React from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import ItemContainer from './Item.style';

type ItemProps = {
  id: string,
  position: number,
  children?: React.Node,
  isDisabled?: boolean,
  onRemove?: Function,
};

const Item = ({ children, id, position, isDisabled, onRemove }: ItemProps) => (
  <Draggable draggableId={id} key={id} index={position} isDragDisabled={!children || isDisabled}>
    {(provided: DraggableProvided) => (
      <ItemContainer
        isEmpty={!children}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}>
        {children && (
          <>
            <i className="cap-android-menu" aria-hidden />

            {children}

            {onRemove && (
              <button type="button" onClick={onRemove} className="btn-remove-choice">
                <i className="cap-delete-1" aria-hidden />
              </button>
            )}
          </>
        )}
      </ItemContainer>
    )}
  </Draggable>
);

export default Item;
