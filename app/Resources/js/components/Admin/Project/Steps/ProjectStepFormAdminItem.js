// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

type Props = {
  index: any,
  step: any,
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
            <ListGroupItem key={index}>step {index}</ListGroupItem>
          </div>
        )}
      </Draggable>
    );
  }
}
