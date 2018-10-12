// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ToggleButton, Button, Modal } from 'react-bootstrap';
import { reduxForm, Field, change, type FormProps } from 'redux-form';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import * as FormField from '../Form/Field';
import CreateQuestionnaireMutation from '../../mutations/CreateQuestionnaireMutation';
import QuestionnaireAdminCreateButtonType from './QuestionnaireAdminCreateButtonType';

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

type Props = FormProps & {
  submitting: boolean,
  handleSubmit: () => void,
  submit: Function,
};

type State = {
  showModal: boolean,
  type: string,
};

export class QuestionnaireAdminCreateButton extends React.Component<Props, State> {
  state = { showModal: false, type: 'VOTING' };

  changeType = (type: string) => {
    this.setState({
      type,
    });
  };

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
<<<<<<< HEAD
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
=======
            <form onSubmit={handleSubmit}>
              <QuestionnaireAdminCreateButtonType
                type={this.state.type}
                handleClick={this.changeType}
              />
>>>>>>> [5673-DRAFT] WIP
              <Field
                name="title"
                label={<FormattedMessage id="admin.fields.questionnaire.title" />}
                component={FormField.default}
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

const mapStateToProps: MapStateToProps<*, *, *> = () => ({});

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(QuestionnaireAdminCreateButton);

export default connect(mapStateToProps)(form);
