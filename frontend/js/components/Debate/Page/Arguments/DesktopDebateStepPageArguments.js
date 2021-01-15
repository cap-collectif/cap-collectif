// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import type { DesktopDebateStepPageArguments_viewer } from '~relay/DesktopDebateStepPageArguments_viewer.graphql';
import Heading from '~ui/Primitives/Heading';
import AppBox from '~/components/Ui/Primitives/AppBox';
import Button from '~ds/Button/Button';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import DebateStepPageArgumentsPagination, {
  CONNECTION_CONFIG_YES,
  CONNECTION_CONFIG_NO,
  CONNECTION_NODES_PER_PAGE,
} from './DebateStepPageArgumentsPagination';
import type { RelayHookPaginationProps as PaginationProps } from '~/types';
import { Menu } from '~ds/Menu';
import Text from '~ui/Primitives/Text';
import type { Filter } from '~/components/Debate/Page/Arguments/types';

type Props = {|
  +step: ?DebateStepPageArguments_step,
  +viewer: ?DesktopDebateStepPageArguments_viewer,
|};

export const DesktopDebateStepPageArguments = ({ step, viewer }: Props) => {
  const [filter, setFilter] = useState<Filter>('DESC');
  const [yesState, setYesState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);
  const [noState, setNoState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);

  const intl = useIntl();

  if (!step) return null;

  const argumentsCount = step?.debate?.arguments?.totalCount || 0;
  return (
    <AppBox id="DebateStepPageArguments">
      <Flex align="center" direction="row" justifyContent="space-between" mb={6}>
        <Heading as="h3" fontWeight="400" capitalize>
          <FormattedMessage id="shortcut.opinion" values={{ num: argumentsCount }} />
        </Heading>
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button p={0} rightIcon={ICON_NAME.ARROW_DOWN} color="gray.500">
              <FormattedMessage tagName={React.Fragment} id="argument.sort.label" />
            </Button>
          </Menu.Button>
          <Menu.List>
            <Menu.OptionGroup
              title={intl.formatMessage({ id: 'arguments.sort' })}
              type="radio"
              onChange={newValue => {
                setFilter(((newValue: any): Filter));
                const field = newValue === 'MOST_SUPPORTED' ? 'VOTE_COUNT' : 'PUBLISHED_AT';
                const direction = newValue === 'MOST_SUPPORTED' ? 'DESC' : newValue;
                if (yesState)
                  yesState.refetchConnection(
                    CONNECTION_CONFIG_YES,
                    CONNECTION_NODES_PER_PAGE,
                    null,
                    {
                      orderBy: { field, direction },
                      debateId: step?.debate?.id,
                      value: 'FOR',
                    },
                  );
                if (noState)
                  noState.refetchConnection(CONNECTION_CONFIG_NO, CONNECTION_NODES_PER_PAGE, null, {
                    orderBy: { field, direction },
                    debateId: step?.debate?.id,
                    value: 'AGAINST',
                  });
              }}
              value={filter}>
              <Menu.OptionItem value="DESC">
                <Text>
                  <FormattedMessage tagName={React.Fragment} id="project.sort.last" />
                </Text>
              </Menu.OptionItem>
              <Menu.OptionItem value="ASC">
                <Text>
                  <FormattedMessage tagName={React.Fragment} id="opinion.sort.old" />
                </Text>
              </Menu.OptionItem>
              <Menu.OptionItem value="MOST_SUPPORTED">
                <Text>
                  <FormattedMessage tagName={React.Fragment} id="filter.most_supported" />
                </Text>
              </Menu.OptionItem>
            </Menu.OptionGroup>
          </Menu.List>
        </Menu>
      </Flex>
      <Flex direction="row" spacing={6}>
        <Flex direction="column" flex={1}>
          <DebateStepPageArgumentsPagination
            debate={step.yesDebate}
            viewer={viewer}
            handleChange={value => {
              if (value.hasMore !== yesState?.hasMore) setYesState(value);
            }}
          />
        </Flex>
        <Flex direction="column" flex={1}>
          <DebateStepPageArgumentsPagination
            debate={step.noDebate}
            viewer={viewer}
            handleChange={value => {
              if (value.hasMore !== noState?.hasMore) setNoState(value);
            }}
          />
        </Flex>
      </Flex>
      {(yesState?.hasMore || noState?.hasMore) && (
        <Button
          m="auto"
          variant="secondary"
          variantSize="small"
          onClick={() => {
            if (yesState) yesState.loadMore(CONNECTION_CONFIG_YES, CONNECTION_NODES_PER_PAGE);
            if (noState) noState.loadMore(CONNECTION_CONFIG_NO, CONNECTION_NODES_PER_PAGE);
          }}>
          <Icon name="ADD" />
          <FormattedMessage id="global.more" />
        </Button>
      )}
    </AppBox>
  );
};

export default createFragmentContainer(DesktopDebateStepPageArguments, {
  viewer: graphql`
    fragment DesktopDebateStepPageArguments_viewer on User {
      ...DebateStepPageArgumentsPagination_viewer
    }
  `,
});
