// @flow
import React from 'react';
import css from '@styled-system/css';
import type { DebateStepPageVoteAndShare_debate } from '~relay/DebateStepPageVoteAndShare_debate.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~/components/Ui/Primitives/AppBox';
import DebateStepPageVote from './DebateStepPageVote';
import { type VoteState } from './DebateStepPageVoteAndShare';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';

type Props = {|
  +debate: DebateStepPageVoteAndShare_debate,
  +isAuthenticated: boolean,
  +body: string,
  +title: string,
  +voteState: VoteState,
  +setVoteState: VoteState => void,
  +showArgumentForm: boolean,
  +setShowArgumentForm: boolean => void,
  +viewerHasArgument: boolean,
  +url: string,
|};

export const DebateStepPageAbsoluteVoteAndShare = ({
  debate,
  title,
  isAuthenticated,
  body,
  voteState,
  setVoteState,
  showArgumentForm,
  setShowArgumentForm,
  viewerHasArgument,
  url,
}: Props) => {
  const background =
    voteState === 'VOTED'
      ? 'linear-gradient(to bottom, rgba(255,255,255,1) 85%,rgba(255,255,255,0) 100%);'
      : 'white';
  const boxShadow = voteState === 'VOTED' ? '' : 'medium';
  return (
    <AppBox
      top={50}
      p={8}
      width="100%"
      position="fixed"
      zIndex={999}
      css={css({
        marginTop: '0 !important',
        background,
        boxShadow,
      })}>
      {voteState === 'NONE' && (
        <Flex justifyContent="center" alignItems="center">
          <Text as="p" color="gray.900" fontSize={4}>
            {title}
          </Text>
          <DebateStepPageVote
            viewerHasArgument={viewerHasArgument}
            width="unset"
            ml={4}
            debateId={debate.id}
            isAuthenticated={isAuthenticated}
            onSuccess={setVoteState}
          />
        </Flex>
      )}
      {voteState !== 'NONE' && (
        <DebateStepPageVoteForm
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
  );
};

export default DebateStepPageAbsoluteVoteAndShare;
