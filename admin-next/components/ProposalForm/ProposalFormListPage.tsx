import { useState, FC, Suspense } from 'react';
import { useIntl } from 'react-intl';
import { graphql, GraphQLTaggedNode, useFragment } from 'react-relay';
import {
    Flex,
    Search,
} from '@cap-collectif/ui';
import ModalCreateProposalForm from './ModalCreateProposalForm';
import ProposalFormList from './ProposalFormList';
import ProposalFormListPlaceholder from './ProposalFormListPlaceholder';
import ProposalFormListNoResult from './ProposalFormListNoResult';
import { ProposalFormListPage_viewer$key } from '@relay/ProposalFormListPage_viewer.graphql';
import debounce from '@utils/debounce-promise';

type ProposalFormListPageProps = {
    readonly viewer: ProposalFormListPage_viewer$key,
};

export const FRAGMENT: GraphQLTaggedNode = graphql`
    fragment ProposalFormListPage_viewer on User
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        affiliations: { type: "[ProposalFormAffiliation!]" }
        orderBy: { type: "ProposalFormOrder" }
    )
    {
        id
        username
        __typename
        allProposalForm: proposalForms(affiliations: $affiliations) {
            totalCount
        }
        ...ModalCreateProposalForm_viewer
        ...ProposalFormListNoResult_viewer
        ...ProposalFormList_viewer
        @arguments(
            count: $count
            cursor: $cursor
            term: $term
            affiliations: $affiliations
            orderBy: $orderBy
        )
    }
`;

const ProposalFormListPage: FC<ProposalFormListPageProps> = ({ viewer: viewerFragment }) => {
    const intl = useIntl();
    const [term, setTerm] = useState('');
    const [orderBy, setOrderBy] = useState('DESC');
    const viewer = useFragment<ProposalFormListPage_viewer$key>(FRAGMENT, viewerFragment);
    const hasProposalForm = viewer.allProposalForm.totalCount > 0;

    const onTermChange = debounce((value: string) => setTerm(value), 400);

    return hasProposalForm ? (
        <Flex
            direction="column"
            p={8}
            spacing={4}
            bg="white"
            borderRadius="normal"
            overflow="hidden">
            <Flex direction="row" spacing={8}>
                <ModalCreateProposalForm
                    viewer={viewer}
                    term={term}
                    orderBy={orderBy}
                    hasProposalForm={hasProposalForm}
                />

                <Search
                    id="search-proposalForm"
                    onChange={onTermChange}
                    value={term}
                    placeholder={intl.formatMessage({ id: 'search-form' })}
                />
            </Flex>

            <Suspense fallback={<ProposalFormListPlaceholder />}>
                <ProposalFormList
                    viewer={viewer}
                    term={term}
                    resetTerm={() => setTerm('')}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                />
            </Suspense>
        </Flex>
    ) : (
        <ProposalFormListNoResult
            viewer={viewer}
            term={term}
            orderBy={orderBy}
            hasProposalForm={hasProposalForm}
        />
    )
};

export default ProposalFormListPage;