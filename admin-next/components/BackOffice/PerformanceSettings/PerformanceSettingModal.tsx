import * as React from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, CapInputSize, CapUIModalSize, Flex, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import UpdatePerformanceSettingMutation from '@mutations/UpdatePerformanceSettingMutation'
import { PerformanceSettingsListQuery$data } from '@relay/PerformanceSettingsListQuery.graphql'

type SiteParameter = PerformanceSettingsListQuery$data['performanceSettings'][number]

type FormValues = {
  value: number
  isEnabled: boolean
}

type Props = {
  siteParameter: SiteParameter
  disclosure: React.ReactElement
}

const PerformanceSettingModal: React.FC<Props> = ({ siteParameter, disclosure }) => {
  const intl = useIntl()
  const formId = React.useId()

  const defaultValues: FormValues = {
    value: Number(siteParameter.value),
    isEnabled: siteParameter.isEnabled,
  }

  const schema = yup.object().shape({
    value: yup
      .number()
      .typeError(intl.formatMessage({ id: 'must-be-positive-integer' }))
      .integer(intl.formatMessage({ id: 'must-be-positive-integer' }))
      .positive(intl.formatMessage({ id: 'must-be-positive-integer' }))
      .required(intl.formatMessage({ id: 'global.required' })),
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
      await UpdatePerformanceSettingMutation.commit({
        input: {
          id: siteParameter.id,
          value: String(values.value),
          isEnabled: values.isEnabled,
        },
      })
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      closeModal(hide)
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal ariaLabel="edit-performance-setting" size={CapUIModalSize.Md} disclosure={disclosure}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'admin.label.settings.performance' })}</Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: siteParameter.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(values => onSubmit(values, hide))}>
              <FormControl name="value" control={control} isRequired>
                <FormLabel htmlFor="value" label={intl.formatMessage({ id: 'global.value' })} />
                <FieldInput id="value" name="value" control={control} type="number" variantSize={CapInputSize.Md} />
              </FormControl>
              <FormControl name="isEnabled" control={control}>
                <FieldInput type="switch" control={control} name="isEnabled" id="isEnabled">
                  {intl.formatMessage({ id: 'admin.settings.header.enabled' })}
                </FieldInput>
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={() => closeModal(hide)}>
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

export default PerformanceSettingModal
