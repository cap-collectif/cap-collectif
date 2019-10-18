// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { DragDropContext, Droppable, DraggableProvided } from 'react-beautiful-dnd';

import ProjectStepFormAdminItem from './ProjectStepFormAdminItem';
import { type ProjectStepFormAdminList_project } from '~relay/ProjectStepFormAdminList_project.graphql';

type Props = {
  project: ?ProjectStepFormAdminList_project,
};

export class ProjectStepFormAdminList extends React.Component<Props> {
  render() {
    const { project } = this.props;

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
                {project &&
                  project.steps.map((member, index) => (
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

const mapStateToProps = () => ({});

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
