// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import GroupAdminUsers from './GroupAdminUsers';
import type { GroupAdminPageTabs_group } from './__generated__/GroupAdminPageTabs_group.graphql';

type DefaultProps = void;
type Props = { group: GroupAdminPageTabs_group, intl: Object };
type State = void;

export class GroupAdminPageTabs extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const { intl, group } = this.props;
    return (
      <div>
        <Tabs>
          <Tab eventKey={1} title={intl.formatMessage({ id: 'group.admin.users' })}>
            <GroupAdminUsers group={group} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const container = injectIntl(GroupAdminPageTabs);

export default createFragmentContainer(
  container,
  graphql`
    fragment GroupAdminPageTabs_group on Group {
      ...GroupAdminUsers_group
    }
  `,
);
