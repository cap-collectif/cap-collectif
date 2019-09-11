// @flow
import React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-bootstrap';
import UserBox from '../User/UserBox';
import { graphqlError } from '../../createRelayEnvironment';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../constants/ProposalConstants';
import type { OpinionVersionFollowersBox_version } from '~relay/OpinionVersionFollowersBox_version.graphql';

type Props = {
  version: OpinionVersionFollowersBox_version,
  relay: RelayPaginationProp,
};

export class OpinionVersionFollowersBox extends React.Component<Props> {
  render() {
    const { version, relay } = this.props;
    if (!version.followers || !version.followers.edges) {
      return graphqlError;
    }
    return (
      <React.Fragment>
        {version.followers && version.followers.edges && version.followers.edges.length !== 0 ? (
          <Row>
            {version.followers.edges.filter(Boolean).map((edge, key) => (
              <UserBox key={key} user={edge.node} className="proposal__follower" />
            ))}
          </Row>
        ) : (
          <div className="well well-lg text-center">
            <i className="cap-32 cap-contacts-1 " />
            <br />
            <FormattedMessage id="no-followers" />
          </div>
        )}

        {relay.hasMore() && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                relay.loadMore(PROPOSAL_FOLLOWERS_TO_SHOW);
              }}
              className="text-center btn btn-secondary">
              <FormattedMessage id="see-more-followers" />
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  OpinionVersionFollowersBox,
  {
    version: graphql`
      fragment OpinionVersionFollowersBox_version on Version
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 20 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        followers(first: $count, after: $cursor)
          @connection(key: "OpinionVersionFollowersBox_followers") {
          edges {
            cursor
            node {
              ...UserBox_user
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props) {
      return props.version && props.version.followers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }) {
      return {
        count,
        cursor,
        versionId: props.version.id,
      };
    },
    query: graphql`
      query OpinionVersionFollowersBoxQuery($versionId: ID!, $count: Int!, $cursor: String) {
        opinion: node(id: $versionId) {
          ...OpinionVersionFollowersBox_version @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
