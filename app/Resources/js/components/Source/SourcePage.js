// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
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
}: {
  ...ReactRelayReadyState,
  props: ?SourcePageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    if (props.node && props.node.sources != null) {
      return <ProfileSourceList sources={props.node.sources} />;
    }
  }
  return <Loader />;
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});

class SourcePage extends React.Component<Props> {
  render() {
    const { isAuthenticated, userId } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={
            ({
              userId,
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
