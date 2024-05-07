import * as React from 'react'
import { Flex, Box, Text, CapUIIcon, Icon, CapUIIconSize } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ResetCss from '~/utils/ResetCss'
import VoteStepFiltersAccordions from '~/components/VoteStep/Filters/VoteStepFiltersAccordions'
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters'
import VoteStepPageSearchBar from '~/components/VoteStep/VoteStepPageSearchBar'
import VoteStepFilterSearchBar from '~/components/VoteStep/Filters/VoteStepFilterSearchBar'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'

type Props = {
  stepId: string
  onClose: () => void
}

const SaveButton = ({ children, onClick }) => {
  return (
    <Box
      as="button"
      borderRadius="50px"
      padding={3}
      width="70%"
      maxWidth="240px"
      fontWeight={600}
      bg="primary.500"
      color="white"
      border="none"
      fontSize={3}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}

const VoteStepFiltersMobile = ({ stepId, onClose }: Props) => {
  const intl = useIntl()
  const voteStepFilters = useVoteStepFilters(stepId)
  const { view } = useVoteStepContext()

  if (!voteStepFilters) {
    return null
  }

  const { filters } = voteStepFilters
  return (
    <Box
      bg="primary.100"
      height="100%"
      minHeight="100vh"
      py={10}
      px={4}
      position="fixed"
      width="100%"
      zIndex={1030}
      top={0}
      overflow="scroll"
    >
      <Flex justifyContent="space-between" mb={5}>
        <Text color="primary.500" fontWeight={700} fontSize={5}>
          {intl.formatMessage({
            id: 'filter-the-projects',
          })}
        </Text>
        <ResetCss>
          <Box as="button" onClick={onClose}>
            <Icon name={CapUIIcon.CrossO} size={CapUIIconSize.Sm} />
          </Box>
        </ResetCss>
      </Flex>
      {view === 'map' && <VoteStepFilterSearchBar />}
      {view !== 'map' && (
        <Box mb={4}>
          <VoteStepPageSearchBar />
        </Box>
      )}
      <VoteStepFiltersAccordions filters={filters} isMobile />
      <Flex justifyContent="center" mt={8} mb="50%">
        <SaveButton onClick={onClose}>
          {intl.formatMessage({
            id: 'global.save',
          })}
        </SaveButton>
      </Flex>
    </Box>
  )
}

export default VoteStepFiltersMobile
