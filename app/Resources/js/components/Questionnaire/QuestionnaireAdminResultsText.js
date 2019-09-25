// @flow
import * as React from 'react';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
import type { QuestionnaireAdminResultsText_simpleQuestion } from '~relay/QuestionnaireAdminResultsText_simpleQuestion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import Loader from '../Ui/FeedbacksIndicators/Loader';

const RESPONSE_PAGINATION = 15;

type Props = {
  relay: RelayPaginationProp,
  simpleQuestion: QuestionnaireAdminResultsText_simpleQuestion,
};

type State = {
  loading: boolean,
};

export class QuestionnaireAdminResultsText extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  handleLoadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(RESPONSE_PAGINATION, () => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { relay, simpleQuestion } = this.props;
    const { loading } = this.state;

    if (simpleQuestion.responses && simpleQuestion.responses.edges) {
      return (
        <div className="mb-20">
          <ListGroupFlush striped className="border-bottom">
            {simpleQuestion.responses.edges.map((response, key) => (
              <ListGroupItem key={response ? response.node.id : key}>
                <WYSIWYGRender value={response && response.node && response.node.value} />
              </ListGroupItem>
            ))}
          </ListGroupFlush>
          {relay.hasMore() && (
            <>
              {loading ? (
                <Loader />
              ) : (
                <Button
                  bsStyle="primary"
                  className="btn-outline-primary mt-20"
                  onClick={this.handleLoadMore}>
                  <FormattedMessage id="see-more-answers" />
                </Button>
              )}
            </>
          )}
        </div>
      );
    }

    return null;
  }
}

export default createPaginationContainer(
  QuestionnaireAdminResultsText,
  {
    simpleQuestion: graphql`
      fragment QuestionnaireAdminResultsText_simpleQuestion on SimpleQuestion
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 5 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        responses(first: $count, after: $cursor)
          @connection(key: "QuestionnaireAdminResultsText__responses", filters: []) {
          edges {
            node {
              id
              ... on ValueResponse {
                value
              }
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
      return props.simpleQuestion && props.simpleQuestion.responses;
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
        questionId: props.simpleQuestion.id,
      };
    },
    query: graphql`
      query QuestionnaireAdminResultsTextPaginatedQuery(
        $questionId: ID!
        $cursor: String
        $count: Int
      ) {
        simpleQuestion: node(id: $questionId) {
          ...QuestionnaireAdminResultsText_simpleQuestion @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
