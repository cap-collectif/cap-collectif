// @flow
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
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
  hasPositionDisplayed?: boolean,
  mode?: string,
};

const List = ({
  children,
  id,
  title,
  isDisabled,
  isCombineEnabled,
  hasPositionDisplayed,
}: ListProps) => (
  <Droppable droppableId={id} isDropDisabled={isDisabled} isCombineEnabled={isCombineEnabled}>
    {provided => (
      <ListContainer
        ref={provided.innerRef}
        {...provided.droppableProps}
        hasPositionDisplayed={hasPositionDisplayed}>
        {title && (
          <Title type={TYPE.H3}>
            <FormattedMessage id={title} />
          </Title>
        )}

        {children.map((child, i) => (
          <ListItemContainer key={i}>
            {hasPositionDisplayed && (
              <span className="item__position">{child.props.position + 1}</span>
            )}
            {child}
          </ListItemContainer>
        ))}
        {provided.placeholder}
      </ListContainer>
    )}
  </Droppable>
);

export default List;
