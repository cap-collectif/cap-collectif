import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, CapUIFontSize, Flex, FormLabel, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import { UserListField } from '@components/BackOffice/Form/UserListField'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import DeleteVideoConfirmationModal from './DeleteVideoConfirmationModal'
import { Locale, VideoFormValues } from './Video.type'

type VideoFormProps = {
  isNewVideo: boolean
  videoId: string | null
  onSubmit: (data: VideoFormValues) => void
  isLoading: boolean
  formName: string
  availableLocales: Locale[]
}

const VideoForm = ({ isNewVideo, videoId, onSubmit, isLoading, availableLocales }: VideoFormProps): JSX.Element => {
  const intl = useIntl()
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { isValid },
  } = useFormContext()
  const multilangue = useFeatureFlag('multilangue')
  const currentLocale = watch('currentLocale')

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
      {multilangue && (
        <Flex direction="column" width="30%">
          <FormControl name="currentLocale" control={control} key="currentLocale">
            <FormLabel htmlFor="currentLocale" label={intl.formatMessage({ id: 'admin.post.languages' })} />
            <FieldInput
              type="select"
              name="currentLocale"
              control={control}
              id="currentLocale"
              options={availableLocales.map(locale => ({
                value: locale.code,
                label: intl.formatMessage({ id: locale.traductionKey }),
              }))}
            />
          </FormControl>
        </Flex>
      )}

      <Flex direction="row" alignItems="flex-start" spacing={6} justify="space-between">
        <Flex direction="column" width="70%">
          <FormControl name={`${currentLocale}-title`} control={control} key={`${currentLocale}-title`} isRequired>
            <FormLabel
              htmlFor={`${currentLocale}-title`}
              label={intl.formatMessage({ id: 'admin.fields.video.title' })}
            />
            <FieldInput
              type="text"
              id={`${currentLocale}-title`}
              name={`${currentLocale}-title`}
              control={control}
              required
            />
          </FormControl>

          <FormControl name="link" control={control} isRequired>
            <FormLabel htmlFor="link" label={intl.formatMessage({ id: 'admin.fields.video.link' })} />
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
              {intl.formatMessage({ id: 'admin.video.url-helptext' }, { b: (...chunks) => <b>{chunks.join('')}</b> })}
            </Text>
            <FieldInput type="text" id="link" name="link" control={control} placeholder="http://" required />
          </FormControl>

          <FormControl name="author" control={control}>
            <FormLabel htmlFor="author" label={intl.formatMessage({ id: 'admin.fields.video.author' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <UserListField
              clearable
              control={control}
              name="author"
              id="author"
              // @ts-ignore: debounce is forwarded to the underlying FieldSelect but not part of UserListFieldProps
              debounce
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              selectFieldIsObject
            />
          </FormControl>
        </Flex>

        <Flex direction="column" width="30%">
          <FormControl name="media" control={control} width="100%" mt={-1} spacing={0}>
            <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'admin.fields.video.media' })} />
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
              {intl.formatMessage({ id: 'admin.help.video.media' })}
            </Text>
            <FieldInput
              type="uploader"
              name="media"
              id="media"
              control={control}
              format=".jpg,.jpeg,.png"
              maxSize={8000000}
              minResolution={{ width: 320, height: 215 }}
              size={UPLOADER_SIZE.MD}
              uploadURI={UPLOAD_PATH}
              showThumbnail
            />
          </FormControl>
        </Flex>
      </Flex>

      <FormControl name={`${currentLocale}-body`} key={`${currentLocale}-body`} control={control}>
        <FormLabel htmlFor={`${currentLocale}-body`} label={intl.formatMessage({ id: 'admin.fields.video.body' })}>
          <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
            {intl.formatMessage({ id: 'global.optional' })}
          </Text>
        </FormLabel>
        <FieldInput type="textarea" id={`${currentLocale}-body`} name={`${currentLocale}-body`} control={control} />
      </FormControl>

      <Flex direction="column" spacing={6} alignItems="flex-start">
        <Flex direction="column" width="30%">
          <FormControl name="position" control={control} isRequired>
            <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'admin.fields.video.position' })} />
            <FieldInput type="number" id="position" name="position" control={control} required />
          </FormControl>
        </Flex>

        <FormControl name="isEnabled" control={control}>
          <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'admin.fields.video.is_enabled' })} />
          <FieldInput type="switch" name="isEnabled" control={control} id="isEnabled" />
        </FormControl>
      </Flex>

      <Flex direction="row" spacing={4}>
        <Button
          type="button"
          loading={isLoading}
          disabled={!isValid}
          onClick={e => handleSubmit(data => onSubmit(data as VideoFormValues))(e)}
        >
          {intl.formatMessage({ id: isNewVideo ? 'btn_create' : 'global.save' })}
        </Button>
        {!isNewVideo && <DeleteVideoConfirmationModal title={getValues(`${currentLocale}-title`)} videoId={videoId} />}
        {isNewVideo && (
          <Button variant="tertiary" variantColor="hierarchy" onClick={() => (window.location.href = 'videos')}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

export default VideoForm
