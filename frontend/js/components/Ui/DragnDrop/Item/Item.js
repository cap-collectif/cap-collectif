// @flow
import * as React from 'react';
import { Draggable, type DraggableProvided } from 'react-beautiful-dnd';
import ItemContainer from './Item.style';
import Icon from '~/components/Ui/Icons/Icon';

type ItemProps = {
  id: string,
  position: number,
  children?: React.Node,
  preview?: React.Node,
  isDisabled?: boolean,
  onRemove?: Function,
};

const Item = ({ preview, children, id, position, isDisabled, onRemove }: ItemProps) => (
  <Draggable draggableId={id} key={id} index={position} isDragDisabled={!children || isDisabled}>
    {(provided: DraggableProvided) => (
      <ItemContainer
        isEmpty={!children}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}>
        {preview}

        {children && (
          <>
            <Icon viewBox="0 0 20 12" name="menu" className="icon-menu" />

            {children}

            {onRemove && (
              <button type="button" onClick={onRemove} className="btn-remove-choice">
                <Icon size={10} viewBox="0 0 10 10" name="close" />
              </button>
            )}
          </>
        )}
      </ItemContainer>
    )}
  </Draggable>
);

export default Item;
