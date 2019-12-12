// @flow
import * as React from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import ItemContainer from './Item.style';

type ItemProps = {
  id: string,
  position: number,
  children?: React.Node,
  isDisabled?: boolean,
  isEmpty?: boolean,
};

const Item = ({ children, id, position, isDisabled, isEmpty }: ItemProps) => (
  <Draggable draggableId={id} index={position} isDragDisabled={isEmpty || isDisabled}>
    {(provided: DraggableProvided) => (
      <ItemContainer
        isEmpty={isEmpty}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}>
        {!isEmpty && <i className="cap-android-menu" aria-hidden />}
        {children}
      </ItemContainer>
    )}
  </Draggable>
);

export default Item;
