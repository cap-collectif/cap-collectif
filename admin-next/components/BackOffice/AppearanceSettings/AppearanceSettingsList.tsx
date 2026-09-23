import * as React from 'react'
import { FieldInput, FormControl, UploaderValue } from '@cap-collectif/form'
import {
  Box,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Modal,
  Table,
  Tag,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import UpdateAppearanceColorMutation from '@mutations/UpdateAppearanceColorMutation'
import UpdateAppearanceImageMutation from '@mutations/UpdateAppearanceImageMutation'
import type { AppearanceSettingsListQuery } from '@relay/AppearanceSettingsListQuery.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

const QUERY = graphql`
  query AppearanceSettingsListQuery {
    appearanceColors {
      id
      keyname
      value
      isEnabled
    }
    appearanceImages {
      id
      keyname
      isEnabled
      media {
        id
        name
        size
        type: contentType
        url(format: "default_logo")
      }
    }
  }
`

type Color = AppearanceSettingsListQuery['response']['appearanceColors'][number]
type Image = AppearanceSettingsListQuery['response']['appearanceImages'][number]

const COLOR_ORDER = [
  'color.body.bg',
  'color.body.text',
  'color.sub.menu.background',
  'color.section.bg',
  'color.section.text',
  'color.header.bg',
  'color.header.title',
  'color.header.text',
  'color.h1',
  'color.h2',
  'color.h3',
  'color.h4',
  'color.h5',
  'color.h6',
  'color.btn.primary.bg',
  'color.btn.primary.text',
  'color.btn.ghost.hover',
  'color.btn.ghost.base',
  'color.link.default',
  'color.link.hover',
  'color.main_menu.text',
  'color.main_menu.text_active',
  'color.main_menu.text_hover',
  'color.main_menu.bg',
  'color.main_menu.bg_active',
  'color.user.vip.bg',
  'color.votes_bar.bg',
  'color.votes_bar.text',
  'color.votes_bar.border',
  'color.votes_bar.btn.bg',
  'color.votes_bar.btn.text',
  'color.bg.primary',
]

const Status = ({ enabled }: { enabled: boolean }) => {
  const intl = useIntl()
  return (
    <Tag variantColor={enabled ? 'success' : 'infoGray'}>
      {intl.formatMessage({ id: enabled ? 'global.yes' : 'global.no' })}
    </Tag>
  )
}

const ColorModal = ({ color }: { color: Color }) => {
  const intl = useIntl()
  const formId = React.useId()
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: { value: color.value ?? '', isEnabled: color.isEnabled },
  })
  return (
    <Modal
      ariaLabel="edit-appearance-color"
      size={CapUIModalSize.Md}
      scrollBehavior="outside"
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: color.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column" overflow="visible">
            <Flex
              as="form"
              id={formId}
              direction="column"
              onSubmit={handleSubmit(async values => {
                try {
                  await UpdateAppearanceColorMutation.commit({
                    input: { id: color.id, value: values.value, isEnabled: values.isEnabled },
                  })
                  successToast(intl.formatMessage({ id: 'global.changes.saved' }))
                  hide()
                } catch {
                  mutationErrorToast(intl)
                }
              })}
            >
              <FormControl name="value" control={control}>
                <FormLabel htmlFor="value" label={intl.formatMessage({ id: 'global.color' })} />
                <FieldInput id="value" name="value" control={control} type="colorPicker" />
              </FormControl>
              <FormControl name="isEnabled" control={control}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variant="secondary"
                variantColor="hierarchy"
                onClick={() => {
                  reset()
                  hide()
                }}
              >
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button type="submit" form={formId} isLoading={formState.isSubmitting}>
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const ImageModal = ({ image }: { image: Image }) => {
  const intl = useIntl()
  const formId = React.useId()
  const { control, handleSubmit, formState, reset } = useForm<{ media: UploaderValue | null; isEnabled: boolean }>({
    defaultValues: { media: image.media, isEnabled: image.isEnabled },
  })
  return (
    <Modal
      ariaLabel="edit-appearance-image"
      size={CapUIModalSize.Md}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: image.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex
              as="form"
              id={formId}
              direction="column"
              onSubmit={handleSubmit(async values => {
                try {
                  await UpdateAppearanceImageMutation.commit({
                    input: {
                      id: image.id,
                      mediaId: (Array.isArray(values.media) ? values.media[0] : values.media)?.id ?? null,
                      isEnabled: values.isEnabled,
                    },
                  })
                  successToast(intl.formatMessage({ id: 'global.changes.saved' }))
                  hide()
                  window.location.reload()
                } catch {
                  mutationErrorToast(intl)
                }
              })}
            >
              <FormControl name="media" control={control}>
                <FormLabel label={intl.formatMessage({ id: 'global.image' })} />
                <FieldInput
                  type="uploader"
                  name="media"
                  control={control}
                  format=".jpg,.jpeg,.png,.svg"
                  maxSize={1024 * 1024}
                  size={UPLOADER_SIZE.MD}
                  uploadURI={UPLOAD_PATH}
                  showThumbnail
                />
              </FormControl>
              <FormControl name="isEnabled" control={control}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variant="secondary"
                variantColor="hierarchy"
                onClick={() => {
                  reset()
                  hide()
                }}
              >
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button type="submit" form={formId} isLoading={formState.isSubmitting}>
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const AppearanceSettingsList: React.FC = () => {
  const intl = useIntl()
  const { appearanceColors, appearanceImages } = useLazyLoadQuery<AppearanceSettingsListQuery>(QUERY, {})
  const colors = appearanceColors
    .filter(color => COLOR_ORDER.includes(color.keyname))
    .sort((first, second) => COLOR_ORDER.indexOf(first.keyname) - COLOR_ORDER.indexOf(second.keyname))
  const images = appearanceImages.filter(image => image.keyname !== 'image.votes_bar')
  return (
    <Flex direction="column" spacing={6}>
      <Box bg="white" p={6} borderRadius="8px">
        <Table emptyMessage={<Box />} width="100%">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.name' })}</Table.Th>
              <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.enabled' })}</Table.Th>
              <Table.Th>{intl.formatMessage({ id: 'global.value' })}</Table.Th>
              <Table.Th width="10%" textAlign="center">
                {intl.formatMessage({ id: 'admin.settings.header.action' })}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {colors.map(color => (
              <Table.Tr key={color.id} rowId={color.id}>
                <Table.Td>{intl.formatMessage({ id: color.keyname })}</Table.Td>
                <Table.Td>
                  <Status enabled={color.isEnabled} />
                </Table.Td>
                <Table.Td>
                  {color.value ? (
                    <Flex align="center" spacing={2}>
                      <Box
                        width="20px"
                        height="20px"
                        borderRadius="4px"
                        bg={color.value}
                        border="1px solid"
                        borderColor="gray.200"
                      />
                      <Text>{color.value}</Text>
                    </Flex>
                  ) : (
                    intl.formatMessage({ id: 'admin.settings.color.undefined' })
                  )}
                </Table.Td>
                <Table.Td>
                  <Flex justify="center">
                    <ColorModal color={color} />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ))}
            {images.map(image => (
              <Table.Tr key={image.id} rowId={image.id}>
                <Table.Td>{intl.formatMessage({ id: image.keyname })}</Table.Td>
                <Table.Td>
                  <Status enabled={image.isEnabled} />
                </Table.Td>
                <Table.Td>
                  {image.media ? (
                    <Box
                      as="img"
                      src={image.media.url}
                      alt={image.media.name}
                      width="32px"
                      height="32px"
                      sx={{ objectFit: 'contain' }}
                    />
                  ) : (
                    '-'
                  )}
                </Table.Td>
                <Table.Td>
                  <Flex justify="center">
                    <ImageModal image={image} />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Flex>
  )
}

export default AppearanceSettingsList
