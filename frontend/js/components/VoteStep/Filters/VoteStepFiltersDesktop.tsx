import React from 'react'
import { Box, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import VoteStepFiltersAccordions from '~/components/VoteStep/Filters/VoteStepFiltersAccordions'
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters'
import VoteInfoPanel from './VoteInfoPanel/VoteInfoPanel'
import ProposalDrafts from './ProposalDrafts'

type Props = {
  stepId: string
  isCollectStep?: boolean
}

const VoteStepFiltersDesktop = ({ stepId, isCollectStep = false }: Props) => {
  const intl = useIntl()
  const voteStepFilters = useVoteStepFilters(stepId)

  if (!voteStepFilters) {
    return null
  }

  const { totalCount, filters } = voteStepFilters

  return (
    <Box width="100%" minHeight="100vh" py={8} pr={2} pl={8} color="neutral-gray.900" position="sticky" top="50px">
      <VoteInfoPanel stepId={stepId} />
      {isCollectStep ? <ProposalDrafts stepId={stepId} /> : null}
      <Text fontSize={4} mb={6} as="div" mt={8}>
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
