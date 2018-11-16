// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import GroupAdminPageTabs from './GroupAdminPageTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

type DefaultProps = void;
type Props = { groupId: string };
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
    return (
      <div className="row">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query GroupAdminPageQuery($id: ID!) {
              group: node(id: $id) {
                ...GroupAdminPageTabs_group
                ...GroupAdminParameters_group
              }
            }
          `}
          variables={{
            id: this.props.groupId,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default GroupAdminPage;
