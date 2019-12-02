// @flow
import * as React from 'react';
import { Button, ListGroupItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { OpinionListPaginated_section } from '~relay/OpinionListPaginated_section.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import Opinion from './Opinion';

type Props = {|
  +relay: RelayPaginationProp,
  +section: OpinionListPaginated_section,
  +enablePagination: boolean,
|};

type State = {|
  +loading: boolean,
|};

const PAGINATION_COUNT = 50;

export class OpinionListPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { enablePagination, section, relay } = this.props;
    const { loading } = this.state;

    if (!section.opinions.edges || section.opinions.edges.length === 0) {
      return (
        <ListGroupItem className="text-center excerpt">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id="proposal.empty" />
        </ListGroupItem>
      );
    }

    return (
      <React.Fragment>
        {section.opinions.edges &&
          section.opinions.edges.map(
            (edge, index) =>
              edge && <Opinion key={index} opinion={edge.node} showUpdatedDate={false} />,
          )}
        {enablePagination && relay.hasMore() ? (
          <ListGroupItem>
            {loading ? (
              <Loader size={28} inline />
            ) : (
              <Button
                block
                id="OpinionListPaginated-loadmore"
                bsStyle="link"
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(PAGINATION_COUNT, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="see-more-proposals" />
              </Button>
            )}
          </ListGroupItem>
        ) : null}
      </React.Fragment>
    );
  }
}

type FragmentVariables = { count: number, cursor: ?string, orderBy: Object };

export default createPaginationContainer(
  OpinionListPaginated,
  {
    section: graphql`
      fragment OpinionListPaginated_section on Section
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "OpinionOrder!" }
        ) {
        id
        opinions(first: $count, after: $cursor, orderBy: $orderBy)
          @connection(key: "OpinionListPaginated_opinions") {
          edges {
            node {
              id
              ...Opinion_opinion
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
      return props.section && props.section.opinions;
    },
    getFragmentVariables(prevVars: FragmentVariables) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { cursor }, fragmentVariables: FragmentVariables) {
      return {
        ...fragmentVariables,
        cursor,
        sectionId: props.section.id,
      };
    },
    query: graphql`
      query OpinionListPaginatedQuery(
        $sectionId: ID!
        $cursor: String
        $orderBy: OpinionOrder!
        $count: Int!
      ) {
        step: node(id: $sectionId) {
          id
          ...OpinionListPaginated_section
            @arguments(count: $count, cursor: $cursor, orderBy: $orderBy)
        }
      }
    `,
  },
);
