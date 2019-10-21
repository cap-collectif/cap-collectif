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

import ProjectStepFormAdminItem from './ProjectStepFormAdminItem';

export type Step = {|
  +id: string,
  +title: string,
  +type: ?string,
|};

export type Steps = $ReadOnlyArray<Step>;

export type Project = ?{| +steps: Steps |};

type Props = {
  ...FieldArrayProps,
  steps: Steps,
  dispatch: Dispatch,
  formName: string,
};

type State = {
  editIndex: ?number,
  showDeleteModal: boolean,
  deleteIndex: ?number,
};

export class ProjectStepFormAdminList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editIndex: null,
      deleteIndex: null,
      showDeleteModal: false,
    };
  }

  onDragEnd = (result: DropResult) => {
    const { dispatch } = this.props;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const { formName } = this.props;

    dispatch(arrayMove(formName, 'steps', result.source.index, result.destination.index));
  };

  handleClose = () => {};

  handleClickDelete = () => {};

  handleDeleteAction = () => {};

  handleClickEdit = () => {};

  handleSubmit = () => {};

  handleCreateStep = () => {};

  handleCancelModal = () => {};

  render() {
    const { fields, steps } = this.props;

    return (
      <ListGroup>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: DraggableProvided) => (
              <div ref={provided.innerRef}>
                {fields.length === 0 && (
                  <div>
                    <FormattedMessage id="highlighted.empty" />
                  </div>
                )}
                {fields.map((field: string, index: number) => (
                  <ProjectStepFormAdminItem step={steps[index]} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ListGroup>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    steps: selector(state, 'steps'),
  };
};

export default connect(mapStateToProps)(ProjectStepFormAdminList);
