// @flow
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ListContainer, { ListItemContainer } from './List.style';
import Title, { TYPE } from '~/components/Ui/Title/Title';

type ListProps = {
  id: string,
  children: any,
  type?: string,
  title?: string,
  isDisabled?: boolean,
  isCombineEnabled?: boolean,
  hasPositionDisplayed?: boolean,
};

const List = ({
  children,
  id,
  type,
  title,
  isDisabled,
  isCombineEnabled,
  hasPositionDisplayed,
}: ListProps) => (
  <Droppable
    droppableId={id}
    type={type}
    isDropDisabled={isDisabled}
    isCombineEnabled={isCombineEnabled}>
    {provided => (
      <ListContainer
        ref={provided.innerRef}
        {...provided.droppableProps}
        hasPositionDisplayed={hasPositionDisplayed}>
        {provided.placeholder}

        {title && <Title type={TYPE.H3}>{title}</Title>}

        {children.map((child, i) => (
          <ListItemContainer key={i}>
            {hasPositionDisplayed && <span className="item__position">{i}</span>}
            {child}
          </ListItemContainer>
        ))}
      </ListContainer>
    )}
  </Droppable>
);

export default List;
