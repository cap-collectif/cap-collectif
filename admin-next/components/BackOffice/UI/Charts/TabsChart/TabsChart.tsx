import * as React from 'react'
import LineChart from '../LineChart/LineChart'
import { Flex } from '@cap-collectif/ui'
import Tab, { ActiveTab } from './Tab/Tab'

export type TabsChartProps = {
  children: React.ReactElement<typeof Tab>[]
}

type SubComponents = {
  Tab: typeof Tab
}

const getFirstTab = (children: React.ReactElement<typeof Tab>[]): ActiveTab => {
  const firstTab = React.Children.toArray(children)[0] as React.ReactElement<typeof Tab>
  return {
    // @ts-ignore
    id: firstTab?.props?.id,
    // @ts-ignore
    label: firstTab.props.label,
    // @ts-ignore
    data: firstTab.props.data,
  }
}

const TabsChart: React.FC<TabsChartProps> & SubComponents = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>(getFirstTab(children))

  const tabsChildren = React.useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          // @ts-ignore
          active: activeTab?.id === child.props.id,
          selectTab: setActiveTab,
        })
      }
    })
  }, [activeTab, children])

  React.useEffect(() => {
    setActiveTab(getFirstTab(children))
  }, [children])

  return (
    <Flex direction="column" spacing={8}>
      <Flex direction="row" overflow="auto">
        {tabsChildren}
      </Flex>
      <LineChart height="250px" withAxis withGrid {...activeTab} />
    </Flex>
  )
}

TabsChart.Tab = Tab

export default TabsChart
