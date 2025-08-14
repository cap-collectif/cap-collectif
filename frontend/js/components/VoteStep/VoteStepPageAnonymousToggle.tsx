import { Flex, Switch, Text, CapUIFontSize } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { State } from '~/types'
import { useVoteStepContext } from './Context/VoteStepContext'
import UpdateVotesVisibilityMutation from '~/mutations/UpdateVotesVisibilityMutation'
import CookieMonster from '@shared/utils/CookieMonster'

type Props = {
  readonly stepId: string
}

const VoteStepPageAnonymousToggle = ({ stepId }: Props) => {
  const isAuthenticated = useSelector((state: State) => state.user.user !== null)
  const intl = useIntl()
  const { isParticipationAnonymous, setIsParticipationAnonymous } = useVoteStepContext()

  if (!isAuthenticated) {
    return null;
  }

  const participantToken = !isAuthenticated ? CookieMonster.getParticipantCookie() : null;

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      sx={{ label: { marginBottom: 0 } }}
      mt={[0, 6]}
      mb={6}
      mx={[4, 0]}
    >
      <Text fontSize={CapUIFontSize.BodyRegular}>{intl.formatMessage({ id: 'vote_step.anonymous_toggle' })}</Text>
      <Switch
        id="anonymous-toggle"
        checked={isParticipationAnonymous}
        onChange={() => {
          UpdateVotesVisibilityMutation.commit({ input: { stepId, anonymous: !isParticipationAnonymous, participantToken } }).then(() => {
            setIsParticipationAnonymous(!isParticipationAnonymous)
          })
        }}
      />
    </Flex>
  )
}

export default VoteStepPageAnonymousToggle
