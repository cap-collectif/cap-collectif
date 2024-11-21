import * as React from 'react'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  FormLabel,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import cn from 'classnames'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FieldValue, useForm } from 'react-hook-form'
import { UseFormSetValue } from 'react-hook-form/dist/types/form'
import { useCollectStep } from './CollectStepContext'
import { FormValues } from './CollectStepForm'

export interface InfoModalProps {
  title: string
  name: string
  initialValues: {
    HelpText: string | null
    Mandatory?: boolean
    proposalInAZoneRequired?: boolean
  }
  setValue: UseFormSetValue<FieldValue<FormValues>>
  className: string
}

const InfoModal: React.FC<InfoModalProps> = ({ title, name, initialValues, setValue, className }) => {
  const intl = useIntl()
  const { handleSubmit, control, reset } = useForm<{
    HelpText: string | null
    Mandatory?: boolean
  }>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const { proposalFormKey } = useCollectStep()

  React.useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const onSubmit = (values: { HelpText: string | null; Mandatory?: boolean; proposalInAZoneRequired?: boolean }) => {
    // @ts-ignore
    setValue(`${proposalFormKey}.${name}HelpText`, values.HelpText)
    if (values.Mandatory !== undefined) {
      // @ts-ignore
      setValue(`${proposalFormKey}.${name}Mandatory`, values.Mandatory)
    }
    if (values.proposalInAZoneRequired !== undefined) {
      // @ts-ignore
      setValue(`${proposalFormKey}.proposalInAZoneRequired`, values.proposalInAZoneRequired)
    }
  }

  return (
    <Modal
      disclosure={
        <ButtonQuickAction
          variantColor="blue"
          icon={CapUIIcon.Pencil}
          label={intl.formatMessage({ id: 'action_edit' })}
          className={cn('disclosure', className)}
        />
      }
      size={CapUIModalSize.Sm}
      ariaLabel={intl.formatMessage({ id: 'form.info.edit.modal' })}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'proposal-form' })}</Modal.Header.Label>
            <Heading>{title}</Heading>
          </Modal.Header>
          <Modal.Body>
            <FormControl name={`HelpText`} control={control} mb={6}>
              <FormLabel htmlFor={`HelpText`} label={intl.formatMessage({ id: 'proposal_form.help_text' })}>
                <Text fontSize={2} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput id={`HelpText`} name={`HelpText`} control={control} type="text" placeholder="" />
            </FormControl>
            {initialValues.Mandatory !== undefined && (
              <FormControl name={`Mandatory`} control={control}>
                <FieldInput type="checkbox" name={`Mandatory`} control={control} id={`Mandatory`}>
                  {intl.formatMessage({ id: 'make.mandatory' })}
                </FieldInput>
              </FormControl>
            )}
            {initialValues.proposalInAZoneRequired !== undefined && (
              <FormControl name={`proposalInAZoneRequired`} control={control}>
                <FieldInput
                  type="checkbox"
                  name={`proposalInAZoneRequired`}
                  control={control}
                  id={`proposalInAZoneRequired`}
                >
                  {intl.formatMessage({
                    id: 'proposal_form.proposalInAZoneRequired',
                  })}
                </FieldInput>
              </FormControl>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="big"
              onClick={e => {
                handleSubmit(onSubmit)(e)
                hide()
              }}
            >
              {intl.formatMessage({ id: 'global.validate' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default InfoModal
