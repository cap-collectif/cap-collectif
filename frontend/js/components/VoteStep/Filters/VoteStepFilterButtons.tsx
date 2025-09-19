import React from 'react'
import { Flex, Box, CapUIFontSize, Text } from '@cap-collectif/ui'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import type { FilterOptions } from '~/components/VoteStep/Filters/useVoteStepFilters'
import '~/components/VoteStep/Filters/useVoteStepFilters'

type Props = {
  options: FilterOptions
  filterName: string
}

const Button = ({ isChecked, children, value, onClick }) => {
  return (
    <Box
      as="button"
      mb={2}
      px={4}
      py={2}
      fontSize={CapUIFontSize.BodySmall}
      bg={isChecked ? 'primary.base' : 'primary.lighter'}
      color={isChecked ? 'primary.lighter' : 'primary.base'}
      borderRadius="100px"
      border="none"
      textAlign="left"
      onClick={() => onClick(value)}
      aria-current={isChecked}
    >
      {children}
    </Box>
  )
}

export const VoteStepFilterButtons = ({ options, filterName }: Props) => {
  const { filters, setFilters } = useVoteStepContext()
  let filter = filters[filterName]

  if (filterName === 'sort' && filter === '') {
    filter = 'random'
  }

  const handleOnChange = value => {
    setFilters(filterName, value)
  }

  return (
    <Flex mt={2}>
      <Flex alignItems="center" spacing={2} wrap="wrap">
        {options.map(choice => (
          <Flex alignItems="center" key={choice.id}>
            <Button isChecked={choice.id === filter} value={choice.id} onClick={handleOnChange}>
              <Text fontWeight={choice.id === filter ? 600 : 400}>{choice?.title || choice?.name}</Text>
            </Button>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}
export default VoteStepFilterButtons
