// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import AccountBox from './AccountBox';
import type { State, FeatureToggles } from '../../../types';
import NotificationsForm from './NotificationsForm';
import FollowingsTab from '../Following/FollowingsTab';
import { type EditProfileTabs_viewer } from '~relay/EditProfileTabs_viewer.graphql';
import UserAvatar from '../UserAvatar';
import UserLink from '../UserLink';
import ChangePasswordForm from './ChangePasswordForm';
import PersonalData from './PersonalData';
import Profile from './Profile';
import ChangeUsername from './ChangeUsername';
import Media from '../../Ui/Medias/Media/Media';

type Props = {|
  +features: FeatureToggles,
  +loginWithOpenId: boolean,
  +viewer: EditProfileTabs_viewer,
|};

export const getHashKey = (hash: string) => {
  if (hash.indexOf('profile') !== -1) {
    return 'profile';
  }
  if (hash.indexOf('account') !== -1) {
    return 'account';
  }
  if (hash.indexOf('personal-data') !== -1) {
    return 'personal-data';
  }
  if (hash.indexOf('password') !== -1) {
    return 'password';
  }
  if (hash.indexOf('notifications') !== -1) {
    return 'notifications';
  }
  if (hash.indexOf('followings') !== -1) {
    return 'followings';
  }
  return 'account';
};

export class EditProfileTabs extends Component<Props> {
  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return getHashKey(hash);
    }
    return 'profile';
  }

  render() {
    const { viewer, features, loginWithOpenId } = this.props;

    return (
      <Tab.Container id="account-tabs" defaultActiveKey={this.getDefaultKey()}>
        <Row className="clearfix">
          <Col sm={4} md={3}>
            <Panel id="panel-account">
              <Panel.Heading className="d-flex">
                <Media className="m-auto align-items-center">
                  <Media.Left>
                    <UserAvatar user={viewer} />
                  </Media.Left>
                  <Media.Body>
                    <UserLink className="excerpt" user={viewer} />
                  </Media.Body>
                </Media>
              </Panel.Heading>
              <ListGroup>
                <Nav bsStyle="pills" stacked>
                  <NavItem eventKey="profile" href="#profile">
                    <ListGroupItem>
                      <span className="icon cap-id-8" />
                      <FormattedMessage id="user.profile.title" />
                    </ListGroupItem>
                  </NavItem>
                  {!features.login_paris && !loginWithOpenId && (
                    <NavItem eventKey="account" href="#account">
                      <ListGroupItem>
                        <span className="icon cap-setting-gear" />
                        <FormattedMessage id="user.profile.edit.account" />
                      </ListGroupItem>
                    </NavItem>
                  )}
                  <NavItem eventKey="personal-data" href="#personal-data">
                    <ListGroupItem>
                      <span className="icon cap-id-1" />
                      <FormattedMessage id="data" />
                    </ListGroupItem>
                  </NavItem>
                  {!features.login_paris && !loginWithOpenId && (
                    <NavItem eventKey="password" href="#password">
                      <ListGroupItem>
                        <span className="icon cap-key-1" />
                        <FormattedMessage id="user.profile.edit.password" />
                      </ListGroupItem>
                    </NavItem>
                  )}
                  <NavItem href="#notifications" eventKey="notifications" className="tab">
                    <ListGroupItem>
                      <span className="icon cap-bell" />
                      <FormattedMessage id="user.profile.notifications.title" />
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="followings" href="#followings" className="tab">
                    <ListGroupItem>
                      <span className="icon cap-rss-2" />
                      <FormattedMessage id="followings" />
                    </ListGroupItem>
                  </NavItem>
                </Nav>
              </ListGroup>
            </Panel>
          </Col>
          <Col xs={12} sm={8} md={9}>
            <Tab.Content animation>
              <Tab.Pane eventKey="profile">
                {features.profiles ? (
                  <Profile viewer={viewer} />
                ) : (
                  <ChangeUsername viewer={viewer} />
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="account">
                {!features.login_paris && !loginWithOpenId && <AccountBox viewer={viewer} />}
              </Tab.Pane>
              <Tab.Pane eventKey="personal-data">
                <PersonalData viewer={viewer} />
              </Tab.Pane>
              <Tab.Pane eventKey="password">
                {!features.login_paris && !loginWithOpenId && <ChangePasswordForm />}
              </Tab.Pane>
              <Tab.Pane eventKey="notifications">
                <NotificationsForm viewer={viewer} />
              </Tab.Pane>
              <Tab.Pane eventKey="followings">
                <FollowingsTab viewer={viewer} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  loginWithOpenId:
    state.default.ssoList.length > 0 &&
    state.default.ssoList.filter(sso => sso.ssoType === 'oauth2').length > 0,
});

const container = connect(mapStateToProps)(EditProfileTabs);

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment EditProfileTabs_viewer on User {
      ...UserAvatar_user
      ...FollowingsTab_viewer
      ...NotificationsForm_viewer
      ...PersonalData_viewer
      ...Profile_viewer
      ...ChangeUsername_viewer
      ...AccountBox_viewer
      ...UserLink_user
    }
  `,
});
