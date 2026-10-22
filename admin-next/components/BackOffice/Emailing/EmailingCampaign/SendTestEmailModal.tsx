import * as React from 'react'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, ButtonGroup, CapUIIcon, CapUIModalSize, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TestEmailingCampaignMutation from '@mutations/TestEmailingCampaignMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'

type Props = {
  readonly emailingCampaignId: string
  readonly disabled: boolean
  // The test is built from the saved campaign: the pending changes are saved first. Resolves to false on failure.
  readonly saveDraft: () => Promise<boolean>
}

type FormValues = { email: string }

const SendTestEmailModal: React.FC<Props> = ({ emailingCampaignId, disabled, saveDraft }) => {
  const intl = useIntl()
  const schema = React.useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .required(intl.formatMessage({ id: 'global.required' }))
          .email(intl.formatMessage({ id: 'global.constraints.email.invalid' })),
      }),
    [intl],
  )
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { email: '' },
    resolver: yupResolver(schema),
  })

  const onSubmit = async ({ email }: FormValues, hide: () => void) => {
    if (!(await saveDraft())) return

    return TestEmailingCampaignMutation.commit({ input: { id: emailingCampaignId, email } })
      .then(response => {
        if (response.testEmailingCampaign?.error) return mutationErrorToast(intl)
        successToast(intl.formatMessage({ id: 'contact.email.sent_success' }))
        reset()
        hide()
      })
      .catch(() => mutationErrorToast(intl))
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'send-test-by-mail' })}
      onClose={() => reset()}
      disclosure={
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Envelope}
          disabled={disabled}
        >
          {intl.formatMessage({ id: 'send-test-by-mail' })}
        </Button>
      }
    >
      {({ hide }) => (
        <form noValidate onSubmit={handleSubmit(values => onSubmit(values, hide))}>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>{intl.formatMessage({ id: 'send-test-by-mail' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <FormControl name="email" control={control} isRequired>
              <FormLabel htmlFor="test-email" label={intl.formatMessage({ id: 'addressee-address' })} />
              <FieldInput
                type="email"
                id="test-email"
                name="email"
                control={control}
                placeholder={intl.formatMessage({ id: 'global.placeholder.email' })}
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button type="submit" variantSize="medium" variant="primary" isLoading={formState.isSubmitting}>
                {intl.formatMessage({ id: 'send-test' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </form>
      )}
    </Modal>
  )
}

export default SendTestEmailModal
