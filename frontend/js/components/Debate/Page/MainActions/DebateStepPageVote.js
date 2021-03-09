// @flow
import React, { useEffect, useState } from 'react';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { m as motion } from 'framer-motion';
import css from '@styled-system/css';
import { useAnalytics } from 'use-analytics';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import AddDebateVoteMutation from '~/mutations/AddDebateVoteMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { type VoteState } from './DebateStepPageVoteAndShare';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Captcha from '~/components/Form/Captcha';
import Text from '~ui/Primitives/Text';
import AddDebateAnonymousVoteMutation from '~/mutations/AddDebateAnonymousVoteMutation';
import { SPACES_SCALES } from '~/styles/theme/base';
import CookieMonster from '~/CookieMonster';

type Props = {|
  ...AppBoxProps,
  +debateId: string,
  +isAuthenticated: boolean,
  +onSuccess: VoteState => void,
  +viewerHasArgument: boolean,
|};

const anonymousVoteForDebate = (
  debateId: string,
  captcha: string,
  type: 'FOR' | 'AGAINST',
  intl: IntlShape,
  onSuccess: (state: VoteState) => void,
) => {
  return AddDebateAnonymousVoteMutation.commit({ input: { debateId, type, captcha } })
    .then(response => {
      if (response.addDebateAnonymousVote?.errorCode) {
        mutationErrorToast(intl);
      } else {
        onSuccess('VOTED_ANONYMOUS');
        if (response.addDebateAnonymousVote?.debateAnonymousVote?.token) {
          CookieMonster.addDebateAnonymousVoteCookie(debateId, {
            type,
            token: response.addDebateAnonymousVote?.debateAnonymousVote?.token,
          });
        }
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const voteForDebate = (
  debateId: string,
  type: 'FOR' | 'AGAINST',
  intl: IntlShape,
  onSuccess: VoteState => void,
  isAuthenticated: boolean,
  viewerHasArgument: boolean,
) => {
  return AddDebateVoteMutation.commit({ input: { debateId, type }, isAuthenticated })
    .then(response => {
      if (response.addDebateVote?.errorCode) {
        mutationErrorToast(intl);
      } else {
        onSuccess(
          response.addDebateVote?.debateVote?.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION'
            ? 'NOT_CONFIRMED'
            : viewerHasArgument
            ? 'ARGUMENTED'
            : 'VOTED',
        );
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
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

export const DebateStepPageVote = ({
  debateId,
  isAuthenticated,
  onSuccess,
  viewerHasArgument,
  ...props
}: Props) => {
  const { track } = useAnalytics();
  const intl = useIntl();
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
  useEffect(() => {
    if (captcha.value) {
      anonymousVoteForDebate(debateId, captcha.value, captcha.voteType, intl, onSuccess);
    }
  }, [debateId, captcha.value, captcha.voteType, intl, onSuccess]);
  return (
    <Container
      transition={{ duration: 0.5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      direction="row"
      alignItems="center"
      spacing={6}
      justifyContent="center"
      width="100%"
      {...props}>
      {!captcha.visible && (
        <>
          <Button
            onMouseEnter={() => setIsHover('FOR')}
            onMouseLeave={() => setIsHover(false)}
            css={css(buttonColor('green', isHover === 'AGAINST'))}
            variantSize="big"
            onClick={() => {
              if (isAuthenticated) {
                track('debate_vote_click', { type: 'FOR' });
                voteForDebate(debateId, 'FOR', intl, onSuccess, isAuthenticated, viewerHasArgument);
              } else {
                setCaptcha(c => ({ ...c, visible: true, voteType: 'FOR' }));
              }
            }}
            leftIcon="THUMB_UP">
            <FormattedMessage id="global.for" />
          </Button>
          <Button
            onMouseEnter={() => setIsHover('AGAINST')}
            onMouseLeave={() => setIsHover(false)}
            css={css(buttonColor('red', isHover === 'FOR'))}
            variantSize="big"
            onClick={() => {
              if (isAuthenticated) {
                track('debate_vote_click', { type: 'AGAINST' });
                voteForDebate(
                  debateId,
                  'AGAINST',
                  intl,
                  onSuccess,
                  isAuthenticated,
                  viewerHasArgument,
                );
              } else {
                setCaptcha(c => ({ ...c, visible: true, voteType: 'AGAINST' }));
              }
            }}
            leftIcon="THUMB_DOWN">
            <FormattedMessage id="global.against" />
          </Button>
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

export default DebateStepPageVote;
