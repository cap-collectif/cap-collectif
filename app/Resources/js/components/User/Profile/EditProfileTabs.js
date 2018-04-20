// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import AccountBox from './AccountBox';
import type { FeatureToggles } from '../../../types';
import NotificationsForm from './NotificationsForm';
import FollowingsProposals from '../Following/FollowingsProposals';
import type EditProfileTabs_viewer from './__generated__/EditProfileTabs_viewer.graphql';
import UserAvatar from '../UserAvatar';
import UserLink from '../UserLink';
import CardUser from '../../Ui/Card/CardUser';
import ChangePasswordForm from './ChangePasswordForm';
import PersonalData from './PersonalData';

type Props = {
  features: FeatureToggles,
  viewer: EditProfileTabs_viewer,
};

export class EditProfileTabs extends Component<Props> {
  getHashKey(hash: string) {
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
  }

  getDefaultKey() {
    const hash = typeof window !== 'undefined' ? window.location.hash : null;
    if (hash) {
      return this.getHashKey(hash);
    }
    return 'account';
  }

  render() {
    const { viewer, features } = this.props;

    return (
      <Tab.Container id="account-tabs" defaultActiveKey={this.getDefaultKey()}>
        <Row className="clearfix">
          <Col sm={4} md={3}>
            <Panel
              id="panel-account"
              header={
                <CardUser>
                  <UserAvatar className="pull-left" user={viewer} />
                  <UserLink user={viewer} />
                </CardUser>
              }>
              <ListGroup>
                <Nav bsStyle="pills" stacked>
                  <NavItem eventKey="account" href="#account">
                    <ListGroupItem>
                      <span className="icon cap-setting-gear" />
                      <FormattedMessage id="user.profile.edit.profile" />
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="personal-data" href="#personal-data">
                    <ListGroupItem>
                      <span className="icon cap-id-1" />
                      <FormattedMessage id="personal-data" />
                    </ListGroupItem>
                  </NavItem>
                  <NavItem eventKey="password" href="#password">
                    <ListGroupItem>
                      <span className="icon cap-key-1" />
                      <FormattedMessage id="user.profile.edit.password" />
                    </ListGroupItem>
                  </NavItem>
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
              <Tab.Pane eventKey="account">
                <AccountBox />
              </Tab.Pane>
              <Tab.Pane eventKey="personal-data">
                <PersonalData user={viewer} />
              </Tab.Pane>
              <Tab.Pane eventKey="password">
                <ChangePasswordForm />
              </Tab.Pane>
              <Tab.Pane eventKey="notifications">
                <Panel header={<FormattedMessage id="profile.account.notifications.title" />}>
                  <NotificationsForm viewer={viewer} />
                </Panel>
              </Tab.Pane>
              <Tab.Pane eventKey="followings">
                <FollowingsProposals viewer={viewer} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }
}

export default createFragmentContainer(
  EditProfileTabs,
  graphql`
    fragment EditProfileTabs_viewer on User {
      ...FollowingsProposals_viewer
      ...NotificationsForm_viewer
      ...PersonalData_user
      username
      displayName
      media {
        url
      }
      show_url
    }
  `,
);
