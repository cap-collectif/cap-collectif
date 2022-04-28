import { useState, FC, Suspense } from 'react';
import { useIntl } from 'react-intl';
import { graphql, GraphQLTaggedNode, useFragment } from 'react-relay';
import {
    Flex,
    Search,
} from '@cap-collectif/ui';
import ModalCreateQuestionnaire from './ModalCreateQuestionnaire';
import QuestionnaireList from './QuestionnaireList';
import QuestionnaireListPlaceholder from './QuestionnaireListPlaceholder';
import QuestionnaireListNoResult from './QuestionnaireListNoResult';
import { QuestionnaireListPage_viewer$key } from '@relay/QuestionnaireListPage_viewer.graphql';
import debounce from '@utils/debounce-promise';

type QuestionnaireListPageProps = {
    readonly viewer: QuestionnaireListPage_viewer$key,
};

export const FRAGMENT: GraphQLTaggedNode = graphql`
    fragment QuestionnaireListPage_viewer on User
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        affiliations: { type: "[QuestionnaireAffiliation!]" }
        orderBy: { type: "QuestionnaireOrder" }
    )
    {
        id
        username
        __typename
        allQuestionnaire: questionnaires(affiliations: $affiliations) {
            totalCount
        }
        ...ModalCreateQuestionnaire_viewer
        ...QuestionnaireListNoResult_viewer
        ...QuestionnaireList_viewer
        @arguments(
            count: $count
            cursor: $cursor
            term: $term
            affiliations: $affiliations
            orderBy: $orderBy
        )
    }
`;

const QuestionnaireListPage: FC<QuestionnaireListPageProps> = ({ viewer: viewerFragment }) => {
    const intl = useIntl();
    const [term, setTerm] = useState('');
    const [orderBy, setOrderBy] = useState('DESC');
    const viewer = useFragment<QuestionnaireListPage_viewer$key>(FRAGMENT, viewerFragment);
    const hasQuestionnaire = viewer.allQuestionnaire.totalCount > 0;

    const onTermChange = debounce((value: string) => setTerm(value), 400);

    return hasQuestionnaire ? (
        <Flex
            direction="column"
            p={8}
            spacing={4}
            bg="white"
            borderRadius="normal"
            overflow="hidden">
            <Flex direction="row" spacing={8}>
                <ModalCreateQuestionnaire
                    viewer={viewer}
                    term={term}
                    orderBy={orderBy}
                    hasQuestionnaire={hasQuestionnaire}
                />

                <Search
                    id="search-questionnaire"
                    onChange={onTermChange}
                    value={term}
                    placeholder={intl.formatMessage({ id: 'search-questionnaire' })}
                />
            </Flex>

            <Suspense fallback={<QuestionnaireListPlaceholder />}>
                <QuestionnaireList
                    viewer={viewer}
                    term={term}
                    resetTerm={() => setTerm('')}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                />
            </Suspense>
        </Flex>
    ) : (
        <QuestionnaireListNoResult
            viewer={viewer}
            term={term}
            orderBy={orderBy}
            hasQuestionnaire={hasQuestionnaire}
        />
    )
};

export default QuestionnaireListPage;
