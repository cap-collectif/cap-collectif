import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIBorder,
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
import { useFeatureFlags } from '@shared/hooks/useFeatureFlag'
import ProposalFormCategoryColor from '@components/Steps/CollectStep/ProposalFormCategoryColor'
import ProposalFormCategoryIcon from '@components/Steps/CollectStep/ProposalFormCategoryIcon'
import ProposalFormCategoryBackgroundPreview from '@components/Steps/CollectStep/ProposalFormCategoryBackgroundPreview'
import dynamic from 'next/dynamic'
import { graphql, useFragment } from 'react-relay'
import { ProposalFormAdminCategoriesModal_query$key } from '@relay/ProposalFormAdminCategoriesModal_query.graphql'

import {
  AvailableProposalCategoryColor,
  AvailableProposalCategoryIcon,
} from '@relay/UpdateProposalFormMutation.graphql'
import { UPLOAD_PATH } from '@utils/config'

const ProposalFormCategoryPinPreview = dynamic(() => import('./ProposalFormCategoryPinPreview'), {
  ssr: false,
})

export interface ProposalFormAdminCategoriesModalProps {
  query: ProposalFormAdminCategoriesModal_query$key
  isUpdating: boolean
  isContainer?: boolean
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
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
  categoryImage: {
    id: string
    image: {
      url: string
      id: string
    } | null
  } | null
  newCategoryImage?: {
    id: string
    image: {
      url: string
      id: string
    } | null
  } | null
  categoryImageEnabled: boolean
}

const CATEGORIES_MODAL_FRAGMENT = graphql`
  fragment ProposalFormAdminCategoriesModal_query on Query {
    customCategoryImages: categoryImages(isDefault: false) {
      id
      image {
        url
        id
        name
      }
    }
  }
`

const ProposalFormAdminCategoriesModal: React.FC<ProposalFormAdminCategoriesModalProps> = ({
  isUpdating,
  isContainer = false,
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
  const features = useFeatureFlags(['display_pictures_in_depository_proposals_list'])
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

  const { reset, handleSubmit, formState, control, watch, setValue } =
    useForm<ProposalFormAdminCategoriesModalFormValues>({
      defaultValues: {
        categoryName: initialValue?.name ?? null,
        categoryColor: initialValue?.color ?? mergedColors.find(elem => !elem.used).value,
        categoryIcon: initialValue?.icon ?? null,
        categoryImage: initialValue?.categoryImage ?? null,
        categoryImageEnabled: !!initialValue?.categoryImage,
        newCategoryImage: null,
      },
      mode: 'onChange',
    })

  const onSubmit = (values: ProposalFormAdminCategoriesModalFormValues) => {
    if (isUpdating) {
      if (!features.display_pictures_in_depository_proposals_list) {
        const updatedCategory = {
          name: values.categoryName,
        }
        update(index, updatedCategory)
      } else {
        const updatedCategory = {
          name: values.categoryName,
          color: values.categoryColor,
          icon: values.categoryIcon,
          categoryImage: values.categoryImage,
          newCategoryImage: values.newCategoryImage,
        }
        update(index, updatedCategory)
      }
    }
    if (!isUpdating) {
      if (!features.display_pictures_in_depository_proposals_list) {
        const updatedCategory = {
          name: values.categoryName,
        }
        append(updatedCategory)
      } else {
        const updatedCategory = {
          name: values.categoryName,
          color: values.categoryColor,
          icon: values.categoryIcon,
          categoryImage: values.categoryImage,
          newCategoryImage: values.newCategoryImage,
        }
        append(updatedCategory)
      }
    }
  }

  return (
    <Modal
      disclosure={
        isContainer ? (
          <Button width="60px" variant="tertiary" className={`NeededInfo_categories_item_add`}>
            {intl.formatMessage({ id: 'admin.global.add' })}
          </Button>
        ) : (
          <ButtonQuickAction
            variantColor="blue"
            icon={CapUIIcon.Pencil}
            label={intl.formatMessage({ id: 'action_edit' })}
            className={`NeededInfo_categories_item_edit_${index}`}
          />
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

            {features.display_pictures_in_depository_proposals_list && (
              <>
                <FormLabel mb={2} label={intl.formatMessage({ id: 'global.color' })} />
                <ProposalFormCategoryColor
                  categoryColors={mergedColors}
                  // @ts-ignore
                  selectedColor={watch('categoryColor')}
                  onColorClick={color => {
                    setValue('categoryColor', color)
                  }}
                />

                <FormLabel
                  mb={2}
                  label={intl.formatMessage({
                    id: 'admin.fields.footer_social_network.style',
                  })}
                >
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({
                      id: 'global.optional',
                    })}
                  </Text>
                </FormLabel>
                <ProposalFormCategoryIcon
                  categoryIcons={mergedIcons}
                  onIconClick={icon => setValue('categoryIcon', icon)}
                  // @ts-ignore
                  selectedColor={watch('categoryColor')}
                  // @ts-ignore
                  selectedIcon={watch('categoryIcon')}
                />

                <FormLabel label={intl.formatMessage({ id: 'global.previsualisation' })}>
                  <Tooltip label={intl.formatMessage({ id: 'category.preview' })}>
                    <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                  </Tooltip>
                </FormLabel>
                <Flex direction="row" justifyContent="space-between" gap={2} my={3} height="120px" minHeight="120px">
                  <ProposalFormCategoryBackgroundPreview
                    icon={watch('categoryIcon')}
                    name={watch('categoryName')}
                    color={watch('categoryColor')}
                    customCategoryImage={watch('categoryImage')}
                  />
                  {watch('categoryColor') && watch('categoryIcon') ? (
                    <ProposalFormCategoryPinPreview
                      // @ts-ignore
                      color={watch('categoryColor')}
                      // @ts-ignore
                      icon={watch('categoryIcon')}
                    />
                  ) : null}
                </Flex>
                <Flex direction="column" gap={3} border="1px solid #ddd" borderRadius={CapUIBorder.Card}>
                  <Box backgroundColor={'gray.100'} px={3} py={1}>
                    <FormControl
                      name="categoryImageEnabled"
                      control={control}
                      onClick={() => {
                        if (watch('categoryImageEnabled')) {
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
                  {watch('categoryImageEnabled') && (
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
                            {customCategoryImages.map(customImage => (
                              <Flex
                                key={customImage.id}
                                width="33%"
                                alignItems="center"
                                justifyContent="center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setValue('categoryImage', customImage)
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
                                />
                              </Flex>
                            ))}
                          </Flex>
                        </>
                      )}

                      <FormControl name="newCategoryImage" control={control} width="100%">
                        <FormLabel
                          label={intl.formatMessage({
                            id: 'illustration',
                          })}
                        >
                          <Text fontSize={2} color="gray.500">
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
                          name="newCategoryImage"
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
                        />
                      </FormControl>
                    </Box>
                  )}
                </Flex>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
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
                  reset()
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
