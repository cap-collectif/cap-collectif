import * as React from 'react'
import { connect } from 'react-redux'

import styled from 'styled-components'
import { graphql, createFragmentContainer } from 'react-relay'
import UserAvatarList from '../Ui/List/UserAvatarList'
import UserAvatar from '~/components/User/UserAvatar'
import type { State, FeatureToggles } from '../../types'
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql'
import Tooltip from '~ds/Tooltip/Tooltip'
import { AvatarProps } from '@cap-collectif/ui'
type Props = {
  readonly users: UserAvatarList_users
  readonly max: number
  readonly avatarSize?: AvatarProps['size']
  readonly onClick?: () => void
  readonly features: FeatureToggles
}
const Button = styled.button`
  border: none;
  background: transparent;
  padding-left: 0;
`
export const UserAvatarListContainer = (props: Props) => {
  const { users, max, onClick, features, avatarSize } = props
  const shouldRedirectProfile = users.length === 1 && features.profiles
  return (
    <Button type="button" onClick={onClick}>
      <UserAvatarList avatarSize={avatarSize} max={max}>
        {users &&
          users.map((user, index) =>
            shouldRedirectProfile ? (
              <UserAvatar
                key={index}
                {...(avatarSize
                  ? {
                      size: avatarSize,
                    }
                  : {})}
                user={user}
              />
            ) : (
              <Tooltip
                placement="top"
                label={user.username}
                id={`tooltip-${user.id}`}
                className="text-left"
                style={{
                  wordBreak: 'break-word',
                }}
              >
                <div>
                  <UserAvatar
                    {...(avatarSize
                      ? {
                          size: avatarSize,
                        }
                      : {})}
                    user={user}
                    displayUrl={false}
                  />
                </div>
              </Tooltip>
            ),
          )}
      </UserAvatarList>
    </Button>
  )
}
UserAvatarListContainer.defaultProps = {
  max: 5,
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
})

export default createFragmentContainer(connect(mapStateToProps)(UserAvatarListContainer), {
  users: graphql`
    fragment UserAvatarList_users on User @relay(plural: true) {
      id
      username
      ...UserAvatar_user
    }
  `,
})
