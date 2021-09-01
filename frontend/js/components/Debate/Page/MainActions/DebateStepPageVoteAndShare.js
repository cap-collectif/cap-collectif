// @flow
import React, { useState, useRef, useEffect, type Node } from 'react';
import { graphql, createFragmentContainer, type RelayFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import { useMachine } from '@xstate/react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { useScrollYPosition } from 'react-use-scroll-position';
import type { DebateStepPageVoteAndShare_step } from '~relay/DebateStepPageVoteAndShare_step.graphql';
import VoteView from '~/components/Ui/Vote/VoteView';
import DebateStepPageVote from './DebateStepPageVote';
import type { GlobalState } from '~/types';
import DebateStepPageAbsoluteVoteAndShare from './DebateStepPageAbsoluteVoteAndShare';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';
import useOnScreen from '~/utils/hooks/useOnScreen';
import Flex from '~ui/Primitives/Layout/Flex';
import Heading from '~ui/Primitives/Heading';
import AppBox from '~ui/Primitives/AppBox';
import CookieMonster from '~/CookieMonster';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';
import {
  debateStateMachine,
  getInitialState,
  MachineContext,
  type VoteState,
} from './DebateStepPageStateMachine';

type Props = {|
  +step: DebateStepPageVoteAndShare_step,
  +isMobile?: boolean,
|};

export const DebateStepPageVoteAndShare = ({ isMobile, step }: Props): Node => {
  const { debate, url, isAnonymousParticipationAllowed } = step;
  const { stepClosed } = useDebateStepPage();
  const viewerIsConfirmedByEmail: boolean = useSelector(
    (state: GlobalState) => state.user?.user?.isEmailConfirmed || false,
  );
  const scrollY: number = useScrollYPosition();
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);

  const intl = useIntl();

  const [current, send, service] = useMachine(debateStateMachine);
  const { value }: { value: VoteState } = current;
  useEffect(() => {
    send(
      getInitialState(
        debate,
        stepClosed,
        viewerIsConfirmedByEmail,
        isAnonymousParticipationAllowed,
        isAuthenticated,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showArgumentForm, setShowArgumentForm] = useState(
    (isAuthenticated && !debate.viewerHasArgument) ||
      (!isAuthenticated && !CookieMonster.hasDebateAnonymousArgumentCookie(debate.id)),
  );
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  const { widget } = useDebateStepPage();
  return (
    <MachineContext.Provider value={service}>
      {value !== 'idle' && !isVisible && !stepClosed && !widget.isSource && scrollY > 300 && (
        <DebateStepPageAbsoluteVoteAndShare
          isMobile={isMobile}
          step={step}
          showArgumentForm={showArgumentForm}
          setShowArgumentForm={setShowArgumentForm}
          viewerIsConfirmed={viewerIsConfirmedByEmail}
        />
      )}

      <Flex width="100%" direction="column" align="center" ref={ref}>
        <AnimatePresence>
          {value.includes('none') && <DebateStepPageVote step={step} />}
        </AnimatePresence>
        {stepClosed && (
          <AppBox textAlign="center" mb={6}>
            <Heading as="h3" color="neutral-gray.900" fontSize={[16, 24]} fontWeight={400}>
              {intl.formatMessage(
                { id: 'summary-debate-participation' },
                {
                  totalVote: debate.votes.totalCount,
                  totalArgument: debate.allArguments.totalCount,
                  totalForArgument: debate.argumentsFor.totalCount,
                  totalAgainstArgument: debate.argumentsAgainst.totalCount,
                },
              )}
            </Heading>
            <Heading as="h3" color="neutral-gray.900" fontSize={[16, 24]} fontWeight={400}>
              {intl.formatMessage({ id: 'thanks-participation-debate-ended' })}
            </Heading>
          </AppBox>
        )}

        {value !== 'idle' && !value.includes('none') && (
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
                showArgumentForm={showArgumentForm}
                setShowArgumentForm={setShowArgumentForm}
                widgetLocation={widget.location}
                intl={intl}
                send={send}
              />
            )}
          </>
        )}
      </Flex>
    </MachineContext.Provider>
  );
};

export default (createFragmentContainer(DebateStepPageVoteAndShare, {
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
}): RelayFragmentContainer<typeof DebateStepPageVoteAndShare>);
