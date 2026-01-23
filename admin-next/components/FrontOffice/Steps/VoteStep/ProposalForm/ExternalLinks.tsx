import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

interface Props {
  usingWebPage: boolean
  usingFacebook: boolean
  usingTwitter: boolean
  usingInstagram: boolean
  usingYoutube: boolean
  usingLinkedIn: boolean
}

const ExternalLinks: React.FC<Props> = props => {
  const intl = useIntl()

  const methods = useFormContext()
  const { control } = methods

  const { usingWebPage, usingFacebook, usingTwitter, usingInstagram, usingYoutube, usingLinkedIn } = props

  const hasAnyExternalLink =
    usingWebPage || usingFacebook || usingTwitter || usingInstagram || usingYoutube || usingLinkedIn

  if (!hasAnyExternalLink) return null

  return (
    <>
      <Text fontWeight="600" fontSize="md" mt={4}>
        {intl.formatMessage({ id: 'your-external-links' })}
      </Text>

      {usingWebPage && (
        <FormControl name="webPageUrl" control={control}>
          <FormLabel htmlFor="webPageUrl" label={intl.formatMessage({ id: 'form.label_website' })} />
          <FieldInput
            type="text"
            control={control}
            name="webPageUrl"
            id="webPageUrl"
            placeholder={intl.formatMessage({ id: 'your-url' })}
          />
        </FormControl>
      )}

      {usingTwitter && (
        <FormControl name="twitterUrl" control={control}>
          <FormLabel htmlFor="twitterUrl" label={intl.formatMessage({ id: 'share.twitter' })} />
          <FieldInput
            type="text"
            control={control}
            name="twitterUrl"
            id="twitterUrl"
            placeholder="https://x.com/pseudo"
          />
        </FormControl>
      )}

      {usingFacebook && (
        <FormControl name="facebookUrl" control={control}>
          <FormLabel htmlFor="facebookUrl" label={intl.formatMessage({ id: 'share.facebook' })} />
          <FieldInput
            type="text"
            control={control}
            name="facebookUrl"
            id="facebookUrl"
            placeholder="https://facebook.com/pseudo"
          />
        </FormControl>
      )}

      {usingInstagram && (
        <FormControl name="instagramUrl" control={control}>
          <FormLabel htmlFor="instagramUrl" label={intl.formatMessage({ id: 'instagram' })} />
          <FieldInput
            type="text"
            control={control}
            name="instagramUrl"
            id="instagramUrl"
            placeholder="https://instagram.com/pseudo"
          />
        </FormControl>
      )}

      {usingLinkedIn && (
        <FormControl name="linkedInUrl" control={control}>
          <FormLabel htmlFor="linkedInUrl" label={intl.formatMessage({ id: 'share.linkedin' })} />
          <FieldInput
            type="text"
            control={control}
            name="linkedInUrl"
            id="linkedInUrl"
            placeholder="https://linkedin.com/in/pseudo"
          />
        </FormControl>
      )}

      {usingYoutube && (
        <FormControl name="youtubeUrl" control={control}>
          <FormLabel htmlFor="youtubeUrl" label={intl.formatMessage({ id: 'youtube' })} />
          <FieldInput
            type="text"
            control={control}
            name="youtubeUrl"
            id="youtubeUrl"
            placeholder="https://youtube.com/channel/pseudo"
          />
        </FormControl>
      )}
    </>
  )
}

export default ExternalLinks
