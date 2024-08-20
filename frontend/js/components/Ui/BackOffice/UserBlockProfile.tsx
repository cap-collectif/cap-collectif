import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'

import styled from 'styled-components'
import ProfileNeutralIcon from '@shared/ui/LegacyIcons/ProfileNeutralIcon'
import PowerButtonIcon from '@shared/ui/LegacyIcons/PowerButtonIcon'
import type { UserBlockProfile_query } from '~relay/UserBlockProfile_query.graphql'
import IconLinkBar from '@shared/ui/LegacyIcons/IconLinkBar'
import colors from '../../../utils/colors'
import DefaultAvatar from '../../User/DefaultAvatar'
import { MenuListItem } from '~ds/Menu'
import Image from '~ui/Primitives/Image'
export type Props = {
  readonly query: UserBlockProfile_query
}
export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 115px;
  padding: 15px;
  line-height: 25px;
  font-size: 16px;
  word-break: break-word;
  font-family: OpenSans, helvetica, arial, sans-serif;
  color: #333;
  min-width: 220px;

  img {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    object-fit: cover;
  }
`
export const UserBlockProfile = ({ query }: Props) => (
  <>
    <MenuListItem
      as="div"
      style={{
        padding: 0,
      }}
    >
      <ProfileInfo>
        {!query.user.media ? (
          <Image src={query.user.media?.url} alt="admin profile" />
        ) : (
          <DefaultAvatar size={60} className="img-circle avatar" />
        )}
        <div>{query.user.displayName}</div>
      </ProfileInfo>
    </MenuListItem>
    {query.user.isAdmin && (
      <MenuListItem
        as="div"
        style={{
          padding: 0,
        }}
      >
        <IconLinkBar noBorderTop color={colors.darkText} message="navbar.profile" url={query.user.adminUrl}>
          <ProfileNeutralIcon color={colors.darkText} />
        </IconLinkBar>
      </MenuListItem>
    )}

    <MenuListItem
      as="div"
      style={{
        padding: 0,
      }}
    >
      <IconLinkBar
        noBorderTop
        color={colors.dangerColor}
        message="global-disconnect"
        url={`${window.location.protocol}//${window.location.host}/logout`}
      >
        <PowerButtonIcon color={colors.dangerColor} />
      </IconLinkBar>
    </MenuListItem>
  </>
)
export default createFragmentContainer(UserBlockProfile, {
  query: graphql`
    fragment UserBlockProfile_query on Query {
      user: viewer {
        isAdmin
        adminUrl
        displayName
        media {
          url
        }
      }
    }
  `,
})
