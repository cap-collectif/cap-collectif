/* @flow */
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { storiesOf } from '@storybook/react';

import TabsBar from '../../components/Ui/TabsBar/TabsBar';

import { items, itemWithChildren } from '../mocks/navbarItems';

const StorybookWrapper: StyledComponent<{ height?: string }, {}, HTMLDivElement> = styled.div`
  background-color: lightBlue;
  height: ${({ height }) => height || '51px'};
`;

const newItems = items.slice(0);
newItems.splice(5, 0, itemWithChildren);

storiesOf('Core|Navigation/TabsBar', module)
  .add('default case', () => (
    <StorybookWrapper>
      <TabsBar items={newItems} />
    </StorybookWrapper>
  ))
  .add('vertical', () => (
    <StorybookWrapper height="auto">
      <TabsBar items={newItems} vertical overflowEnable={false} />
    </StorybookWrapper>
  ));
