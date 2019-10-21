// @flow
import * as React from 'react';
import { FieldArray } from 'redux-form';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ProjectStepFormAdminList from './ProjectStepFormAdminList';

type Props = {
  form: string,
};

export default class ProjectStepFormAdmin extends React.Component<Props> {
  render() {
    const { form } = this.props;

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
              <FieldArray name="steps" component={ProjectStepFormAdminList} formName={form} />
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
