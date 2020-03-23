// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import CloseButton from '~/components/Form/CloseButton';
import SubmitButton from '~/components/Form/SubmitButton';
import component from '~/components/Form/Field';
import { isEmail } from '~/services/Validator';
import type { State } from '~/types';
import ContactProposalAuthorMutation from '~/mutations/ContactProposalAuthorMutation';

type Props = {|
  ...ReduxFormFormProps,
  show: boolean,
  proposalId: string,
  onClose: () => {},
  onSubmit: () => {},
|};

type FormValues = {| proposalId: string, senderName: string, message: string, replyEmail: string |};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  if (!values) return;
  ContactProposalAuthorMutation.commit({ input: { ...values } })
    .then(() => {
      props.reset();
      props.onClose();
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ senderName, message, replyEmail }: FormValues) => {
  const errors = {};

  if (!senderName || senderName?.length < 2) errors.senderName = 'global.required';

  if (!message || message?.length < 2) errors.message = 'global.required';

  if (!replyEmail) {
    errors.replyEmail = 'global.required';
  } else if (!isEmail(replyEmail)) {
    errors.replyEmail = 'global.constraints.email.invalid';
  }

  return errors;
};

export const formName = 'ProposalContactModalForm';

export const ProposalContactModal = ({
  handleSubmit,
  show,
  onClose,
  invalid,
  submitting,
}: Props) => (
  <Modal show={show} onHide={onClose} aria-labelledby="ProposalFormContactModal-modal">
    <form onSubmit={handleSubmit} id={formName}>
      <Modal.Header closeButton>
        <Modal.Title
          id="ProposalFormContactModal-title"
          children={<FormattedMessage id="send-message" />}
        />
      </Modal.Header>
      <Modal.Body>
        <Field
          label={<FormattedMessage id="admin.fields.status.name" />}
          id="ProposalFormContactModal-senderName"
          name="senderName"
          type="text"
          component={component}
        />
        <Field
          label={<FormattedMessage id="contact.your-message" />}
          id="ProposalFormContactModal-message"
          name="message"
          type="textarea"
          component={component}
        />
        <Field
          label={<FormattedMessage id="admin.mail.contact" />}
          id="ProposalFormContactModal-replyEmail"
          name="replyEmail"
          type="email"
          component={component}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton
          id="ProposalFormContactModal-submit"
          label="global.validate"
          isSubmitting={submitting}
          disabled={invalid || submitting}
          onSubmit={onSubmit}
        />
      </Modal.Footer>
    </form>
  </Modal>
);

const mapStateToProps = (state: State, { proposalId }: Props) => ({
  form: formName,
  initialValues: { proposalId },
});

const form = connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    enableReinitialize: true,
  })(ProposalContactModal),
);

export default form;
