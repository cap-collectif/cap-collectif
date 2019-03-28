// @flow
import * as React from 'react';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { QuestionnaireAdminResultsMedia_mediaQuestion } from './__generated__/QuestionnaireAdminResultsMedia_mediaQuestion.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import { Card } from '../Ui/Card/Card';
import FileIcon from '../Ui/Icons/FileIcon';
import FormattedMediaSize from '../Utils/FormattedMediaSize';

const RESPONSE_PAGINATION = 24;

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

    const mediaQuestionMedias =
      mediaQuestion &&
      mediaQuestion.responses &&
      mediaQuestion.responses.edges &&
      mediaQuestion.responses.edges.reduce((acc, curr) => {
        acc.push(curr && curr.node.medias);
        return acc;
      }, []);

    const medias = mediaQuestionMedias && [].concat(...mediaQuestionMedias);

    if (medias && medias.length > 0) {
      return (
        <div className="mb-20">
          <div className="row d-flex flex-wrap">
            {medias.map((media, key) => {
              const format = media.contentType.split('/').pop();

              return (
                <div key={`${media.name}${key}`} className="col-sm-3 col-xs-6 d-flex">
                  <Card>
                    <Card.Body className="text-center">
                      <div className="mb-5">
                        <FileIcon format={format} />
                      </div>
                      <span className="mb-5">
                        <a href={media.url}>{media.name}</a>
                      </span>
                      <FormattedMediaSize size={media.size} />
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          {relay.hasMore() && (
            <div className="w-100 text-center">
              {loading ? (
                <Loader />
              ) : (
                <Button
                  bsStyle="primary"
                  className="btn-outline-primary"
                  onClick={this.handleLoadMore}>
                  <FormattedMessage id="see-more-documents" />
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
          count: { type: "Int", defaultValue: 24 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        responses(first: $count, after: $cursor)
          @connection(key: "QuestionnaireAdminResultsMedia__responses", filters: []) {
          edges {
            node {
              id
              ... on MediaResponse {
                medias {
                  url
                  name
                  size
                  contentType
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
        questionId: props.mediaQuestion.id,
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
