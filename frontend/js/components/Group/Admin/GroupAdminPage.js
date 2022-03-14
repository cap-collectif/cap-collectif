// @flow
import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import GroupAdminPageTabs from './GroupAdminPageTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

type DefaultProps = void;
export type Props = {| groupId: string |};
type State = void;

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.group !== null) {
      return <GroupAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class GroupAdminPage extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const { groupId } = this.props;
    return (
      <div className="row">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query GroupAdminPageQuery(
              $id: ID!
              $countUsers: Int!
              $cursorUsers: String
              $countInvitations: Int!
              $cursorInvitations: String
            ) {
              group: node(id: $id) {
                ...GroupAdminPageTabs_group
                  @arguments(
                    countUsers: $countUsers
                    cursorUsers: $cursorUsers
                    countInvitations: $countInvitations
                    cursorInvitations: $cursorInvitations
                  )
                ...GroupAdminParameters_group
              }
            }
          `}
          variables={{
            id: Buffer.from(`Group:${groupId}`).toString('base64'),
            cursorUsers: null,
            countUsers: 100,
            cursorInvitations: null,
            countInvitations: 50,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default GroupAdminPage;
