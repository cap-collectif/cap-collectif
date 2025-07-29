import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIBorder,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  Icon,
  Modal,
  Text,
  Tooltip,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFeatureFlag } from '@shared/hooks/useFeatureFlag'
import ProposalFormCategoryColor from '@components/BackOffice/Steps/CollectStep/ProposalFormCategoryColor'
import ProposalFormCategoryIcon from '@components/BackOffice/Steps/CollectStep/ProposalFormCategoryIcon'
import ProposalFormCategoryBackgroundPreview from '@components/BackOffice/Steps/CollectStep/ProposalFormCategoryBackgroundPreview'
import dynamic from 'next/dynamic'
import { graphql, useFragment } from 'react-relay'
import { ProposalFormAdminCategoriesModal_query$key } from '@relay/ProposalFormAdminCategoriesModal_query.graphql'
import HandleProposalFormCategoryImageMutation from '@mutations/HandleProposalFormCategoryImageMutation'

import {
  AvailableProposalCategoryColor,
  AvailableProposalCategoryIcon,
} from '@relay/UpdateProposalFormMutation.graphql'
import { UPLOAD_PATH } from '@utils/config'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'

const ProposalFormCategoryPinPreview = dynamic(() => import('./ProposalFormCategoryPinPreview'), {
  ssr: false,
})

export interface ProposalFormAdminCategoriesModalProps {
  query: ProposalFormAdminCategoriesModal_query$key
  isUpdating: boolean
  initialValue?: {
    id: string
    name: string
    color: string
    icon: string | null
    categoryImage: {
      id: string
      image: {
        url: string
        id: string
      } | null
    } | null
    newCategoryImage?: string | null
    newCategoryImagePreview?: {
      id: string
      name: string
      size: string
      url: string
      type: string
    }
  }
  index?: number
  append?: (obj: any) => void
  update?: (index: number, obj: any) => void
  colors: ReadonlyArray<AvailableProposalCategoryColor>
  icons: ReadonlyArray<AvailableProposalCategoryIcon>
  usedColors: string[]
  usedIcons: string[]
}
interface ProposalFormAdminCategoriesModalFormValues {
  id: string | null
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
  categoryImage: {
    id: string
    image: {
      url: string
      id: string
      name: string
    } | null
  } | null
  newCategoryImage?: string | null
  newCategoryImagePreview?: {
    id: string
    name: string
    size: string
    url: string
    type: string
  }
  categoryImageEnabled: boolean
}

type File = {
  id: string
  name: string
  size: string
  type: string
  url: string
}

const CATEGORIES_MODAL_FRAGMENT = graphql`
  fragment ProposalFormAdminCategoriesModal_query on Query {
    customCategoryImages: categoryImages(isDefault: false) {
      id
      image {
        url
        id
        name
        type: contentType
      }
    }
  }
`

const ProposalFormAdminCategoriesModal: React.FC<ProposalFormAdminCategoriesModalProps> = ({
  isUpdating,
  initialValue,
  index,
  colors,
  icons,
  usedColors,
  usedIcons,
  query: queryRef,
  append,
  update,
}) => {
  const display_pictures_in_depository_proposals_list = useFeatureFlag('display_pictures_in_depository_proposals_list')
  const { customCategoryImages } = useFragment(CATEGORIES_MODAL_FRAGMENT, queryRef)
  const intl = useIntl()
  const mergedColors = colors.map(c => ({
    value: c,
    used: usedColors.some(uc => uc === c),
  }))
  const mergedIcons = icons.map(i => ({
    value: i,
    used: usedIcons.some(ic => ic === i),
  }))

  const defaultValues = {
    id: initialValue?.id ?? null,
    categoryName: initialValue?.name ?? null,
    categoryColor: initialValue?.color ?? mergedColors.find(elem => !elem.used).value,
    categoryIcon: initialValue?.icon ?? null,
    categoryImage: initialValue?.categoryImage ?? null,
    categoryImageEnabled: !!initialValue?.categoryImage || !!initialValue?.newCategoryImagePreview,
    newCategoryImage: initialValue?.newCategoryImage ?? null,
    newCategoryImagePreview: initialValue?.newCategoryImagePreview ?? null,
  }

  const { reset, handleSubmit, formState, control, watch, setValue } =
    useForm<ProposalFormAdminCategoriesModalFormValues>({
      defaultValues,
      mode: 'onChange',
    })

  const categoryIcon = watch('categoryIcon')
  const categoryName = watch('categoryName')
  const categoryColor = watch('categoryColor')
  const categoryImage = watch('categoryImage')
  const categoryImageEnabled = watch('categoryImageEnabled')
  const newCategoryImage = watch('newCategoryImage')

  const onSubmit = (values: ProposalFormAdminCategoriesModalFormValues) => {
    const getCategoryInput = () => {
      if (!display_pictures_in_depository_proposals_list) {
        return {
          name: values.categoryName,
        }
      }

      return {
        id: initialValue?.id ?? null,
        name: values.categoryName,
        color: values.categoryColor,
        icon: values.categoryIcon,
        categoryImage: values.categoryImage?.id ? values.categoryImage : null,
        newCategoryImage: values.categoryImage?.id ? null : values.newCategoryImagePreview?.id,
        newCategoryImagePreview: values?.newCategoryImagePreview,
      }
    }

    const category = getCategoryInput()

    if (isUpdating) {
      update(index, category)
      return
    }

    append(category)
  }

  const onUpload = async (file: File) => {
    {
      if (!file) return
      try {
        const response = await HandleProposalFormCategoryImageMutation.commit({
          input: {
            mediaId: file.id,
            action: 'ADD',
          },
        })

        const categoryImage = response.handleProposalFormCategoryImage.categoryImage

        setValue('categoryImage', categoryImage)
      } catch (error) {
        return mutationErrorToast(intl)
      }
    }
  }

  const onFileRemove = async (file: File) => {
    if (!file) return
    try {
      await HandleProposalFormCategoryImageMutation.commit({
        input: {
          mediaId: file.id,
          action: 'DELETE',
        },
      })
      setValue('categoryImage', null)
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      disclosure={
        isUpdating ? (
          <ButtonQuickAction
            variantColor="primary"
            icon={CapUIIcon.Pencil}
            label={intl.formatMessage({ id: 'action_edit' })}
            className={`NeededInfo_categories_item_edit_${index}`}
            onClick={() => {
              reset({
                categoryName: initialValue?.name,
                categoryColor: initialValue?.color,
                categoryIcon: initialValue?.icon ?? null,
                categoryImage: initialValue?.categoryImage ?? null,
                categoryImageEnabled: !!initialValue?.categoryImage || !!initialValue?.newCategoryImage,
                newCategoryImage: null,
              })
            }}
          />
        ) : (
          <Button width="60px" variant="tertiary" className={`NeededInfo_categories_item_add`} onClick={() => reset()}>
            {intl.formatMessage({ id: 'admin.global.add' })}
          </Button>
        )
      }
      size={CapUIModalSize.Lg}
      aria-labelledby="report-modal-title-lg"
      ariaLabel={intl.formatMessage({
        id: !isUpdating ? 'category_modal.create.title' : 'category_modal.update.title',
      })}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'proposal-form' })}</Modal.Header.Label>
            <Heading id="report-modal-title-lg">
              {intl.formatMessage({
                id: !isUpdating ? 'category_modal.create.heading' : 'category_modal.update.title',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <FormControl name={`categoryName`} control={control} mb={6} isRequired>
              <FormLabel htmlFor={`categoryName`} label={intl.formatMessage({ id: 'global.title' })} />
              <FieldInput
                id={`categoryName`}
                name={`categoryName`}
                control={control}
                type="text"
                placeholder={intl.formatMessage({ id: 'category.without.title' })}
              />
            </FormControl>

            {display_pictures_in_depository_proposals_list && (
              <>
                <FormLabel mb={2} label={intl.formatMessage({ id: 'global.color' })} />
                <ProposalFormCategoryColor
                  isNewCategory={!isUpdating}
                  categoryColors={mergedColors}
                  selectedColor={categoryColor}
                  updateCurrentColor={color => {
                    setValue('categoryColor', color)
                  }}
                />

                <FormLabel
                  mb={2}
                  label={intl.formatMessage({
                    id: 'admin.fields.footer_social_network.style',
                  })}
                >
                  <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                    {intl.formatMessage({
                      id: 'global.optional',
                    })}
                  </Text>
                </FormLabel>
                <ProposalFormCategoryIcon
                  categoryIcons={mergedIcons}
                  onIconClick={icon => setValue('categoryIcon', icon)}
                  selectedColor={categoryColor}
                  selectedIcon={categoryIcon}
                />

                <FormLabel label={intl.formatMessage({ id: 'global.previsualisation' })}>
                  <Tooltip label={intl.formatMessage({ id: 'category.preview' })}>
                    <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                  </Tooltip>
                </FormLabel>
                <Flex direction="row" justifyContent="space-between" gap={2} my={3} height="120px" minHeight="120px">
                  <ProposalFormCategoryBackgroundPreview
                    icon={categoryIcon}
                    name={categoryName}
                    color={categoryColor}
                    imageUrl={categoryImage?.image?.url}
                  />
                  {categoryColor && categoryIcon ? (
                    <ProposalFormCategoryPinPreview color={categoryColor} icon={categoryIcon} />
                  ) : null}
                </Flex>
                <Flex direction="column" gap={3} border="1px solid #ddd" borderRadius={CapUIBorder.Card}>
                  <Box backgroundColor={'gray.100'} px={3} py={1}>
                    <FormControl
                      name="categoryImageEnabled"
                      control={control}
                      onClick={() => {
                        if (categoryImageEnabled) {
                          setValue('categoryImage', null)
                        }
                      }}
                      width="auto"
                    >
                      <FieldInput id="categoryImageEnabled" name="categoryImageEnabled" control={control} type="switch">
                        {intl.formatMessage({ id: 'custom-illustration' })}
                      </FieldInput>
                    </FormControl>
                  </Box>
                  {categoryImageEnabled && (
                    <Box px={3} py={1}>
                      {!!customCategoryImages.length && (
                        <>
                          <Text fontWeight={CapUIFontWeight.Bold}>
                            {intl.formatMessage({
                              id: 'your-pictures',
                            })}
                          </Text>
                          <Flex
                            direction="row"
                            wrap="wrap"
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            p={4}
                            gap={1}
                          >
                            {customCategoryImages.map(customImage => {
                              const isSelectedImage =
                                categoryImage?.id === customImage.id || newCategoryImage === customImage?.image?.id
                              return (
                                <Flex
                                  key={customImage.id}
                                  width="33%"
                                  alignItems="center"
                                  justifyContent="center"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setValue('categoryImage', customImage)
                                    setValue('newCategoryImage', null)
                                  }}
                                >
                                  <Box
                                    width="178px"
                                    height="56px"
                                    as="img"
                                    style={{ objectFit: 'cover' }}
                                    id={customImage.id}
                                    src={customImage?.image?.url}
                                    mb={3}
                                    borderRadius={CapUIBorder.Card}
                                    border={isSelectedImage ? '2px solid' : ''}
                                    borderColor={isSelectedImage ? 'primary.base' : ''}
                                  />
                                </Flex>
                              )
                            })}
                          </Flex>
                        </>
                      )}

                      <FormControl
                        name="newCategoryImage"
                        control={control}
                        width="100%"
                        sx={{
                          '.cap-uploader': { width: '100%', minWidth: 'unset' },
                          '.cap-uploader > div ': { width: '100%' },
                        }}
                      >
                        <FormLabel
                          label={intl.formatMessage({
                            id: 'illustration',
                          })}
                        >
                          <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                            {intl.formatMessage({
                              id: 'global.optional',
                            })}
                          </Text>
                        </FormLabel>
                        <FormGuideline>
                          {intl.formatMessage({ id: 'supported.format.listed' }, { format: 'jpg, jpeg, png' })}{' '}
                          {intl.formatMessage({ id: 'specific-max-weight' }, { weight: '8Mo' })}
                          {intl.formatMessage({ id: 'min-size-dynamic' }, { width: '950', height: '310' })}
                        </FormGuideline>

                        <FieldInput
                          width="100%"
                          type="uploader"
                          name="newCategoryImagePreview"
                          control={control}
                          format=".jpg,.jpeg,.png"
                          maxSize={8000000}
                          minResolution={{
                            width: 950,
                            height: 310,
                          }}
                          size={UPLOADER_SIZE.LG}
                          uploadURI={UPLOAD_PATH}
                          showThumbnail
                          // @ts-ignore
                          onChange={onUpload}
                          onRemove={onFileRemove}
                          isFullWidth
                        />
                      </FormControl>
                    </Box>
                  )}
                </Flex>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              variantColor="primary"
              variantSize="big"
              onClick={() => {
                hide()
                reset()
              }}
            >
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              id="add-category-button"
              variant="primary"
              variantColor="primary"
              variantSize="big"
              disabled={!formState.isValid}
              onClick={e => {
                handleSubmit(onSubmit)(e)
                if (formState.isValid) {
                  hide()
                }
              }}
            >
              {intl.formatMessage({ id: !isUpdating ? 'admin.global.add' : 'global.change' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ProposalFormAdminCategoriesModal
