// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { ListGroupItem, Button, Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionVersion from '../OpinionVersion/OpinionVersion';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { UserOpinionVersionListViewPaginated_user } from '~relay/UserOpinionVersionListViewPaginated_user.graphql';
import ListGroup from '../Ui/List/ListGroup';

type Props = {|
  relay: RelayPaginationProp,
  user: UserOpinionVersionListViewPaginated_user,
  userId: string,
|};
type State = {|
  loading: boolean,
|};

class UserOpinionVersionListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { user, relay } = this.props;
    const { loading } = this.state;
    const { edges } = user.opinionVersions;
    if (!edges || edges.length === 0) {
      return (
        <Panel.Body className="text-center excerpt">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id="opinion.no_new_version" />
        </Panel.Body>
      );
    }

    return (
      <ListGroup id="versions-list">
        {edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(version => (
            <OpinionVersion key={version.id} version={version} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem>
            {loading ? (
              <Loader size={28} inline />
            ) : (
              <Button
                block
                bsStyle="link"
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(50, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="see-more-amendments" />
              </Button>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
}

export default createPaginationContainer(
  UserOpinionVersionListViewPaginated,
  {
    user: graphql`
      fragment UserOpinionVersionListViewPaginated_user on User
        @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        opinionVersions(first: $count)
          @connection(key: "UserOpinionVersionListViewPaginated_opinionVersions") {
          edges {
            node {
              id
              ...OpinionVersion_version
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.user && props.user.opinionVersions;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        userId: props.userId,
      };
    },
    query: graphql`
      query UserOpinionVersionListViewPaginatedPaginatedQuery(
        $userId: ID!
        $cursor: String
        $count: Int!
      ) {
        user: node(id: $userId) {
          id
          ...UserOpinionVersionListViewPaginated_user @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
);
