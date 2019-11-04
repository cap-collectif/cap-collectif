// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, DropResult, DraggableProvided } from 'react-beautiful-dnd';
import { formValueSelector, arrayMove, type FieldArrayProps } from 'redux-form';

import type { GlobalState } from '../../../../types';

import ProjectStepAdminItem from './ProjectStepAdminItem';

export type Step = {|
  +id: string,
  +title: string,
  +type: ?string,
  +url: ?string,
|};

export type Steps = $ReadOnlyArray<Step>;

export type Project = ?{| +steps: Steps |};

// Not typed strictly because FieldArrayProps is not strict.
type Props = {
  ...FieldArrayProps,
  steps: Steps,
  dispatch: Dispatch,
  formName: string,
};

export function ProjectStepAdminList(props: Props) {
  const onDragEnd = (result: DropResult) => {
    const { dispatch, formName } = props;

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(arrayMove(formName, 'steps', result.source.index, result.destination.index));
  };

  const { fields, steps, formName } = props;
  return (
    <ListGroup>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided: DraggableProvided) => (
            <div ref={provided.innerRef}>
              {fields.length === 0 && (
                <div>
                  <FormattedMessage id="highlighted.empty" />
                </div>
              )}
              {fields.map((field: string, index: number) => (
                <ProjectStepAdminItem
                  step={steps[index]}
                  index={index}
                  fields={fields}
                  formName={formName}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ListGroup>
  );
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    steps: selector(state, 'steps'),
  };
};

export default connect(mapStateToProps)(ProjectStepAdminList);
