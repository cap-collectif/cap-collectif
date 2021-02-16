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
|};

export const formName = 'debate-argument-form';

export type VoteState = 'NONE' | 'VOTED' | 'ARGUMENTED' | 'RESULT';

const getInitialState = (
  debate: $PropertyType<DebateStepPageVoteAndShare_step, 'debate'>,
  isStepFinished: boolean,
): VoteState => {
  if (debate.viewerHasVote) {
    if (debate.viewerHasArgument) return 'ARGUMENTED';
    return 'VOTED';
  }

  if (isStepFinished) return 'RESULT';

  return 'NONE';
};

export const DebateStepPageVoteAndShare = ({
  isAuthenticated,
  body,
  title,
  isMobile,
  step,
}: Props) => {
  const { debate, url, timeless, timeRange } = step;
  const isStepFinished = timeless
    ? false
    : timeRange?.endAt
      ? moment().isAfter(moment(timeRange.endAt))
    : false;

  const [voteState, setVoteState] = useState<VoteState>(getInitialState(debate, isStepFinished));
  const [showArgumentForm, setShowArgumentForm] = useState(!debate.viewerHasArgument);
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  const intl = useIntl();

  return (
    <>
      {!isVisible && !isStepFinished && (
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

        {isStepFinished && (
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
                voteState === 'RESULT'
                  ? {
                      FOR: debate.yesVotes.totalCount,
                      AGAINST: debate.votes.totalCount - debate.yesVotes.totalCount,
                    }
                  : null
              }
            />

            {voteState !== 'RESULT' && (
              <DebateStepPageVoteForm
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
