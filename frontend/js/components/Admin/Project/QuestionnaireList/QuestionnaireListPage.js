// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Flex from '~ui/Primitives/Layout/Flex';
import ModalCreateQuestionnaire from '~/components/Admin/Project/QuestionnaireList/ModalCreateQuestionnaire';
import Input from '~ui/Form/Input/Input';
import QuestionnaireList from './QuestionnaireList';
import NoResult from './NoResult';
import QuestionnaireListPlaceholder from './QuestionnaireListPlaceholder';
import type { QuestionnaireListPageQuery as QuestionnaireListPageQueryType } from '~relay/QuestionnaireListPageQuery.graphql';
import Button from '~ds/Button/Button';
import type { QuestionnaireList_viewer$ref } from '~relay/QuestionnaireListPaginationQuery.graphql';

type Props = {|
  +queryReference: PreloadedQuery<QuestionnaireListPageQueryType>,
  +isAdmin: boolean,
|};

export type Viewer = {|
  +id: string,
  +username: ?string,
  +__typename: string,
  +allQuestionnaire: {|
    +totalCount: number,
  |},
  +$fragmentRefs: QuestionnaireList_viewer$ref,
|};

export const QuestionnaireListPageQuery: GraphQLTaggedNode = graphql`
  query QuestionnaireListPageQuery(
    $count: Int
    $cursor: String
    $term: String
    $affiliations: [QuestionnaireAffiliation!]
    $orderBy: QuestionnaireOrder
  ) {
    viewer {
      id
      username
      __typename
      allQuestionnaire: questionnaires(affiliations: $affiliations) {
        totalCount
      }
      ...QuestionnaireList_viewer
        @arguments(
          count: $count
          cursor: $cursor
          term: $term
          affiliations: $affiliations
          orderBy: $orderBy
        )
    }
  }
`;

const QuestionnaireListPage = ({ queryReference, isAdmin }: Props): React.Node => {
  const intl = useIntl();
  const [term, setTerm] = React.useState<string>('');
  const [orderBy, setOrderBy] = React.useState('DESC');
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const query = usePreloadedQuery<QuestionnaireListPageQueryType>(
    QuestionnaireListPageQuery,
    queryReference,
  );

  return (
    <Flex direction="column">
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'global.questionnaire' })}
      </Text>

      {query.viewer.allQuestionnaire.totalCount > 0 ? (
        <Flex
          direction="column"
          p={8}
          spacing={4}
          m={6}
          bg="white"
          borderRadius="normal"
          overflow="hidden">
          <Flex direction="row" spacing={8}>
            <>
              <Button
                variant="primary"
                variantColor="primary"
                variantSize="small"
                leftIcon="ADD"
                id="btn-add-questionnaire"
                onClick={onOpen}>
                {intl.formatMessage({ id: 'create-questionnaire' })}
              </Button>
              <ModalCreateQuestionnaire
                viewer={query.viewer}
                intl={intl}
                isAdmin={isAdmin}
                term={term}
                orderBy={orderBy}
                show={isOpen}
                onClose={onClose}
              />
            </>

            <Input
              type="text"
              name="term"
              id="search-questionnaire"
              onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
              value={term}
              placeholder={intl.formatMessage({ id: 'search-questionnaire' })}
            />
          </Flex>

          <React.Suspense fallback={<QuestionnaireListPlaceholder />}>
            <QuestionnaireList
              viewer={query.viewer}
              term={term}
              isAdmin={isAdmin}
              resetTerm={() => setTerm('')}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <NoResult isAdmin={isAdmin} viewer={query.viewer} term={term} orderBy={orderBy} />
      )}
    </Flex>
  );
};

export default QuestionnaireListPage;
