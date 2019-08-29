// @flow
import React from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  SourcePageQueryResponse,
  SourcePageQueryVariables,
} from '~relay/SourcePageQuery.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProfileSourceList from './ProfileSourceList';
import type { State } from '../../types';

const query = graphql`
  query SourcePageQuery($userId: ID!, $isAuthenticated: Boolean!) {
    node(id: $userId) {
      ... on User {
        sources {
          ...ProfileSourceList_sources @arguments(isAuthenticated: $isAuthenticated)
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
  ...ReduxProps,
|};

export const rendering = ({
  error,
  props,
}: {|
  ...ReadyState,
  props: ?SourcePageQueryResponse,
|}) => {
  if (error) {
    return graphqlError;
  }

  if (props && props.node && props.node.sources != null) {
    // $FlowFixMe
    return <ProfileSourceList sources={props.node.sources} />;
  }
  return <Loader />;
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});

class SourcePage extends React.Component<Props> {
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
            }: SourcePageQueryVariables)
          }
          render={rendering}
        />
      </div>
    );
  }
}

const container = connect(mapStateToProps)(SourcePage);

export default container;
