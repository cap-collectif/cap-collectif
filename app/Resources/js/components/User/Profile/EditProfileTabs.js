// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import AccountBox from './AccountBox';
import type { State, FeatureToggles } from '../../../types';
import NotificationsForm from './NotificationsForm';
import FollowingsTab from '../Following/FollowingsTab';
import type EditProfileTabs_viewer from './__generated__/EditProfileTabs_viewer.graphql';
import UserAvatar from '../UserAvatar';
import UserLink from '../UserLink';
import CardUser from '../../Ui/Card/CardUser';
import ChangePasswordForm from './ChangePasswordForm';
import PersonalData from './PersonalData';
import Profile from './Profile';

type Props = {
  features: FeatureToggles,
  viewer: EditProfileTabs_viewer,
};

const getHashKey = (hash: string) => {
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
    const { viewer, features } = this.props;

    return (
      <Tab.Container id="account-tabs" defaultActiveKey={this.getDefaultKey()}>
        <Row className="clearfix">
          <Col sm={4} md={3}>
            <Panel id="panel-account">
              <Panel.Heading>
                <CardUser>
                  <UserAvatar className="pull-left" user={viewer} />
                  <UserLink user={viewer} />
                </CardUser>
              </Panel.Heading>
              <ListGroup>
                <Nav bsStyle="pills" stacked>
                  {features.profiles && (
                    <NavItem eventKey="profile" href="#profile">
                      <ListGroupItem>
                        <span className="icon cap-id-8" />
                        <FormattedMessage id="user.profile.title" />
                      </ListGroupItem>
                    </NavItem>
                  )}
                  {!features.login_paris &&
                    !features.login_openid && (
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
                  {!features.login_paris &&
                    !features.login_openid && (
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
                {features.profiles && <Profile viewer={viewer} />}
              </Tab.Pane>
              <Tab.Pane eventKey="account">
                {!features.login_paris && !features.login_openid && <AccountBox viewer={viewer} />}
              </Tab.Pane>
              <Tab.Pane eventKey="personal-data">
                <PersonalData viewer={viewer} />
              </Tab.Pane>
              <Tab.Pane eventKey="password">
                {!features.login_paris && !features.login_openid && <ChangePasswordForm />}
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
});

const container = connect(mapStateToProps)(EditProfileTabs);

export default createFragmentContainer(
  container,
  graphql`
    fragment EditProfileTabs_viewer on User {
      ...FollowingsTab_viewer
      ...NotificationsForm_viewer
      ...PersonalData_viewer
      ...Profile_viewer
      ...AccountBox_viewer
      username
      displayName
      media {
        url
      }
      show_url
    }
  `,
);
