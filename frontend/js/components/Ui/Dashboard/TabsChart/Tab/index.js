// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import type { LineChartProps } from '~ui/Dashboard/LineChart';
import AppBox from '~ui/Primitives/AppBox';
import { headingStyles } from '~ui/Primitives/Heading';

export type ActiveTab = {|
  +id: string,
  +label: $PropertyType<LineChartProps, 'label'>,
  +data: $PropertyType<LineChartProps, 'data'>,
|};

export type TabProps = {|
  ...LineChartProps,
  +id: string,
  +count: number,
  +active?: boolean,
  +selectTab?: (activeTab: ActiveTab) => void,
|};

const Tab = ({ id, label, count, active, data, selectTab }: TabProps) => (
  <AppBox
    as="button"
    type="button"
    onClick={() => (selectTab ? selectTab({ id, label, data }) : null)}
    bg="transparent"
    border="none"
    borderRight="1px solid"
    borderColor="gray.150"
    p={0}
    m={0}
    flex={1}>
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
      <Text color="blue.900" fontSize={3} capitalize>
        {label}
      </Text>
      <Text color="blue.800" {...headingStyles.h3}>
        {count}
      </Text>
    </Flex>
  </AppBox>
);

export default Tab;
