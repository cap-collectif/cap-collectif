// @flow
import React, { type Node } from 'react';
import css from '@styled-system/css';
import { useIntl } from 'react-intl';
import { useActor } from '@xstate/react';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import type { DebateStepPageAbsoluteVoteAndShare_step } from '~relay/DebateStepPageAbsoluteVoteAndShare_step.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~/components/Ui/Primitives/AppBox';
import DebateStepPageVote from './DebateStepPageVote';
import DebateStepPageVoteForm from './DebateStepPageVoteForm';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';
import { MachineContext, type VoteState, type VoteAction } from './DebateStepPageStateMachine';

type Props = {|
  +step: DebateStepPageAbsoluteVoteAndShare_step,
  +isMobile?: boolean,
  +showArgumentForm: boolean,
  +setShowArgumentForm: boolean => void,
  +viewerIsConfirmed: boolean,
|};

export const DebateStepPageAbsoluteVoteAndShare = ({
  step,
  isMobile,
  showArgumentForm,
  setShowArgumentForm,
  viewerIsConfirmed,
}: Props): Node => {
  const { debate, url } = step;
  const { title, widget } = useDebateStepPage();
  const intl = useIntl();
  const machine = React.useContext(MachineContext);
  const [current, send] = useActor<{ value: VoteState }, VoteAction>(machine);
  const { value } = current;

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
          ? 'medium'
          : !showArgumentForm || value.includes('none')
          ? 'medium'
          : '0 10px 14px 0 white',
      })}>
      {/** I dont like this but for now we have to use the bootstrap container max-width, waiting for the DS one */}
      <AppBox
        className="container"
        css={{ padding: '0 !important', '& .recaptcha-message': { display: 'none' } }}>
        {value.includes('none') && (
          <Flex
            direction={['column', 'row']}
            spacing={4}
            justifyContent="center"
            alignItems="center">
            <Text textAlign={['center', 'left']} color="gray.900" fontSize={4}>
              {title}
            </Text>
            <DebateStepPageVote width="unset" step={step} top={isMobile} />
          </Flex>
        )}
        {!value.includes('none') && (
          <DebateStepPageVoteForm
            viewerIsConfirmed={viewerIsConfirmed}
            isMobile={isMobile}
            isAbsolute
            url={url}
            debate={debate}
            showArgumentForm={showArgumentForm}
            setShowArgumentForm={setShowArgumentForm}
            widgetLocation={widget.location}
            intl={intl}
            send={send}
          />
        )}
      </AppBox>
    </AppBox>
  );
};

export default (createFragmentContainer(DebateStepPageAbsoluteVoteAndShare, {
  step: graphql`
    fragment DebateStepPageAbsoluteVoteAndShare_step on DebateStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, isMobile: { type: "Boolean!" }) {
      url
      debate {
        ...DebateStepPageVoteForm_debate
          @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
      }
      ...DebateStepPageVote_step @arguments(isMobile: $isMobile)
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageAbsoluteVoteAndShare>);
