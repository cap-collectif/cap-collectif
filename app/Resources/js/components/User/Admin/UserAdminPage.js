// @flow
import * as React from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import UserAdminPageTabs from './UserAdminPageTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { State } from '../../../types';
import type {
  UserAdminPageQueryResponse,
  UserAdminPageQueryVariables,
} from '~relay/UserAdminPageQuery.graphql';

export type Props = { userId: string, dirty: boolean };

const onUnload = e => {
  e.returnValue = true;
};

const component = ({ error, props }: { props?: ?UserAdminPageQueryResponse } & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.user !== null) {
      return <UserAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class UserAdminPage extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.dirty === false && this.props.dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (this.props.dirty === false) {
      window.removeEventListener('beforeunload', onUnload);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  render() {
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query UserAdminPageQuery($id: ID!) {
              user: node(id: $id) {
                ...UserAdminPageTabs_user
              }
            }
          `}
          variables={
            ({
              id: this.props.userId,
            }: UserAdminPageQueryVariables)
          }
          render={component}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  dirty:
    isDirty('user-admin-edit')(state) ||
    isDirty('user-admin-selections')(state) ||
    isDirty('user-admin-evaluation')(state) ||
    isDirty('user-admin-status')(state),
});

export default connect(mapStateToProps)(UserAdminPage);
