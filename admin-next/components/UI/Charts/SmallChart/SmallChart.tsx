import type { FC } from 'react'
import LineChart, { LineChartProps } from '../LineChart/LineChart'
import { Flex, Text, headingStyles } from '@cap-collectif/ui'
import { formatBigNumber } from '@utils/format-number'

export interface SmallChartProps extends LineChartProps {
  count: number
}

const SmallChart: FC<SmallChartProps> = ({ label, count, ...props }) => (
  <Flex
    direction="row"
    align="center"
    justify="space-between"
    px={6}
    py={4}
    border="normal"
    borderColor="gray.150"
    borderRadius="normal"
    bg="white"
    height="100%"
  >
    <Flex direction="column" mr={3}>
      <Text color="blue.800" mb={2} textAlign="left" {...headingStyles.h4}>
        {label}
      </Text>
      <Text color="blue.800" textAlign="left" {...headingStyles.h3}>
        {formatBigNumber(count)}
      </Text>
    </Flex>

    <LineChart label={label} flex={1} {...props} />
  </Flex>
)

export default SmallChart
