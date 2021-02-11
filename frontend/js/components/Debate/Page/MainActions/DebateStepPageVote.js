// @flow
import React, { useState } from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { m as motion } from 'framer-motion';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Icon from '~ds/Icon/Icon';
import AddDebateVoteMutation from '~/mutations/AddDebateVoteMutation';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { type VoteState } from './DebateStepPageVoteAndShare';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  +debateId: string,
  +isAuthenticated: boolean,
  +onSuccess: VoteState => void,
  +viewerHasArgument: boolean,
|};

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
      } else onSuccess(viewerHasArgument ? 'ARGUMENTED' : 'VOTED');
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
  const intl = useIntl();
  const [isHover, setIsHover] = useState<'FOR' | 'AGAINST' | false>(false);

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
      <LoginOverlay>
        <Button
          onMouseEnter={() => setIsHover('FOR')}
          onMouseLeave={() => setIsHover(false)}
          css={css(buttonColor('green', isHover === 'AGAINST'))}
          variantSize="big"
          aria-label={intl.formatMessage({ id: 'global.for' })}
          onClick={() =>
            voteForDebate(debateId, 'FOR', intl, onSuccess, isAuthenticated, viewerHasArgument)
          }>
          <Icon name="THUMB_UP" />
        </Button>
      </LoginOverlay>
      <LoginOverlay>
        <Button
          onMouseEnter={() => setIsHover('AGAINST')}
          onMouseLeave={() => setIsHover(false)}
          css={css(buttonColor('red', isHover === 'FOR'))}
          variantSize="big"
          aria-label={intl.formatMessage({ id: 'global.against' })}
          onClick={() =>
            voteForDebate(debateId, 'AGAINST', intl, onSuccess, isAuthenticated, viewerHasArgument)
          }>
          <Icon name="THUMB_DOWN" />
        </Button>
      </LoginOverlay>
    </Container>
  );
};

export default DebateStepPageVote;
