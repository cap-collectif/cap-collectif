// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { usePaginationFragment, graphql, type GraphQLTaggedNode } from 'react-relay';
import Table from '~ds/Table';
import type { QuestionnaireList_viewer$key } from '~relay/QuestionnaireList_viewer.graphql';
import QuestionnaireItem from '~/components/Admin/Project/QuestionnaireList/QuestionnaireItem';
import Menu from '../../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';

export const QUESTIONNAIRE_LIST_PAGINATION = 20;

type Props = {|
  +viewer: QuestionnaireList_viewer$key,
  +term: string,
  +isAdmin: boolean,
  +resetTerm: () => void,
  +orderBy: string,
  +setOrderBy: (orderBy: string) => void,
|};

export const QuestionnaireListQuery: GraphQLTaggedNode = graphql`
  fragment QuestionnaireList_viewer on User
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

const QuestionnaireList = ({
  viewer,
  term,
  isAdmin,
  resetTerm,
  orderBy,
  setOrderBy,
}: Props): React.Node => {
  const intl = useIntl();
  const firstRendered = React.useRef(null);
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(
    QuestionnaireListQuery,
    viewer,
  );
  const { questionnaires } = data;
  const hasQuestionnaire = questionnaires ? questionnaires.totalCount > 0 : false;

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
        affiliations: isAdmin ? null : ['OWNER'],
        orderBy: { field: 'CREATED_AT', direction: orderBy },
      });
    }

    firstRendered.current = true;
  }, [term, isAdmin, refetch, orderBy]);

  return (
    <Table
      onReset={() => {
        setOrderBy('DESC');
        resetTerm();
      }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.project' })}</Table.Th>
          {isAdmin && <Table.Th>{intl.formatMessage({ id: 'global.owner' })}</Table.Th>}
          <Table.Th>{intl.formatMessage({ id: 'global.update' })}</Table.Th>
          <Table.Th>
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button rightIcon={ICON_NAME.ARROW_DOWN_O} {...styles}>
                    {intl.formatMessage({ id: 'creation' })}
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy}
                    onChange={value => setOrderBy(((value: any): string))}
                    type="radio"
                    title={intl.formatMessage({ id: 'sort-by' })}>
                    <Menu.OptionItem value="DESC">
                      <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                      <Icon ml="auto" name="ARROW_DOWN_O" />
                    </Menu.OptionItem>

                    <Menu.OptionItem value="ASC">
                      <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                      <Icon ml="auto" name="ARROW_UP_O" />
                    </Menu.OptionItem>
                  </Menu.OptionGroup>
                </Menu.List>
              </Menu>
            )}
          </Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll={hasQuestionnaire}
        onScrollToBottom={() => {
          loadNext(QUESTIONNAIRE_LIST_PAGINATION);
        }}
        hasMore={hasNext}>
        {questionnaires?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(questionnaire => (
            <Table.Tr key={questionnaire.id} rowId={questionnaire.id}>
              <QuestionnaireItem
                questionnaire={questionnaire}
                connectionName={questionnaires.__id}
                isAdmin={isAdmin}
              />
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
  );
};

export default QuestionnaireList;
