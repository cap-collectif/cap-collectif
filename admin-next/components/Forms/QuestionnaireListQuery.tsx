import React, { useState } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import {
    QuestionnaireListQuery as QuestionnaireListQueryType,
    QuestionnaireType,
} from '@relay/QuestionnaireListQuery.graphql';
import QuestionnaireList from '../QuestionnaireList/QuestionnaireList';
import withPageAuthRequired from '@utils/withPageAuthRequired';

export const QUESTIONNAIRE_LIST_QUERY = graphql`
    query QuestionnaireListQuery(
        $count: Int!
        $cursor: String
        $term: String
        $affiliations: [QuestionnaireAffiliation!]
        $orderBy: QuestionnaireOrder
        $types: [QuestionnaireType]
    ) {
        viewer {
            ...QuestionnaireList_viewer
            ...QuestionnaireList_questionnaireOwner
                @arguments(
                    count: $count
                    cursor: $cursor
                    term: $term
                    affiliations: $affiliations
                    orderBy: $orderBy
                    types: $types
                )
            organizations {
                ...QuestionnaireList_questionnaireOwner
                    @arguments(
                        count: $count
                        cursor: $cursor
                        term: $term
                        affiliations: $affiliations
                        orderBy: $orderBy
                        types: $types
                    )
            }
        }
    }
`;

type Props = {
    queryReference: PreloadedQuery<QuestionnaireListQueryType>;
    term: string;
    resetTerm: () => void;
    types?: Array<QuestionnaireType>;
};

const QuestionnaireListQuery: React.FC<Props> = ({ queryReference, term, resetTerm, types }) => {
    const query = usePreloadedQuery(QUESTIONNAIRE_LIST_QUERY, queryReference);
    const viewer = query?.viewer;
    const organization = viewer?.organizations?.[0];
    const questionnaireOwner = organization ?? viewer;
    const [orderBy, setOrderBy] = React.useState('DESC');

    if (!questionnaireOwner) return null;

    return (
        <QuestionnaireList
            viewer={viewer}
            questionnaireOwner={questionnaireOwner}
            term={term}
            resetTerm={resetTerm}
            types={types}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
        />
    );
};

export const getServerSideProps = withPageAuthRequired;
export default QuestionnaireListQuery;
