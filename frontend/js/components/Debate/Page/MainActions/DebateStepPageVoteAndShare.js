// @flow
import React, { useState, useRef } from 'react';
import { graphql, createFragmentContainer, type RelayFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import type { DebateStepPageVoteAndShare_step } from '~relay/DebateStepPageVoteAndShare_step.graphql';
import VoteView from '~/components/Ui/Vote/VoteView';
import DebateStepPageVote from './DebateStepPageVote';
import type { GlobalState } from '~/types';
import DebateStepPageAbsoluteVoteAndShare from './DebateStepPageAbsoluteVoteAndShare';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';
import useOnScreen from '~/utils/hooks/useOnScreen';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';
import CookieMonster from '~/CookieMonster';

type Props = {|
  +step: DebateStepPageVoteAndShare_step,
  +isMobile?: boolean,
  +url: string,
  +viewerIsConfirmedByEmail: boolean,
  +isAuthenticated: boolean,
|};

export type VoteState =
  | 'NONE'
  | 'VOTED'
  | 'VOTED_ANONYMOUS'
  | 'ARGUMENTED'
  | 'RESULT'
  | 'NOT_CONFIRMED'
  | 'NOT_CONFIRMED_ARGUMENTED';

const getInitialState = (
  debate: $PropertyType<DebateStepPageVoteAndShare_step, 'debate'>,
  stepClosed: boolean,
  viewerIsConfirmedByEmail: boolean,
  isAnonymousVoteAllowed: boolean,
  isAuthenticated: boolean,
): VoteState => {
  if (debate.viewerHasVote && !stepClosed) {
    if (debate.viewerHasArgument)
      return viewerIsConfirmedByEmail ? 'ARGUMENTED' : 'NOT_CONFIRMED_ARGUMENTED';
    return viewerIsConfirmedByEmail ? 'VOTED' : 'NOT_CONFIRMED';
  }

  if (stepClosed) return 'RESULT';
  if (
    isAnonymousVoteAllowed &&
    CookieMonster.hasDebateAnonymousVoteCookie(debate.id) &&
    !isAuthenticated
  ) {
    return 'VOTED_ANONYMOUS';
  }

  return 'NONE';
};

export const DebateStepPageVoteAndShare = ({
  isMobile,
  viewerIsConfirmedByEmail,
  step,
  isAuthenticated,
}: Props) => {
  const { debate, url, isAnonymousParticipationAllowed } = step;
  const { stepClosed } = useDebateStepPage();
  const intl = useIntl();

  const [voteState, setVoteState] = useState<VoteState>(
    getInitialState(
      debate,
      stepClosed,
      viewerIsConfirmedByEmail,
      isAnonymousParticipationAllowed,
      isAuthenticated,
    ),
  );

  const [showArgumentForm, setShowArgumentForm] = useState(!debate.viewerHasArgument);
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  const { widget } = useDebateStepPage();

  return (
    <>
      {!isVisible && !stepClosed && !widget.isSource && (
        <DebateStepPageAbsoluteVoteAndShare
          isMobile={isMobile}
          step={step}
          voteState={voteState}
          setVoteState={setVoteState}
          showArgumentForm={showArgumentForm}
          setShowArgumentForm={setShowArgumentForm}
          viewerIsConfirmed={viewerIsConfirmedByEmail}
        />
      )}

      <Flex width="100%" direction="column" align="center" ref={ref}>
        <AnimatePresence>
          {voteState === 'NONE' && <DebateStepPageVote step={step} setVoteState={setVoteState} />}
        </AnimatePresence>
        {stepClosed && (
          <AppBox textAlign="center" mb={6}>
            <Text color="neutral-gray.700">
              {intl.formatMessage({ id: 'thanks-participation-debate-ended' })}
            </Text>

            <Text color="neutral-gray.700">
              {intl.formatMessage(
                { id: 'summary-debate-participation' },
                {
                  totalVote: debate.votes.totalCount,
                  totalArgument: debate.allArguments.totalCount,
                  totalForArgument: debate.argumentsFor.totalCount,
                  totalAgainstArgument: debate.argumentsAgainst.totalCount,
                },
              )}
            </Text>
          </AppBox>
        )}

        {voteState !== 'NONE' && (
          <>
            {debate.votes.totalCount ? (
              <VoteView
                isMobile={isMobile}
                positivePercentage={(debate.yesVotes.totalCount / debate.votes.totalCount) * 100}
                votesCount={
                  stepClosed
                    ? {
                        FOR: debate.yesVotes.totalCount,
                        AGAINST: debate.votes.totalCount - debate.yesVotes.totalCount,
                      }
                    : null
                }
              />
            ) : null}
            {!stepClosed && (
              <DebateStepPageVoteForm
                viewerIsConfirmed={viewerIsConfirmedByEmail}
                isMobile={isMobile}
                url={url}
                debate={debate}
                voteState={voteState}
                setVoteState={setVoteState}
                showArgumentForm={showArgumentForm}
                setShowArgumentForm={setShowArgumentForm}
                widgetLocation={widget.location}
                intl={intl}
              />
            )}
          </>
        )}
      </Flex>
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  viewerIsConfirmedByEmail: state.user?.user?.isEmailConfirmed,
  isAuthenticated: !!state.user.user,
});

const DebateStepPageVoteAndShareConnected = connect<any, any, _, _, _, _>(mapStateToProps)(
  DebateStepPageVoteAndShare,
);

export default (createFragmentContainer(DebateStepPageVoteAndShareConnected, {
  step: graphql`
    fragment DebateStepPageVoteAndShare_step on DebateStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, isMobile: { type: "Boolean!" }) {
      url
      isAnonymousParticipationAllowed
      debate {
        id
        viewerHasArgument @include(if: $isAuthenticated)
        viewerHasVote @include(if: $isAuthenticated)
        yesVotes: votes(isPublished: true, first: 0, type: FOR) {
          totalCount
        }
        votes(isPublished: true, first: 0) {
          totalCount
        }
        allArguments: arguments(isPublished: true, first: 0, isTrashed: false) {
          totalCount
        }
        argumentsFor: arguments(isPublished: true, first: 0, value: FOR) {
          totalCount
        }
        argumentsAgainst: arguments(isPublished: true, first: 0, value: AGAINST) {
          totalCount
        }
        ...DebateStepPageVoteForm_debate
          @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
      }
      ...DebateStepPageVote_step @arguments(isMobile: $isMobile)
      ...DebateStepPageAbsoluteVoteAndShare_step
        @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageVoteAndShareConnected>);
