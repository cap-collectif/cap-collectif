// @flow
import * as React from 'react';
import { Droppable, type DroppableProvided } from 'react-beautiful-dnd';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ListContainer, { ListItemContainer } from './List.style';
import Title, { TYPE } from '~/components/Ui/Title/Title';

type ListProps = {
  id: string,
  children: any,
  title?: string,
  isDisabled?: boolean,
  isCombineEnabled?: boolean,
  isCombineOnly?: boolean,
  hasPositionDisplayed?: boolean,
};

const List = ({
  children,
  id,
  title,
  isDisabled,
  isCombineEnabled,
  isCombineOnly,
  hasPositionDisplayed,
}: ListProps) => {
  return (
    <ListContainer hasPositionDisplayed={hasPositionDisplayed} id={id}>
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
        {(provided: DroppableProvided) => (
          <ul
            className="wrapper-item-container"
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {children.map((child, i: string) => {
              let points = false;
              if (
                child.props &&
                child.props.children &&
                child.props.children.props &&
                child.props.children.props.step
              ) {
                const availablePoints = Array.from(
                  { length: child.props.children.props.step.votesLimit },
                  (v, l) => child.props.children.props.step.votesLimit - l,
                );
                points = availablePoints ? availablePoints[child.props.position] : false;
              }
              return (
                <ListItemContainer key={i}>
                  {hasPositionDisplayed && points && (
                    <span className="item__position__point">
                      <FormattedHTMLMessage id="item-point" values={{ num: points }} />
                    </span>
                  )}
                  {child}
                </ListItemContainer>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </ListContainer>
  );
};

export default List;
