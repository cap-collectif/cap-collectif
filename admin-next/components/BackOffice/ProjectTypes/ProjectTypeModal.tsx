import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  FormLabel,
  Heading,
  Modal,
} from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import UpdateProjectTypeMutation from '@mutations/UpdateProjectTypeMutation'
import { ProjectTypesListQuery$data } from '@relay/ProjectTypesListQuery.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

type Props = {
  projectType: ProjectTypesListQuery$data['projectTypes'][number]
}

type FormValues = {
  color: string
}

export const ProjectTypeModal: React.FC<Props> = ({ projectType }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { color: projectType.color },
  })

  const onCloseModal = () => {
    onClose()
    reset({ color: projectType.color })
  }

  const onSubmit = async (data: FormValues) => {
    try {
      await UpdateProjectTypeMutation.commit({ input: { id: projectType.id, color: data.color } })
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      onClose()
    } catch (err) {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      <ButtonQuickAction
        onClick={onOpen}
        variantColor="primary"
        icon={CapUIIcon.Pencil}
        size={CapUIIconSize.Md}
        label={intl.formatMessage({ id: 'global.edit' })}
      />
      <Modal
        size={CapUIModalSize.Md}
        ariaLabel="modal-title"
        show={isOpen}
        onClose={onCloseModal}
        scrollBehavior="outside"
      >
        <Modal.Header>
          <Heading>
            {intl.formatMessage({ id: 'global.edit.title' }, { name: intl.formatMessage({ id: projectType.title }) })}
          </Heading>
        </Modal.Header>

        <Modal.Body overflow="visible">
          <FormControl name="color" control={control}>
            <FormLabel htmlFor="color" label={intl.formatMessage({ id: 'global.color' })} />
            <FieldInput type="colorPicker" id="color" name="color" control={control} />
          </FormControl>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" variantColor="primary" variantSize="big" onClick={onCloseModal}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button variantSize="big" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {intl.formatMessage({ id: 'global.edit' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ProjectTypeModal
