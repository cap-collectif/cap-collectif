import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import GroupAdminUsers from './GroupAdminUsers'
import GroupAdminParameters from './GroupAdminParameters'
import type { GroupAdminPageTabs_group } from '~relay/GroupAdminPageTabs_group.graphql'

type Props = {
  group: GroupAdminPageTabs_group
  intl: IntlShape
}
export class GroupAdminPageTabs extends Component<Props> {
  render() {
    const { intl, group } = this.props
    return (
      <div className="col-xs-12">
        <Tabs id="group-admin-tabs">
          <Tab
            eventKey={1}
            title={intl.formatMessage({
              id: 'admin.fields.group.number_users',
            })}
          >
            <GroupAdminUsers group={group} pendingInvitationFragmentRef={group} />
          </Tab>
          <Tab
            eventKey={2}
            title={intl.formatMessage({
              id: 'global.params',
            })}
          >
            <GroupAdminParameters group={group} />
          </Tab>
        </Tabs>
      </div>
    )
  }
}
const container = injectIntl(GroupAdminPageTabs)
export default createFragmentContainer(container, {
  group: graphql`
    fragment GroupAdminPageTabs_group on Group
    @argumentDefinitions(
      countInvitations: { type: "Int!" }
      cursorInvitations: { type: "String" }
      countUsers: { type: "Int!" }
      cursorUsers: { type: "String" }
    ) {
      ...GroupAdminUsers_group @arguments(cursorUsers: $cursorUsers, countUsers: $countUsers)
      ...GroupAdminPendingInvitationsList_group
        @arguments(countInvitations: $countInvitations, cursorInvitations: $cursorInvitations)
      ...GroupAdminParameters_group
    }
  `,
})
