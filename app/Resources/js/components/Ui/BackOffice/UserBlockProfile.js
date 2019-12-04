// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import ProfileNeutralIcon from '../Icons/ProfileNeutralIcon';
import PowerButtonIcon from '../Icons/PowerButtonIcon';
import type { GlobalState } from '../../../types';

export type Props = {|
  userImage: ?string,
  profileUrl: string,
  userName: string,
|};

type IconLinkBarProps = {|
  color: string,
  message: string,
  url: string,
  children: React.Node,
|};

const IconLinkBarContainer: StyledComponent<{ color: string }, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
  border-top: 1px solid #e3e3e3;
  color: ${props => props.color};
  padding-left: 15px;
  a {
    font-family: OpenSans, helvetica, arial, sans-serif;
    font-size: 16px;
    color: ${props => props.color};
    margin-left: 15px;
  }
`;

const ProfileInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 115px;
  padding-top: 15px;
  line-height: 25px;
  font-size: 16px;
  font-family: OpenSans, helvetica, arial, sans-serif;
  color: #333333;
  img {
    width: 60px;
    height: 60px;
    border-radius: 30px;
  }
`;

const IconLinkBar = ({ color, message, url, children }: IconLinkBarProps) => (
  <IconLinkBarContainer color={color}>
    {children}
    <a href={url}>
      <FormattedMessage id={message} />
    </a>
  </IconLinkBarContainer>
);

const UserBlockProfile = ({ userImage, profileUrl, userName }: Props) => (
  <>
    <ProfileInfo>
      <img src={userImage} alt="admin profile" />
      <div>{userName}</div>
    </ProfileInfo>
    <IconLinkBar color="#333333" message="navbar.profile" url={profileUrl}>
      <ProfileNeutralIcon color="#333333" />
    </IconLinkBar>
    <IconLinkBar
      color="#dc3545"
      message="global-disconnect"
      url={`${window.location.protocol}//${window.location.host}/logout`}>
      <PowerButtonIcon color="#dc3545" />
    </IconLinkBar>
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  userName: state.user.user ? state.user.user.username : '',
});

export default connect(mapStateToProps)(UserBlockProfile);
