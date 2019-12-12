// @flow
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { ListGroupItem, Row } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DraggableProvided,
  type DroppableProvided,
  type DraggableStateSnapshot,
  type DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import styled, { type StyledComponent } from 'styled-components';
import ReactDOM from 'react-dom';
import Toggle from '~/components/Ui/Toggle/Toggle';
import { Wrapper, DraggableItem } from '~/components/Project/Votes/ProposalsUserVotesTable';
import InputRequirement from '~/components/Ui/Form/InputRequirement';
import ListGroup from '~/components/Ui/List/ListGroup';
import config from '../../../config';

export const RightNavSide: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  width: 100%;
  padding-left: 20px;
  align-items: center;
`;

export const InputPlaceholder: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  min-width: 100px;
`;

let portal: ?HTMLElement = null;
if (config.canUseDOM && document) {
  portal = document.createElement('div');
  if (document.body) {
    document.body.appendChild(portal);
  }
}

const DraggableMember = ({ id, placeholder }: { id: number, placeholder: string }): any => {
  const [toggled, setToggled] = useState(false);

  return (
    <Draggable key={id} draggableId={id} index={id}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const usePortal: boolean = snapshot.isDragging;

        const child = (
          <div>
            <DraggableItem
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              {...provided.draggableProps}
              {...provided.dragHandleProps}>
              <ListGroupItem style={{ display: 'flex' }}>
                <Toggle checked={toggled} onChange={() => setToggled(!toggled)} />
                <RightNavSide>
                  {toggled && id === 3 ? (
                    <>
                      <InputPlaceholder>{placeholder} </InputPlaceholder>
                      <InputRequirement
                        placeholder={placeholder}
                        onChange={() => {}}
                        onDelete={() => setToggled(false)}
                      />
                    </>
                  ) : (
                    <span>{placeholder} </span>
                  )}
                </RightNavSide>
              </ListGroupItem>
            </DraggableItem>
            {provided.placeholder}
          </div>
        );

        if (config.isMobile || !portal || !usePortal) {
          return child;
        }

        return ReactDOM.createPortal(child, portal);
      }}
    </Draggable>
  );
};

storiesOf('Core|Form/AdminRequirement', module).add('AdminRequirement', () => {
  return (
    <form>
      <ListGroup>
        <Row>
          <DragDropContext onDragEnd={() => {}} onDragStart={() => {}} onDragUpdate={() => {}}>
            <Droppable droppableId="droppable">
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <Wrapper
                  isDraggingOver={snapshot.isDraggingOver}
                  ref={provided.innerRef}
                  {...provided.droppableProps}>
                  <DraggableMember id={1} placeholder="Nom" />
                  <DraggableMember id={2} placeholder="Prenom" />
                  <DraggableMember id={3} placeholder="Age minimum" />
                  {provided.placeholder}
                </Wrapper>
              )}
            </Droppable>
          </DragDropContext>
        </Row>
      </ListGroup>
    </form>
  );
});
