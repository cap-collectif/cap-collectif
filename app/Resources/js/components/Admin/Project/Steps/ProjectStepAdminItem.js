// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

import { type Step } from './ProjectStepAdminList';
import ProjectStepAdminItemStep from './ProjectStepAdminItemStep';

type Props = {|
  index: number,
  step: Step,
  fields: { length: number, map: Function, remove: Function },
  formName: string,
|};

export default function ProjectStepAdminItem(props: Props) {
  const { step, index, fields, formName } = props;
  return (
    <Draggable key={step.id} draggableId={step.id || `new-step-${index}`} index={index}>
      {(providedDraggable: DraggableProvided) => (
        <div
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
          {...providedDraggable.dragHandleProps}>
          <ListGroupItem key={index}>
            <ProjectStepAdminItemStep
              step={step}
              index={index}
              fields={fields}
              formName={formName}
            />
          </ListGroupItem>
        </div>
      )}
    </Draggable>
  );
}
