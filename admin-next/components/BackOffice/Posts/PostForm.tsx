import * as React from 'react'
import { useIntl } from 'react-intl'
import { Flex, FormLabel, Text, UPLOADER_SIZE, Button, CapUIFontSize } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { UPLOAD_PATH } from '@utils/config'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { UserListField } from '@components/BackOffice/Form/UserListField'
import { PostFormValues } from './Post.type'
import DeletePostConfirmationModal from './DeletePostConfirmationModal'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import useUrlState from '@hooks/useUrlState'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'

type PostFormProps = {
  isNewPost?: boolean
  postId: string | null
  onSubmit: (data: PostFormValues) => Promise<void>
  defaultLocale: string
  isLoading: boolean
  formName: string
}

const PostForm = ({ isNewPost, postId, onSubmit, defaultLocale = 'FR_FR', isLoading }: PostFormProps): JSX.Element => {
  const intl = useIntl()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { isValid },
  } = useFormContext()
  const { viewerSession } = useAppContext()

  const { isOrganizationMember, isProjectAdmin, isAdmin, isSuperAdmin } = viewerSession
  const hasAdminRights = isAdmin || isSuperAdmin
  const isOrgaMemberOrProjectAdmin = !hasAdminRights && (isOrganizationMember || isProjectAdmin)
  const [proposalIdFromUrl] = useUrlState('proposalId', '')

  const currentLocale = watch('currentLocale')

  const projects = watch('projects')
  const authors = watch('authors')
  const currentBody = watch(`${currentLocale}-body`)

  const isEmptyBody = isWYSIWYGContentEmpty(currentBody)

  const disableSaveButton =
    isEmptyBody ||
    !isValid ||
    authors.length < 1 ||
    (!proposalIdFromUrl && isOrgaMemberOrProjectAdmin && projects.length < 1)

  const handleAuthorChange = React.useCallback(() => {
    if (authors.length === 0) {
      setError('authors', {
        type: 'manual',
        message: intl.formatMessage({ id: 'fill-field' }),
      })
    } else {
      clearErrors('authors')
    }
  }, [authors, intl, setError, clearErrors])

  React.useEffect(() => {
    handleAuthorChange()
  }, [authors, handleAuthorChange])

  return (
    <Flex
      direction="column"
      marginTop="48px"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      justify="space-between"
    >
      <Flex direction={'row'} alignItems="flex-start" spacing={6} justify="space-between">
        <Flex direction={'column'} width={'70%'}>
          <FormControl
            name={`${currentLocale}-title`}
            id={`${currentLocale}-title`}
            control={control}
            key={`${currentLocale}-title`}
            isRequired
          >
            <FormLabel
              htmlFor={`${currentLocale}-title`}
              id={`${currentLocale}-title`}
              label={intl.formatMessage({ id: 'global.title' })}
            />
            <FieldInput
              type="text"
              id={`${currentLocale}-title`}
              name={`${currentLocale}-title`}
              control={control}
              required
            />
          </FormControl>

          <FormControl name="authors" id="authors" control={control} isRequired>
            <FormLabel htmlFor="authors" id="authors" label={intl.formatMessage({ id: 'global.author' })} />
            <UserListField
              clearable={false}
              control={control}
              // @ts-ignore
              autoload
              name="authors"
              id="authors"
              disabled={!hasAdminRights}
              debounce
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              selectFieldIsObject
              isMulti
            />
          </FormControl>

          <FormControl
            name={`${currentLocale}-abstract`}
            id={`${currentLocale}-abstract`}
            control={control}
            key={`${currentLocale}-abstract`}
          >
            <FormLabel
              htmlFor={`${currentLocale}-abstract`}
              label={intl.formatMessage({ id: 'global.summary' })}
              id={`${currentLocale}-abstract`}
            >
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput
              type="text"
              id={`${currentLocale}-abstract`}
              name={`${currentLocale}-abstract`}
              control={control}
            />
          </FormControl>
        </Flex>

        <Flex width={'30%'}>
          <FormControl
            name="media"
            id="media"
            control={control}
            width="100%"
            mt={-1}
            spacing={0}
            sx={{
              '.cap-uploader > div ': { width: '100%' },
            }}
          >
            <FormLabel htmlFor="media" id="media" label={intl.formatMessage({ id: 'cover-image' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>

            <FieldInput
              type="uploader"
              name="media"
              id="media"
              control={control}
              format=".jpg,.jpeg,.png"
              maxSize={8000000}
              minResolution={{
                width: 120,
                height: 80,
              }}
              size={UPLOADER_SIZE.MD}
              uploadURI={UPLOAD_PATH}
              showThumbnail
            />
          </FormControl>
        </Flex>
      </Flex>

      <FormControl
        id={`${currentLocale}-body`}
        name={`${currentLocale}-body`}
        key={`${currentLocale}-body`}
        control={control}
        isRequired
      >
        <TextEditor
          label={intl.formatMessage({ id: 'admin.general.content' })}
          name={`${currentLocale}-body`}
          id={`${currentLocale}-body`}
          placeholder={intl.formatMessage({
            id: 'admin.content.start-writing',
          })}
          noModalAdvancedEditor
          platformLanguage={defaultLocale}
          selectedLanguage={defaultLocale}
          required
        />
      </FormControl>

      <Flex direction={'row'} spacing={4}>
        {isNewPost && (
          <>
            <Button
              loading={isLoading}
              disabled={disableSaveButton}
              type="button"
              onClick={e => {
                setValue('isPublished', true)
                handleSubmit(data => onSubmit(data as PostFormValues))(e)
              }}
            >
              {intl.formatMessage({ id: 'admin.post.createAndPublish' })}
            </Button>
            <Button
              type="button"
              variant="secondary"
              variantColor={'primary'}
              loading={isLoading}
              disabled={disableSaveButton}
              onClick={e => handleSubmit(data => onSubmit(data as PostFormValues))(e)}
            >
              {intl.formatMessage({ id: 'btn_create' })}
            </Button>
            <Button variant="tertiary" variantColor={'hierarchy'} onClick={() => (window.location.href = 'posts')}>
              {intl.formatMessage({ id: 'global.back' })}
            </Button>
          </>
        )}

        {!isNewPost && (
          <>
            <Button
              type="button"
              loading={isLoading}
              disabled={disableSaveButton}
              onClick={e => {
                handleSubmit(data => onSubmit(data as PostFormValues))(e)
              }}
            >
              {intl.formatMessage({ id: 'global.save' })}
            </Button>

            <DeletePostConfirmationModal title={getValues('title')} postId={postId} />
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default PostForm
