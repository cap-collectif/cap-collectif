// @flow
import React, {useState, useMemo} from 'react';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
import type { QuestionnaireAdminResultsText_simpleQuestion } from '~relay/QuestionnaireAdminResultsText_simpleQuestion.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import TagCloud from '~ui/TagCloud/TagCloud';
import ModalResponseTagSearchResults from '~/components/Questionnaire/ModalResponseTagSearchResults';
import Button from '~ds/Button/Button';
import QuestionnaireAdminResultsTextAnswerItem from './QuestionnaireAdminResultsTextAnswerItem';
import Menu from '~ds/Menu/Menu';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';

const RESPONSE_PAGINATION = 15;
type VIEW = 'list' | 'tagCloud';

type Props = {
  relay: RelayPaginationProp,
  simpleQuestion: QuestionnaireAdminResultsText_simpleQuestion,
};

export const QuestionnaireAdminResultsText = React.forwardRef<Props, HTMLElement>(({ relay, simpleQuestion }: Props, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [responseSearchTag, setResponseSearchTag] = useState<?{| value: string, count: number |}>(
    null,
  );
  const [view, setView] = useState<VIEW>('tagCloud');

  const tags = useMemo(
    () =>
      simpleQuestion.tagCloud
        .map(tag => {
          return {
            tag: {
              value: tag.value,
              count: tag.occurrencesCount,
              onClick: () =>
                setResponseSearchTag({ value: tag.value, count: tag.occurrencesCount }),
            },
            marginBottom: -1 * Math.floor(Math.random() * 25),
          };
        })
        .sort(() => Math.random() - 0.5),
    [simpleQuestion],
  );

  const handleLoadMore = () => {
    setLoading(true);
    relay.loadMore(RESPONSE_PAGINATION, () => {
      setLoading(false);
    });
  };

  if (simpleQuestion?.responses?.edges) {
    return (
      <div className="mb-20">
        <Flex>
          <Text uppercase mr={2} fontWeight="600">
            <FormattedMessage id="see.by" />
          </Text>
          <Menu>
            <Menu.Button as={React.Fragment}>
              <Button
                variant="tertiary"
                rightIcon="ARROW_DOWN_O"
                color="blue.500"
                css={{ textTransform: 'uppercase' }}>
                {view === 'list' ? (
                  <FormattedMessage id="question.display.list" />
                ) : (
                  <FormattedMessage id="question.display.tag_cloud" />
                )}
              </Button>
            </Menu.Button>
            <Menu.List>
              <Menu.OptionGroup
                onChange={value => setView(value === 'tagCloud' ? 'tagCloud' : 'list')}
                type="radio"
                value={view}>
                <Menu.OptionItem value="tagCloud">
                  <FormattedMessage id="question.display.tag_cloud" />
                </Menu.OptionItem>
                <Menu.OptionItem value="list">
                  <FormattedMessage id="question.display.list" />
                </Menu.OptionItem>
              </Menu.OptionGroup>
            </Menu.List>
          </Menu>
        </Flex>
        {view === 'list' ? (
          <div className="mt-20">
            <ListGroupFlush striped>
              {simpleQuestion.responses.edges.map((response, key) => (
                <QuestionnaireAdminResultsTextAnswerItem
                  key={response ? response.node.id : key}
                  value={response?.node?.value || ''}
                />
              ))}
            </ListGroupFlush>
            {relay.hasMore() && (
              <>
                {loading ? (
                  <Loader />
                ) : (
                  <Button
                    m="auto"
                    mt={4}
                    variant="tertiary"
                    variantColor="primary"
                    variantSize="small"
                    onClick={handleLoadMore}>
                    <FormattedMessage id="see-more-answers" />
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{ margin: 'auto', maxWidth: 650, marginTop: '20' }}>
            <TagCloud tags={tags} minSize={12} maxSize={45} ref={ref} />
          </div>
        )}
        {responseSearchTag && (
          <ModalResponseTagSearchResults
            questionId={simpleQuestion.id}
            show={!!responseSearchTag}
            onClose={() => {
              setResponseSearchTag(null);
            }}
            searchTag={responseSearchTag}
          />
        )}
      </div>
    );
  }

  return null;
});

export default createPaginationContainer(
  QuestionnaireAdminResultsText,
  {
    simpleQuestion: graphql`
      fragment QuestionnaireAdminResultsText_simpleQuestion on SimpleQuestion
        @argumentDefinitions(count: { type: "Int", defaultValue: 4 }, cursor: { type: "String" }) {
        id
        tagCloud {
          value
          occurrencesCount
        }
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
