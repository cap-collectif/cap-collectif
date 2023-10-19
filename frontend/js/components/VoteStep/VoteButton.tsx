import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, Icon, CapUIIcon, CapUIIconSize, toast, Flex, Text } from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import RemoveProposalVoteMutation from '~/mutations/RemoveProposalVoteMutation'
import LoginOverlay from '~/components/Utils/NewLoginOverlay'
import { vote } from '~/redux/modules/proposal'
import { VoteStepEvent, ACTIVE_COLOR, dispatchEvent } from './utils'
type Props = {
  readonly proposalId: string
  readonly stepId: string
  readonly hasVoted: boolean
  readonly disabled: boolean
}

const VoteButton = ({ proposalId, stepId, hasVoted, disabled }: Props) => {
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasSwitched, setHasSwitch] = React.useState(false)
  const intl = useIntl()

  const deleteVote = () => {
    setIsLoading(true)
    return RemoveProposalVoteMutation.commit({
      stepId,
      input: {
        proposalId,
        stepId,
      },
      isAuthenticated,
      token: null,
    })
      .then(() => {
        dispatchEvent(VoteStepEvent.RemoveVote, {
          proposalId,
        })
        setHasSwitch(true)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast({
          variant: 'warning',
          content: intl.formatMessage({
            id: 'global.failure',
          }),
        })
      })
  }

  const onButtonClick = () => {
    dispatchEvent(VoteStepEvent.AnimateCard, {
      proposalId,
    })
    if (hasVoted) deleteVote()
    else {
      setIsLoading(true)
      vote(
        dispatch,
        stepId,
        proposalId,
        false,
        intl,
        () => {
          dispatchEvent(VoteStepEvent.AddVote, {
            proposalId,
          })
          setHasSwitch(true)
          setIsLoading(false)
        },
        () => setIsLoading(false),
      )
    }
  }

  const displayhasVoted = (hasVoted && !hasSwitched) || (!hasVoted && hasSwitched)
  const leftText = displayhasVoted ? 'global.thank.you' : 'global.vote.for'
  return (
    <Box
      sx={{
        '& > *': {
          transition: 'color 0.3s 0.1s ease-in-out, background 0.3s 0.1s ease-in-out',
        },
      }}
    >
      <LoginOverlay enabled={!isAuthenticated}>
        <Box
          as="button"
          id={`proposal-vote-button-${proposalId}`}
          onClick={onButtonClick}
          disabled={disabled || isLoading}
          border="normal"
          borderRadius="50px"
          borderColor={ACTIVE_COLOR}
          p={1}
          bg={displayhasVoted ? ACTIVE_COLOR : 'white'}
        >
          <Flex className="toggle-btn" alignItems="center">
            <Text as="span" color={displayhasVoted ? 'white' : ACTIVE_COLOR} fontSize={3} fontWeight="700" mx={2}>
              {intl.formatMessage({
                id: leftText,
              })}
            </Text>
            <Flex className="inner-circle" p={1} borderRadius="100%" bg={displayhasVoted ? 'white' : ACTIVE_COLOR}>
              <Icon name={CapUIIcon.Vote} size={CapUIIconSize.Lg} color={displayhasVoted ? ACTIVE_COLOR : 'white'} />
            </Flex>
          </Flex>
        </Box>
      </LoginOverlay>
    </Box>
  )
}

export default VoteButton
