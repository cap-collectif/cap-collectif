// @flow
import React, { PropTypes } from 'react';
import { graphql, createPaginationContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import Opinion from './Opinion';

export const ContributionPaginatedList = React.createClass({
  propTypes: {
    consultation: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  _loadMore() {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      console.log('No More !');
      return;
    }

    this.props.relay.loadMore(10, e => {
      console.log(e);
    });
  },

  render() {
    const { contributionConnection } = this.props.consultation;
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
        <div className="opinion  opinion__footer  box">
          <a
            onClick={() => this._loadMore()}
            className="text-center"
            style={{ display: 'block' }}>
            Voir plus
          </a>
        </div>
      </div>
    );
  },
});

export default createPaginationContainer(
  ContributionPaginatedList,
  graphql`
    fragment ContributionPaginatedList_consultation on Consultation {
      contributionConnection(first: 50) @connection(key: "ContributionPaginatedList_contributionConnection") {
        edges {
          cursor
          node {
            ...Opinion_opinion
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      console.log('getConnectionFromProps', props);
      return props.consultation && props.consultation.contributionConnection;
    },
    getFragmentVariables(prevVars /* , totalCount*/) {
      return {
        ...prevVars,
        // count: totalCount,
      };
    },
    getVariables(props, { count, cursor } /* , fragmentVariables*/) {
      return {
        count,
        cursor,
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        // orderBy: fragmentVariables.orderBy,
        consultationId: 1,
      };
    },
    query: graphql`
      query ContributionPaginatedListQuery(
        $consultationId: ID!
        $count: Int!
        $cursor: String
        $orderby: String!
      ) {
        consultations(id: $consultationId) {
          ...ContributionPaginatedList_consultation
        }
      }
    `,
  },
);
