// @ts-nocheck
import * as React from 'react'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import TabsBar from '../../components/Ui/TabsBar/TabsBar'
import { items, itemWithChildren } from '../mocks/navbarItems'

const StorybookWrapper = styled.div<{
  height?: string
}>`
  background-color: lightBlue;
  height: ${({ height }) => height || '51px'};
`
const newItems = items.slice(0)
newItems.splice(5, 0, itemWithChildren)
storiesOf('Core/Navigation/TabsBar', module).add('default case', () => (
  <StorybookWrapper>
    <TabsBar items={newItems} />
  </StorybookWrapper>
))
