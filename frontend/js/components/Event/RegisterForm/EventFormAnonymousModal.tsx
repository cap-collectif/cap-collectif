import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast, Button, FormLabel, Modal, Heading, CapUIModalSize } from '@cap-collectif/ui'
import { FormControl, FieldInput } from '@cap-collectif/form'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import SubscribeToEventAsNonRegisteredMutation from '~/mutations/SubscribeToEventAsNonRegisteredMutation'
import ResetCss from '~/utils/ResetCss'
import type { Dispatch, GlobalState } from '~/types'
import { ChartLinkComponent, PrivacyPolicyComponent } from '~/components/User/Registration/RegistrationForm'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
type Props = {
  readonly eventId: string
  readonly register: () => void
}
type FormValues = {
  email: string
  username: string
}
export const EventFormAnonymousModal = ({ eventId, register }: Props) => {
  const intl = useIntl()
  const privacyPolicyRequired = useFeatureFlag('privacy_policy')
  const cguName = useSelector((state: GlobalState) => state.default.parameters['signin.cgu.name'])
  const dispatch: Dispatch = useDispatch()
  const { handleSubmit, formState, control, reset, setError } = useForm({
    mode: 'onChange',
  })
  const { isValid, isSubmitting } = formState

  const onSubmit = (values: FormValues, hide: () => void) => {
    const input = {
      eventId,
      email: values.email,
      username: values.username,
      private: false,
    }
    return SubscribeToEventAsNonRegisteredMutation.commit({
      input,
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'event_registration.create.register_success',
          }),
        })
        reset()
        register()
        hide()
      }) // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(e => {
        setError('email', {
          type: 'server',
          message: intl.formatHTMLMessage({
            id: 'user-already-registered-with-this-email',
          }),
        })
      })
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      hideOnClickOutside={false}
      zIndex={1050}
      disclosure={
        <Button
          variantColor="primary"
          variant="primary"
          variantSize="big"
          label="event_registration.create.register"
          width={['100%', 'auto']}
          justifyContent="center"
        >
          {intl.formatMessage({
            id: 'global.register',
          })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <ResetCss>
            <Modal.Header>
              <Heading>
                {intl.formatMessage({
                  id: 'subscribe-event',
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          <Modal.Body>
            <FormControl name="username" control={control} isRequired>
              <FormLabel
                htmlFor="EventFormAnonymousModal-username"
                label={intl.formatMessage({
                  id: 'form.label_firstname_lastname',
                })}
              />
              <FieldInput id="EventFormAnonymousModal-username" name="username" control={control} type="text" />
            </FormControl>
            <FormControl name="email" control={control} isRequired>
              <FormLabel
                htmlFor="EventFormAnonymousModal-email"
                label={intl.formatMessage({
                  id: 'global.email',
                })}
              />
              <FieldInput id="EventFormAnonymousModal-email" name="email" control={control} type="email" />
            </FormControl>
            <FormControl name="accept" control={control} isRequired>
              <FieldInput id="EventFormAnonymousModal-accept" name="accept" control={control} type="checkbox">
                <span
                  style={{
                    fontWeight: 'normal',
                  }}
                >
                  <ChartLinkComponent cguName={cguName} dispatch={dispatch} />
                  <PrivacyPolicyComponent privacyPolicyRequired={privacyPolicyRequired} />
                </span>
              </FieldInput>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="medium" onClick={hide}>
              {intl.formatMessage({
                id: 'cancel',
              })}
            </Button>
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="medium"
              loading={isSubmitting}
              isLoading={isSubmitting}
              disabled={!isValid}
              onClick={e => {
                handleSubmit((data: FormValues) => onSubmit(data, hide))(e)
              }}
            >
              {intl.formatMessage({
                id: 'global.register',
              })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}
export default EventFormAnonymousModal
