// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import ProjectStepFormAdminItemStep from './ProjectStepFormAdminItemStep';
import { type Step } from './ProjectStepFormAdminList';

type Props = {
  index: number,
  step: Step,
};

export default class ProjectStepFormAdminItem extends React.Component<Props> {
  render() {
    const { step, index } = this.props;

    return (
      <Draggable key={step.id} draggableId={step.id || `new-step-${index}`} index={index}>
        {(providedDraggable: DraggableProvided) => (
          <div
            ref={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            {...providedDraggable.dragHandleProps}>
            <ListGroupItem key={index}>
              <ProjectStepFormAdminItemStep step={step} index={index} />
            </ListGroupItem>
          </div>
        )}
      </Draggable>
    );
  }
}
