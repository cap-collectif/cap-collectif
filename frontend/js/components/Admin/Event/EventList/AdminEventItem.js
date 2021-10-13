// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { AdminEventItem_event$key } from '~relay/AdminEventItem_event.graphql';
import Td from '~ds/Table/Td';
import Link from '~ds/Link/Link';
import Tooltip from '~ds/Tooltip/Tooltip';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import colors from '~/styles/modules/colors';
import AdminEventModalConfirmationDelete from '~/components/Admin/Event/EventList/AdminEventModalConfirmationDelete';
import downloadCSV from '~/components/Utils/downloadCSV';

type Props = {|
  +event: AdminEventItem_event$key,
  +isAdmin: boolean,
|};

const FRAGMENT = graphql`
  fragment AdminEventItem_event on Event {
    id
    title
    adminUrl
    reviewStatus
    projects {
      id
      title
      url
    }
    themes {
      id
      title
      url
    }
    timeRange {
      startAt
      endAt
    }
    createdAt
    owner {
      username
    }
    guestListEnabled
    exportParticipantsUrl
    ...AdminEventModalConfirmationDelete_event
  }
`;
const AdminEventItem = ({ event: eventFragment, isAdmin }: Props): React.Node => {
  const event = useFragment(FRAGMENT, eventFragment);
  const intl = useIntl();
  const project = event.projects[0];
  return (
    <React.Fragment>
      <Td>
        {event.reviewStatus === 'DELETED' ? (
          event.title && event.title?.split('').length > 128 ? (
            <Tooltip label={event.title}>
              <Text truncate={128}>{event.title}</Text>
            </Tooltip>
          ) : (
            <Text truncate={128}>{event.title}</Text>
          )
        ) : event.title && event.title?.split('').length > 128 ? (
          <Tooltip label={event.title}>
            <Link truncate={128} href={event.adminUrl}>
              {event.title}
            </Link>
          </Tooltip>
        ) : (
          <Link truncate={128} href={event.adminUrl}>
            {event.title}
          </Link>
        )}
      </Td>

      <Td>
        <Flex direction="column">
          {project && project.title && project.url && (
            <Link href={project.url}>{project.title}</Link>
          )}
          <Flex direction="row" color="gray.500">
            {event.themes.length > 0 &&
              event.themes.map((theme, index) => {
                if (theme && theme.title && theme.url) {
                  if (index + 1 < event.themes.length) {
                    return (
                      <React.Fragment key={theme.id}>
                        <Link href={theme?.url} color={`${colors.gray['500']}!important`}>
                          {theme?.title}
                        </Link>
                        <span>, &nbsp; </span>
                      </React.Fragment>
                    );
                  }
                  return (
                    <Link
                      key={theme.id}
                      href={theme?.url}
                      color={`${colors.gray['500']}!important`}>
                      {theme?.title}
                    </Link>
                  );
                }
              })}
          </Flex>
        </Flex>
      </Td>

      <Td>
        {event.timeRange && (
          <Text fontSize={3}>
            {event.timeRange.startAt &&
              intl.formatDate(event.timeRange.startAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}{' '}
            -{' '}
            {event.timeRange.endAt &&
              intl.formatDate(event.timeRange.endAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
          </Text>
        )}
      </Td>
      {isAdmin && <Td>{event.owner && <Text fontSize={3}>{event.owner.username}</Text>}</Td>}
      <Td>
        {event.createdAt &&
          intl.formatDate(event.createdAt, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
      </Td>
      <Td visibleOnHover>
        <Flex direction="row" justify="space-evenly">
          {!!event.exportParticipantsUrl && event.guestListEnabled && (
            <ButtonQuickAction
              icon="DOWNLOAD"
              size="md"
              variantColor="primary"
              label={intl.formatMessage({ id: 'global.download' })}
              href={event?.exportParticipantsUrl || ''}
              onClick={async () => {
                if (event.exportParticipantsUrl) {
                  await downloadCSV(event.exportParticipantsUrl, intl);
                }
              }}
            />
          )}
          {event.reviewStatus !== 'DELETED' && <AdminEventModalConfirmationDelete event={event} />}
        </Flex>
      </Td>
    </React.Fragment>
  );
};

export default AdminEventItem;
