import * as React from 'react';
import { useIntl } from 'react-intl';
import { usePaginationFragment, graphql } from 'react-relay';
import { Table, Menu, Icon, CapUIIcon, Text } from '@cap-collectif/ui';
import EmptyMessage from '@ui/Table/EmptyMessage';
import { useAppContext } from '../AppProvider/App.context';
import { useLayoutContext } from '../Layout/Layout.context';
import ConsultationItem from "@components/ConsultationList/ConsultationItem";
import {ConsultationList_consultationOwner$key} from "@relay/ConsultationList_consultationOwner.graphql";

export const CONSULTATION_LIST_PAGINATION = 20;

type ConsultationListProps = {
    consultationOwner: ConsultationList_consultationOwner$key;
    term: string;
    resetTerm: () => void;
    orderBy: string;
    setOrderBy: (order: string) => void;
};


export const CONSULTATION_CONSULTATION_OWNER_FRAGMENT = graphql`
    fragment ConsultationList_consultationOwner on ConsultationOwner
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        orderBy: { type: "ConsultationOrder" }
    )
    @refetchable(queryName: "ConsultationListPaginationQuery") {
        ...on ConsultationOwner {
            consultations(
                first: $count
                after: $cursor
                query: $term
                orderBy: $orderBy
            )
            @connection(
                key: "ConsultationList_consultations"
                filters: ["query", "orderBy"]
            ) {
                __id
                totalCount
                edges {
                    node {
                        id
                        ...ConsultationItem_consultation
                    }
                }
            }
        }
    }
`;

const ConsultationList: React.FC<ConsultationListProps> = ({
                                                               consultationOwner,
                                                               term,
                                                               resetTerm,
                                                               orderBy,
                                                               setOrderBy,
                                                           }) => {
    const { viewerSession } = useAppContext();
    const intl = useIntl();
    const firstRendered = React.useRef<true | null>(null);
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(
        CONSULTATION_CONSULTATION_OWNER_FRAGMENT,
        consultationOwner,
    );

    const { consultations } = data;
    const { contentRef } = useLayoutContext();
    const hasConsultation = consultations ? consultations.totalCount > 0 : false;

    React.useEffect(() => {
        if (firstRendered.current) {
            refetch({
                term: term || null,
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
                useInfiniteScroll={hasConsultation}
                onScrollToBottom={() => {
                    loadNext(CONSULTATION_LIST_PAGINATION);
                }}
                hasMore={hasNext}
                scrollParentRef={contentRef || undefined}>
                {consultations?.edges
                    ?.filter(Boolean)
                    .map(edge => edge?.node)
                    .filter(Boolean)
                    .map(
                        consultation =>
                            consultation && (
                                <Table.Tr
                                    key={consultation.id}
                                    rowId={consultation.id}
                                    data-cy="consultation-item">
                                    <ConsultationItem
                                        consultation={consultation}
                                        connectionName={consultations.__id}
                                    />
                                </Table.Tr>
                            ),
                    )}
            </Table.Tbody>
        </Table>
    );
};

export default ConsultationList;
