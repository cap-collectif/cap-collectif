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
    // eslint-disable-next-line
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
            query GroupAdminPageQuery($id: ID!, $count: Int!, $cursor: String) {
              group: node(id: $id) {
                ...GroupAdminPageTabs_group @arguments(count: $count, cursor: $cursor)
                ...GroupAdminParameters_group
              }
            }
          `}
          variables={{
            id: groupId,
            cursor: null,
            count: 100,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default GroupAdminPage;
