import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import UserAvatarDeprecated from '../User/UserAvatarDeprecated'
import OpinionInfos from './OpinionInfos'
import OpinionPreviewTitle from './OpinionPreviewTitle'
import OpinionPreviewCounters from './OpinionPreviewCounters'
import type { OpinionPreview_opinion } from '~relay/OpinionPreview_opinion.graphql'
import TrashedMessage from '../Trashed/TrashedMessage'
import Media from '../Ui/Medias/Media/Media'
import config from '~/config'
type Props = {
  readonly showUpdatedDate: boolean
  readonly opinion: OpinionPreview_opinion
  readonly rankingThreshold?: number | null | undefined
  readonly isProfile: boolean
}
const MediaBody: StyledComponent<any, {}, typeof Media.Body> = styled(Media.Body)`
  overflow: visible;
  .cap-popover {
    button {
      background-color: transparent !important;
      border: none !important;
    }
  }
`

class OpinionPreview extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
    isProfile: false,
  }

  render() {
    const { opinion, rankingThreshold, showUpdatedDate, isProfile } = this.props
    return (
      <div>
        {opinion.__typename === 'Version' && isProfile && (
          <p>
            <FormattedMessage id="admin.fields.opinion.link" />
            {' : '}
            <a href={opinion.related ? opinion.related.url : ''}>{opinion.related ? opinion.related.title : ''}</a>
          </p>
        )}
        <Media.Left>
          {/* @ts-expect-error Will be a fragment soon */}
          <UserAvatarDeprecated user={opinion.author} />
        </Media.Left>

        <MediaBody className="opinion__body">
          <OpinionInfos rankingThreshold={rankingThreshold} opinion={opinion} showUpdatedDate={showUpdatedDate} />

          {!config.isMobile && (
            <>
              <TrashedMessage contribution={opinion}>
                <OpinionPreviewTitle opinion={opinion} showTypeLabel={false} />
              </TrashedMessage>
              <OpinionPreviewCounters opinion={opinion} />
            </>
          )}
        </MediaBody>

        {config.isMobile && (
          <div className="opinion__body mt-10">
            <TrashedMessage contribution={opinion}>
              <OpinionPreviewTitle opinion={opinion} showTypeLabel={false} />
            </TrashedMessage>
            <OpinionPreviewCounters opinion={opinion} />
          </div>
        )}
      </div>
    )
  }
}

export default createFragmentContainer(OpinionPreview, {
  opinion: graphql`
    fragment OpinionPreview_opinion on OpinionOrVersion {
      __typename
      ...TrashedMessage_contribution
      ...OpinionInfos_opinion
      ...OpinionPreviewTitle_opinion
      ...OpinionPreviewCounters_opinion
      ... on Opinion {
        author {
          displayName
          media {
            url
          }
        }
      }
      ... on Version {
        author {
          displayName
          media {
            url
          }
        }
        related {
          ... on Opinion {
            title
            url
          }
        }
      }
    }
  `,
})
