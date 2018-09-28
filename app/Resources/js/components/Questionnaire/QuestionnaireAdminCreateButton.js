// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
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

  return errors;
};

const onSubmit = values =>
  CreateQuestionnaireMutation.commit({ input: values }).then(() => {
    window.location.reload();
  });

type Props = {
  submitting: boolean,
  handleSubmit: () => void,
  submit: Function,
};

type State = {
  showModal: boolean,
};

export class QuestionnaireAdminCreateButton extends React.Component<Props, State> {
  state = { showModal: false };

  render() {
    const { submitting, handleSubmit, submit } = this.props;
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
            <form onSubmit={handleSubmit}>
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

export default reduxForm({
  onSubmit,
  validate,
  form: formName,
})(QuestionnaireAdminCreateButton);
