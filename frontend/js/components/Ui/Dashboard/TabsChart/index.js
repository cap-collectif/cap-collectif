// @flow
import * as React from 'react';
import LineChart from '~ui/Dashboard/LineChart';
import Flex from '~ui/Primitives/Layout/Flex';
import Tab, { type ActiveTab } from './Tab';

export type TabsChartProps = {|
  +children: React.ChildrenArray<React.Element<typeof Tab>>,
|};

const getFirstTab = (children: React.ChildrenArray<React.Element<typeof Tab>>): ActiveTab => {
  const firstTab = React.Children.toArray(children)[0];
  return {
    id: firstTab.props.id,
    label: firstTab.props.label,
    data: firstTab.props.data,
  };
};

const TabsChart = ({ children }: TabsChartProps) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>(getFirstTab(children));

  const tabsChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        active: activeTab?.id === child.props.id,
        selectTab: setActiveTab,
      });
    }
  });

  return (
    <Flex direction="column" spacing={8}>
      <Flex direction="row">{tabsChildren}</Flex>
      <LineChart height="250px" withAxis withGrid {...activeTab} />
    </Flex>
  );
};

TabsChart.Tab = Tab;

export default TabsChart;
