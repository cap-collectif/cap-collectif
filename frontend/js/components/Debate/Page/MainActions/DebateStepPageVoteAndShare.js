// @flow
import React, { useState, useRef } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, formValueSelector } from 'redux-form';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
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

type Props = {|
  +step: DebateStepPageVoteAndShare_step,
  +isMobile?: boolean,
  +isAuthenticated: boolean,
  +body: string,
  +title: string,
  +url: string,
  +viewerIsConfirmedByEmail: boolean,
|};

export const formName = 'debate-argument-form';

export type VoteState =
  | 'NONE'
  | 'VOTED'
  | 'ARGUMENTED'
  | 'RESULT'
  | 'NOT_CONFIRMED'
  | 'NOT_CONFIRMED_ARGUMENTED';

const getInitialState = (
  debate: $PropertyType<DebateStepPageVoteAndShare_step, 'debate'>,
  isStepClosed: boolean,
  viewerIsConfirmedByEmail: boolean,
): VoteState => {
  if (debate.viewerHasVote && !isStepClosed) {
    if (debate.viewerHasArgument)
      return viewerIsConfirmedByEmail ? 'ARGUMENTED' : 'NOT_CONFIRMED_ARGUMENTED';
    return viewerIsConfirmedByEmail ? 'VOTED' : 'NOT_CONFIRMED';
  }

  if (isStepClosed) return 'RESULT';

  return 'NONE';
};

export const DebateStepPageVoteAndShare = ({
  isAuthenticated,
  body,
  title,
  isMobile,
  viewerIsConfirmedByEmail,
  step,
}: Props) => {
  const { debate, url, timeless, timeRange } = step;
  const isStepFinished = timeless
    ? false
    : timeRange?.endAt
    ? moment().isAfter(moment(timeRange.endAt))
    : false;
  const isStartedAndNoEndDate = timeless
    ? false
    : !timeRange?.endAt && moment().isAfter(moment(timeRange.startAt));
  const isStepClosed = isStepFinished || isStartedAndNoEndDate;

  const [voteState, setVoteState] = useState<VoteState>(
    getInitialState(debate, isStepClosed, viewerIsConfirmedByEmail),
  );

  const [showArgumentForm, setShowArgumentForm] = useState(!debate.viewerHasArgument);
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  const intl = useIntl();

  return (
    <>
      {!isVisible && !isStepClosed && (
        <DebateStepPageAbsoluteVoteAndShare
          isMobile={isMobile}
          title={title}
          step={step}
          isAuthenticated={isAuthenticated}
          body={body}
          voteState={voteState}
          setVoteState={setVoteState}
          showArgumentForm={showArgumentForm}
          setShowArgumentForm={setShowArgumentForm}
          viewerIsConfirmed={viewerIsConfirmedByEmail}
        />
      )}

      <Flex width="100%" direction="column" align="center" ref={ref}>
        {voteState === 'NONE' && (
          <DebateStepPageVote
            debateId={debate.id}
            isAuthenticated={isAuthenticated}
            viewerHasArgument={debate.viewerHasArgument || false}
            onSuccess={setVoteState}
          />
        )}

        {isStepClosed && (
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
            <VoteView
              isMobile={isMobile}
              positivePercentage={(debate.yesVotes.totalCount / debate.votes.totalCount) * 100}
              votesCount={
                isStepClosed
                  ? {
                      FOR: debate.yesVotes.totalCount,
                      AGAINST: debate.votes.totalCount - debate.yesVotes.totalCount,
                    }
                  : null
              }
            />

            {!isStepClosed && (
              <DebateStepPageVoteForm
                viewerIsConfirmed={viewerIsConfirmedByEmail}
                isMobile={isMobile}
                url={url}
                debate={debate}
                body={body}
                voteState={voteState}
                setVoteState={setVoteState}
                showArgumentForm={showArgumentForm}
                setShowArgumentForm={setShowArgumentForm}
              />
            )}
          </>
        )}
      </Flex>
    </>
  );
};

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState) => ({
  viewerIsConfirmedByEmail: state.user?.user?.isEmailConfirmed,
  initialValues: {
    body: '',
  },
  body: selector(state, 'body'),
});

const form = reduxForm({
  form: formName,
})(DebateStepPageVoteAndShare);

const DebateStepPageVoteAndShareConnected = connect(mapStateToProps)(form);

export default createFragmentContainer(DebateStepPageVoteAndShareConnected, {
  step: graphql`
    fragment DebateStepPageVoteAndShare_step on DebateStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      url
      timeless
      timeRange {
        startAt
        endAt
      }
      debate {
        id
        viewerHasArgument @include(if: $isAuthenticated)
        viewerHasVote @include(if: $isAuthenticated)
        yesVotes: votes(first: 0, type: FOR) {
          totalCount
        }
        votes(first: 0) {
          totalCount
        }
        allArguments: arguments(first: 0) {
          totalCount
        }
        argumentsFor: arguments(first: 0, value: FOR) {
          totalCount
        }
        argumentsAgainst: arguments(first: 0, value: AGAINST) {
          totalCount
        }
        ...DebateStepPageVoteForm_debate @arguments(isAuthenticated: $isAuthenticated)
      }
      ...DebateStepPageAbsoluteVoteAndShare_step @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
