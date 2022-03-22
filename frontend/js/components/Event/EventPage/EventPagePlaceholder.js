// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Skeleton, Flex, Text } from '@cap-collectif/ui';
import ProjectHeader from '~ui/Project/ProjectHeader';
import EventPageContent from './EventPageContent';
import EventPageHeader from './EventPageHeader';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
|};
const EventPagePlaceholder = ({ hasError, fetchData }: Props): React.Node => {
  const intl = useIntl();
  return (
    <>
      <EventPageHeader.Header>
        {hasError && <ErrorQuery retry={fetchData} />}
        <EventPageHeader.Content>
          <Skeleton.Circle size={9} />
          <EventPageHeader.Title>
            <Skeleton.Text size="sm" width="90%" />
          </EventPageHeader.Title>
          <Skeleton.Text width="25" height="20px" />
          <ProjectHeader.Socials>
            <Skeleton.Circle size={4} />
            <Skeleton.Circle size={4} />
            <Skeleton.Circle size={4} />
          </ProjectHeader.Socials>
        </EventPageHeader.Content>
        <EventPageHeader.Cover alt="" />
      </EventPageHeader.Header>
      <EventPageContent.Content>
        <Flex flexDirection="column" flex="1">
          <EventPageContent.About>
            <Skeleton.Text width="100%" height="200px" />
          </EventPageContent.About>
        </Flex>
        <EventPageContent.Aside>
          <Text as="span" fontWeight={600} fontSize={5} mb={2}>
            {intl.formatMessage({ id: 'global.admin.published_at' })}
          </Text>
          <Skeleton.Text width="100%" height="20px" />
          <Text as="span" fontWeight={600} fontSize={5} mt={8} mb={2}>
            {intl.formatMessage({ id: 'admin.fields.event.group_address' })}
          </Text>
          <Skeleton.Text width="100%" height="20px" />
        </EventPageContent.Aside>
      </EventPageContent.Content>
    </>
  );
};

export default EventPagePlaceholder;
