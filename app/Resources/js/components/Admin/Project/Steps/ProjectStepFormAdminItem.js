// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { type ProjectStepFormAdminItem_step } from '~relay/ProjectStepFormAdminItem_step.graphql';
import ProjectStepFormAdminItemStep from './ProjectStepFormAdminItemStep';

type Props = {
  index: number,
  step: ProjectStepFormAdminItem_step,
};

export class ProjectStepFormAdminItem extends React.Component<Props> {
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

export default createFragmentContainer(ProjectStepFormAdminItem, {
  step: graphql`
    fragment ProjectStepFormAdminItem_step on Step {
      id
      ...ProjectStepFormAdminItemStep_step
    }
  `,
});
