// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import ProfileNeutralIcon from '../Icons/ProfileNeutralIcon';
import PowerButtonIcon from '../Icons/PowerButtonIcon';
import type { UserBlockProfile_query } from '~relay/UserBlockProfile_query.graphql';
import IconLinkBar from '../Icons/IconLinkBar';
import colors from '../../../utils/colors';
import DefaultAvatar from '../../User/DefaultAvatar';

export type Props = {|
  +query: UserBlockProfile_query,
|};

export const ProfileInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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
  color: #333333;
  min-width: 220px;
  img {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    object-fit: cover;
  }
`;

export const UserBlockProfile = ({ query }: Props) => (
  <>
    <ProfileInfo>
      {query.user.media ? (
        <img src={query.user.media?.url} alt="admin profile" />
      ) : (
        <DefaultAvatar size={60} className="img-circle avatar" />
      )}
      <div>{query.user.displayName}</div>
    </ProfileInfo>
    <IconLinkBar color={colors.darkText} message="navbar.profile" url={query.user.adminUrl}>
      <ProfileNeutralIcon color={colors.darkText} />
    </IconLinkBar>
    <IconLinkBar
      color={colors.dangerColor}
      message="global-disconnect"
      url={`${window.location.protocol}//${window.location.host}/logout`}>
      <PowerButtonIcon color={colors.dangerColor} />
    </IconLinkBar>
  </>
);

export default createFragmentContainer(UserBlockProfile, {
  query: graphql`
    fragment UserBlockProfile_query on Query {
      user: viewer {
        adminUrl
        displayName
        media {
          url
        }
      }
    }
  `,
});
