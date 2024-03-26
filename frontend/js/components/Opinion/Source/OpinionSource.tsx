import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { Media, ListGroupItem } from 'react-bootstrap'

import styled from 'styled-components'
import UserAvatarLegacy from '../../User/UserAvatarLegacy'
import OpinionInfos from '../OpinionInfos'
import OpinionSourceTitle from './OpinionSourceTitle'
import OpinionSourceContent from './OpinionSourceContent'
import OpinionSourceButtons from './OpinionSourceButtons'
import type { OpinionSource_source } from '~relay/OpinionSource_source.graphql'
import type { OpinionSource_sourceable } from '~relay/OpinionSource_sourceable.graphql'
import TrashedMessage from '../../Trashed/TrashedMessage'
type Props = {
  readonly source: OpinionSource_source
  readonly sourceable: OpinionSource_sourceable
  readonly isProfile: boolean
}
const MediaBody = styled(Media.Body)`
  overflow: visible;
  .cap-popover {
    button {
      background-color: transparent !important;
      border: none !important;
    }
  }
`
export class OpinionSource extends React.Component<Props> {
  static defaultProps = {
    isProfile: false,
  }

  render() {
    const { source, sourceable, isProfile } = this.props
    return (
      <ListGroupItem
        className={`list-group-item__opinion opinion ${source.author && source.author.vip ? ' bg-vip' : ''}`}
        id={`source-${source.id}`}
      >
        <Media>
          {isProfile && (
            <p>
              <FormattedMessage id="admin.fields.opinion.link" />
              {' : '}
              <a href={sourceable && sourceable.url ? sourceable.url : ''}>
                {sourceable && sourceable.title ? sourceable.title : ''}
              </a>
            </p>
          )}
          <Media.Left>
            <UserAvatarLegacy user={source.author} />
          </Media.Left>
          <MediaBody className="opinion__body">
            <OpinionInfos rankingThreshold={null} opinion={source} />
            <TrashedMessage contribution={source}>
              <OpinionSourceTitle source={source} />
              <OpinionSourceContent source={source} />
            </TrashedMessage>
            <div className="small">
              <OpinionSourceButtons sourceable={sourceable} source={source} />
            </div>
          </MediaBody>
        </Media>
      </ListGroupItem>
    )
  }
}
export default createFragmentContainer(OpinionSource, {
  source: graphql`
    fragment OpinionSource_source on Source
    @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      ...OpinionInfos_opinion
      ...OpinionSourceTitle_source
      ...OpinionSourceContent_source
      ...OpinionSourceButtons_source @arguments(isAuthenticated: $isAuthenticated)
      ...TrashedMessage_contribution
      author {
        id
        displayName
        vip
        url
        media {
          url
        }
      }
    }
  `,
  sourceable: graphql`
    fragment OpinionSource_sourceable on Sourceable @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...OpinionSourceButtons_sourceable @arguments(isAuthenticated: $isAuthenticated)
      ... on Opinion {
        title
        url
        author {
          ...UserAvatarLegacy_user
        }
      }
      ... on Version {
        title
        url
        author {
          ...UserAvatarLegacy_user
        }
      }
    }
  `,
})
