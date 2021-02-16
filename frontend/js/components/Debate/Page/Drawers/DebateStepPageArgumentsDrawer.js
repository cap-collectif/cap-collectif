// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { useFragment } from 'relay-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState } from 'react';
import type { Props as DetailDrawerProps } from '~ds/DetailDrawer/DetailDrawer';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateStepPageAlternateArgumentsPagination, {
  CONNECTION_CONFIG,
} from '~/components/Debate/Page/Arguments/DebateStepPageAlternateArgumentsPagination';
import type {
  DebateStepPageArgumentsDrawer_debate,
  DebateStepPageArgumentsDrawer_debate$key,
} from '~relay/DebateStepPageArgumentsDrawer_debate.graphql';
import type {
  DebateStepPageArgumentsDrawer_viewer,
  DebateStepPageArgumentsDrawer_viewer$key,
} from '~relay/DebateStepPageArgumentsDrawer_viewer.graphql';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import type { RelayHookPaginationProps as PaginationProps } from '~/types';
import { CONNECTION_NODES_PER_PAGE } from '~/components/Debate/Page/Arguments/DebateStepPageArgumentsPagination';
import type { Filter } from '~/components/Debate/Page/Arguments/types';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import ListOptionGroup from '~ds/List/ListOptionGroup';

const DEBATE_FRAGMENT = graphql`
  fragment DebateStepPageArgumentsDrawer_debate on Debate
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    arguments(first: 0, isTrashed: false) {
      totalCount
    }
    forArguments: arguments(first: 0, value: FOR, isTrashed: false) {
      totalCount
    }
    againstArguments: arguments(first: 0, value: AGAINST, isTrashed: false) {
      totalCount
    }
    ...DebateStepPageAlternateArgumentsPagination_debate
      @arguments(
        isAuthenticated: $isAuthenticated
        orderBy: { field: PUBLISHED_AT, direction: DESC }
      )
  }
`;

const VIEWER_FRAGMENT = graphql`
  fragment DebateStepPageArgumentsDrawer_viewer on User {
    ...DebateStepPageAlternateArgumentsPagination_viewer
  }
`;

const DebateStepPageArgumentsDrawer = ({
  debate: debateFragment,
  viewer: viewerFragment,
  isStepFinished,
  ...drawerProps
}: {|
  ...DetailDrawerProps,
  +debate: DebateStepPageArgumentsDrawer_debate$key,
  +viewer: ?DebateStepPageArgumentsDrawer_viewer$key,
  +isStepFinished: boolean,
|}) => {
  const intl = useIntl();
  const debate: DebateStepPageArgumentsDrawer_debate = useFragment(DEBATE_FRAGMENT, debateFragment);
  const viewer: DebateStepPageArgumentsDrawer_viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
  const [filter, setFilter] = useState<Filter>('DESC');
  const [connection, setConnection] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);

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

        <Modal
          disclosure={
            <Button rightIcon={ICON_NAME.ARROW_DOWN} color="gray.500">
              <FormattedMessage tagName={React.Fragment} id="argument.sort.label" />
            </Button>
          }
          ariaLabel={intl.formatMessage({ id: 'arguments.sort' })}>
          {({ hide }) => (
            <>
              <Modal.Header>
                <Heading as="h4">{intl.formatMessage({ id: 'arguments.sort' })}</Heading>
              </Modal.Header>

              <Modal.Body pb={6}>
                <ListOptionGroup
                  value={filter}
                  onChange={newFilter => {
                    setFilter(((newFilter: any): Filter));
                    const field = newFilter === 'MOST_SUPPORTED' ? 'VOTE_COUNT' : 'PUBLISHED_AT';
                    const direction = newFilter === 'MOST_SUPPORTED' ? 'DESC' : newFilter;
                    if (connection)
                      connection.refetchConnection(
                        CONNECTION_CONFIG,
                        CONNECTION_NODES_PER_PAGE,
                        null,
                        {
                          orderBy: { field, direction },
                          debateId: debate?.id,
                        },
                      );
                    hide();
                  }}
                  type="radio">
                  <ListOptionGroup.Item value="DESC">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="project.sort.last" />
                    </Text>
                  </ListOptionGroup.Item>
                  <ListOptionGroup.Item value="ASC">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="opinion.sort.old" />
                    </Text>
                  </ListOptionGroup.Item>
                  <ListOptionGroup.Item value="MOST_SUPPORTED">
                    <Text>
                      <FormattedMessage tagName={React.Fragment} id="filter.most_supported" />
                    </Text>
                  </ListOptionGroup.Item>
                </ListOptionGroup>
              </Modal.Body>
            </>
          )}
        </Modal>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex overflow="auto" height="100%" direction="column" spacing={4}>
          <DebateStepPageAlternateArgumentsPagination
            handleChange={value => {
              if (value.hasMore !== connection?.hasMore) setConnection(value);
            }}
            debate={debate}
            viewer={viewer}
            isStepFinished={isStepFinished}
          />
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageArgumentsDrawer;
