// @flow
import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ArgumentListProfile_argumentList } from './__generated__/ArgumentListProfile_argumentList.graphql';

import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/Loader';

type Props = {
  relay: RelayPaginationProp,
  argumentList: ArgumentListProfile_argumentList,
};

type State = {
  loading: boolean,
};

export class ArgumentListProfile extends Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { argumentList, relay } = this.props;
    console.log(argumentList);

    return (
      <ListGroup>
        {// $FlowFixMe
        argumentList.arguments.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          // $FlowFixMe
          .map(argument => (
            <ArgumentItem key={argument.id} argument={argument} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem style={{ textAlign: 'center' }}>
            {this.state.loading ? (
              <Loader />
            ) : (
              <a
                style={{ cursor: 'pointer' }}
                className="small"
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(5, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="global.more" />
              </a>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
}

export default createPaginationContainer(
  ArgumentListProfile,
  {
    argumentList: graphql`
      fragment ArgumentListProfile_argumentList on User
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
        ) {
        id
        arguments(first: $count, after: $cursor) @connection(key: "ArgumentListProfile_arguments") {
          totalCount
          edges {
            node {
              id
              ...ArgumentItem_argument @arguments(isAuthenticated: $isAuthenticated)
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
    getConnectionFromProps(props: Props) {
      return props.argumentList && props.argumentList;
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
        argumentId: props.argumentList.id,
      };
    },
    query: graphql`
      query ArgumentListProfileQuery(
        $argumentId: ID!
        $isAuthenticated: Boolean!
        $cursor: String
        $count: Int
      ) {
        argumentList: node(id: $argumentId) {
          id
          ...ArgumentListProfile_argumentList
            @arguments(isAuthenticated: $isAuthenticated, cursor: $cursor, count: $count)
        }
      }
    `,
  },
);
