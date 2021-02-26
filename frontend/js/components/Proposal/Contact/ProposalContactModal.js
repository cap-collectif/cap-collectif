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
import type { State, Dispatch } from '~/types';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import ContactProposalAuthorMutation from '~/mutations/ContactProposalAuthorMutation';

type Props = {|
  ...ReduxFormFormProps,
  show: boolean,
  proposalId: string,
  authorName: string,
  onClose: () => {},
  onSubmit: () => {},
  addCaptchaField: boolean,
|};

type FormValues = {|
  proposalId: string,
  senderName: string,
  message: string,
  replyEmail: string,
  captcha: string,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  if (!values) return;
  ContactProposalAuthorMutation.commit({ input: { ...values } })
    .then(() => {
      props.reset();
      props.onClose();
      FluxDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content: 'message-sent-with-success',
        },
      });
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ senderName, message, replyEmail, captcha }: FormValues, props: Props) => {
  const errors = {};

  if (!senderName || senderName?.length < 2) errors.senderName = 'global.required';

  if (!message || message?.length < 2) errors.message = 'global.required';

  if (!replyEmail) {
    errors.replyEmail = 'global.required';
  } else if (!isEmail(replyEmail)) {
    errors.replyEmail = 'global.constraints.email.invalid';
  }

  if (!captcha && props.addCaptchaField && window && window.location.host !== 'capco.test') {
    errors.captcha = 'registration.constraints.captcha.invalid';
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
  pristine,
  reset,
  authorName,
}: Props) => (
  <Modal
    show={show}
    onHide={() => {
      onClose();
      reset();
    }}
    aria-labelledby="ProposalFormContactModal-modal">
    <form onSubmit={handleSubmit} id={formName}>
      <Modal.Header closeButton>
        <Modal.Title
          id="ProposalFormContactModal-title"
          children={<FormattedMessage id="send-message-to" values={{ messageTo: authorName }} />}
        />
      </Modal.Header>
      <Modal.Body>
        <Field
          label={<FormattedMessage id="your-name" />}
          id="ProposalFormContactModal-senderName"
          name="senderName"
          type="text"
          component={component}
        />
        <Field
          label={<FormattedMessage id="your-email-address" />}
          id="ProposalFormContactModal-replyEmail"
          name="replyEmail"
          type="email"
          component={component}
        />
        <Field
          label={<FormattedMessage id="contact.your-message" />}
          id="ProposalFormContactModal-message"
          name="message"
          type="textarea"
          rows={4}
          component={component}
        />
        <Field id="captcha" component={component} name="captcha" type="captcha" />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton
          onClose={() => {
            onClose();
            reset();
          }}
        />
        <SubmitButton
          id="ProposalFormContactModal-submit"
          label="global.validate"
          isSubmitting={submitting}
          disabled={invalid || submitting || pristine}
          onSubmit={onSubmit}
        />
      </Modal.Footer>
    </form>
  </Modal>
);

const mapStateToProps = (state: State, { proposalId }: Props) => ({
  form: formName,
  initialValues: { proposalId },
  addCaptchaField: state.default.features.captcha,
});

const form = connect<any, any, _, _, _, _>(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    enableReinitialize: true,
  })(ProposalContactModal),
);

export default form;
