// @flow
import * as React from 'react';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
import type { QuestionnaireAdminResultsMedia_mediaQuestion } from './__generated__/QuestionnaireAdminResultsMedia_mediaQuestion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import Loader from '../Ui/FeedbacksIndicators/Loader';

const RESPONSE_PAGINATION = 5;

type Props = {
  relay: RelayPaginationProp,
  mediaQuestion: QuestionnaireAdminResultsMedia_mediaQuestion,
};

type State = {
  loading: boolean,
};

export class QuestionnaireAdminResultsMedia extends React.Component<Props, State> {
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

    const { relay, mediaQuestion } = this.props;
    const { loading } = this.state;

    if(mediaQuestion.responses && mediaQuestion.responses.edges) {
      return (
        <div className="mb-20">
            {mediaQuestion.responses.edges.map((response, key) => (
                <div key={key}>
                  {response.authorName}
                </div>
              ))}
              {relay.hasMore() && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  {this.state.loading ? (
                    <Loader />
                  ) : (
                    <Button bsStyle="link" onClick={this.handleLoadMore}>
                      <FormattedMessage id="global.more" />
                    </Button>
                  )}
                </div>
              )}
        </div>
      );
    }
    
    return null;
  }
}

export default createPaginationContainer(
  QuestionnaireAdminResultsMedia, 
  {
    mediaQuestion: graphql`
      fragment QuestionnaireAdminResultsMedia_mediaQuestion on MediaQuestion 
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String", defaultValue: null }
      ) {
        id
        responses (
          first: $count
          after: $cursor
        ) @connection(key: "QuestionnaireAdminResultsMedia__responses", filters: []) {
            edges {
              node {
                id
                ... on MediaResponse {
                  medias {
                    description
                    authorName
                  }
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
    getConnectionFromProps(props: Props) {
      return props.mediaQuestion && props.mediaQuestion.responses;
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
        questionId: props.mediaQuestion.id
      };
    },
    query: graphql`
      query QuestionnaireAdminResultsMediaQuery($questionId: ID!, $cursor: String, $count: Int) {
        mediaQuestion: node(id: $questionId) {
          ...QuestionnaireAdminResultsMedia_mediaQuestion @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
