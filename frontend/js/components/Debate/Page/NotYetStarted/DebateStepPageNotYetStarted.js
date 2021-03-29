// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { DebateStepPageNotYetStarted_step } from '~relay/DebateStepPageNotYetStarted_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Tag from '~ds/Tag/Tag';
import Heading from '~ui/Primitives/Heading';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  +step: ?DebateStepPageNotYetStarted_step,
|};

export const DebateStepPageNotYetStarted = ({ step }: Props): React.Node => {
  const endDate = moment(step?.timeRange?.startAt);
  const now = moment();
  const { title } = useDebateStepPage();

  const daysUntil = endDate.diff(now, 'days');
  const hoursUntil = endDate.diff(now, 'hours');
  const minutesUntil = endDate.diff(now, 'minutes');

  let timeUntil = <FormattedMessage id="count.daysUntil" values={{ count: daysUntil }} />;
  if (daysUntil === 0 && hoursUntil === 0 && minutesUntil !== 0)
    timeUntil = <FormattedMessage id="count.minutesUntil" values={{ count: minutesUntil }} />;
  if (daysUntil === 0 && hoursUntil !== 0 && minutesUntil !== 0)
    timeUntil = <FormattedMessage id="count.hoursUntil" values={{ count: hoursUntil }} />;

  return (
    <AppBox id="DebateStepPageNotYetStarted">
      <Flex direction="column" alignItems="center" spacing={4}>
        <Tag variantType="badge" variant="blue" icon="CLOCK">
          {timeUntil}
        </Tag>
        <Heading as="h2" fontWeight="400" mb={2} textAlign="center" color="gray.900">
          {title}
        </Heading>
      </Flex>
    </AppBox>
  );
};

export default (createFragmentContainer(DebateStepPageNotYetStarted, {
  step: graphql`
    fragment DebateStepPageNotYetStarted_step on DebateStep {
      timeRange {
        startAt
      }
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageNotYetStarted>);
