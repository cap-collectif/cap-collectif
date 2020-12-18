// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { useFragment } from 'relay-hooks';
import { FormattedMessage } from 'react-intl';
import type { Props as DetailDrawerProps } from '~ds/DetailDrawer/DetailDrawer';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateStepPageAlternateArgumentsPagination from '~/components/Debate/Page/Arguments/DebateStepPageAlternateArgumentsPagination';
import type {
  DebateStepPageArgumentsDrawer_debate,
  DebateStepPageArgumentsDrawer_debate$key,
} from '~relay/DebateStepPageArgumentsDrawer_debate.graphql';

const FRAGMENT = graphql`
  fragment DebateStepPageArgumentsDrawer_debate on Debate
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    arguments(first: 0) {
      totalCount
    }
    forArguments: arguments(first: 0, value: FOR) {
      totalCount
    }
    againstArguments: arguments(first: 0, value: AGAINST) {
      totalCount
    }
    ...DebateStepPageAlternateArgumentsPagination_debate
      @arguments(
        isAuthenticated: $isAuthenticated
        orderBy: { field: PUBLISHED_AT, direction: DESC }
      )
  }
`;

const DebateStepPageArgumentsDrawer = ({
  debate: debateFragment,
  ...drawerProps
}: {|
  ...DetailDrawerProps,
  +debate: DebateStepPageArgumentsDrawer_debate$key,
|}) => {
  const debate: DebateStepPageArgumentsDrawer_debate = useFragment(FRAGMENT, debateFragment);

  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Header textAlign="center" display="grid" gridTemplateColumns="1fr 10fr 1fr">
        <Flex direction="column">
          <Text fontWeight="bold">
            <FormattedMessage
              tagName={React.Fragment}
              id="shortcut.opinion"
              values={{ num: debate.arguments.totalCount }}
            />
          </Text>
          <Text color="neutral-gray.700">
            <FormattedMessage
              tagName={React.Fragment}
              id="vote-count-for-and-against"
              values={{
                for: debate.forArguments.totalCount,
                against: debate.againstArguments.totalCount,
              }}
            />
          </Text>
        </Flex>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex overflow="auto" height="100%" direction="column" spacing={4}>
          <DebateStepPageAlternateArgumentsPagination debate={debate} />
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageArgumentsDrawer;
