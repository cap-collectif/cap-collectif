// @flow
import * as React from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { OrganizationPageEventList_organization$key } from '~relay/OrganizationPageEventList_organization.graphql';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Heading from '~/components/Ui/Primitives/Heading';
import Button from '~/components/DesignSystem/Button/Button';
import AppBox from '~/components/Ui/Primitives/AppBox';
import EventCard from '~/components/Ui/Event/EventCard';

const FRAGMENT = graphql`
  fragment OrganizationPageEventList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, hideDeletedEvents: { type: "Boolean" }, hideUnpublishedEvents: { type: "Boolean" })
  @refetchable(queryName: "OrganizationPageEventListPaginationQuery") {
    events(first: $count, after: $cursor, hideDeletedEvents: $hideDeletedEvents, hideUnpublishedEvents: $hideUnpublishedEvents)
      @connection(key: "OrganizationPageEventList_events", filters: ["query", "orderBy"]) {
      totalCount
      edges {
        node {
          id
          ...EventCard_event
        }
      }
    }
  }
`;

export type Props = {|
  +organization: OrganizationPageEventList_organization$key,
|};

export const OrganizationPageEventList = ({ organization }: Props) => {
  const intl = useIntl();
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, organization);

  if (!data) return null;

  const { events } = data;

  return (
    <Flex direction="column" maxWidth={['100%', '380px']} width="100%">
      <Heading as="h4" mb={4}>
        {intl.formatMessage({ id: 'homepage.section.events' })}
      </Heading>
      {events.edges?.filter(Boolean).map((edge, index) => (
        <EventCard event={edge?.node} key={index} mb={4} />
      ))}
      {hasNext ? (
        <AppBox width="100%">
          <Button margin="auto" onClick={() => loadNext(3)} color="blue.500">
            {intl.formatMessage({ id: 'global.more' })}
          </Button>
        </AppBox>
      ) : null}
    </Flex>
  );
};

export default OrganizationPageEventList;
