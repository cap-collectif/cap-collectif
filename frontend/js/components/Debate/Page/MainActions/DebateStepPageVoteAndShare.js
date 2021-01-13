// @flow
import React, { useState, useRef } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import type { DebateStepPageVoteAndShare_debate } from '~relay/DebateStepPageVoteAndShare_debate.graphql';
import VoteView from '~/components/Ui/Vote/VoteView';
import AppBox from '~/components/Ui/Primitives/AppBox';
import DebateStepPageVote from './DebateStepPageVote';
import type { GlobalState } from '~/types';
import DebateStepPageAbsoluteVoteAndShare from './DebateStepPageAbsoluteVoteAndShare';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';
import useOnScreen from '~/utils/hooks/useOnScreen';

type Props = {|
  +debate: DebateStepPageVoteAndShare_debate,
  +isMobile?: boolean,
  +isAuthenticated: boolean,
  +body: string,
  +title: string,
  +url: string,
|};

export const formName = 'debate-argument-form';

export type VoteState = 'NONE' | 'VOTED' | 'ARGUMENTED';

export const DebateStepPageVoteAndShare = ({
  debate,
  isAuthenticated,
  body,
  title,
  url,
  isMobile,
}: Props) => {
  const [voteState, setVoteState] = useState<VoteState>(
    debate.viewerHasVote ? (debate.viewerHasArgument ? 'ARGUMENTED' : 'VOTED') : 'NONE',
  );
  const [showArgumentForm, setShowArgumentForm] = useState(!debate.viewerHasArgument);
  const ref = useRef();
  const isVisible = useOnScreen(ref);

  return (
    <>
      {!isVisible && (
        <DebateStepPageAbsoluteVoteAndShare
          isMobile={isMobile}
          title={title}
          debate={debate}
          isAuthenticated={isAuthenticated}
          body={body}
          voteState={voteState}
          setVoteState={setVoteState}
          showArgumentForm={showArgumentForm}
          setShowArgumentForm={setShowArgumentForm}
          viewerHasArgument={debate.viewerHasArgument || false}
          url={url}
        />
      )}
      <AppBox width={['100%', 580]} ref={ref}>
        {voteState === 'NONE' && (
          <DebateStepPageVote
            debateId={debate.id}
            isAuthenticated={isAuthenticated}
            viewerHasArgument={debate.viewerHasArgument || false}
            onSuccess={setVoteState}
          />
        )}
        {voteState !== 'NONE' && (
          <>
            <VoteView
              isMobile={isMobile}
              positivePercentage={(debate.yesVotes.totalCount / debate.votes.totalCount) * 100}
            />
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
          </>
        )}
      </AppBox>
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

export default createFragmentContainer(connect(mapStateToProps)(form), {
  debate: graphql`
    fragment DebateStepPageVoteAndShare_debate on Debate
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...DebateStepPageVoteForm_debate @arguments(isAuthenticated: $isAuthenticated)
      id
      viewerHasArgument @include(if: $isAuthenticated)
      viewerHasVote @include(if: $isAuthenticated)
      yesVotes: votes(type: FOR) {
        totalCount
      }
      votes {
        totalCount
      }
    }
  `,
});
