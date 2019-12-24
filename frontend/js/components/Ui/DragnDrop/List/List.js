// @flow
import * as React from 'react';
import { Droppable, DraggableProvided } from 'react-beautiful-dnd';
import { FormattedMessage } from 'react-intl';
import ListContainer, { ListItemContainer } from './List.style';
import Title, { TYPE } from '~/components/Ui/Title/Title';

type ListProps = {
  id: string,
  children: any,
  type?: string,
  title?: string,
  isDisabled?: boolean,
  isCombineEnabled?: boolean,
  isCombineOnly?: boolean,
  hasPositionDisplayed?: boolean,
  mode?: string,
};

const List = ({
  children,
  id,
  title,
  isDisabled,
  isCombineEnabled,
  isCombineOnly,
  hasPositionDisplayed,
}: ListProps) => (
  <ListContainer hasPositionDisplayed={hasPositionDisplayed}>
    {title && (
      <Title type={TYPE.H3}>
        <FormattedMessage id={title} />
      </Title>
    )}
    <Droppable
      droppableId={id}
      isDropDisabled={isDisabled}
      isCombineEnabled={isCombineEnabled}
      isCombineOnly={isCombineOnly}>
      {(provided: DraggableProvided) => (
        <ul className="wrapper-item-container" ref={provided.innerRef} {...provided.droppableProps}>
          {children.map((child, i: string) => (
            <ListItemContainer key={i}>
              {hasPositionDisplayed && (
                <span className="item__position">{child.props.position + 1}</span>
              )}
              {child}
            </ListItemContainer>
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  </ListContainer>
);

export default List;
