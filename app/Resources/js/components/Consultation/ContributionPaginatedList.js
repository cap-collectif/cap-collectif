// @flow
import React, { PropTypes } from 'react';
import { graphql, createPaginationContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import Opinion from './Opinion';
// import Loader from '../Utils/Loader';

export const ContributionPaginatedList = React.createClass({
  propTypes: {
    consultation: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { relay, consultation: contributionConnection } = this.props;
    return (
      <div className="anchor-offset block  block--bordered">
        <div className={`opinion opinion--default`}>
          <div className="opinion__header  opinion__header--mobile-centered">
            <h2 className="pull-left  h4  opinion__header__title">
              {contributionConnection.totalCount || 0} propositions
            </h2>
          </div>
        </div>
        <ul className="media-list  opinion__list">
          <div>
            {contributionConnection.edges.map((edge, index) => (
              <Opinion key={index} opinion={edge.node} />
            ))}
          </div>
        </ul>
        {relay.hasMore() &&
          <div className="opinion  opinion__footer  box">
            <a
              onClick={() => {
                relay.loadMore(2, e => {
                  console.log(e);
                });
              }}
              className="text-center"
              style={{ display: 'block' }}>
              Voir plus
            </a>
          </div>}
      </div>
    );
  },
});

export default createPaginationContainer(
  ContributionPaginatedList,
  graphql`
    fragment ContributionPaginatedList_consultation on Consultation {
      id
      contributionConnection(first: $count, after: $cursor) @connection(key: "ContributionPaginatedList_contributionConnection") {
        edges {
          cursor
          node {
            ...Opinion_opinion
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        # totalCount
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.consultation && props.consultation.contributionConnection;
    },
    getFragmentVariables(prevVars, totalCount) {
      console.log('getFragmentVariables', prevVars, totalCount);
      return {
        ...prevVars,
        // count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      console.log('getVariables', props, count, cursor, fragmentVariables);
      return {
        count,
        cursor,
        // orderBy: fragmentVariables.orderBy,
        consultationId: props.consultation.id,
      };
    },
    query: graphql`
      query ContributionPaginatedListQuery(
        $consultationId: ID!
        $count: Int!
        $cursor: String
      ) {
        consultations(id: $consultationId) {
          ...ContributionPaginatedList_consultation
        }
      }
    `,
  },
);
