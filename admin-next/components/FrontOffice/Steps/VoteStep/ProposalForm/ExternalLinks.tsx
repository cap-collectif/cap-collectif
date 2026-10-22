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
        <FormControl errorId="proposal_wep_page-error" name="webPageUrl" control={control}>
          <FormLabel
            id="label-proposal_wep_page"
            htmlFor="proposal_wep_page"
            label={intl.formatMessage({ id: 'form.label_website' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="webPageUrl"
            id="proposal_wep_page"
            placeholder={intl.formatMessage({ id: 'your-url' })}
          />
        </FormControl>
      )}

      {usingTwitter && (
        <FormControl errorId="proposal_twitter-error" name="twitterUrl" control={control}>
          <FormLabel
            id="label-proposal_twitter"
            htmlFor="proposal_twitter"
            label={intl.formatMessage({ id: 'share.twitter' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="twitterUrl"
            id="proposal_twitter"
            placeholder="https://x.com/pseudo"
          />
        </FormControl>
      )}

      {usingFacebook && (
        <FormControl errorId="proposal_facebook-error" name="facebookUrl" control={control}>
          <FormLabel
            id="label-proposal_facebook"
            htmlFor="proposal_facebook"
            label={intl.formatMessage({ id: 'share.facebook' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="facebookUrl"
            id="proposal_facebook"
            placeholder="https://facebook.com/pseudo"
          />
        </FormControl>
      )}

      {usingInstagram && (
        <FormControl errorId="proposal_instagram-error" name="instagramUrl" control={control}>
          <FormLabel
            id="label-proposal_instagram"
            htmlFor="proposal_instagram"
            label={intl.formatMessage({ id: 'instagram' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="instagramUrl"
            id="proposal_instagram"
            placeholder="https://instagram.com/pseudo"
          />
        </FormControl>
      )}

      {usingLinkedIn && (
        <FormControl errorId="proposal_linkedin-error" name="linkedInUrl" control={control}>
          <FormLabel
            id="label-proposal_linkedin"
            htmlFor="proposal_linkedin"
            label={intl.formatMessage({ id: 'share.linkedin' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="linkedInUrl"
            id="proposal_linkedin"
            placeholder="https://linkedin.com/in/pseudo"
          />
        </FormControl>
      )}

      {usingYoutube && (
        <FormControl errorId="proposal_youtube-error" name="youtubeUrl" control={control}>
          <FormLabel
            id="label-proposal_youtube"
            htmlFor="proposal_youtube"
            label={intl.formatMessage({ id: 'youtube' })}
          />
          <FieldInput
            type="text"
            control={control}
            name="youtubeUrl"
            id="proposal_youtube"
            placeholder="https://youtube.com/channel/pseudo"
          />
        </FormControl>
      )}
    </>
  )
}

export default ExternalLinks
