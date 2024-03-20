import * as React from 'react'
import { Flex, Box, Text, FlexProps, CapUIFontWeight, Link } from '@cap-collectif/ui'
import { formatBigNumber } from '@utils/format-number'

export interface ViewChartProps extends FlexProps {
  total: number
  count: number
  level: number
  label: string
  url: string
}

const colors: string[] = ['blue.700', 'blue.600', 'blue.500']

const ViewChart = ({ total, count, level, label, url, ...props }: ViewChartProps) => (
  <Flex direction="column" spacing={1} {...props}>
    <Flex direction="row" justify="space-between">
      <Link color="gray.900" href={url} target="_blank">
        {label}
      </Link>
      <Text color="blue.900" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
        {formatBigNumber(count)}
      </Text>
    </Flex>

    <Box width="100%" height="2px" bg="gray.150" borderRadius="normal">
      <Box bg={level <= 2 ? colors[level] : 'blue.400'} width={`${(count / total) * 100}%`} height="100%" />
    </Box>
  </Flex>
)

export default ViewChart
