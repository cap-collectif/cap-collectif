import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import UserAdminPageTabs from './UserAdminPageTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { State } from '../../../types';
import type { UserAdminPageQueryResponse, UserAdminPageQueryVariables } from '~relay/UserAdminPageQuery.graphql';

export type Props = {
  readonly userId: string
  readonly dirty: boolean
}

const onUnload = e => {
  e.returnValue = true;
};

const component = ({
                     error,
                     props,
                   }: ReactRelayReadyState & {
  props: UserAdminPageQueryResponse | null | undefined
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console

    return graphqlError;
  }

  if (props) {
    const { user, viewer } = props;

    if (user) {
      return <UserAdminPageTabs user={user} viewer={viewer} />;
    }

    return graphqlError;
  }

  return <Loader />;
};

export class UserAdminPage extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const { dirty } = this.props;

    if (prevProps.dirty === false && dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (dirty === false) {
      window.removeEventListener('beforeunload', onUnload);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  render() {
    const { userId } = this.props;
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment as any}
          query={graphql`
            query UserAdminPageQuery($id: ID!) {
              user: node(id: $id) {
                ...UserAdminPageTabs_user
                ... on User {
                  isLogged(actionType: SHOW, description: "L'utilisateur :getUsername") {
                    actionType
                    description
                  }
                }
              }
              viewer {
                ...UserAdminPageTabs_viewer
              }
            }
          `}
          variables={
            {
              id: userId,
            } as UserAdminPageQueryVariables
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
