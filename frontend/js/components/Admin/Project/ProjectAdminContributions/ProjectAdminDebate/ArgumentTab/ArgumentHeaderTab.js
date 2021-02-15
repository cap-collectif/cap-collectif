// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import InlineSelect from '~ds/InlineSelect';
import type { ArgumentState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import Flex from '~ui/Primitives/Layout/Flex';
import Menu from '~ds/Menu/Menu';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import type { ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql';
import Text from '~ui/Primitives/Text';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import type { ArgumentHeaderTab_debate } from '~relay/ArgumentHeaderTab_debate.graphql';
import type { ArgumentHeaderTab_debateStep } from '~relay/ArgumentHeaderTab_debateStep.graphql';

type Props = {|
  debate: ArgumentHeaderTab_debate,
  debateStep: ArgumentHeaderTab_debateStep,
|};

export const ArgumentHeaderTab = ({ debate, debateStep }: Props) => {
  const { parameters, dispatch } = useProjectAdminDebateContext();
  const intl = useIntl();
  const {
    debateArgumentsPublished,
    debateArgumentsWaiting,
    debateArgumentsTrashed,
    argumentsFor,
    argumentsAgainst,
  } = debate;
  const exportUrl = `/debate/${debate.id}/download/arguments`;
  const hasArgumentForOrAgainst = argumentsFor.totalCount > 0 || argumentsAgainst.totalCount > 0;
  const isStepFinished = debateStep.timeless
    ? false
    : debateStep?.timeRange?.endAt
    ? moment().isAfter(((debateStep.timeRange.endAt: any): string))
    : false;

  return (
    <Flex direction="column" mb={4}>
      <Flex direction="row" justify="space-between" align="center" mb={4}>
        <InlineSelect
          value={parameters.filters.argument.state}
          onChange={value =>
            dispatch({ type: 'CHANGE_ARGUMENT_STATE', payload: ((value: any): ArgumentState) })
          }>
          <InlineSelect.Choice value="PUBLISHED">
            {intl.formatMessage(
              { id: 'filter.count.status.published-masculine' },
              { num: debateArgumentsPublished.totalCount },
            )}
          </InlineSelect.Choice>
          <InlineSelect.Choice value="WAITING">
            {intl.formatMessage(
              {
                id: isStepFinished
                  ? 'filter.count.status.non.published'
                  : 'filter.count.status.awaiting',
              },
              { num: debateArgumentsWaiting.totalCount },
            )}
          </InlineSelect.Choice>
          <InlineSelect.Choice value="TRASHED">
            {intl.formatMessage(
              { id: 'filter.count.status.trash' },
              { num: debateArgumentsTrashed.totalCount },
            )}
          </InlineSelect.Choice>
        </InlineSelect>

        <Flex direction="row" align="center" spacing={5}>
          <Menu>
            <Menu.Button as={React.Fragment}>
              <Button rightIcon={ICON_NAME.ARROW_DOWN_O} color="gray.500">
                {intl.formatMessage({ id: 'label_filters' })}
              </Button>
            </Menu.Button>

            <Menu.List>
              <Menu.OptionGroup
                value={((parameters.filters.argument.type: any): string[])}
                onChange={value =>
                  dispatch({
                    type: 'CHANGE_ARGUMENT_TYPE',
                    payload: ((value: any): ForOrAgainstValue[]),
                  })
                }
                type="checkbox"
                title={intl.formatMessage({ id: 'filter-arguments' })}>
                <Menu.OptionItem value="FOR">
                  <Text color="gray.900">{intl.formatMessage({ id: 'global.for' })}</Text>
                </Menu.OptionItem>
                <Menu.OptionItem value="AGAINST">
                  <Text color="gray.900">{intl.formatMessage({ id: 'global.against' })}</Text>
                </Menu.OptionItem>
              </Menu.OptionGroup>
            </Menu.List>
          </Menu>

          <Button
            variant="primary"
            variantColor="primary"
            variantSize="small"
            onClick={() => {
              window.location.href = exportUrl;
            }}
            aria-label={intl.formatMessage({ id: 'global.export' })}>
            {intl.formatMessage({ id: 'global.export' })}
          </Button>
        </Flex>
      </Flex>

      {parameters.filters.argument.state === 'WAITING' && hasArgumentForOrAgainst && (
        <Text color="gray.500">
          {intl.formatMessage({
            id: isStepFinished
              ? 'arguments-with-account-not-confirmed-before-end-step'
              : 'arguments-waiting-user-email-confirmation',
          })}
        </Text>
      )}
    </Flex>
  );
};

export default createFragmentContainer(ArgumentHeaderTab, {
  debate: graphql`
    fragment ArgumentHeaderTab_debate on Debate
      @argumentDefinitions(isPublished: { type: "Boolean!" }, isTrashed: { type: "Boolean!" }) {
      id
      debateArgumentsPublished: arguments(first: 0, isPublished: true, isTrashed: false) {
        totalCount
      }
      debateArgumentsWaiting: arguments(first: 0, isPublished: false, isTrashed: false) {
        totalCount
      }
      debateArgumentsTrashed: arguments(first: 0, isPublished: true, isTrashed: true) {
        totalCount
      }
      argumentsFor: arguments(
        first: 0
        value: FOR
        isPublished: $isPublished
        isTrashed: $isTrashed
      ) {
        totalCount
      }
      argumentsAgainst: arguments(
        first: 0
        value: AGAINST
        isPublished: $isPublished
        isTrashed: $isTrashed
      ) {
        totalCount
      }
    }
  `,
  debateStep: graphql`
    fragment ArgumentHeaderTab_debateStep on Step {
      timeless
      timeRange {
        endAt
      }
    }
  `,
});
