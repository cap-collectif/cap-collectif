import type { FC } from 'react';
import type { LineChartProps } from '../../LineChart/LineChart';
import { Box, headingStyles, Flex, Text } from '@cap-collectif/ui'
import { capitalizeFirstLetter } from '@utils/format-string';

export type ActiveTab = {
  readonly id: string,
  readonly label: LineChartProps['label']
  readonly data: LineChartProps['data']
};

export interface TabProps extends LineChartProps {
  readonly id: string,
  readonly count: number,
  readonly active?: boolean,
  readonly selectTab?: (activeTab: ActiveTab) => void,
  readonly disabled?: boolean
};

const Tab: FC<TabProps> = ({ id, label, count, active, data, selectTab, disabled }) => (
  <Box
    as="button"
    type="button"
    onClick={() => (selectTab ? selectTab({ id, label, data }) : null)}
    borderRight="normal"
    borderColor="gray.150"
    flex={1}
    disabled={disabled}>
    <Flex
      id={id}
      direction="column"
      bg="white"
      px={6}
      py={2}
      textAlign="left"
      borderBottom={active ? 'none' : 'normal'}
      borderRight={active ? 'normal' : 'none'}
      borderColor="gray.150"
      opacity={active ? 1 : 0.5}>
      <Text color="blue.900" fontSize={3}>
        {capitalizeFirstLetter(label)}
      </Text>
      <Text color="blue.800" {...headingStyles.h3}>
        {count}
      </Text>
    </Flex>
  </Box>
);

export default Tab;
