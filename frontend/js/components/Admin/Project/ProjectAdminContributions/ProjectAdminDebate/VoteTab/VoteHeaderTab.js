// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import moment from 'moment';
import InlineSelect from '~ds/InlineSelect';
import type { VoteState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import type { VoteHeaderTab_debate } from '~relay/VoteHeaderTab_debate.graphql';
import type { VoteHeaderTab_debateStep } from '~relay/VoteHeaderTab_debateStep.graphql';
import Text from '~ui/Primitives/Text';

type Props = {|
  debate: VoteHeaderTab_debate,
  debateStep: VoteHeaderTab_debateStep,
|};

export const VoteHeaderTab = ({ debate, debateStep }: Props) => {
  const { parameters, dispatch } = useProjectAdminDebateContext();
  const intl = useIntl();
  const { debateVotesPublished, debateVotesWaiting, debateVotesFor, debateVotesAgainst } = debate;
  const exportUrl = `/debate/${debate.id}/download/votes`;
  const isStepFinished = debateStep.timeless
    ? false
    : debateStep?.timeRange?.endAt
    ? moment().isAfter(((debateStep.timeRange.endAt: any): string))
    : false;

  return (
    <Flex direction="column" mb={4}>
      <Flex direction="row" justify="space-between" align="center" mb={4}>
        <InlineSelect
          value={parameters.filters.vote.state}
          onChange={value =>
            dispatch({ type: 'CHANGE_VOTE_STATE', payload: ((value: any): VoteState) })
          }>
          <InlineSelect.Choice value="PUBLISHED">
            {intl.formatMessage(
              { id: 'filter.count.status.published-masculine' },
              { num: debateVotesPublished.totalCount },
            )}
          </InlineSelect.Choice>
          <InlineSelect.Choice value="WAITING">
            {intl.formatMessage(
              {
                id: isStepFinished
                  ? 'filter.count.status.non.published'
                  : 'filter.count.status.awaiting',
              },
              { num: debateVotesWaiting.totalCount },
            )}
          </InlineSelect.Choice>
        </InlineSelect>

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

      {parameters.filters.vote.state === 'PUBLISHED' && (
        <Text color="gray.500">
          {intl.formatMessage(
            { id: 'vote-count-for-and-against' },
            { for: debateVotesFor.totalCount, against: debateVotesAgainst.totalCount },
          )}
        </Text>
      )}

      {parameters.filters.vote.state === 'WAITING' && (
        <Text color="gray.500">
          {intl.formatMessage({
            id: isStepFinished
              ? 'votes-with-account-not-confirmed-before-end-step'
              : 'votes-waiting-user-email-confirmation',
          })}
        </Text>
      )}
    </Flex>
  );
};

export default createFragmentContainer(VoteHeaderTab, {
  debate: graphql`
    fragment VoteHeaderTab_debate on Debate {
      id
      debateVotesPublished: votes(first: 0, isPublished: true) {
        totalCount
      }
      debateVotesWaiting: votes(first: 0, isPublished: false) {
        totalCount
      }
      debateVotesFor: votes(type: FOR, isPublished: true) {
        totalCount
      }
      debateVotesAgainst: votes(type: AGAINST, isPublished: true) {
        totalCount
      }
    }
  `,
  debateStep: graphql`
    fragment VoteHeaderTab_debateStep on Step {
      timeless
      timeRange {
        endAt
      }
    }
  `,
});
