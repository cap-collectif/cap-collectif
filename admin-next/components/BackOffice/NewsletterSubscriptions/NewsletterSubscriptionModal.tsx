import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, ButtonGroup, CapInputSize, CapUIModalSize, Flex, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateNewsletterSubscriptionMutation from '@mutations/CreateNewsletterSubscriptionMutation'
import UpdateNewsletterSubscriptionMutation from '@mutations/UpdateNewsletterSubscriptionMutation'
import { NewsletterSubscriptionErrorCode } from '@relay/CreateNewsletterSubscriptionMutation.graphql'
import { NewsletterSubscriptionList_query$key } from '@relay/NewsletterSubscriptionList_query.graphql'
import '@shared/utils/yupExtensions'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import { RefetchFnDynamic } from 'react-relay'
import { OperationType } from 'relay-runtime'
import * as yup from 'yup'

type NewsletterSubscription = {
  readonly id: string
  readonly email: string
  readonly isEnabled: boolean
}

type FormValues = {
  email: string
  isEnabled: boolean
}

type Props = {
  disclosure: React.ReactElement
  // Absent in creation mode
  newsletterSubscription?: NewsletterSubscription
  // Only needed in creation mode, to prepend the created subscription to the list
  connectionId?: string
  // Refetches the list so it reflects the create/update immediately, without a page reload.
  // Nullable because, in creation mode, the list may not have mounted yet when this is rendered.
  refetch?: RefetchFnDynamic<OperationType, NewsletterSubscriptionList_query$key> | null
  search?: string | null
}

type FormProps = Omit<Props, 'disclosure'> & {
  hide: () => void
}

const getSchema = (intl: IntlShape) =>
  yup.object({
    email: yup
      .string()
      .notBlank(intl.formatMessage({ id: 'global.required' }))
      .email(intl.formatMessage({ id: 'global.constraints.email.invalid' })),
    isEnabled: yup.boolean().required(),
  })

const EMAIL_ERROR_MESSAGES: Partial<Record<NewsletterSubscriptionErrorCode, string>> = {
  INVALID_EMAIL: 'global.constraints.email.invalid',
  EMAIL_ALREADY_USED: 'newsletter.already_subscribed',
}

// Rendered inside the Modal render-prop: CapUI unmounts it on close, so the form restarts from the
// saved values at each opening without any reset() to handle.
const NewsletterSubscriptionForm: React.FC<FormProps> = ({
  newsletterSubscription,
  connectionId,
  refetch,
  search,
  hide,
}) => {
  const intl = useIntl()
  const formId = React.useId()
  const { control, handleSubmit, setError, formState } = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      email: newsletterSubscription?.email ?? '',
      isEnabled: newsletterSubscription?.isEnabled ?? true,
    },
    resolver: yupResolver(getSchema(intl)),
  })

  const onSubmit = async (values: FormValues) => {
    const input = { email: values.email.trim(), isEnabled: values.isEnabled }
    try {
      const errorCode = newsletterSubscription
        ? (await UpdateNewsletterSubscriptionMutation.commit({ input: { ...input, id: newsletterSubscription.id } }))
            .updateNewsletterSubscription?.errorCode
        : (
            await CreateNewsletterSubscriptionMutation.commit({
              input,
              connections: connectionId ? [connectionId] : [],
            })
          ).createNewsletterSubscription?.errorCode

      if (errorCode) {
        const emailErrorMessage = EMAIL_ERROR_MESSAGES[errorCode]
        if (emailErrorMessage) {
          setError('email', { type: 'server', message: intl.formatMessage({ id: emailErrorMessage }) })
          return
        }
        mutationErrorToast(intl)
        return
      }

      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
      refetch?.({ search })
      hide()
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      <Modal.Body direction="column">
        {/* noValidate: let yup display the translated email error instead of the browser's native tooltip */}
        <Flex as="form" id={formId} direction="column" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="email" control={control} isRequired>
            <FormLabel
              htmlFor="email"
              label={intl.formatMessage({ id: 'admin.fields.newsletter_subscription.email' })}
            />
            <FieldInput id="email" name="email" control={control} type="email" variantSize={CapInputSize.Md} />
          </FormControl>
          <FormControl name="isEnabled" control={control}>
            <FormLabel
              htmlFor="isEnabled"
              label={intl.formatMessage({ id: 'admin.fields.newsletter_subscription.is_enabled' })}
            />
            <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
          </FormControl>
        </Flex>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <ButtonGroup>
          <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={hide}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            variantColor="primary"
            variantSize="medium"
            isLoading={formState.isSubmitting}
          >
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  )
}

const NewsletterSubscriptionModal: React.FC<Props> = ({
  disclosure,
  newsletterSubscription,
  connectionId,
  refetch,
  search,
}) => {
  const intl = useIntl()
  const title = newsletterSubscription
    ? intl.formatMessage({ id: 'global.edit.title' }, { name: newsletterSubscription.email })
    : intl.formatMessage({ id: 'admin.newsletter-subscriptions.create' })

  return (
    <Modal ariaLabel={title} size={CapUIModalSize.Md} disclosure={disclosure}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{title}</Heading>
          </Modal.Header>
          <NewsletterSubscriptionForm
            newsletterSubscription={newsletterSubscription}
            connectionId={connectionId}
            refetch={refetch}
            search={search}
            hide={hide}
          />
        </>
      )}
    </Modal>
  )
}

export default NewsletterSubscriptionModal
