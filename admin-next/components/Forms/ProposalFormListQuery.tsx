import React, { useState } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import type { ProposalFormListQuery as ProposalFormListQueryType } from '@relay/ProposalFormListQuery.graphql';
import withPageAuthRequired from '@utils/withPageAuthRequired';
import ProposalFormList from '../ProposalForm/ProposalFormList';

export const PROPOSAL_FORM_LIST_QUERY = graphql`
    query ProposalFormListQuery(
        $count: Int!
        $cursor: String
        $term: String
        $affiliations: [ProposalFormAffiliation!]
        $orderBy: ProposalFormOrder
    ) {
        viewer {
            ...ProposalFormList_viewer
            organizations {
                ...ProposalFormList_proposalFormOwner
                    @arguments(
                        count: $count
                        cursor: $cursor
                        term: $term
                        affiliations: $affiliations
                        orderBy: $orderBy
                    )
            }
            ...ProposalFormList_proposalFormOwner
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

type Props = {
    queryReference: PreloadedQuery<ProposalFormListQueryType>;
    term: string;
    resetTerm: () => void;
};

const ProposalFormListQuery: React.FC<Props> = ({ queryReference, term, resetTerm }) => {
    const query = usePreloadedQuery(PROPOSAL_FORM_LIST_QUERY, queryReference);
    const viewer = query?.viewer;
    const organization = viewer?.organizations?.[0];
    const proposalFormOwner = organization ?? viewer;
    const [orderBy, setOrderBy] = React.useState('DESC');

    if (!proposalFormOwner) return null;

    return (
        <ProposalFormList
            proposalFormOwner={proposalFormOwner}
            viewer={viewer}
            term={term}
            resetTerm={resetTerm}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
        />
    );
};

export const getServerSideProps = withPageAuthRequired;

export default ProposalFormListQuery;
