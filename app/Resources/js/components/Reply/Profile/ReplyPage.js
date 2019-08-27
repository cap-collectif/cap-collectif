// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type {
  ReplyPageQueryResponse,
  ReplyPageQueryVariables,
} from '~relay/ReplyPageQuery.graphql';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import ProfileReplyList from './ProfileReplyList';
import type { State } from '../../../types';

const query = graphql`
  query ReplyPageQuery($userId: ID!, $isAuthenticated: Boolean!) {
    node(id: $userId) {
      ... on User {
        replies {
          ...ProfileReplyList_replies @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  }
`;
type ReduxProps = {|
  isAuthenticated: boolean,
|};

export type Props = {|
  userId: string,
  isProfileEnabled: boolean,
  ...ReduxProps,
|};

export const rendering = ({
  error,
  props,
}: {|
  ...ReadyState,
  props: ?ReplyPageQueryResponse,
|}) => {
  if (error) {
    return graphqlError;
  }

  if (props && props.node && props.node.replies != null) {
    return (
      // $FlowFixMe
      <ProfileReplyList replies={props.node.replies} isProfileEnabled={props.isProfileEnabled} />
    );
  }
  return <Loader />;
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});

export class ReplyPage extends React.Component<Props> {
  render() {
    const { isAuthenticated } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={
            ({
              userId: this.props.userId,
              isAuthenticated,
            }: ReplyPageQueryVariables)
          }
          render={rendering}
        />
      </div>
    );
  }
}

const container = connect(mapStateToProps)(ReplyPage);

export default container;
