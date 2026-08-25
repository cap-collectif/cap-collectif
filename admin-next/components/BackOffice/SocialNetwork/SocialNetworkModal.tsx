import * as React from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapInputSize,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  Modal,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import CreateSocialNetworkMutation from '@mutations/CreateSocialNetworkMutation'
import UpdateSocialNetworkMutation from '@mutations/UpdateSocialNetworkMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { SocialNetworkRow } from './types'

type FormValues = {
  title: string
  link: string
  position: number
  isEnabled: boolean
  media?: { id: string; name: string; size: string; type: string; url: string } | null
}

type Props = {
  connectionId?: string | null
  editingSocialNetwork?: SocialNetworkRow
  disclosure?: React.ReactNode
}

const getDefaultValues = (editingSocialNetwork?: SocialNetworkRow): FormValues => ({
  title: editingSocialNetwork?.title ?? '',
  link: editingSocialNetwork?.link ?? '',
  position: editingSocialNetwork?.position ?? 0,
  isEnabled: editingSocialNetwork?.isEnabled ?? false,
  media: editingSocialNetwork?.media ?? null,
})

const SocialNetworkModal: React.FC<Props> = ({ connectionId, editingSocialNetwork, disclosure }) => {
  const intl = useIntl()
  const formId = React.useId()
  const defaultValues = React.useMemo(() => getDefaultValues(editingSocialNetwork), [editingSocialNetwork])

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const closeModal = (hide: () => void) => {
    reset(defaultValues)
    hide()
  }

  const onSubmit = async (values: FormValues, hide: () => void) => {
    const input = {
      title: values.title,
      link: values.link,
      position: Number(values.position),
      isEnabled: values.isEnabled,
      media: values.media?.id ?? null,
    }

    try {
      if (editingSocialNetwork) {
        await UpdateSocialNetworkMutation.commit({ input: { id: editingSocialNetwork.id, ...input } })
      } else {
        await CreateSocialNetworkMutation.commit({ input, connections: connectionId ? [connectionId] : [] })
      }

      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      closeModal(hide)

      if (input.media) {
        // Media upload is still REST-based, so we need to reload the page to see the updated icon.
        window.location.reload()
      }
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      ariaLabel={intl.formatMessage({
        id: editingSocialNetwork ? 'admin.social-network.edit-modal-title' : 'admin.social-network.create-modal-title',
      })}
      size={CapUIModalSize.Md}
      disclosure={
        disclosure ?? (
          <ButtonQuickAction
            icon={CapUIIcon.Pencil}
            size={CapUIIconSize.Md}
            variantColor="hierarchy"
            label={intl.formatMessage({ id: 'global.edit' })}
          />
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: editingSocialNetwork
                  ? 'admin.social-network.edit-modal-title'
                  : 'admin.social-network.create-modal-title',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(values => onSubmit(values, hide))}>
              <FormControl name="title" control={control} isRequired>
                <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
                <FieldInput id="title" name="title" control={control} type="text" variantSize={CapInputSize.Md} />
              </FormControl>
              <FormControl name="link" control={control} isRequired>
                <FormLabel htmlFor="link" label={intl.formatMessage({ id: 'global.link' })} />
                <FieldInput id="link" name="link" control={control} type="text" variantSize={CapInputSize.Md} />
              </FormControl>
              <FormControl name="position" control={control} isRequired>
                <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'global.position' })} />
                <FieldInput
                  id="position"
                  name="position"
                  control={control}
                  type="number"
                  min={0}
                  variantSize={CapInputSize.Md}
                />
              </FormControl>
              <FormControl name="isEnabled" control={control} marginBottom={0}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
              </FormControl>
              <Flex direction="column" mt={2}>
                <FormControl name="media" control={control} width="100%" spacing={0}>
                  <Flex gap={1}>
                    <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'global.image' })} />
                    <Text color="text.tertiary">{intl.formatMessage({ id: 'global.optional' })}</Text>
                  </Flex>
                  <FormGuideline mb={2}>
                    <Text lineHeight="auto">
                      {intl.formatMessage({ id: 'supported.format.listed' }, { format: 'jpg, png' })}
                    </Text>
                  </FormGuideline>
                  <FieldInput
                    type="uploader"
                    name="media"
                    control={control}
                    id="media"
                    format=".jpg,.jpeg,.png"
                    maxFiles={1}
                    showThumbnail
                    isFullWidth
                    size={UPLOADER_SIZE.LG}
                    uploadURI={UPLOAD_PATH}
                  />
                </FormControl>
              </Flex>
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button
                type="button"
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
                {intl.formatMessage({ id: editingSocialNetwork ? 'global.save' : 'global.add' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default SocialNetworkModal
