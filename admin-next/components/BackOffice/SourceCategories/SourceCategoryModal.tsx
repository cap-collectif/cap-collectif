import * as React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { ConnectionHandler, ROOT_ID } from 'relay-runtime'
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
import CreateSourceCategoryMutation from '@mutations/CreateSourceCategoryMutation'
import UpdateSourceCategoryMutation from '@mutations/UpdateSourceCategoryMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { SourceCategoriesList_query$data } from '@relay/SourceCategoriesList_query.graphql'

type Props = {
  context?: 'create' | 'edit'
  sourceCategory?: SourceCategoriesList_query$data['sourceCategories']['edges'][number]['node']
}

type FormValues = {
  title: string
}

export const SourceCategoryModal: React.FC<Props> = ({ context = 'create', sourceCategory }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const defaultValues = { title: sourceCategory?.title ?? '' }

  const schema = yup.object().shape({
    title: yup.string().notBlank(intl.formatMessage({ id: 'global.required' })),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues, resolver: yupResolver(schema) })

  const onCloseModal = () => {
    onClose()
    reset(defaultValues)
  }

  const onSubmit = async (data: FormValues) => {
    try {
      if (context === 'create') {
        await CreateSourceCategoryMutation.commit({
          input: { title: data.title },
          connections: [ConnectionHandler.getConnectionID(ROOT_ID, 'SourceCategoriesList_sourceCategories', {})],
        })
        successToast(intl.formatMessage({ id: 'admin.source-category.create-success' }))
      } else {
        await UpdateSourceCategoryMutation.commit({
          input: { id: sourceCategory.id, title: data.title },
        })
        successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      }
      onClose()
    } catch (err) {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      {context === 'create' ? (
        <Button leftIcon={CapUIIcon.Add} onClick={onOpen}>
          {intl.formatMessage({ id: 'global.add' })}
        </Button>
      ) : (
        <ButtonQuickAction
          onClick={onOpen}
          variantColor="primary"
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      )}
      <Modal size={CapUIModalSize.Md} ariaLabel="modal-title" show={isOpen} onClose={onCloseModal}>
        <Modal.Header>
          <Heading>
            {context === 'create'
              ? intl.formatMessage({ id: 'admin.source-category.create-title' })
              : intl.formatMessage({ id: 'global.edit.title' }, { name: sourceCategory.title })}
          </Heading>
        </Modal.Header>

        <Modal.Body>
          <FormControl name="title" control={control} isRequired>
            <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
            <FieldInput type="text" id="title" name="title" control={control} />
          </FormControl>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" variantColor="primary" variantSize="big" onClick={onCloseModal}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button variantSize="big" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {context === 'create'
              ? intl.formatMessage({ id: 'global.add' })
              : intl.formatMessage({ id: 'global.edit' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SourceCategoryModal
