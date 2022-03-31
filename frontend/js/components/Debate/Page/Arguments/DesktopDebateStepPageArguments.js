// @flow
import React, { useState, type Node } from 'react';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Heading, Box, Button, Flex, Menu, Text, CapUIIcon } from '@cap-collectif/ui';
import styled from 'styled-components';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import type { DesktopDebateStepPageArguments_viewer } from '~relay/DesktopDebateStepPageArguments_viewer.graphql';
import DebateStepPageArgumentsPagination, {
  CONNECTION_CONFIG_YES,
  CONNECTION_CONFIG_NO,
  CONNECTION_NODES_PER_PAGE,
} from './DebateStepPageArgumentsPagination';
import type { RelayHookPaginationProps as PaginationProps } from '~/types';
import type { Filter } from '~/components/Debate/Page/Arguments/types';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  +step: ?DebateStepPageArguments_step,
  +viewer: ?DesktopDebateStepPageArguments_viewer,
|};

const OptionItem = styled(Menu.OptionItem)`
  border-left: 0;
  border-right: 0;
  border-top: 0;
  background-color: white;
  input {
    margin-left: 4px;
    margin-right: 8px;
    margin-top: 0;
  }
`;

export const DesktopDebateStepPageArguments = ({ step, viewer }: Props): Node => {
  const { stepClosed } = useDebateStepPage();
  const [filter, setFilter] = useState<Filter>('DESC');
  const [yesState, setYesState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);
  const [noState, setNoState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);

  const intl = useIntl();

  if (!step) return null;

  const viewerUnpublishedArgument = step?.debate?.viewerUnpublishedArgument;

  const argumentsCount = step?.debate?.arguments?.totalCount || 0;

  return (
    <Box id="DebateStepPageArguments">
      {!stepClosed && (
        <Flex align="center" direction="row" justifyContent="space-between" mb={6}>
          <Heading as="h3" fontWeight="400" capitalize>
            <FormattedMessage id="shortcut.opinion" values={{ num: argumentsCount }} />
          </Heading>
          <Menu
            disclosure={
              <Button rightIcon={CapUIIcon.ArrowDown} variantColor="hierarchy" variant="tertiary">
                <FormattedMessage tagName={React.Fragment} id="argument.sort.label" />
              </Button>
            }>
            <Menu.List>
              <Menu.OptionGroup
                title={intl.formatMessage({ id: 'arguments.sort' }).toUpperCase()}
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
                    noState.refetchConnection(
                      CONNECTION_CONFIG_NO,
                      CONNECTION_NODES_PER_PAGE,
                      null,
                      {
                        orderBy: { field, direction },
                        debateId: step?.debate?.id,
                        value: 'AGAINST',
                      },
                    );
                }}
                value={filter}>
                <OptionItem value="DESC">
                  <Text>
                    <FormattedMessage tagName={React.Fragment} id="project.sort.last" />
                  </Text>
                </OptionItem>
                <OptionItem value="ASC">
                  <Text>
                    <FormattedMessage tagName={React.Fragment} id="opinion.sort.old" />
                  </Text>
                </OptionItem>
                <OptionItem value="MOST_SUPPORTED">
                  <Text>
                    <FormattedMessage tagName={React.Fragment} id="filter.most_supported" />
                  </Text>
                </OptionItem>
              </Menu.OptionGroup>
            </Menu.List>
          </Menu>
        </Flex>
      )}

      <Flex direction="row" spacing={6}>
        <Flex direction="column" flex={1}>
          <DebateStepPageArgumentsPagination
            viewerUnpublishedArgument={
              viewerUnpublishedArgument?.type === 'FOR' ? viewerUnpublishedArgument : null
            }
            debate={step.yesDebate}
            viewer={viewer}
            handleChange={value => {
              if (value.hasMore !== yesState?.hasMore) setYesState(value);
            }}
          />
        </Flex>

        <Flex direction="column" flex={1}>
          <DebateStepPageArgumentsPagination
            viewerUnpublishedArgument={
              viewerUnpublishedArgument?.type === 'AGAINST' ? viewerUnpublishedArgument : null
            }
            debate={step.noDebate}
            viewer={viewer}
            handleChange={value => {
              if (value.hasMore !== noState?.hasMore) setNoState(value);
            }}
          />
        </Flex>
      </Flex>
      {(yesState?.hasMore || noState?.hasMore) && (
        <Flex width="100%" justify="center">
          <Button
            variant="secondary"
            variantSize="small"
            onClick={() => {
              if (yesState) yesState.loadMore(CONNECTION_CONFIG_YES, CONNECTION_NODES_PER_PAGE);
              if (noState) noState.loadMore(CONNECTION_CONFIG_NO, CONNECTION_NODES_PER_PAGE);
            }}
            leftIcon={CapUIIcon.Add}>
            <FormattedMessage id="global.more" />
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default (createFragmentContainer(DesktopDebateStepPageArguments, {
  viewer: graphql`
    fragment DesktopDebateStepPageArguments_viewer on User {
      ...DebateStepPageArgumentsPagination_viewer
    }
  `,
}): RelayFragmentContainer<typeof DesktopDebateStepPageArguments>);
