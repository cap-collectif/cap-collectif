import * as React from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, CapInputSize, CapUIModalSize, Flex, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import UpdateNotificationSettingMutation from '@mutations/UpdateNotificationSettingMutation'
import { NotificationSettingsListQuery$data } from '@relay/NotificationSettingsListQuery.graphql'

type SiteParameter = NotificationSettingsListQuery$data['notificationSettings'][number]

type FormValues = {
  value: string
  isEnabled: boolean
}

type Props = {
  siteParameter: SiteParameter
  disclosure: React.ReactElement
}

const NotificationSettingModal: React.FC<Props> = ({ siteParameter, disclosure }) => {
  const intl = useIntl()
  const formId = React.useId()
  const isEmail = siteParameter.keyname !== 'admin.mail.notifications.send_name'
  const defaultValues: FormValues = { value: siteParameter.value ?? '', isEnabled: siteParameter.isEnabled }
  const schema = yup.object({
    value: isEmail ? yup.string().email(intl.formatMessage({ id: 'global.constraints.email.invalid' })) : yup.string(),
    isEnabled: yup.boolean().required(),
  })
  const { control, formState, handleSubmit, reset } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  })

  const closeModal = (hide: () => void) => {
    reset(defaultValues)
    hide()
  }

  const onSubmit = async (values: FormValues, hide: () => void) => {
    try {
      const { updateNotificationSetting } = await UpdateNotificationSettingMutation.commit({
        input: { id: siteParameter.id, ...values },
      })
      if (updateNotificationSetting.errorCode) {
        throw new Error(updateNotificationSetting.errorCode)
      }
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      closeModal(hide)
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal ariaLabel="edit-notification-setting" size={CapUIModalSize.Md} disclosure={disclosure}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'admin.label.settings.notifications' })}</Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: siteParameter.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(values => onSubmit(values, hide))}>
              <FormControl name="value" control={control}>
                <FormLabel htmlFor="value" label={intl.formatMessage({ id: 'global.value' })} />
                <FieldInput
                  id="value"
                  name="value"
                  control={control}
                  type={isEmail ? 'email' : 'text'}
                  variantSize={CapInputSize.Md}
                />
              </FormControl>
              <FormControl name="isEnabled" control={control}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput type="switch" control={control} name="isEnabled" id="isEnabled" />
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button
                variant="secondary"
                variantColor="hierarchy"
                variantSize="medium"
                onClick={() => closeModal(hide)}
              >
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button
                type="submit"
                form={formId}
                variant="primary"
                variantColor="primary"
                variantSize="medium"
                disabled={!formState.isValid}
                isLoading={formState.isSubmitting}
              >
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default NotificationSettingModal
