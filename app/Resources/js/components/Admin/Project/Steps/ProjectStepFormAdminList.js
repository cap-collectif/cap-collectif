// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, DraggableProvided } from 'react-beautiful-dnd';

import ProjectStepFormAdminItem from './ProjectStepFormAdminItem';

type Props = {
  steps: Array<Object>,
};

export class ProjectStepFormAdminList extends React.Component<Props> {
  render() {
    const { steps } = this.props;

    return (
      <ListGroup>
        <DragDropContext>
          <Droppable droppableId="droppable">
            {(provided: DraggableProvided) => (
              <div ref={provided.innerRef}>
                {steps.length === 0 && (
                  <div>
                    <FormattedMessage id="highlighted.empty" />
                  </div>
                )}
                {steps.map((member, index) => (
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
/*
export createFragmentContainer(container, {
  project: graphql`
    fragment ProjectStepFormAdminList_project on Project {
      id
      title
      authors {
        value: id
        label: username
      }
      opinionTerm
      type {
        id
      }
    }
  `,
}); */

export default container;
