// @flow
import React from 'react';
import css from '@styled-system/css';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageAbsoluteVoteAndShare_step } from '~relay/DebateStepPageAbsoluteVoteAndShare_step.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~/components/Ui/Primitives/AppBox';
import DebateStepPageVote from './DebateStepPageVote';
import { type VoteState } from './DebateStepPageVoteAndShare';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';

type Props = {|
  +step: DebateStepPageAbsoluteVoteAndShare_step,
  +isAuthenticated: boolean,
  +isMobile?: boolean,
  +body: string,
  +title: string,
  +voteState: VoteState,
  +setVoteState: VoteState => void,
  +showArgumentForm: boolean,
  +setShowArgumentForm: boolean => void,
  +viewerIsConfirmed: boolean,
|};

export const DebateStepPageAbsoluteVoteAndShare = ({
  step,
  isMobile,
  title,
  isAuthenticated,
  body,
  voteState,
  setVoteState,
  showArgumentForm,
  setShowArgumentForm,
  viewerIsConfirmed,
}: Props) => {
  const { debate, url } = step;

  return (
    <AppBox
      p={[6, 8]}
      width="100%"
      position="fixed"
      zIndex={999}
      {...(isMobile
        ? { bottom: 0, borderTopLeftRadius: 'poppin', borderTopRightRadius: 'poppin' }
        : { top: 50 })}
      css={css({
        marginTop: '0 !important',
        background: 'white',
        boxShadow: isMobile
          ? 'none'
          : !showArgumentForm || voteState === 'NONE'
          ? 'medium'
          : '0 10px 14px 0px white',
      })}>
      {/** I dont like this but for now we have to use the bootstrap container max-width, waiting for the DS one */}
      <AppBox
        className="container"
        css={{ padding: '0 !important', '& .recaptcha-message': { display: 'none' } }}>
        {voteState === 'NONE' && (
          <Flex
            direction={['column', 'row']}
            spacing={4}
            justifyContent="center"
            alignItems="center">
            <Text textAlign={['center', 'left']} color="gray.900" fontSize={4}>
              {title}
            </Text>
            <DebateStepPageVote
              viewerHasArgument={debate?.viewerHasArgument || false}
              width="unset"
              debateId={debate.id}
              isAuthenticated={isAuthenticated}
              onSuccess={setVoteState}
            />
          </Flex>
        )}
        {voteState !== 'NONE' && (
          <DebateStepPageVoteForm
            viewerIsConfirmed={viewerIsConfirmed}
            isMobile={isMobile}
            isAbsolute
            url={url}
            debate={debate}
            body={body}
            voteState={voteState}
            setVoteState={setVoteState}
            showArgumentForm={showArgumentForm}
            setShowArgumentForm={setShowArgumentForm}
          />
        )}
      </AppBox>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageAbsoluteVoteAndShare, {
  step: graphql`
    fragment DebateStepPageAbsoluteVoteAndShare_step on DebateStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      url
      debate {
        id
        viewerHasArgument @include(if: $isAuthenticated)
        ...DebateStepPageVoteForm_debate @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `,
});
