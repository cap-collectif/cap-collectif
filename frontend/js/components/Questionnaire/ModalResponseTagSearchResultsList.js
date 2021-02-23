// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { usePagination } from 'relay-hooks';
import { FormattedMessage } from 'react-intl';
import type { ModalResponseTagSearchResultsList_query } from '~relay/ModalResponseTagSearchResultsList_query.graphql';
import Button from '~ds/Button/Button';
import type { ConnectionMetadata } from '~/types';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import QuestionnaireAdminResultsTextAnswerItem from './QuestionnaireAdminResultsTextAnswerItem';

type RelayProps = {|
  +query: ModalResponseTagSearchResultsList_query,
|};

type Props = {|
  ...RelayProps,
  value: string,
|};

const FRAGMENT = graphql`
  fragment ModalResponseTagSearchResultsList_query on Query
    @argumentDefinitions(
      questionId: { type: "ID!" }
      term: { type: "String!" }
      first: { type: "Int", defaultValue: 4 }
      cursor: { type: "String" }
    ) {
    node(id: $questionId) {
      ... on SimpleQuestion {
        responses(first: $first, after: $cursor, term: $term)
          @connection(key: "ModalResponseTagSearchResultsList_responses") {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              ... on ValueResponse {
                id
                formattedValue
              }
            }
          }
        }
      }
    }
  }
`;

const CONNECTION_CONFIG = {
  direction: 'forward',

  getVariables(props: RelayProps, { count, cursor }: ConnectionMetadata, fragmentVariables) {
    return {
      ...fragmentVariables,
      cursor,
      first: count,
    };
  },
  query: graphql`
    query ModalResponseTagSearchResultsListPaginationQuery(
      $questionId: ID!
      $term: String!
      $first: Int!
      $cursor: String
    ) {
      ...ModalResponseTagSearchResultsList_query
        @arguments(questionId: $questionId, term: $term, first: $first, cursor: $cursor)
    }
  `,
};

const ModalResponseTagSearchResultsList = ({ query: queryFragment, value }: Props) => {
  const [query, { hasMore, loadMore }] = usePagination(FRAGMENT, queryFragment);
  const { startLoading, stopLoading, isLoading } = useLoadingMachine();
  const _loadMore = () => {
    if (!hasMore() || isLoading) {
      return;
    }
    startLoading();
    loadMore(CONNECTION_CONFIG, 4, () => {
      stopLoading();
    });
  };

  const responses = query?.node.responses.edges.map(edge => edge.node) ?? [];
  return (
    <div>
      <div>
        {responses.map(response => (
          <QuestionnaireAdminResultsTextAnswerItem
            key={response.id}
            value={response.formattedValue || ''}
            highlightedPart={value}
          />
        ))}
      </div>
      {hasMore() && (
        <Button
          mt={4}
          margin="auto"
          isLoading={isLoading}
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          onClick={_loadMore}>
          <FormattedMessage id="see-more-answers" />
        </Button>
      )}
    </div>
  );
};

export default ModalResponseTagSearchResultsList;
