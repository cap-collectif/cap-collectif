import * as React from 'react';
import { useIntl } from 'react-intl';
import { usePaginationFragment, graphql, useFragment } from 'react-relay';
import { Table, Menu, Icon, CapUIIcon, Text } from '@cap-collectif/ui';
import type { QuestionnaireList_viewer$key } from '@relay/QuestionnaireList_viewer.graphql';
import QuestionnaireItem from './QuestionnaireItem';
import EmptyMessage from '@ui/Table/EmptyMessage';
import type { OrderDirection } from '@relay/QuestionnaireListQuery.graphql';
import { useLayoutContext } from '../Layout/Layout.context';
import { QuestionnaireList_questionnaireOwner$key } from '@relay/QuestionnaireList_questionnaireOwner.graphql';

export const QUESTIONNAIRE_LIST_PAGINATION = 20;

type QuestionnaireListProps = {
    viewer: QuestionnaireList_viewer$key;
    questionnaireOwner: QuestionnaireList_questionnaireOwner$key;
    term: string;
    resetTerm: () => void;
    orderBy: string;
    setOrderBy: (orderBy: OrderDirection) => void;
};

export const QUESTIONNAIRE_OWNER_FRAGMENT = graphql`
    fragment QuestionnaireList_questionnaireOwner on QuestionnaireOwner
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        affiliations: { type: "[QuestionnaireAffiliation!]" }
        orderBy: { type: "QuestionnaireOrder" }
    )
    @refetchable(queryName: "QuestionnaireListPaginationQuery") {
        questionnaires(
            first: $count
            after: $cursor
            query: $term
            affiliations: $affiliations
            orderBy: $orderBy
        )
            @connection(
                key: "QuestionnaireList_questionnaires"
                filters: ["query", "orderBy", "affiliations"]
            ) {
            __id
            totalCount
            edges {
                node {
                    id
                    ...QuestionnaireItem_questionnaire
                }
            }
        }
    }
`;

const VIEWER_FRAGMENT = graphql`
    fragment QuestionnaireList_viewer on User {
        isAdmin
        isAdminOrganization
        ...QuestionnaireItem_viewer
    }
`;
const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
    viewer: viewerRef,
    questionnaireOwner,
    term,
    resetTerm,
    orderBy,
    setOrderBy,
}) => {
    const intl = useIntl();
    const firstRendered = React.useRef<true | null>(null);
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(
        QUESTIONNAIRE_OWNER_FRAGMENT,
        questionnaireOwner,
    );
    const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);
    const { questionnaires } = data;
    const { contentRef } = useLayoutContext();
    const hasQuestionnaire = questionnaires ? questionnaires.totalCount > 0 : false;

    React.useEffect(() => {
        if (firstRendered.current) {
            refetch({
                term: term || null,
                affiliations: viewer?.isAdmin ? null : ['OWNER'],
                orderBy: { field: 'CREATED_AT', direction: orderBy },
            });
        }

        firstRendered.current = true;
    }, [term, viewer?.isAdmin, refetch, orderBy]);

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
                    <Table.Th>
                        {intl.formatMessage({ id: 'admin.projects.list.author' })}
                    </Table.Th>
                    {viewer?.isAdmin || viewer?.isAdminOrganization ? (
                        <Table.Th>{intl.formatMessage({ id: 'global.owner' })}</Table.Th>
                    ) : null}
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
                useInfiniteScroll={hasQuestionnaire}
                onScrollToBottom={() => {
                    loadNext(QUESTIONNAIRE_LIST_PAGINATION);
                }}
                hasMore={hasNext}
                scrollParentRef={contentRef || undefined}>
                {questionnaires?.edges
                    ?.filter(Boolean)
                    .map(edge => edge?.node)
                    .filter(Boolean)
                    .map(
                        questionnaire =>
                            questionnaire && (
                                <Table.Tr key={questionnaire.id} rowId={questionnaire.id} data-cy="questionnaire-item">
                                    <QuestionnaireItem
                                        viewer={viewer}
                                        questionnaire={questionnaire}
                                        connectionName={questionnaires.__id}
                                    />
                                </Table.Tr>
                            ),
                    )}
            </Table.Tbody>
        </Table>
    );
};

export default QuestionnaireList;
