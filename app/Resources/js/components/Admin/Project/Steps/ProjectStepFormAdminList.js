// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { DragDropContext, Droppable, DraggableProvided } from 'react-beautiful-dnd';
import { formValueSelector, arrayPush, arrayMove, type FieldArrayProps } from 'redux-form';

import type { GlobalState } from '../../../../types';

import ProjectStepFormAdminItem from './ProjectStepFormAdminItem';
import { type ProjectStepFormAdminList_project } from '~relay/ProjectStepFormAdminList_project.graphql';

type Props = {
  ...FieldArrayProps,
  project: ?ProjectStepFormAdminList_project,
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
    console.log('*********** props');
    console.log(props);

    this.state = {
      editIndex: null,
      deleteIndex: null,
      showDeleteModal: false,
    };
  }

  onDragEnd = () => {};

  handleClose = () => {};

  handleClickDelete = () => {};

  handleDeleteAction = () => {};

  handleClickEdit = () => {};

  handleSubmit = () => {};

  handleCreateStep = () => {};

  handleCancelModal = () => {};

  render() {
    const { project, fields } = this.props;

    return (
      <ListGroup>
        <DragDropContext>
          <Droppable droppableId="droppable">
            {(provided: DraggableProvided) => (
              <div ref={provided.innerRef}>
                {!project ||
                  (project.steps.length === 0 && (
                    <div>
                      <FormattedMessage id="highlighted.empty" />
                    </div>
                  ))}
                {fields.map((member, index) => (
                  <ProjectStepFormAdminItem step={member} index={index} />
                ))}
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

const container = connect(mapStateToProps)(ProjectStepFormAdminList);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectStepFormAdminList_project on Project {
      steps {
        id
        ...ProjectStepFormAdminItem_step
      }
    }
  `,
});
