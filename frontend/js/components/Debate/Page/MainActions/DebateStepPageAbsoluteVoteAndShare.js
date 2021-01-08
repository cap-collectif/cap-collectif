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
  +isMobile?: boolean,
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
  isMobile,
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
        boxShadow: isMobile ? 'none' : ' 0 10px 14px 0px white;',
      })}>
      {voteState === 'NONE' && (
        <Flex direction={['column', 'row']} spacing={4} justifyContent="center" alignItems="center">
          <Text textAlign={['center', 'left']} as="p" color="gray.900" fontSize={4}>
            {title}
          </Text>
          <DebateStepPageVote
            viewerHasArgument={viewerHasArgument}
            width="unset"
            debateId={debate.id}
            isAuthenticated={isAuthenticated}
            onSuccess={setVoteState}
          />
        </Flex>
      )}
      {voteState !== 'NONE' && (
        <DebateStepPageVoteForm
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
  );
};

export default DebateStepPageAbsoluteVoteAndShare;
