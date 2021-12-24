// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { SubmissionError } from 'redux-form';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button } from '@cap-collectif/ui';
import type { State } from '~/types';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import ContactProposalAuthorMutation from '~/mutations/ContactProposalAuthorMutation';
import FieldInput from '~/components/Form/FieldInput';

type Props = {|
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

export const formName = 'ProposalContactModalForm';

export const ProposalContactModal = ({
  show,
  onClose,
  authorName,
  addCaptchaField,
  proposalId,
}: Props) => {
  const intl = useIntl();

  const { handleSubmit, formState, control, reset } = useForm({
    mode: 'onChange',
    defaultValues: { proposalId },
  });
  const { isValid, isSubmitting } = formState;

  const onSubmit = (values: FormValues) => {
    if (!values) return;
    ContactProposalAuthorMutation.commit({ input: { ...values } })
      .then(() => {
        onClose();
        reset();
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
  return (
    <Modal
      show={show}
      onHide={() => {
        onClose();
        reset();
      }}
      aria-labelledby="ProposalFormContactModal-modal">
      <form onSubmit={handleSubmit(onSubmit)} id={formName}>
        <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title id="ProposalFormContactModal-title">
            <FormattedMessage id="send-message-to" values={{ messageTo: authorName }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FieldInput
            label={<FormattedMessage id="your-name" />}
            id="ProposalFormContactModal-senderName"
            type="text"
            control={control}
            minLength={2}
            required
            name="senderName"
          />
          <FieldInput
            label={<FormattedMessage id="your-email-address" />}
            id="ProposalFormContactModal-replyEmail"
            required
            control={control}
            name="replyEmail"
            type="email"
          />
          <FieldInput
            label={<FormattedMessage id="contact.your-message" />}
            id="ProposalFormContactModal-message"
            required
            control={control}
            name="message"
            type="textarea"
          />
          <FieldInput
            id="captcha"
            name="captcha"
            type="captcha"
            control={control}
            required={addCaptchaField}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            variantColor="hierarchy"
            variantSize="medium"
            mr={2}
            onClick={() => {
              onClose();
              reset();
            }}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            id="ProposalFormContactModal-submit"
            isLoading={isSubmitting}
            disabled={!isValid}
            variant="primary"
            variantSize="medium"
            type="submit"
            onClick={onSubmit}>
            {intl.formatMessage({ id: 'global.validate' })}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const mapStateToProps = (state: State) => ({
  addCaptchaField: state.default.features.captcha,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalContactModal);
