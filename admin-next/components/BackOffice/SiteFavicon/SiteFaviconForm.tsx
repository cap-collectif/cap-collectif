import { FieldInput, FormControl, UploaderValue } from '@cap-collectif/form'
import { Box, Button, Flex, FormGuideline, FormLabel, UPLOADER_SIZE } from '@cap-collectif/ui'
import ChangeSiteFaviconMutation from '@mutations/ChangeSiteFaviconMutation'
import RemoveSiteFaviconMutation from '@mutations/RemoveSiteFaviconMutation'
import type { SiteFaviconFormQuery } from '@relay/SiteFaviconFormQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query SiteFaviconFormQuery {
    siteFavicon {
      id
      media {
        id
        name
        size
        type: contentType
        url(format: "reference")
      }
    }
  }
`

type FormValues = {
  media: UploaderValue | null
}

// Same constraints as the legacy React form: ALLOWED_IMAGE_MIMETYPES and a 25 MB limit.
const FAVICON_FORMAT = '.png,.gif,.jpg,.jpeg,.webp'
const FAVICON_MAX_SIZE = 26214400

const SiteFaviconForm: React.FC = () => {
  const intl = useIntl()
  const formId = React.useId()
  const { siteFavicon } = useLazyLoadQuery<SiteFaviconFormQuery>(QUERY, {})
  const { control, formState, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { media: siteFavicon.media },
  })

  const onSubmit = async (values: FormValues) => {
    const media = Array.isArray(values.media) ? values.media[0] : values.media

    try {
      if (!media) {
        await RemoveSiteFaviconMutation.commit({ input: {} })
      } else if (!media.id) {
        // The upload API rejected the file: never treat it as a removal
        mutationErrorToast(intl)
        return
      } else {
        await ChangeSiteFaviconMutation.commit({ input: { mediaId: media.id } })
      }
      reset({ media: media ?? null })
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="8px">
      <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
        <FormControl name="media" control={control}>
          <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'global.image' })} />
          <FormGuideline>{intl.formatMessage({ id: 'favicon-parameters' })}</FormGuideline>
          {/* Same max-width as the MD uploader, so that error messages are aligned with it */}
          <Box width="100%" maxWidth={pxToRem(488)} sx={{ '& .cap-info-message': { mt: 2 } }}>
            <FieldInput
              id="media"
              type="uploader"
              name="media"
              control={control}
              format={FAVICON_FORMAT}
              maxSize={FAVICON_MAX_SIZE}
              size={UPLOADER_SIZE.MD}
              uploadURI={UPLOAD_PATH}
              showThumbnail
            />
          </Box>
        </FormControl>
        <Flex mt={6}>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            variantColor="primary"
            variantSize="medium"
            isLoading={formState.isSubmitting}
            disabled={!formState.isDirty}
          >
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default SiteFaviconForm
