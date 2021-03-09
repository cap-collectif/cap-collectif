// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import type { DebateStepPageMainActions_step } from '~relay/DebateStepPageMainActions_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Tag from '~ds/Tag/Tag';
import Heading from '~ui/Primitives/Heading';
import RemainingTime from '~/components/Utils/RemainingTime';
import DebateStepPageMainActionsPlaceholder from './DebateStepPageMainActionPlaceholder';
import DebateStepPageVoteAndShare from './DebateStepPageVoteAndShare';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  +step: ?DebateStepPageMainActions_step,
  +isMobile: boolean,
  +isAuthenticated: boolean,
|};

export const DebateStepPageMainActions = ({ step, isMobile, isAuthenticated }: Props) => {
  const intl = useIntl();
  const { title, stepClosed } = useDebateStepPage();

  if (!step) return null;

  return (
    <AppBox id={step ? 'DebateStepPageMainActions' : 'DebateStepPageMainActionsLoading'}>
      <ReactPlaceholder ready={!!step} customPlaceholder={<DebateStepPageMainActionsPlaceholder />}>
        <Flex direction="column" alignItems="center" spacing={4}>
          {stepClosed && (
            <Tag variantType="badge" variant="neutral-gray" icon="CLOCK">
              {intl.formatMessage({ id: 'global.ended' })}
            </Tag>
          )}

          {!stepClosed && step?.timeRange?.endAt && (
            <Tag variantType="badge" variant="yellow" icon="CLOCK">
              <RemainingTime noStyle endAt={step?.timeRange?.endAt} />
            </Tag>
          )}

          <Heading as="h2" mb={2} textAlign="center" color="gray.900">
            {title}
          </Heading>
          {step && (
            <DebateStepPageVoteAndShare
              isMobile={isMobile}
              isAuthenticated={isAuthenticated}
              step={step}
            />
          )}
        </Flex>
      </ReactPlaceholder>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageMainActions, {
  step: graphql`
    fragment DebateStepPageMainActions_step on DebateStep {
      timeRange {
        endAt
      }
      ...DebateStepPageVoteAndShare_step @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
