import { FC, useState } from 'react'
import { Box, Button, CapUIModalSize, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import { useForm } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import UserListField from '@components/Form/UserListField'
import AddMediatorsMutation from 'mutations/AddMediatorsMutation'

type MediatorCreateModalProps = {
  onClose: () => void
  options: { label: string; value: string; connectionId: string }[]
}

type FormValues = {
  step: string
  mediators: Array<{ label: string; value: string; connectionId: string }>
}

const MediatorCreateModal: FC<MediatorCreateModalProps> = ({ onClose, options }) => {
  const intl = useIntl()
  const { handleSubmit, formState, control } = useForm<FormValues>({
    mode: 'onChange',
  })

  const { isSubmitting } = formState

  const onSubmit = async (values: FormValues) => {
    const mediatorConnectionId = options.find(option => option.value === values.step)?.connectionId
    try {
      await AddMediatorsMutation.commit(
        {
          input: { usersId: values.mediators.map(m => m.value), stepId: values.step },
        },
        mediatorConnectionId,
      )
      onClose()
    } catch {
      mutationErrorToast(intl)
      onClose()
    }
  }

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'group.admin.step.modal.delete.content' })}
    >
      <Modal.Header>
        <Modal.Header.Label>{intl.formatMessage({ id: 'global.mediator' })}</Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'mediator.add_plural' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="mediators" control={control} isRequired>
            <FormLabel htmlFor="mediators" label={intl.formatMessage({ id: 'group.admin.form.users' })} />
            <UserListField name="mediators" control={control} isMulti isMediatorCompliant />
          </FormControl>
          <FormControl name="step" control={control} isRequired>
            <FormLabel htmlFor="step" label={intl.formatMessage({ id: 'mediator.select_step' })} />
            <FieldInput name="step" control={control} options={options} type="select" clearable />
          </FormControl>
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onClose} variant="secondary" variantSize="big" variantColor="primary">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          type="submit"
          variantColor="primary"
          variantSize="big"
          onClick={e => {
            handleSubmit((data: FormValues) => onSubmit(data))(e)
          }}
          isLoading={isSubmitting}
          disabled={!formState.isValid}
        >
          {intl.formatMessage({ id: 'global.add' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MediatorCreateModal
