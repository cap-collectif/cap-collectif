import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
// @ts-ignore
import type { PreviewMail_emailingCampaign } from '~relay/PreviewMail_emailingCampaign.graphql'
import stripHtml from '@shared/utils/stripHTML'

type Props = {
  reference: React.Ref<'div'>
  emailingCampaign: PreviewMail_emailingCampaign
}
export const PreviewMail = ({ emailingCampaign, reference }: Props) =>
  emailingCampaign.content && stripHtml(emailingCampaign.content) ? (
    // @ts-ignore
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
