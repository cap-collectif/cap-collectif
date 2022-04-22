import type { FC } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { PROPOSAL_FORM_LIST_PAGINATION } from './ProposalFormList';
import ProposalFormListPage from './ProposalFormListPage';
import { useAppContext } from '../AppProvider/App.context';
import type { ProposalFormListQuery as ProposalFormListQueryType } from '@relay/ProposalFormListQuery.graphql';

export const QUERY = graphql`
    query ProposalFormListQuery(
        $count: Int
        $cursor: String
        $term: String
        $affiliations: [ProposalFormAffiliation!]
        $orderBy: ProposalFormOrder
    ) {
        viewer {
            ...ProposalFormListPage_viewer
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

const ProposalFormListQuery: FC = () => {
    const { viewerSession } = useAppContext();
    const query = useLazyLoadQuery<ProposalFormListQueryType>(QUERY, {
        count: PROPOSAL_FORM_LIST_PAGINATION,
        cursor: null,
        term: null,
        affiliations: viewerSession.isAdmin ? null : ['OWNER'],
        orderBy: { field: 'CREATED_AT', direction: 'DESC' },
    });

    return <ProposalFormListPage viewer={query.viewer} />;
};

export default ProposalFormListQuery;
