// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, FormLabel, toast } from '@cap-collectif/ui';
import { FormControl, FieldInput } from '@cap-collectif/form';
import { SubmissionError } from 'redux-form';
import type { State } from '~/types';
import ContactProposalAuthorMutation from '~/mutations/ContactProposalAuthorMutation';
import Captcha from '~/components/Form/Captcha';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

type Props = {|
  show: boolean,
  proposalId: string,
  authorName: string,
  onClose: () => {},
  addCaptchaField: boolean,
|};

type FormValues = {|
  proposalId: string,
  senderName: string,
  message: string,
  replyEmail: string,
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
  const [captcha, setCaptcha] = React.useState('');

  const { handleSubmit, formState, control, reset } = useForm({
    mode: 'onChange',
    defaultValues: { proposalId },
  });
  const { isValid, isSubmitting } = formState;

  const hasValidForm = addCaptchaField ? isValid && !!captcha : isValid;

  const onSubmit = (values: FormValues) => {
    if (!values) return;
    ContactProposalAuthorMutation.commit({ input: { ...values, captcha } })
      .then((response) => {
        onClose();
        reset();
        setCaptcha('');

        if(response?.contactProposalAuthor?.error != null) {
          throw new SubmissionError({
            _error: response.contactProposalAuthor.error,
          });
        }

        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({ id: 'message-sent-with-success' }),
        });
      })
      .catch(() => {
        mutationErrorToast(intl);
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
      <form onSubmit={e => handleSubmit((data: FormValues) => onSubmit(data))(e)} id={formName}>
        <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title id="ProposalFormContactModal-title">
            <FormattedMessage id="send-message-to" values={{ messageTo: authorName }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl name="senderName" control={control} isRequired>
            <FormLabel
              htmlFor="ProposalFormContactModal-senderName"
              label={intl.formatMessage({ id: 'your-name' })}
            />
            <FieldInput
              id="ProposalFormContactModal-senderName"
              name="senderName"
              control={control}
              type="text"
              minLength={2}
            />
          </FormControl>

          <FormControl name="replyEmail" control={control} isRequired>
            <FormLabel
              htmlFor="ProposalFormContactModal-replyEmail"
              label={intl.formatMessage({ id: 'your-email-address' })}
            />
            <FieldInput
              id="ProposalFormContactModal-replyEmail"
              name="replyEmail"
              control={control}
              type="email"
            />
          </FormControl>

          <FormControl name="message" control={control} isRequired>
            <FormLabel
              htmlFor="ProposalFormContactModal-message"
              label={intl.formatMessage({ id: 'contact.your-message' })}
            />
            <FieldInput
              id="ProposalFormContactModal-message"
              name="message"
              control={control}
              type="textarea"
            />
          </FormControl>

          {addCaptchaField && (
            <Captcha onChange={captchaKey => setCaptcha(captchaKey)} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
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
            disabled={!hasValidForm}
            variant="primary"
            variantSize="medium"
            type="submit">
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
