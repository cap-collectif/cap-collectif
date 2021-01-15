// @flow
import * as React from 'react';
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

type Props = {|
  +step: ?DebateStepPageMainActions_step,
  +isMobile: boolean,
  +title: string,
  +isAuthenticated: boolean,
|};

export const DebateStepPageMainActions = ({ step, title, isMobile, isAuthenticated }: Props) => (
  <AppBox id={step ? 'DebateStepPageMainActions' : 'DebateStepPageMainActionsLoading'}>
    <ReactPlaceholder ready={!!step} customPlaceholder={<DebateStepPageMainActionsPlaceholder />}>
      <Flex direction="column" alignItems="center" spacing={4}>
        {!step?.timeless && step?.timeRange?.endAt && (
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
            title={title}
            debate={step?.debate}
            isAuthenticated={isAuthenticated}
            url={step?.url}
          />
        )}
      </Flex>
    </ReactPlaceholder>
  </AppBox>
);

export default createFragmentContainer(DebateStepPageMainActions, {
  step: graphql`
    fragment DebateStepPageMainActions_step on DebateStep {
      timeless
      timeRange {
        endAt
      }
      url
      debate {
        ...DebateStepPageVoteAndShare_debate @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `,
});
