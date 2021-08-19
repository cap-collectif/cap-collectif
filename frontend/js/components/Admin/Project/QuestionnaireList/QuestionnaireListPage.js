// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
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
import QuestionnaireListPlaceholder from './QuestionnaireListPlaceholder';
import type { QuestionnaireListPageQuery as QuestionnaireListPageQueryType } from '~relay/QuestionnaireListPageQuery.graphql';

type Props = {|
  +queryReference: PreloadedQuery<QuestionnaireListPageQueryType>,
  +isAdmin: boolean,
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

      <Flex
        direction="column"
        p={8}
        spacing={4}
        m={6}
        bg="white"
        borderRadius="normal"
        overflow="hidden">
        <Flex direction="row" spacing={8}>
          <ModalCreateQuestionnaire
            viewerId={query.viewer.id}
            intl={intl}
            isAdmin={isAdmin}
            term={term}
            orderBy={orderBy}
          />

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
    </Flex>
  );
};

export default QuestionnaireListPage;
