// @flow
import * as React from 'react';
import { graphql, type GraphQLTaggedNode, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Table from '~ds/Table';
import Text from '~ui/Primitives/Text';
import Menu from '../../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Tr from '~ds/Table/Tr';
import type { AdminEventList_viewer$key } from '~relay/AdminEventList_viewer.graphql';
import AdminEventItem from '~/components/Admin/Event/EventList/AdminEventItem';

export const EVENT_LIST_PAGINATION = 20;

export const AdminEventListQuery: GraphQLTaggedNode = graphql`
  fragment AdminEventList_viewer on User
    @argumentDefinitions(
      count: { type: "Int!" }
      cursor: { type: "String" }
      term: { type: "String", defaultValue: null }
      affiliations: { type: "[EventAffiliation!]" }
      orderBy: { type: "EventOrder" }
      status: { type: "EventStatus" }
    )
    @refetchable(queryName: "AdminEventListPaginationQuery") {
    events(
      first: $count
      after: $cursor
      search: $term
      affiliations: $affiliations
      orderBy: $orderBy
      status: $status
    )
      @connection(
        key: "AdminEventList_events"
        filters: ["query", "orderBy", "status", "affiliations", "search"]
      ) {
      __id
      totalCount
      edges {
        node {
          id
          ...AdminEventItem_event
        }
      }
    }
  }
`;
type Props = {|
  +viewer: AdminEventList_viewer$key,
  +term: string,
  +isAdmin: boolean,
  +resetFilters: () => void,
  +status: ?string,
|};

const AdminEventList = ({ viewer, term, isAdmin, status, resetFilters }: Props): React.Node => {
  const intl = useIntl();
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(AdminEventListQuery, viewer);
  const [orderBy, setOrderBy] = React.useState('DESC');
  const { events } = data;
  const firstRendered = React.useRef(null);
  const hasEvents = events ? events.totalCount > 0 : false;
  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
        status: status !== 'ALL' ? status : null,
        affiliations: isAdmin ? null : ['OWNER'],
        orderBy: { field: 'START_AT', direction: orderBy },
      });
    }
    firstRendered.current = true;
  }, [term, isAdmin, refetch, orderBy, status]);
  return (
    <Table
      style={{ border: 'none' }}
      onReset={() => {
        setOrderBy('DESC');
        resetFilters();
      }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.title' })} </Table.Th>
          <Table.Th lineHeight="sm">
            {intl.formatMessage({ id: 'global.participative.project' })}
          </Table.Th>
          <Table.Th lineHeight="sm">
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button
                    rightIcon={orderBy === 'DESC' ? ICON_NAME.ARROW_DOWN_O : ICON_NAME.ARROW_UP_O}
                    {...styles}>
                    <Text lineHeight="sm" style={{ whiteSpace: 'nowrap' }}>
                      {intl.formatMessage({ id: 'start.date.and.end' })}
                    </Text>
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy}
                    onChange={setOrderBy}
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
          {isAdmin && (
            <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.owner' })}</Table.Th>
          )}
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.updated.date' })}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={hasEvents}
        onScrollToBottom={() => {
          loadNext(EVENT_LIST_PAGINATION);
        }}
        hasMore={hasNext}>
        {events?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(event => (
            <Tr key={event.id} rowId={event.id}>
              <AdminEventItem isAdmin={isAdmin} event={event} />
            </Tr>
          ))}
      </Table.Tbody>
    </Table>
  );
};

export default AdminEventList;
