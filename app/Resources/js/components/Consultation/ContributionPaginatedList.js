// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import Opinion from './Opinion';
import type { ContributionPaginatedList_consultation } from './__generated__/ContributionPaginatedList_consultation.graphql';
import { graphqlError } from '../../createRelayEnvironment';

export const pageSize = 20;

type Props = {
  consultation: ContributionPaginatedList_consultation,
  relay: RelayPaginationProp,
};

export class ContributionPaginatedList extends React.Component<Props> {
  render() {
    const { relay, consultation } = this.props;
    const { contributionConnection } = consultation;
    if (
      !contributionConnection ||
      typeof contributionConnection.edges === 'undefined' ||
      contributionConnection.edges === null
    ) {
      return graphqlError;
    }
    return (
      <div className="anchor-offset block  block--bordered">
        <div className="opinion opinion--default">
          <div className="opinion__header  opinion__header--mobile-centered">
            <h2 className="pull-left  h4  opinion__header__title">
              {contributionConnection.totalCount || 0} propositions
            </h2>
          </div>
        </div>
        <ul className="media-list  opinion__list">
          <div>
            {contributionConnection.edges.filter(Boolean).map((edge, index) => (
              // $FlowFixMe
              <Opinion key={index} opinion={edge.node} />
            ))}
          </div>
        </ul>
        {relay.hasMore() && (
          <div className="opinion  opinion__footer  box">
            <Button
              bsStyle="link"
              onClick={() => {
                relay.loadMore(pageSize, e => {
                  console.log(e); // eslint-disable-line
                });
              }}
              className="text-center"
              style={{ display: 'block' }}>
              <FormattedMessage id="global.more" />
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  ContributionPaginatedList,
  graphql`
    fragment ContributionPaginatedList_consultation on Consultation {
      id
      contributionConnection(first: $count, after: $cursor)
        @connection(key: "ContributionPaginatedList_contributionConnection") {
        totalCount
        edges {
          cursor
          node {
            ...Opinion_opinion
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props: Props) {
      return props.consultation && props.consultation.contributionConnection;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }) {
      return {
        count,
        cursor,
        consultationId: props.consultation.id,
      };
    },
    query: graphql`
      query ContributionPaginatedListQuery($consultationId: ID!, $count: Int!, $cursor: String) {
        consultations(id: $consultationId) {
          ...ContributionPaginatedList_consultation
        }
      }
    `,
  },
);
