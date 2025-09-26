import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import UserAdminAccount from './UserAdminAccount'
import UserAdminProfile from './UserAdminProfile'
import type { UserAdminPageTabs_user } from '~relay/UserAdminPageTabs_user.graphql'
import '~relay/UserAdminPageTabs_user.graphql'
import type { UserAdminPageTabs_viewer } from '~relay/UserAdminPageTabs_viewer.graphql'
import '~relay/UserAdminPageTabs_viewer.graphql'
import UserAdminPersonalData from './UserAdminPersonalData'
import UserAdminPassword from './UserAdminPassword'
type Props = {
  readonly user: UserAdminPageTabs_user
  readonly viewer: UserAdminPageTabs_viewer
  readonly intl: IntlShape
}
export class UserAdminPageTabs extends Component<Props> {
  render() {
    const { intl, user, viewer } = this.props
    return (
      <div>
        <p>
          <strong>
            <FormattedMessage id="permalink" /> :{' '}
          </strong>{' '}
          <a href={user.url}>{user.url}</a>{' '}
        </p>
        <Tabs defaultActiveKey={1} id="UserAdminPageTabs">
          <Tab
            eventKey={1}
            title={intl.formatMessage({
              id: 'user.profile.edit.account',
            })}
          >
            <UserAdminAccount user={user} viewer={viewer} />
          </Tab>
          <Tab
            eventKey={2}
            title={intl.formatMessage({
              id: 'user.profile.title',
            })}
          >
            <UserAdminProfile user={user} viewer={viewer} />
          </Tab>
          <Tab
            eventKey={3}
            title={intl.formatMessage({
              id: 'global.data',
            })}
          >
            <UserAdminPersonalData user={user} viewer={viewer} intl={intl} />
          </Tab>
          <Tab
            eventKey={4}
            title={intl.formatMessage({
              id: 'global.password',
            })}
          >
            <UserAdminPassword user={user} />
          </Tab>
        </Tabs>
      </div>
    )
  }
}
const container = injectIntl(UserAdminPageTabs)
export default createFragmentContainer(container, {
  user: graphql`
    fragment UserAdminPageTabs_user on User {
      url
      userType {
        id
        name
      }
      ...UserAdminAccount_user
      ...UserAdminProfile_user
      ...UserAdminPersonalData_user
      ...UserAdminPassword_user
    }
  `,
  viewer: graphql`
    fragment UserAdminPageTabs_viewer on User {
      ...UserAdminAccount_viewer
      ...UserAdminPersonalData_viewer
      ...UserAdminProfile_viewer
    }
  `,
})
