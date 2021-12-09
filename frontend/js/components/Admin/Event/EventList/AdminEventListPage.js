// @flow
import * as React from 'react';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Input from '~ui/Form/Input/Input';
import TablePlaceholder from '~ds/Table/placeholder';
import type { AdminEventListPageQuery as AdminEventListPageQueryType } from '~relay/AdminEventListPageQuery.graphql';
import AdminEventList from '~/components/Admin/Event/EventList/AdminEventList';
import InlineSelect from '~ds/InlineSelect';
import AdminEventImportModal from '~/components/Admin/Event/EventList/AdminEventImportModal';
import AdminEventListNoResult from '~/components/Admin/Event/EventList/AdminEventListNoResult';
import downloadCSV from '~/components/Utils/downloadCSV';

type Props = {|
  +queryReference: PreloadedQuery<AdminEventListPageQueryType>,
  +isAdmin: boolean,
|};

export const AdminEventListPageQuery: GraphQLTaggedNode = graphql`
  query AdminEventListPageQuery(
    $count: Int
    $cursor: String
    $term: String
    $affiliations: [EventAffiliation!]
    $status: EventStatus
    $orderBy: EventOrder
  ) {
    viewer {
      allEvents: events(affiliations: $affiliations) {
        totalCount
      }
      awaiting: events(status: AWAITING, affiliations: $affiliations) {
        totalCount
      }
      approved: events(status: APPROVED, affiliations: $affiliations) {
        totalCount
      }
      refused: events(status: REFUSED, affiliations: $affiliations) {
        totalCount
      }
      deleted: events(status: DELETED, affiliations: $affiliations) {
        totalCount
      }
      ...AdminEventList_viewer
        @arguments(
          count: $count
          cursor: $cursor
          term: $term
          affiliations: $affiliations
          status: $status
          orderBy: $orderBy
        )
    }
  }
`;
const AdminEventListPage = ({ queryReference, isAdmin }: Props): React.Node => {
  const intl = useIntl();
  const [term, setTerm] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('ALL');
  const query = usePreloadedQuery<AdminEventListPageQueryType>(
    AdminEventListPageQuery,
    queryReference,
  );

  const exportEvents = async () => {
    await downloadCSV('/events/download', intl);
  };

  return (
    <Flex direction="column" spacing={6}>
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'global.events' })}
      </Text>
      {query.viewer.allEvents.totalCount > 0 ? (
        <Flex
          direction="column"
          p={8}
          spacing={4}
          m={6}
          bg="white"
          borderRadius="normal"
          overflow="hidden">
          <Flex direction="row" justify="space-between">
            <Flex direction="row">
              <Button
                className="event_list_create"
                variant="primary"
                variantColor="primary"
                variantSize="small"
                leftIcon="ADD"
                onClick={() => window.open('/admin/capco/app/event/create', '_self')}
                mr={6}>
                {intl.formatMessage({ id: 'admin-create-event' })}
              </Button>
              <Input
                type="text"
                name="term"
                id="search-post"
                onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
                value={term}
                placeholder={intl.formatMessage({ id: 'search.event' })}
              />
            </Flex>
            <Flex direction="row">
              <AdminEventImportModal intl={intl} />
              {
                isAdmin && (
                  <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="small"
                    onClick={() => exportEvents()}>
                    {intl.formatMessage({ id: 'global.export' })}
                  </Button>
                )
              }
            </Flex>
          </Flex>
          <InlineSelect
            onChange={value => {
              if (value) {
                setStatus(value);
              }
            }}
            value={status}>
            <InlineSelect.Choice value="ALL">
              {intl.formatMessage(
                { id: 'event.filter.all' },
                { number: query.viewer.allEvents.totalCount },
              )}
            </InlineSelect.Choice>
            {isAdmin && (
              <>
                <InlineSelect.Choice value="AWAITING">
                  {intl.formatMessage(
                    { id: 'event.filter.waiting' },
                    { number: query.viewer.awaiting.totalCount },
                  )}
                </InlineSelect.Choice>
                <InlineSelect.Choice value="APPROVED">
                  {intl.formatMessage(
                    { id: 'event.filter.approved' },
                    { number: query.viewer.approved.totalCount },
                  )}
                </InlineSelect.Choice>
                <InlineSelect.Choice value="REFUSED">
                  {intl.formatMessage(
                    { id: 'events.filter.refused' },
                    { number: query.viewer.refused.totalCount },
                  )}
                </InlineSelect.Choice>
              </>
            )}
            <InlineSelect.Choice value="DELETED">
              {intl.formatMessage(
                { id: 'event.filter.deleted' },
                { number: query.viewer.deleted.totalCount },
              )}
            </InlineSelect.Choice>
          </InlineSelect>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
            <AdminEventList
              viewer={query.viewer}
              term={term}
              isAdmin={isAdmin}
              resetFilters={() => {
                setTerm('');
                setStatus('ALL');
              }}
              status={status}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <AdminEventListNoResult />
      )}
    </Flex>
  );
};

export default AdminEventListPage;
