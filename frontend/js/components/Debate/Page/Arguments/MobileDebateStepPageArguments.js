// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql } from 'react-relay';
import moment from 'moment';
import { useDisclosure } from '@liinkiing/react-hooks';
import { useFragment } from 'relay-hooks';
import Heading from '~ui/Primitives/Heading';
import AppBox from '~/components/Ui/Primitives/AppBox';
import Button from '~ds/Button/Button';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import type {
  MobileDebateStepPageArguments_debate,
  MobileDebateStepPageArguments_debate$key,
} from '~relay/MobileDebateStepPageArguments_debate.graphql';
import type {
  MobileDebateStepPageArguments_viewer,
  MobileDebateStepPageArguments_viewer$key,
} from '~relay/MobileDebateStepPageArguments_viewer.graphql';
import DebateStepPageAlternateArgumentsPagination from '~/components/Debate/Page/Arguments/DebateStepPageAlternateArgumentsPagination';
import DebateStepPageArgumentsDrawer from '~/components/Debate/Page/Drawers/DebateStepPageArgumentsDrawer';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';

type Props = {|
  +debate: MobileDebateStepPageArguments_debate$key,
  +viewer: ?MobileDebateStepPageArguments_viewer$key,
  +step: ?DebateStepPageArguments_step,
|};

const DEBATE_FRAGMENT = graphql`
  fragment MobileDebateStepPageArguments_debate on Debate
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    arguments(first: 0, isTrashed: false) {
      totalCount
    }
    ...DebateStepPageArgumentsDrawer_debate @arguments(isAuthenticated: $isAuthenticated)
    ...DebateStepPageAlternateArgumentsPagination_debate
      @arguments(
        isAuthenticated: $isAuthenticated
        orderBy: { field: PUBLISHED_AT, direction: DESC }
      )
  }
`;

const VIEWER_FRAGMENT = graphql`
  fragment MobileDebateStepPageArguments_viewer on User {
    ...DebateStepPageArgumentsDrawer_viewer
    ...DebateStepPageAlternateArgumentsPagination_viewer
  }
`;

export const MobileDebateStepPageArguments = ({
  debate: debateFragment,
  viewer: viewerFragment,
  step,
}: Props) => {
  const debate: MobileDebateStepPageArguments_debate = useFragment(DEBATE_FRAGMENT, debateFragment);
  const viewer: MobileDebateStepPageArguments_viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
  const { isOpen, onClose, onOpen } = useDisclosure();

  if (!debate) return null;

  const argumentsCount: number = debate.arguments?.totalCount ?? 0;

  const isStepFinished = step?.timeless
    ? false
    : step?.timeRange?.endAt
    ? moment().isAfter(moment(step.timeRange.endAt))
    : false;

  return (
    <AppBox id="DebateStepPageArguments">
      <DebateStepPageArgumentsDrawer
        onClose={onClose}
        isOpen={isOpen}
        debate={debate}
        viewer={viewer}
        isStepFinished={isStepFinished}
      />
      <Flex direction="row" justifyContent="space-between" mb={6}>
        <Heading as="h3" fontWeight="400" capitalize>
          <FormattedMessage id="shortcut.opinion" values={{ num: argumentsCount }} />
        </Heading>
        <Button onClick={onOpen} variant="link" ml="auto">
          <FormattedMessage id="global.show_all" />
        </Button>
      </Flex>
      <Flex direction="row">
        <DebateStepPageAlternateArgumentsPagination
          debate={debate}
          viewer={viewer}
          isStepFinished={isStepFinished}
          preview
        />
      </Flex>
    </AppBox>
  );
};

export default MobileDebateStepPageArguments;
