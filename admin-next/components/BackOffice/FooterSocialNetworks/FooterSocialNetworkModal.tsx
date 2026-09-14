import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Modal,
  Select,
  Switch,
} from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import CreateFooterSocialNetworkMutation from '@mutations/CreateFooterSocialNetworkMutation'
import DeleteFooterSocialNetworkMutation from '@mutations/DeleteFooterSocialNetworkMutation'
import UpdateFooterSocialNetworkMutation from '@mutations/UpdateFooterSocialNetworkMutation'
import { FooterSocialNetworksListQuery$data } from '@relay/FooterSocialNetworksListQuery.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { STYLE_OPTIONS, StyleOption } from './utils'

type FooterSocialNetworkNode = NonNullable<
  NonNullable<FooterSocialNetworksListQuery$data['footerSocialNetworks']>['edges']
>[number]['node']

type Props = {
  connectionId?: string | null
  footerSocialNetwork?: FooterSocialNetworkNode
}

type FormValues = {
  title: string
  link: string
  style: StyleOption
  position: number
  isEnabled: boolean
}

const getDefaultValues = (footerSocialNetwork?: FooterSocialNetworkNode): FormValues => ({
  title: footerSocialNetwork?.title ?? '',
  link: footerSocialNetwork?.link ?? '',
  style: STYLE_OPTIONS.find(option => option.value === footerSocialNetwork?.style) ?? STYLE_OPTIONS[0],
  position: footerSocialNetwork?.position ?? 0,
  isEnabled: footerSocialNetwork?.isEnabled ?? true,
})

export const FooterSocialNetworkModal: React.FC<Props> = ({ connectionId, footerSocialNetwork }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const isEditing = Boolean(footerSocialNetwork)

  const defaultValues = React.useMemo(() => getDefaultValues(footerSocialNetwork), [footerSocialNetwork])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues,
  })

  const onCloseModal = () => {
    onClose()
    setIsDeleting(false)
    reset(defaultValues)
  }

  const onDelete = async () => {
    if (!footerSocialNetwork) return
    setIsDeleting(true)
    try {
      await DeleteFooterSocialNetworkMutation.commit({
        input: { id: footerSocialNetwork.id },
        connections: connectionId ? [connectionId] : [],
      })
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
    } catch {
      mutationErrorToast(intl)
      setIsDeleting(false)
      return
    }
    onCloseModal()
  }

  const onSubmit = async (data: FormValues) => {
    const input = {
      title: data.title,
      link: data.link,
      style: data.style.value,
      position: data.position,
      isEnabled: data.isEnabled,
    }

    try {
      if (footerSocialNetwork) {
        const response = await UpdateFooterSocialNetworkMutation.commit({
          input: { ...input, id: footerSocialNetwork.id },
        })
        if (response.updateFooterSocialNetwork?.errorCode) {
          mutationErrorToast(intl)
          return
        }
      } else {
        const response = await CreateFooterSocialNetworkMutation.commit({
          input,
          connections: connectionId ? [connectionId] : [],
        })
        if (response.createFooterSocialNetwork?.errorCode) {
          mutationErrorToast(intl)
          return
        }
      }
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
    } catch {
      mutationErrorToast(intl)
      return
    }
    onCloseModal()
  }

  return (
    <>
      {isEditing ? (
        <ButtonQuickAction
          onClick={onOpen}
          variantColor="primary"
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      ) : (
        <Button leftIcon={CapUIIcon.Add} variantSize="small" onClick={onOpen}>
          {intl.formatMessage({ id: 'admin.footer-social-networks.create' })}
        </Button>
      )}

      <Modal size={CapUIModalSize.Md} ariaLabel="modal-title" show={isOpen} onClose={onCloseModal}>
        <Modal.Header>
          <Heading>
            {isEditing
              ? intl.formatMessage({ id: 'global.edit.title' }, { name: footerSocialNetwork?.title })
              : intl.formatMessage({ id: 'admin.footer-social-networks.create' })}
          </Heading>
        </Modal.Header>

        <Modal.Body>
          <Flex direction="column" gap={4}>
            <FormControl name="title" control={control} isRequired>
              <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
              <FieldInput type="text" id="title" name="title" control={control} />
            </FormControl>

            <FormControl name="link" control={control} isRequired>
              <FormLabel htmlFor="link" label={intl.formatMessage({ id: 'global.link' })} />
              <FieldInput type="text" id="link" name="link" control={control} />
            </FormControl>

            <FormControl name="style" control={control} isRequired>
              <FormLabel
                htmlFor="style"
                label={intl.formatMessage({ id: 'admin.fields.footer_social_network.style' })}
              />
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <Select
                    id="style"
                    name="style"
                    value={field.value}
                    options={STYLE_OPTIONS}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormControl>

            <FormControl name="position" control={control} isRequired>
              <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'global.position' })} />
              <FieldInput type="number" id="position" name="position" control={control} min={0} />
            </FormControl>

            <FormControl name="isEnabled" control={control}>
              <Flex align="center" gap={2}>
                <Controller
                  name="isEnabled"
                  control={control}
                  render={({ field }) => (
                    <Switch id="isEnabled" checked={field.value} onChange={() => field.onChange(!field.value)} />
                  )}
                />
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} mb={0} />
              </Flex>
            </FormControl>
          </Flex>
        </Modal.Body>

        <Modal.Footer>
          {isEditing && (
            <Button
              variant="tertiary"
              variantColor="danger"
              variantSize="big"
              onClick={onDelete}
              isLoading={isDeleting}
              disabled={isSubmitting}
            >
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          )}
          <Button variant="secondary" variantColor="primary" variantSize="big" onClick={onCloseModal}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button variantSize="big" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting} disabled={isDeleting}>
            {isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FooterSocialNetworkModal
