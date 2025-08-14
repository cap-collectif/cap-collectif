import React from 'react'
import { Box, CapUIFontSize, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import VoteStepFiltersAccordions from '~/components/VoteStep/Filters/VoteStepFiltersAccordions'
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters'
import VoteInfoPanel from './VoteInfoPanel/VoteInfoPanel'
import ProposalDrafts from './ProposalDrafts'
import { useEventListener } from '@shared/hooks/useEventListener'
import { VoteStepEvent } from '~/components/VoteStep/utils'

type Props = {
  stepId: string
  isCollectStep?: boolean
}

const VoteStepFiltersDesktop = ({ stepId, isCollectStep = false }: Props) => {
  const intl = useIntl()
  const voteStepFilters = useVoteStepFilters(stepId)

  const [participantToken, setParticipantToken] = React.useState()
  useEventListener(VoteStepEvent.NewParticipantToken, (event) => {
    setParticipantToken(event.data?.token)
  })

  if (!voteStepFilters) {
    return null
  }

  const { totalCount, filters } = voteStepFilters

  return (
    <Box width="100%" minHeight="100vh" py={8} pr={2} pl={8} color="neutral-gray.900" position="sticky" top="50px">
      <VoteInfoPanel stepId={stepId} key={participantToken} />
      {isCollectStep ? <ProposalDrafts stepId={stepId} /> : null}
      <Text fontSize={CapUIFontSize.Headline} mb={6} as="h2" mt={8} color="neutral-gray.900">
        {intl.formatMessage(
          {
            id: 'filter-the-n-projects',
          },
          {
            n: totalCount,
          },
        )}
      </Text>
      <VoteStepFiltersAccordions filters={filters} isMobile={false} />
    </Box>
  )
}

export default VoteStepFiltersDesktop
