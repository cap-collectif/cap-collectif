import * as React from 'react';
import { useIntl } from 'react-intl';
import { usePaginationFragment, graphql } from 'react-relay';
import { Table, Menu, Icon, CapUIIcon, Text } from '@cap-collectif/ui';
import type { ProposalFormList_viewer$key } from '@relay/ProposalFormList_viewer.graphql';
import ProposalFormItem from './ProposalFormItem';
import EmptyMessage from '@ui/Table/EmptyMessage';
import type { OrderDirection } from '@relay/ProposalFormListQuery.graphql';
import { useAppContext } from '../AppProvider/App.context';
import { useLayoutContext } from '../Layout/Layout.context';

export const PROPOSAL_FORM_LIST_PAGINATION = 20;

type ProposalFormListProps = {
    viewer: ProposalFormList_viewer$key,
    term: string,
    resetTerm: () => void,
    orderBy: string,
    setOrderBy: (orderBy: OrderDirection) => void,
};

export const FRAGMENT = graphql`
    fragment ProposalFormList_viewer on User
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        affiliations: { type: "[ProposalFormAffiliation!]" }
        orderBy: { type: "ProposalFormOrder" }
    )
    @refetchable(queryName: "ProposalFormListPaginationQuery") {
        proposalForms(
            first: $count
            after: $cursor
            query: $term
            affiliations: $affiliations
            orderBy: $orderBy
        )
            @connection(
                key: "ProposalFormList_proposalForms"
                filters: ["query", "orderBy", "affiliations"]
            ) {
            __id
            totalCount
            edges {
                node {
                    id
                    ...ProposalFormItem_proposalForm
                }
            }
        }
    }
`;

const ProposalFormList: React.FC<ProposalFormListProps> = ({
    viewer,
    term,
    resetTerm,
    orderBy,
    setOrderBy,
}) => {
    const { viewerSession } = useAppContext();
    const intl = useIntl();
    const firstRendered = React.useRef<true | null>(null);
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, viewer);
    const { proposalForms } = data;
    const { contentRef } = useLayoutContext();
    const hasProposalForm = proposalForms ? proposalForms.totalCount > 0 : false;

    React.useEffect(() => {
        if (firstRendered.current) {
            refetch({
                term: term || null,
                affiliations: viewerSession.isAdmin ? null : ['OWNER'],
                orderBy: { field: 'CREATED_AT', direction: orderBy },
            });
        }

        firstRendered.current = true;
    }, [term, viewerSession.isAdmin, refetch, orderBy]);

    return (
        <Table
            emptyMessage={
                <EmptyMessage
                    onReset={() => {
                        setOrderBy('DESC');
                        resetTerm();
                    }}
                />
            }>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th width="50%">{intl.formatMessage({ id: 'global.title' })}</Table.Th>
                    <Table.Th>{intl.formatMessage({ id: 'global.project' })}</Table.Th>
                    {viewerSession.isAdmin && (
                        <Table.Th>{intl.formatMessage({ id: 'global.owner' })}</Table.Th>
                    )}
                    <Table.Th>{intl.formatMessage({ id: 'global.update' })}</Table.Th>
                    <Table.Th>
                        <Table.Menu label={intl.formatMessage({ id: 'creation' })}>
                            <Table.Menu.OptionGroup
                                value={orderBy}
                                onChange={value => {
                                    if (value === 'DESC' || value === 'ASC') setOrderBy(value);
                                }}
                                type="radio"
                                title={intl.formatMessage({ id: 'sort-by' })}>
                                <Menu.OptionItem value="DESC">
                                    <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                                    <Icon ml="auto" name={CapUIIcon.ArrowDownO} />
                                </Menu.OptionItem>
                                <Menu.OptionItem value="ASC">
                                    <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                                    <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                                </Menu.OptionItem>
                            </Table.Menu.OptionGroup>
                        </Table.Menu>
                    </Table.Th>
                    <Table.Th />
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody
                useInfiniteScroll={hasProposalForm}
                onScrollToBottom={() => {
                    loadNext(PROPOSAL_FORM_LIST_PAGINATION);
                }}
                hasMore={hasNext}
                scrollParentRef={contentRef || undefined}>
                {proposalForms?.edges
                    ?.filter(Boolean)
                    .map(edge => edge?.node)
                    .filter(Boolean)
                    .map(
                        proposalForm =>
                            proposalForm && (
                                <Table.Tr key={proposalForm.id} rowId={proposalForm.id}>
                                    <ProposalFormItem
                                        proposalForm={proposalForm}
                                        connectionName={proposalForms.__id}
                                    />
                                </Table.Tr>
                            ),
                    )}
            </Table.Tbody>
        </Table>
    );
};

export default ProposalFormList;
