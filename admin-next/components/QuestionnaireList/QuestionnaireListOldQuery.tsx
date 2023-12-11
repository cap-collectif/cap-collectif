import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { QUESTIONNAIRE_LIST_PAGINATION } from './QuestionnaireList';
import QuestionnaireListPage from './QuestionnaireListPage';
import { useAppContext } from '../AppProvider/App.context';
import type { QuestionnaireListOldQuery as QuestionnaireListOldQueryType } from '@relay/QuestionnaireListOldQuery.graphql';

export const QUERY = graphql`
    query QuestionnaireListOldQuery(
        $count: Int!
        $cursor: String
        $term: String
        $affiliations: [QuestionnaireAffiliation!]
        $orderBy: QuestionnaireOrder
    ) {
        viewer {
            ...QuestionnaireListPage_viewer
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

const QuestionnaireListOldQuery: FC = () => {
    const { viewerSession } = useAppContext();
    const query = useLazyLoadQuery<QuestionnaireListOldQueryType>(QUERY, {
        count: QUESTIONNAIRE_LIST_PAGINATION,
        cursor: null,
        term: null,
        affiliations: viewerSession.isAdmin ? null : ['OWNER'],
        orderBy: { field: 'CREATED_AT', direction: 'DESC' },
    });

    return <QuestionnaireListPage viewer={query.viewer} />;
};

export default QuestionnaireListOldQuery;
