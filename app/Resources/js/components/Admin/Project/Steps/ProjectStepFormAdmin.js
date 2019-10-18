// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import type { Dispatch } from '../../../../types';
import ProjectStepFormAdminList from './ProjectStepFormAdminList';
import { type ProjectStepFormAdmin_project } from '~relay/ProjectStepFormAdmin_project.graphql';

type Props = {
  dispatch: Dispatch,
  form: string,
  intl: IntlShape,
  project: ?ProjectStepFormAdmin_project,
};

export class ProjectStepFormAdmin extends React.Component<Props> {
  render() {
    const { project, form } = this.props;

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
              <FieldArray
                name="steps"
                component={ProjectStepFormAdminList}
                formName={form}
                props={{ project }}
              />
              <ButtonToolbar>
                <Button
                  id="js-btn-create-question"
                  bsStyle="primary"
                  className="btn-outline-primary box-content__toolbar"
                  onClick={() => {}}>
                  <i className="cap cap-bubble-add-2" />{' '}
                  <FormattedMessage id="question_modal.create.title" />
                </Button>
              </ButtonToolbar>
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
      ...ProjectStepFormAdminList_project
    }
  `,
});
