// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import GroupAdminUsers from './GroupAdminUsers';
import GroupAdminParameters from './GroupAdminParameters';
import type { GroupAdminPageTabs_group } from '~relay/GroupAdminPageTabs_group.graphql';

type Props = { group: GroupAdminPageTabs_group, intl: IntlShape };

export class GroupAdminPageTabs extends Component<Props> {
  render() {
    const { intl, group } = this.props;
    return (
      <div className="col-xs-12">
        <Tabs id="group-admin-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'group.admin.users' })}>
            <GroupAdminUsers group={group} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'group.admin.parameters' })}>
            <GroupAdminParameters group={group} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const container = injectIntl(GroupAdminPageTabs);

export default createFragmentContainer(container, {
  group: graphql`
    fragment GroupAdminPageTabs_group on Group
      @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
      ...GroupAdminUsers_group @arguments(cursor: $cursor, count: $count)
      ...GroupAdminParameters_group
    }
  `,
});
