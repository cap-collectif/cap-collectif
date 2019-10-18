// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import type { Dispatch } from '../../../../types';
import FlashMessages from '../../../Utils/FlashMessages';
import ProjectStepFormAdminList from './ProjectStepFormAdminList';
import { type ProjectStepFormAdmin_project } from '~relay/ProjectStepFormAdmin_project.graphql';

type Props = {
  dispatch: Dispatch,
  formName: string,
  intl: IntlShape,
  project: ProjectStepFormAdmin_project,
};

type State = {
  editIndex: ?number,
  editIndexSection: ?number,
  showDeleteModal: boolean,
  deleteIndex: ?number,
  deleteType: ?string,
  flashMessages: Array<string>,
};

export class ProjectStepFormAdmin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editIndex: null,
      editIndexSection: null,
      deleteIndex: null,
      showDeleteModal: false,
      deleteType: null,
      flashMessages: [],
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
    const { flashMessages } = this.state;
    const { project } = this.props;

    return (
      <div className="col-md-12">
        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h4 className="box-title">
              <FormattedMessage id="admin.group.steps" />
            </h4>
          </div>
          <div className="box-content">
            <div className="form-group" id="proposal_form_admin_questions_panel_personal">
              <ProjectStepFormAdminList steps={project.steps} />
              <ButtonToolbar>
                <Button
                  id="js-btn-create-question"
                  bsStyle="primary"
                  className="btn-outline-primary box-content__toolbar"
                  onClick={this.handleCreateStep}>
                  <i className="cap cap-bubble-add-2" />{' '}
                  <FormattedMessage id="question_modal.create.title" />
                </Button>
              </ButtonToolbar>
              <FlashMessages className="mt-15" success={flashMessages} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

export const container = connect(mapStateToProps)(ProjectStepFormAdmin);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectStepFormAdmin_project on Project {
      id
      steps {
        id
      }
    }
  `,
});
