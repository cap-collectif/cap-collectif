import * as React from 'react'
import {
  Box,
  Button,
  CapUIBorder,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIModalSize,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  InputGroup,
  Modal,
  Select,
  Text,
  toast,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useDisclosure } from '@liinkiing/react-hooks'
import { FormControl, FieldInput } from '@cap-collectif/form'
import { FormProvider, useForm } from 'react-hook-form'
import CreateUserTypeMutation from '@mutations/CreateUserTypeMutation'
import { TranslationLocale } from '@relay/NavBarQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { UserTypeModal_LocalesQuery } from '@relay/UserTypeModal_LocalesQuery.graphql'
import UpdateUserTypeMutation from '@mutations/UpdateUserTypeMutation'
import { getExistingTranslations } from './utils'
import { getDefaultLocale, getFormattedPlatformLocales } from '@shared/utils/platformLanguages'
import DeleteUserTypeMutation from '@mutations/DeleteUserTypeMutation'
import { UPLOAD_PATH } from '@utils/config'
import { UserTypesList_query$data } from '@relay/UserTypesList_query.graphql'

type Props = {
  context?: 'create' | 'edit'
  userTypeData?: UserTypesList_query$data['userTypes']['edges'][number]['node']
  connectionId: string
}

type FormProps = {
  translations: Array<{ name: string; locale: TranslationLocale }>
  locale: FormattedLocale
  connectionId: string
  file?: { id: string; url: string } | null | undefined
}

type FormattedLocale = {
  label: string
  value: TranslationLocale
}

export const LOCALES_QUERY = graphql`
  query UserTypeModal_LocalesQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
  }
`

export const UserTypeModal: React.FC<Props> = ({ context = 'create', userTypeData, connectionId }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const multilangue = useFeatureFlag('multilangue')
  const [currentAction, setCurrentAction] = React.useState<'save' | 'delete' | null>(null)

  const isNewUserType = userTypeData ? false : true

  const { platformLocales } = useLazyLoadQuery<UserTypeModal_LocalesQuery>(LOCALES_QUERY, {})

  const defaultLocaleCode = getDefaultLocale([...platformLocales])!.code

  const formattedDefaultLocale = {
    value: defaultLocaleCode,
    label: intl.formatMessage({ id: getDefaultLocale([...platformLocales])!.traductionKey }),
  }
  const [currentLocale, setCurrentLocale] = React.useState<FormattedLocale>(formattedDefaultLocale)

  const formattedLocales = getFormattedPlatformLocales([...platformLocales], intl)

  const defaultValues = React.useMemo(() => {
    if (isNewUserType) {
      const localeFields = Object.fromEntries(platformLocales.map(locale => [`${locale.code}-typeName`, '']))
      return {
        translations: [],
        file: null,
        ...localeFields,
      }
    } else {
      const localeFields = Object.fromEntries(
        platformLocales.map(locale => {
          const translation = userTypeData?.translations?.find(t => t.locale === locale.code)
          return [`${locale.code}-typeName`, translation?.name || '']
        }),
      )
      return {
        translations: getExistingTranslations(userTypeData?.translations, [...platformLocales]),
        file: userTypeData?.media ?? null,
        ...localeFields,
      }
    }
  }, [isNewUserType, userTypeData, platformLocales])

  const methods = useForm<FormProps>({
    mode: 'onSubmit',
    defaultValues,
  })

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { isSubmitting },
  } = methods

  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues)
    }
  }, [isOpen, defaultValues, reset])

  const handleLocaleChange = (e: FormattedLocale) => {
    setCurrentLocale(e)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // @ts-ignore: dynamically generated, thus not typed
    setValue(`${currentLocale.value}-typeName`, value)
  }

  const onCloseModal = () => {
    onClose()
    setCurrentAction(null)
    reset(defaultValues)
  }

  const onOpenModal = () => {
    setCurrentLocale(formattedDefaultLocale)
    onOpen()
  }

  const onDeleteType = async () => {
    setCurrentAction('delete')
    const deleteMutationInput = { input: { id: userTypeData.id }, connections: [connectionId] }

    try {
      await DeleteUserTypeMutation.commit(deleteMutationInput)
      toast({
        variant: 'danger',
        content: intl.formatMessage({ id: 'admin.user-types.delete-success' }),
      })
    } catch (err) {
      mutationErrorToast(intl)
      return
    }
    onCloseModal()
  }

  const onSubmit = async (data: FormProps): Promise<void> => {
    setCurrentAction('save')

    const translations = platformLocales
      .map(locale =>
        data[`${locale.code}-typeName`]
          ? {
              locale: locale.code as TranslationLocale,
              name: data[`${locale.code}-typeName`],
            }
          : null,
      )
      .filter(Boolean)

    // If all the name fields are empty, we can't move forward
    if (translations.every(t => t.name.trim() === '')) {
      // @ts-ignore: dynamically generated, thus not typed
      setError(`${currentLocale.value}-typeName`, {
        type: 'manual',
        message: intl.formatMessage({ id: 'fill-field' }),
      })
      return
    }

    if (context === 'create') {
      const createUserTypeInput = {
        input: {
          translations: translations.filter(t => t.name.trim() !== ''),
          media: data?.file?.id || null,
        },
        connections: [connectionId],
      }

      try {
        await CreateUserTypeMutation.commit(createUserTypeInput)
        if (createUserTypeInput.input.media) {
          // currently, the media upload is still in REST
          // so we have to reload the page to see the type and its media
          window.location.reload()
        }
        toast({
          variant: 'success',
          content: intl.formatMessage(
            { id: 'admin.user-types.create-success' },
            {
              type:
                createUserTypeInput.input.translations.find(t => t.locale === defaultLocaleCode)?.name ||
                createUserTypeInput.input.translations?.[0]?.name ||
                '',
            },
          ),
        })
      } catch (err) {
        mutationErrorToast(intl)
      }
    } else {
      const updateUserTypeInput = {
        input: {
          translations: translations,
          media: data?.file?.id || null,
          id: userTypeData.id,
        },
      }

      try {
        await UpdateUserTypeMutation.commit(updateUserTypeInput)

        if (updateUserTypeInput.input.media) {
          // currently, the media upload is still in REST
          // so we have to reload the page to see the type and its media
          window.location.reload()
        }
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'global.changes.saved' }),
        })
      } catch (err) {
        mutationErrorToast(intl)
      }
    }
    onCloseModal()
  }

  return (
    <>
      {context === 'create' ? (
        <Button leftIcon={CapUIIcon.Add} width="fit-content" onClick={onOpenModal}>
          {intl.formatMessage({ id: 'admin.user-types.create-button' })}
        </Button>
      ) : (
        <Box as="button" width="fit-content" onClick={onOpenModal} ml={2} mr={0}>
          <Text color="primary.base" fontSize={CapUIFontSize.Caption} fontWeight={CapUIFontWeight.Bold}>
            {intl.formatMessage({ id: 'global.edit' }).toUpperCase()}
          </Text>
        </Box>
      )}
      <Modal size={CapUIModalSize.Md} ariaLabel={'modal-title'} show={isOpen} onClose={onCloseModal}>
        <Modal.Header height={pxToRem(72)}>
          {context === 'create' ? (
            <Heading>{intl.formatMessage({ id: 'admin.user-types.create-type' })}</Heading>
          ) : (
            <Heading>{intl.formatMessage({ id: 'admin.user-types.update-type' })}</Heading>
          )}
        </Modal.Header>

        <Modal.Body>
          <FormProvider {...methods}>
            <Flex direction="column" gap={2}>
              <InputGroup display="flex" direction="column" width="100%" gap={0}>
                <Flex wrap="nowrap" alignItems="baseline" width="100%" gap={0} grow={1}>
                  {multilangue && (
                    <Flex gap={0} grow={1}>
                      <FormControl name="locale" control={control} borderRightWidth={CapUIBorder.Normal} grow={1}>
                        <FormLabel htmlFor="locale" label={intl.formatMessage({ id: 'admin.user-types.type-name' })} />
                        <Select
                          name="locale"
                          id="locale"
                          value={currentLocale}
                          options={formattedLocales}
                          onChange={handleLocaleChange}
                        />
                      </FormControl>
                    </Flex>
                  )}

                  <Flex grow={3}>
                    <FormControl
                      name={`${currentLocale.value}-typeName`}
                      control={control}
                      isRequired
                      grow={3}
                      key={`${currentLocale.value}-typeName`}
                    >
                      {/* If multilangue is NOT enabled, the label of the <Select /> is not displayed, so we display it here */}
                      {/* If multilangue IS enabled, we display a non-breaking space so that both inputs are displayed properly, even when 'typeName' input has an error message */}
                      <FormLabel
                        htmlFor={`${currentLocale.value}-typeName`}
                        label={multilangue ? '\xa0' : intl.formatMessage({ id: 'admin.user-types.type-name' })}
                        aria-hidden={multilangue}
                      />
                      <FieldInput
                        type="text"
                        control={control}
                        name={`${currentLocale.value}-typeName`}
                        id={`${currentLocale.value}-typeName`}
                        flexGrow={1}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Flex>
                </Flex>
              </InputGroup>

              <Flex direction="column">
                <FormControl name="file" control={control} width="100%" mt={-1} spacing={0}>
                  <Flex gap={1}>
                    <FormLabel
                      htmlFor="file"
                      label={intl.formatMessage({
                        id: 'illustration',
                      })}
                    />
                    <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary">
                      {intl.formatMessage({ id: 'global.optional' })}
                    </Text>
                  </Flex>
                  <FormGuideline mb={2}>
                    <Text lineHeight="auto">{intl.formatMessage({ id: 'admin.user-types.media-specs' })} </Text>
                  </FormGuideline>

                  <FieldInput
                    type="uploader"
                    name="file"
                    control={control}
                    id="file"
                    format=".jpg,.jpeg,.png"
                    maxFiles={1}
                    maxSize={100000} // 100ko
                    showThumbnail
                    isFullWidth
                    size={UPLOADER_SIZE.LG}
                    uploadURI={UPLOAD_PATH}
                  />
                </FormControl>
              </Flex>
            </Flex>
          </FormProvider>
        </Modal.Body>

        <Modal.Footer>
          {context === 'edit' && (
            <Button
              variant="tertiary"
              variantColor="danger"
              variantSize="big"
              onClick={handleSubmit(onDeleteType)}
              isLoading={isSubmitting && currentAction === 'delete'}
            >
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          )}
          <Button variant="secondary" variantColor="primary" variantSize="big" onClick={onCloseModal}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            variantSize="big"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting && currentAction === 'save'}
          >
            {context === 'create'
              ? intl.formatMessage({ id: 'admin.user-types.create-type-save-button' })
              : intl.formatMessage({ id: 'global.edit' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default UserTypeModal
