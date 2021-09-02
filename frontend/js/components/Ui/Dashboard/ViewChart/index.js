// @flow
import * as React from 'react';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import { formatBigNumber } from '~/utils/bigNumberFormatter';
import { FontWeight } from '~ui/Primitives/constants';

export type ViewChartProps = {|
  ...FlexProps,
  +truncate?: number,
  +total: number,
  +count: number,
  +level: number,
  +label: string,
|};

const colors: string[] = ['blue.700', 'blue.600', 'blue.500'];

const ViewChart = ({ total, count, truncate = 50, level, label, ...props }: ViewChartProps) => {
  let content = label;
  if (truncate && label.length > truncate) {
    content = `…${label.slice(truncate, label.length)}`;
  }

  return (
    <Flex direction="column" spacing={1} {...props}>
      <Flex direction="row" justify="space-between">
        <Text color="gray.900" {...(truncate && { title: label })}>
          {content}
        </Text>
        <Text color="blue.900" fontSize={2} fontWeight={FontWeight.Semibold}>
          {formatBigNumber(count)}
        </Text>
      </Flex>

      <AppBox width="100%" height="2px" bg="gray.150" borderRadius="normal">
        <AppBox
          bg={level <= 2 ? colors[level] : 'blue.400'}
          width={`${(count / total) * 100}%`}
          height="100%"
        />
      </AppBox>
    </Flex>
  );
};

export default ViewChart;
