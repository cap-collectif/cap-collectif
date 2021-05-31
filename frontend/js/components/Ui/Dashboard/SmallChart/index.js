// @flow
import * as React from 'react';
import LineChart, { type LineChartProps } from '~ui/Dashboard/LineChart';
import Flex from '~ui/Primitives/Layout/Flex';
import { headingStyles } from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';

export type SmallChartProps = {|
  ...LineChartProps,
  count: number,
|};

const SmallChart = ({ label, count, ...props }: SmallChartProps) => (
  <Flex
    direction="row"
    align="center"
    justify="space-between"
    p={6}
    border="normal"
    borderColor="gray.150"
    borderRadius="normal">
    <Flex direction="column" flex={1}>
      <Text color="blue.800" mb={2} {...headingStyles.h4}>
        {label}
      </Text>
      <Text color="blue.800" {...headingStyles.h3}>
        {count}
      </Text>
    </Flex>

    <LineChart label={label} flex={1} {...props} />
  </Flex>
);

export default SmallChart;
