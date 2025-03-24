import React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import UserAvatar from '~/components/User/UserAvatar'
import UserLink from './UserLink'
import type { UserPreview_user } from '~relay/UserPreview_user.graphql'
import UserNotConfirmedLabel from './UserNotConfirmedLabel'
import Media from '../Ui/Medias/Media/Media'
import Card from '../Ui/Card/Card'

type Props = {
  user: UserPreview_user | null | undefined
}
export class UserPreview extends React.Component<Props> {
  render() {
    const { user } = this.props
    const contributionsCount = user && user.contributionsCount ? user.contributionsCount : 0
    return (
      <Card>
        <Card.Body>
          <Media>
            <Media.Left>
              <UserAvatar user={user} />
            </Media.Left>
            <Media.Body>
              {user ? (
                <React.Fragment>
                  {/* @ts-expect-error */}
                  <UserLink className="excerpt" user={user} />
                  <UserNotConfirmedLabel user={user} />
                </React.Fragment>
              ) : (
                <span className="excerpt">
                  <FormattedMessage id="global.anonymous" />
                </span>
              )}
              <p className="excerpt small">
                {user ? (
                  <>
                    <span>
                      <FormattedMessage
                        id="global.counters.contributions"
                        values={{
                          num: contributionsCount,
                        }}
                      />
                    </span>
                    {user.votes && (
                      <>
                        {' • '}
                        <FormattedMessage
                          id="global.votes"
                          values={{
                            num: user.votes?.totalCount,
                          }}
                        />
                      </>
                    )}
                  </>
                ) : null}
              </p>
            </Media.Body>
          </Media>
        </Card.Body>
      </Card>
    )
  }
}
export default createFragmentContainer(UserPreview, {
  user: graphql`
    fragment UserPreview_user on User {
      ...UserNotConfirmedLabel_user
      ...UserAvatar_user
      id
      url
      displayName
      username
      ...UserLink_user
      contributionsCount
      votes {
        totalCount
      }
      media {
        url
      }
    }
  `,
})
