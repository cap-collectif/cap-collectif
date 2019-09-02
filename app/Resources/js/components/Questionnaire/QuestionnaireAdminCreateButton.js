// @flow
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ToggleButton, Button, Modal } from 'react-bootstrap';
import { reduxForm, Field, change, type FormProps } from 'redux-form';

import { type QuestionnaireType } from '~relay/ReplyForm_questionnaire.graphql';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';
import CreateQuestionnaireMutation from '../../mutations/CreateQuestionnaireMutation';

const formName = 'questionnaire-form-admin-create';

const validate = (values: Object) => {
  const errors = {};

  if (!values.title || values.title.length <= 2) {
    errors.title = 'title';
  }

  if (!values.type) {
    errors.type = 'type';
  }

  return errors;
};

const onSubmit = values => {
  CreateQuestionnaireMutation.commit({ input: values }).then(() => {
    window.location.reload();
  });
};

export type Props = {|
  ...FormProps,
  submitting: boolean,
  handleSubmit: () => void,
  submit: Function,
|};

type State = {
  showModal: boolean,
  type: QuestionnaireType,
};

export class QuestionnaireAdminCreateButton extends React.Component<Props, State> {
  state = { showModal: false, type: 'VOTING' };

  render() {
    const { submitting, handleSubmit, submit, dispatch } = this.props;
    const { showModal } = this.state;
    return (
      <div>
        <Button
          id="add-questionnaire"
          bsStyle="default"
          style={{ marginTop: 10 }}
          onClick={() => {
            this.setState({ showModal: true });
          }}>
          <FormattedMessage id="proposal_form.create" />
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="project.types.questionnaire" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={() => handleSubmit}>
              <Field type="radio-buttons" id="questionnaire_type" name="type" component={component}>
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'type', 'VOTING'))}
                  value="VOTING">
                  <FormattedMessage id="voting" />
                </ToggleButton>
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'type', 'QUESTIONNAIRE'))}
                  value="QUESTIONNAIRE">
                  <FormattedMessage id="project.types.questionnaire" />
                </ToggleButton>
              </Field>
              <Field
                name="title"
                label={<FormattedMessage id="admin.fields.questionnaire.title" />}
                component={component}
                type="text"
                id="questionnaire_title"
              />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
            <SubmitButton
              id="confirm-questionnaire-create"
              isSubmitting={submitting}
              onSubmit={() => {
                submit(formName);
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(QuestionnaireAdminCreateButton);

export default connect()(form);
