// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, createFragmentContainer, type RelayFragmentContainer } from 'react-relay';
import { Box, Flex, Tag, Heading, Skeleton } from '@cap-collectif/ui';
import type { DebateStepPageMainActions_step } from '~relay/DebateStepPageMainActions_step.graphql';
import RemainingTime from '~/components/Utils/RemainingTime';
import DebateStepPageMainActionsPlaceholder from './DebateStepPageMainActionPlaceholder';
import DebateStepPageVoteAndShare from './DebateStepPageVoteAndShare';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  +step: ?DebateStepPageMainActions_step,
  +isMobile: boolean,
|};

export const DebateStepPageMainActions = ({ step, isMobile }: Props): React.Node => {
  const intl = useIntl();
  const { stepClosed } = useDebateStepPage();

  return (
    <Box id={step ? 'DebateStepPageMainActions' : 'DebateStepPageMainActionsLoading'}>
      <Skeleton isLoaded={!!step} placeholder={<DebateStepPageMainActionsPlaceholder />}>
        <Flex direction="column" alignItems="center" spacing={4}>
          {stepClosed && (
            <Tag variantType="badge" variantColor="neutral-gray" icon="CLOCK">
              {intl.formatMessage({ id: 'global.ended' })}
            </Tag>
          )}

          {!stepClosed && step?.timeRange?.endAt && (
            <Tag variantType="badge" variantColor="yellow" icon="CLOCK">
              <RemainingTime noStyle endAt={step?.timeRange?.endAt} />
            </Tag>
          )}

          <Heading as="h2" mb={2} textAlign="center" color="gray.900">
            {step?.title}
          </Heading>
          {step && <DebateStepPageVoteAndShare isMobile={isMobile} step={step} />}
        </Flex>
      </Skeleton>
    </Box>
  );
};

export default (createFragmentContainer(DebateStepPageMainActions, {
  step: graphql`
    fragment DebateStepPageMainActions_step on DebateStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, isMobile: { type: "Boolean!" }) {
      title
      timeRange {
        endAt
      }
      ...DebateStepPageVoteAndShare_step
        @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageMainActions>);
