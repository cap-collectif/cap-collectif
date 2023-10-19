import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import type { PreviewMail_emailingCampaign } from '~relay/PreviewMail_emailingCampaign.graphql'
import stripHtml from '~/utils/stripHtml'

type Props = {
  reference: React.Ref<'div'>
  emailingCampaign: PreviewMail_emailingCampaign
}
export const PreviewMail = ({ emailingCampaign, reference }: Props) =>
  emailingCampaign.content && stripHtml(emailingCampaign.content) ? (
    <div className="preview-mail" ref={reference}>
      <p
        dangerouslySetInnerHTML={{
          __html: emailingCampaign.preview,
        }}
      />
    </div>
  ) : null
export default createFragmentContainer(PreviewMail, {
  emailingCampaign: graphql`
    fragment PreviewMail_emailingCampaign on EmailingCampaign {
      preview
      content
    }
  `,
})
