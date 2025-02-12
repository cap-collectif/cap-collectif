import * as React from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import classNames from 'classnames'
import moment from 'moment'
import Linkify from 'react-linkify'
import { Label, ListGroupItem } from 'react-bootstrap'

import styled from 'styled-components'
import Media from '../Ui/Medias/Media/Media'
import UserAvatar from '~/components/User/UserAvatar'
import UserLink from '../User/UserLink'
import ArgumentButtons from './ArgumentButtons'
import UnpublishedLabel from '../Publishable/UnpublishedLabel'
import type { ArgumentItem_argument } from '~relay/ArgumentItem_argument.graphql'
import TrashedMessage from '../Trashed/TrashedMessage'
import { translateContent } from '@shared/utils/contentTranslator'
import htmlDecode from '~/components/Utils/htmlDecode'
type Props = {
  readonly argument: ArgumentItem_argument
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
export class ArgumentItem extends React.Component<Props> {
  static defaultProps = {
    isProfile: false,
  }
  renderDate = () => {
    const { argument } = this.props
    // @ts-ignore
    if (typeof Modernizr === 'undefined' || !Modernizr.intl) {
      return null
    }

    return (
      <div className="excerpt small">
        <FormattedDate // @ts-ignore
          value={moment(argument.publishedAt ? argument.publishedAt : argument.createdAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </div>
    )
  }

  render() {
    const { argument, isProfile } = this.props
    const classes = classNames({
      opinion: true,
      'bg-vip': argument.author && argument.author.vip,
    })
    const labelStyle = argument.type === 'FOR' ? 'success' : 'danger'
    const labelValueTranslateId = argument.type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'
    const relatedTitle = argument.related ? translateContent(argument.related.title) : ''
    return (
      <ListGroupItem className={classes} id={`arg-${argument.id}`}>
        {isProfile && (
          <p>
            <FormattedMessage
              id={`admin.fields.${argument.related ? argument.related.__typename.toLowerCase() : 'proposition'}.link`}
            />
            {' : '}
            <a href={argument.related ? argument.related.url : ''}>{relatedTitle}</a>
          </p>
        )}
        <Media overflow>
          <Media.Left>
            {/** @ts-ignore */}
            <UserAvatar user={argument.author} className="excerpt_dark" />
          </Media.Left>
          <MediaBody className="opinion__body">
            <div
              className="opinion__data"
              style={{
                overflow: 'visible',
              }}
            >
              <div className="opinion__user">
                {/** @ts-ignore */}
                <UserLink user={argument.author} />
                {this.renderDate()}
                <UnpublishedLabel publishable={argument} />
                {isProfile && (
                  <React.Fragment>
                    {' '}
                    <Label bsStyle={labelStyle} bsSize="xs">
                      <FormattedMessage id={labelValueTranslateId} />
                    </Label>
                  </React.Fragment>
                )}
              </div>
            </div>
          </MediaBody>
          <div className="opinion__body">
            <TrashedMessage contribution={argument}>
              <p className="opinion__text">
                <Linkify
                  properties={{
                    className: 'external-link',
                  }}
                >
                  {translateContent(htmlDecode(argument.body))}
                </Linkify>
              </p>
            </TrashedMessage>
            <ArgumentButtons argument={argument} />
          </div>
        </Media>
      </ListGroupItem>
    )
  }
}
export default createFragmentContainer(ArgumentItem, {
  argument: graphql`
    fragment ArgumentItem_argument on Argument
    @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      ...TrashedMessage_contribution
      ...UnpublishedLabel_publishable
      id
      createdAt
      publishedAt
      ...ArgumentButtons_argument @arguments(isAuthenticated: $isAuthenticated)
      author {
        ...UserAvatar_user
        ...UserLink_user
        vip
      }
      body
      type
      related {
        __typename
        id
        url
        ... on Opinion {
          title
        }
        ... on Version {
          title
        }
      }
    }
  `,
})
