// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';
import CreateProposalFormMutation from '../../mutations/CreateProposalFormMutation';

const formName = 'proposal-form-admin-create';
const validate = () => ({});

const onSubmit = values =>
  CreateProposalFormMutation.commit({ input: values }).then(() => {
    window.location.reload();
  });

export type Props = {
  submitting: boolean,
  handleSubmit: Function,
  submit: Function,
};

type State = {
  showModal: boolean,
};

export class ProposalFormCreateButton extends React.Component<Props, State> {
  state = { showModal: false };

  render() {
    const { submitting, handleSubmit, submit } = this.props;
    const { showModal } = this.state;
    return (
      <div>
        <Button
          id="add-proposalform"
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
              <FormattedMessage id="proposal_form.create.title" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <Field
                name="title"
                label={<FormattedMessage id="proposal_form.title" />}
                component={component}
                type="text"
                id="proposal_form_title"
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
              id="confirm-proposalform-create"
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
})(ProposalFormCreateButton);
