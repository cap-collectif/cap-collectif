import type { Node } from 'react'
import React, { useEffect, useState } from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { m as motion } from 'framer-motion'
import { useAnalytics } from 'use-analytics'
import { useActor } from '@xstate/react'
import { Text, Flex, Box, Icon, CapUIIcon, CapUILineHeight } from '@cap-collectif/ui'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import type { OptimisticResponse } from '~/mutations/AddDebateVoteMutation'
import AddDebateVoteMutation from '~/mutations/AddDebateVoteMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import type { VoteAction, VoteState } from './DebateStepPageStateMachine'
import { MachineContext } from './DebateStepPageStateMachine'
import Captcha from '~/components/Form/Captcha'
import AddDebateAnonymousVoteMutation from '~/mutations/AddDebateAnonymousVoteMutation'
import { SPACES_SCALES } from '~/styles/theme/base'
import CookieMonster from '~/CookieMonster'
import ConditionalWrapper from '~/components/Utils/ConditionalWrapper'
import NewLoginOverlay from '~/components/Utils/NewLoginOverlay'
import type { DebateStepPageVote_step } from '~relay/DebateStepPageVote_step.graphql'
import type { GlobalState } from '~/types'
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context'
type Props = AppBoxProps & {
  readonly step: DebateStepPageVote_step
  readonly top?: boolean
}

const anonymousVoteForDebate = (
  debateId: string,
  captcha: string,
  type: 'FOR' | 'AGAINST',
  widgetLocation: string | null | undefined,
  intl: IntlShape,
  send: (state: VoteAction) => void,
) => {
  return AddDebateAnonymousVoteMutation.commit({
    input: {
      debateId,
      type,
      captcha,
      widgetOriginURI: widgetLocation,
    },
  })
    .then(response => {
      if (response.addDebateAnonymousVote?.errorCode) {
        mutationErrorToast(intl)
      } else {
        if (response.addDebateAnonymousVote?.token) {
          CookieMonster.addDebateAnonymousVoteCookie(debateId, {
            type,
            token: response.addDebateAnonymousVote.token,
          })
        }

        send('VOTE')
      }
    })
    .catch(() => {
      mutationErrorToast(intl)
    })
}

const voteForDebate = (
  debateId: string,
  type: 'FOR' | 'AGAINST',
  widgetLocation: string | null | undefined,
  intl: IntlShape,
  send: (state: VoteAction) => void,
  isAuthenticated: boolean,
  optimisticData: OptimisticResponse,
) => {
  // For optimistic response
  send('VOTE')
  return AddDebateVoteMutation.commit(
    {
      input: {
        debateId,
        type,
        widgetOriginURI: widgetLocation,
      },
    },
    optimisticData,
  )
    .then(response => {
      if (response.addDebateVote?.errorCode) {
        mutationErrorToast(intl)
        send('DELETE_VOTE')
      }
    })
    .catch(() => {
      mutationErrorToast(intl)
      send('DELETE_VOTE')
    })
}

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
})

const Container = motion(Flex)
export const DebateStepPageVote = ({ step, top, ...props }: Props): Node => {
  const isEmailConfirmed: boolean = useSelector((state: GlobalState) => state.user?.user?.isEmailConfirmed || false)
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)
  const { track } = useAnalytics()
  const intl = useIntl()
  const { widget } = useDebateStepPage()
  const [isHover, setIsHover] = useState<'FOR' | 'AGAINST' | false>(false)
  const [captcha, setCaptcha] = useState<{
    visible: boolean
    value: string | null | undefined
    voteType: 'FOR' | 'AGAINST'
  }>({
    visible: false,
    value: null,
    voteType: 'AGAINST',
  })
  const machine = React.useContext(MachineContext)
  const [, send] = useActor<
    {
      value: VoteState
    },
    VoteAction
  >(machine)
  useEffect(() => {
    if (captcha.value) {
      anonymousVoteForDebate(step.debate.id, captcha.value, captcha.voteType, widget.location, intl, send)
    }
  }, [step.debate.id, captcha.value, captcha.voteType, widget.location, intl, send])
  const optimisticData: OptimisticResponse = {
    yesVotes: step.debate.yesVotes.totalCount,
    votes: step.debate.votes.totalCount,
    viewerConfirmed: isEmailConfirmed,
  }
  return (
    <Container
      transition={{
        duration: 0.5,
      }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      direction="row"
      alignItems="center"
      spacing={6}
      justifyContent="center"
      width="100%"
      {...props}
    >
      {!captcha.visible && (
        <>
          <ConditionalWrapper
            when={!step.isAnonymousParticipationAllowed}
            wrapper={children => <NewLoginOverlay placement={top ? 'top' : 'bottom'}>{children}</NewLoginOverlay>}
          >
            <Box
              as="button"
              onMouseEnter={() => setIsHover('FOR')}
              onMouseLeave={() => setIsHover(false)}
              sx={buttonColor('green', isHover === 'AGAINST')}
              onClick={() => {
                if (isAuthenticated) {
                  track('debate_vote_click', {
                    type: 'FOR',
                    url: step.debate.url,
                  })
                  voteForDebate(step.debate.id, 'FOR', widget.location, intl, send, isAuthenticated, optimisticData)
                } else {
                  setCaptcha(c => ({ ...c, visible: true, voteType: 'FOR' }))
                }
              }}
              fontWeight={600}
              px={8}
              py={3}
              borderRadius="4px"
              fontSize={3}
            >
              <Flex align="center" justify="center">
                <Icon name={CapUIIcon.ThumbUp} mr={1} />
                <Text lineHeight={CapUILineHeight.Base}>
                  {intl.formatMessage({
                    id: 'global.for',
                  })}
                </Text>
              </Flex>
            </Box>
          </ConditionalWrapper>

          <ConditionalWrapper
            when={!step.isAnonymousParticipationAllowed}
            wrapper={children => <NewLoginOverlay placement={top ? 'top' : 'bottom'}>{children}</NewLoginOverlay>}
          >
            <Box
              as="button"
              onMouseEnter={() => setIsHover('AGAINST')}
              onMouseLeave={() => setIsHover(false)}
              sx={buttonColor('red', isHover === 'FOR')}
              variantSize="big"
              onClick={() => {
                if (isAuthenticated) {
                  track('debate_vote_click', {
                    type: 'AGAINST',
                    url: step.debate.url,
                  })
                  voteForDebate(step.debate.id, 'AGAINST', widget.location, intl, send, isAuthenticated, optimisticData)
                } else {
                  setCaptcha(c => ({ ...c, visible: true, voteType: 'AGAINST' }))
                }
              }}
              fontWeight={600}
              px={8}
              py={3}
              borderRadius="4px"
              fontSize={3}
            >
              <Flex align="center" justify="center">
                <Icon name={CapUIIcon.ThumbDown} mr={1} />
                <Text lineHeight={CapUILineHeight.Base}>
                  {intl.formatMessage({
                    id: 'global.against',
                  })}
                </Text>
              </Flex>
            </Box>
          </ConditionalWrapper>
        </>
      )}

      {captcha.visible && (
        <Flex direction="column" align="center">
          <Text
            sx={{
              mb: `${SPACES_SCALES[6]} !important`,
            }}
            textAlign="center"
            className="captcha-message"
            color="neutral-gray.700"
          >
            {intl.formatMessage({
              id: 'publish-anonymous-debate-vote-bot',
            })}
          </Text>
          <Captcha
            style={{
              transformOrigin: 'center',
            }}
            onChange={value => setCaptcha(c => ({ ...c, value }))}
          />
        </Flex>
      )}
    </Container>
  )
}
export default createFragmentContainer(DebateStepPageVote, {
  step: graphql`
    fragment DebateStepPageVote_step on DebateStep {
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
}) as RelayFragmentContainer<typeof DebateStepPageVote>
