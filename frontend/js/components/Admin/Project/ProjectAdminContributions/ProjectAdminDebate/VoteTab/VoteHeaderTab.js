// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import InlineSelect from '~ds/InlineSelect';
import type { VoteState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import type { VoteHeaderTab_debate } from '~relay/VoteHeaderTab_debate.graphql';
import type { VoteHeaderTab_debateStep } from '~relay/VoteHeaderTab_debateStep.graphql';

type Props = {|
  debate: VoteHeaderTab_debate,
  debateStep: VoteHeaderTab_debateStep,
|};

export const VoteHeaderTab = ({ debate, debateStep }: Props) => {
  const { parameters, dispatch } = useProjectAdminDebateContext();
  const intl = useIntl();
  const { debateVotesPublished, debateVotesWaiting, allDebateVote } = debate;
  const exportUrl = `/debate/${debate.id}/download/votes`;
  const isStepClosed = debateStep?.timeRange?.hasEnded;

  return (
    <Flex direction="row" justify="space-between" align="center" mb={4}>
      <InlineSelect
        value={parameters.filters.vote.state}
        onChange={value =>
          dispatch({ type: 'CHANGE_VOTE_STATE', payload: ((value: any): VoteState) })
        }>
        <InlineSelect.Choice value="ALL">
          {intl.formatMessage(
            { id: 'filter.count.status.all.masculine' },
            { num: allDebateVote.totalCount },
          )}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="PUBLISHED">
          {intl.formatMessage(
            { id: 'filter.count.status.published-masculine' },
            { num: debateVotesPublished.totalCount },
          )}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="WAITING">
          {intl.formatMessage(
            {
              id: isStepClosed
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
  );
};

export default createFragmentContainer(VoteHeaderTab, {
  debate: graphql`
    fragment VoteHeaderTab_debate on Debate {
      id
      allDebateVote: votes(first: 0, isPublished: null) {
        totalCount
      }
      debateVotesPublished: votes(first: 0, isPublished: true) {
        totalCount
      }
      debateVotesWaiting: votes(first: 0, isPublished: false) {
        totalCount
      }
    }
  `,
  debateStep: graphql`
    fragment VoteHeaderTab_debateStep on Step {
      timeRange {
        hasEnded
      }
    }
  `,
});
