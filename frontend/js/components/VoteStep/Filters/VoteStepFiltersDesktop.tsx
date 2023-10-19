import React from 'react'
import { Box, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import VoteStepFiltersAccordions from '~/components/VoteStep/Filters/VoteStepFiltersAccordions'
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters'

type Props = {
  stepId: string
}

const VoteStepFiltersDesktop = ({ stepId }: Props) => {
  const intl = useIntl()
  const voteStepFilters = useVoteStepFilters(stepId)

  if (!voteStepFilters) {
    return null
  }

  const { totalCount, filters } = voteStepFilters
  return (
    <Box width="100%" minHeight="100vh" p={8} color="neutral-gray.900">
      <Text fontSize={4} mb={6} as="div">
        {intl.formatMessage(
          {
            id: 'filter-the-n-projects',
          },
          {
            n: (
              <strong
                key={totalCount}
                style={{
                  color: '#CE237F',
                }}
              >
                {totalCount}
              </strong>
            ),
          },
        )}
      </Text>
      <VoteStepFiltersAccordions filters={filters} isMobile={false} />
    </Box>
  )
}

export default VoteStepFiltersDesktop
