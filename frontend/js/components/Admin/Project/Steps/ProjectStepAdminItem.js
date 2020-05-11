// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Draggable, type DraggableProvided } from 'react-beautiful-dnd';
import styled, { type StyledComponent } from 'styled-components';
import { type Step } from './ProjectStepAdminList';
import ProjectStepAdminItemStep from './ProjectStepAdminItemStep';

type Props = {|
  index: number,
  step: Step,
  fields: { length: number, map: Function, remove: Function },
  formName: string,
|};

const Item: StyledComponent<{}, {}, typeof ListGroupItem> = styled(ListGroupItem).attrs({
  className: 'item-step',
})`
  background: #fafafa;
`;

export default function ProjectStepAdminItem(props: Props) {
  const { step, index, fields, formName } = props;
  return (
    <Draggable key={step.id} draggableId={step.id || `new-step-${index}`} index={index}>
      {(providedDraggable: DraggableProvided) => (
        <div
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
          {...providedDraggable.dragHandleProps}>
          <Item key={index}>
            <ProjectStepAdminItemStep
              step={step}
              index={index}
              fields={fields}
              formName={formName}
            />
          </Item>
        </div>
      )}
    </Draggable>
  );
}
