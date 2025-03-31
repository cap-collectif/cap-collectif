import type { Node } from 'react'
import React from 'react'
import { useIntl } from 'react-intl'
import { useActor } from '@xstate/react'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { Flex, Text, Box, CapUIFontSize } from '@cap-collectif/ui'
import type { DebateStepPageAbsoluteVoteAndShare_step } from '~relay/DebateStepPageAbsoluteVoteAndShare_step.graphql'
import DebateStepPageVote from './DebateStepPageVote'
import DebateStepPageVoteForm from './DebateStepPageVoteForm'
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context'
import type { VoteState, VoteAction } from './DebateStepPageStateMachine'
import { MachineContext } from './DebateStepPageStateMachine'
type Props = {
  readonly step: DebateStepPageAbsoluteVoteAndShare_step
  readonly isMobile?: boolean
  readonly showArgumentForm: boolean
  readonly setShowArgumentForm: (arg0: boolean) => void
  readonly viewerIsConfirmed: boolean
}
export const DebateStepPageAbsoluteVoteAndShare = ({
  step,
  isMobile,
  showArgumentForm,
  setShowArgumentForm,
  viewerIsConfirmed,
}: Props): Node => {
  const { debate, url } = step
  const { widget } = useDebateStepPage()
  const intl = useIntl()
  const machine = React.useContext(MachineContext)
  const [current, send] = useActor<
    {
      value: VoteState
    },
    VoteAction
  >(machine)
  const { value } = current
  return (
    <Box
      p={[6, 8]}
      width="100%"
      position="fixed"
      zIndex={999}
      {...(isMobile
        ? {
            bottom: 0,
            borderTopLeftRadius: 'poppin',
            borderTopRightRadius: 'poppin',
          }
        : {
            top: 50,
          })}
      sx={{
        marginTop: '0 !important',
        background: 'white',
        boxShadow: isMobile ? 'medium' : !showArgumentForm || value.includes('none') ? 'medium' : '0 10px 14px 0 white',
      }}
    >
      {/** I dont like this but for now we have to use the bootstrap container max-width, waiting for the DS one */}
      <Box
        className="container"
        sx={{
          padding: '0 !important',
          '& .captcha-message': {
            display: 'none',
          },
        }}
      >
        {value.includes('none') && (
          <Flex direction={['column', 'row']} spacing={4} justify="center" align="center">
            <Text textAlign={['center', 'left']} color="gray.900" fontSize={CapUIFontSize.Headline}>
              {step.title}
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
      </Box>
    </Box>
  )
}
export default createFragmentContainer(DebateStepPageAbsoluteVoteAndShare, {
  step: graphql`
    fragment DebateStepPageAbsoluteVoteAndShare_step on DebateStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, isMobile: { type: "Boolean!" }) {
      url
      title
      debate {
        ...DebateStepPageVoteForm_debate @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
      }
      ...DebateStepPageVote_step
    }
  `,
}) as RelayFragmentContainer<typeof DebateStepPageAbsoluteVoteAndShare>
