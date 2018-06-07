// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import UserAdminAccount from "./UserAdminAccount";
import UserAdminProfile from "./UserAdminProfile";
import UserAdminPageTabs_user from './__generated__/UserAdminPageTabs_user.graphql';
import UserAdminPersonalData from "./UserAdminPersonalData";

type DefaultProps = void;
type Props = { user: UserAdminPageTabs_user, intl: Object };
type State = void;

export class UserAdminPageTabs extends Component<Props, State> {
  static defaultProps: DefaultProps;
  render() {
    const { intl, user } = this.props;
    return (
      <div>
        <p>
          <strong>Permalien : </strong> <a href={user.show_url}>{user.show_url}</a> |{' '}
        </p>
        <Tabs defaultActiveKey={1} id="user-admin-page-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'user.profile.edit.account' })}>
            <UserAdminAccount user={user} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'user.profile.show.jumbotron' })}>
            <UserAdminProfile user={user} />
          </Tab>
          <Tab eventKey={3} title={intl.formatMessage({ id: 'user.profile.edit.data' })}>
            <UserAdminPersonalData user={user} />
          </Tab>
          {/*<Tab eventKey={4} title={intl.formatMessage({ id: 'user.admin.password' })}>*/}
            {/*<UserAdminPassword user={user} />*/}
          {/*</Tab>*/}
          {/*<Tab*/}
            {/*eventKey={5}*/}
            {/*title={*/}
              {/*<div>*/}
                {/*<FormattedMessage id="user.tabs.group" />*/}
              {/*</div>*/}
            {/*}>*/}
            {/*<UserAdminGroup user={user} />*/}
          {/*</Tab>*/}
        </Tabs>
      </div>
    );
  }
}

const container = injectIntl(UserAdminPageTabs);

export default createFragmentContainer(
  container,
  graphql`
    fragment UserAdminPageTabs_user on User {
      username
      show_url
      ...UserAdminAccount_user
      ...UserAdminProfile_user
      ...UserAdminPersonalData_user
    }
  `,
);
