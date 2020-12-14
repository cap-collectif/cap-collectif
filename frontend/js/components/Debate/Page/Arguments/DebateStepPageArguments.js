// @flow
import React, { useState } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import Heading from '~ui/Primitives/Heading';
import AppBox from '~/components/Ui/Primitives/AppBox';
import Button from '~ds/Button/Button';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import Icon from '~ds/Icon/Icon';
import DebateStepPageArgumentsPagination, {
  CONNECTION_CONFIG_YES,
  CONNECTION_CONFIG_NO,
  CONNECTION_NODES_PER_PAGE,
} from './DebateStepPageArgumentsPagination';
import type { RelayHookPaginationProps as PaginationProps } from '~/types';

type Props = {|
  +step: ?DebateStepPageArguments_step,
|};

type Filter = 'ASC' | 'DESC' | 'MOST_SUPPORTED' | 'RANDOM';

export const DebateStepPageArguments = ({ step }: Props) => {
  const [filter, setFilter] = useState<Filter>('DESC');
  const [yesState, setYesState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);
  const [noState, setNoState] = useState<?{ ...PaginationProps, hasMore: boolean }>(null);

  const intl = useIntl();

  if (!step) return null;

  const argumentsCount = step?.debate?.arguments?.totalCount || 0;
  return (
    <AppBox id="DebateStepPageArguments">
      <Flex direction="row" justifyContent="space-between">
        <Heading as="h3" fontWeight="400" mb={6} capitalize>
          <FormattedMessage id="shortcut.opinion" values={{ num: argumentsCount }} />
        </Heading>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage id="argument.sort.label" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'argument.sort.label' })}>
            <DropdownSelect
              value={filter}
              title={<FormattedMessage id="arguments.sort" />}
              defaultValue="DESC"
              onChange={(newValue: Filter) => {
                setFilter(newValue);
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
              }}>
              <DropdownSelect.Choice value="DESC">
                <FormattedMessage id="project.sort.last" />
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="ASC">
                <FormattedMessage id="opinion.sort.old" />
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="MOST_SUPPORTED">
                <FormattedMessage id="filter.most_supported" />
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="RANDOM">
                <FormattedMessage id="global.filter_random" />
              </DropdownSelect.Choice>
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </Flex>
      <Flex direction="row">
        <Flex direction="column" width="50%" p={3}>
          <DebateStepPageArgumentsPagination
            debate={step.yesDebate}
            handleChange={value => {
              if (value.hasMore !== yesState?.hasMore) setYesState(value);
            }}
          />
        </Flex>
        <Flex direction="column" width="50%" p={3}>
          <DebateStepPageArgumentsPagination
            debate={step.noDebate}
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

export default createFragmentContainer(DebateStepPageArguments, {
  step: graphql`
    fragment DebateStepPageArguments_step on DebateStep {
      noDebate: debate {
        id
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            value: AGAINST
            orderBy: { field: PUBLISHED_AT, direction: DESC }
          )
      }
      yesDebate: debate {
        id
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            value: FOR
            orderBy: { field: PUBLISHED_AT, direction: DESC }
          )
      }
      debate {
        id
        arguments {
          totalCount
        }
      }
    }
  `,
});
