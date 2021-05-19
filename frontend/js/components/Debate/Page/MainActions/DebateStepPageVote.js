// @flow
import React, { useEffect, useState, type Node } from 'react';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { m as motion } from 'framer-motion';
import css from '@styled-system/css';
import { useAnalytics } from 'use-analytics';
import { useActor } from '@xstate/react';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import AddDebateVoteMutation, { type OptimisticResponse } from '~/mutations/AddDebateVoteMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { MachineContext, type VoteAction, type VoteState } from './DebateStepPageStateMachine';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Captcha from '~/components/Form/Captcha';
import Text from '~ui/Primitives/Text';
import AddDebateAnonymousVoteMutation from '~/mutations/AddDebateAnonymousVoteMutation';
import { SPACES_SCALES } from '~/styles/theme/base';
import CookieMonster from '~/CookieMonster';
import ConditionalWrapper from '~/components/Utils/ConditionalWrapper';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import type { DebateStepPageVote_step } from '~relay/DebateStepPageVote_step.graphql';
import type { GlobalState } from '~/types';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  ...AppBoxProps,
  +step: DebateStepPageVote_step,
  +top?: boolean,
|};

const anonymousVoteForDebate = (
  debateId: string,
  captcha: string,
  type: 'FOR' | 'AGAINST',
  widgetLocation: ?string,
  intl: IntlShape,
  send: (state: VoteAction) => void,
) => {
  return AddDebateAnonymousVoteMutation.commit({
    input: { debateId, type, captcha, widgetOriginURI: widgetLocation },
  })
    .then(response => {
      if (response.addDebateAnonymousVote?.errorCode) {
        mutationErrorToast(intl);
      } else {
        if (response.addDebateAnonymousVote?.token) {
          CookieMonster.addDebateAnonymousVoteCookie(debateId, {
            type,
            token: response.addDebateAnonymousVote.token,
          });
        }
        send('VOTE');
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const voteForDebate = (
  debateId: string,
  type: 'FOR' | 'AGAINST',
  widgetLocation: ?string,
  intl: IntlShape,
  send: (state: VoteAction) => void,
  isAuthenticated: boolean,
  optimisticData: OptimisticResponse,
) => {
  // For optimistic response
  send('VOTE');

  return AddDebateVoteMutation.commit(
    { input: { debateId, type, widgetOriginURI: widgetLocation } },
    optimisticData,
  )
    .then(response => {
      if (response.addDebateVote?.errorCode) {
        mutationErrorToast(intl);
        send('DELETE_VOTE');
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
      send('DELETE_VOTE');
    });
};

const buttonColor = (styleColor: string, disabled: boolean) => ({
  opacity: disabled ? '.6' : '1',
  color: `${styleColor}.500`,
  backgroundColor: `${styleColor}.100`,
  borderColor: `${styleColor}.500`,
  border: '1px solid',
  '&:hover': {
    boxShadow: '0px 10px 50px 0px rgba(0, 0, 0, 0.15)',
  },
  '&:focus': {
    backgroundColor: `${styleColor}.500`,
    color: 'white',
    borderColor: `${styleColor}.500`,
  },
});

const Container = motion.custom(Flex);

export const DebateStepPageVote = ({ step, top, ...props }: Props): Node => {
  const isEmailConfirmed: boolean = useSelector(
    (state: GlobalState) => state.user?.user?.isEmailConfirmed || false,
  );
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);
  const { track } = useAnalytics();
  const intl = useIntl();
  const { widget } = useDebateStepPage();
  const [isHover, setIsHover] = useState<'FOR' | 'AGAINST' | false>(false);
  const [captcha, setCaptcha] = useState<{
    visible: boolean,
    value: ?string,
    voteType: 'FOR' | 'AGAINST',
  }>({
    visible: false,
    value: null,
    voteType: 'AGAINST',
  });
  const machine = React.useContext(MachineContext);
  const [, send] = useActor<{ value: VoteState }, VoteAction>(machine);

  useEffect(() => {
    if (captcha.value) {
      anonymousVoteForDebate(
        step.debate.id,
        captcha.value,
        captcha.voteType,
        widget.location,
        intl,
        send,
      );
    }
  }, [step.debate.id, captcha.value, captcha.voteType, widget.location, intl, send]);

  const optimisticData: OptimisticResponse = {
    yesVotes: step.debate.yesVotes.totalCount,
    votes: step.debate.votes.totalCount,
    viewerConfirmed: isEmailConfirmed,
  };

  return (
    <Container
      transition={{ duration: 0.5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      direction="row"
      alignItems="center"
      spacing={6}
      justifyContent="center"
      width="100%"
      {...props}>
      {!captcha.visible && (
        <>
          <ConditionalWrapper
            when={!step.isAnonymousParticipationAllowed}
            wrapper={children => (
              <LoginOverlay placement={top ? 'top' : 'bottom'}>{children}</LoginOverlay>
            )}>
            <Button
              onMouseEnter={() => setIsHover('FOR')}
              onMouseLeave={() => setIsHover(false)}
              css={css(buttonColor('green', isHover === 'AGAINST'))}
              variantSize="big"
              onClick={() => {
                if (isAuthenticated) {
                  track('debate_vote_click', { type: 'FOR', url: step.debate.url });
                  voteForDebate(
                    step.debate.id,
                    'FOR',
                    widget.location,
                    intl,
                    send,
                    isAuthenticated,
                    optimisticData,
                  );
                } else {
                  setCaptcha(c => ({ ...c, visible: true, voteType: 'FOR' }));
                }
              }}
              leftIcon="THUMB_UP">
              <FormattedMessage id="global.for" />
            </Button>
          </ConditionalWrapper>

          <ConditionalWrapper
            when={!step.isAnonymousParticipationAllowed}
            wrapper={children => (
              <LoginOverlay placement={top ? 'top' : 'bottom'}>{children}</LoginOverlay>
            )}>
            <Button
              onMouseEnter={() => setIsHover('AGAINST')}
              onMouseLeave={() => setIsHover(false)}
              css={css(buttonColor('red', isHover === 'FOR'))}
              variantSize="big"
              onClick={() => {
                if (isAuthenticated) {
                  track('debate_vote_click', { type: 'AGAINST', url: step.debate.url });
                  voteForDebate(
                    step.debate.id,
                    'AGAINST',
                    widget.location,
                    intl,
                    send,
                    isAuthenticated,
                    optimisticData,
                  );
                } else {
                  setCaptcha(c => ({ ...c, visible: true, voteType: 'AGAINST' }));
                }
              }}
              leftIcon="THUMB_DOWN">
              <FormattedMessage id="global.against" />
            </Button>
          </ConditionalWrapper>
        </>
      )}

      {captcha.visible && (
        <Flex direction="column" align="center">
          <Text
            css={css({
              mb: `${SPACES_SCALES[6]} !important`,
            })}
            className="recaptcha-message"
            color="neutral-gray.700">
            {intl.formatMessage({ id: 'publish-anonymous-debate-vote-bot' })}
          </Text>
          <Captcha
            style={{ transformOrigin: 'center' }}
            value={captcha.value}
            onChange={value => setCaptcha(c => ({ ...c, value }))}
          />
        </Flex>
      )}
    </Container>
  );
};

export default (createFragmentContainer(DebateStepPageVote, {
  step: graphql`
    fragment DebateStepPageVote_step on DebateStep
      @argumentDefinitions(isMobile: { type: "Boolean!" }) {
      isAnonymousParticipationAllowed
      debate {
        url
        id
        yesVotes: votes(isPublished: true, first: 0, type: FOR) {
          totalCount
        }
        votes(isPublished: true, first: 0) {
          totalCount
        }
      }
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageVote>);
