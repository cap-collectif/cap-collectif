// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { css } from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';

storiesOf('Core|Primitives/AppBox', module)
  .add('default', () => {
    return (
      <AppBox fontSize="2xl" p={4} bg="red.300">
        <a href="https://styled-system.com/api">Genshin Impact</a>
      </AppBox>
    );
  })
  .add('with responsive styles', () => {
    return (
      <AppBox display="flex" gridGap={2}>
        <AppBox p={2} bg={{ _: 'red.300', lg: 'green.300' }}>
          With named response parameters. I will be red.300 on mobile until lg breakpoint, I will be
          green.300. Any undefined key in the object will define the base style
        </AppBox>
        <AppBox p={2} bg={{ _: 'red.300', md: 'yellow.300', lg: 'green.300' }}>
          With named response parameters. I will be red.300 on mobile , yellow.300 on md breakpoint,
          and green.300 on lg breakpoint
        </AppBox>
        <AppBox p={2} bg={['red.300', 'yellow.300', 'green.300']}>
          With array parameters. It goes from the lower breakpoint and goes to the next breakpoint.
          I will be red.300 on lowest breakpoint, then yellow.300 on the tablet breakpoint and
          finally green.300 in the desktop breakpoint
        </AppBox>
        <AppBox p={2} bg={['red.300', null, 'green.300']}>
          You can also skip some breakpoint with the array parameter by providing a null value.
          Here, it will skip the tablet breakpoint (and thus keeping the red.300 value until
          desktop)
        </AppBox>
      </AppBox>
    );
  })
  .add('with custom css', () => {
    return (
      <AppBox display="flex" gridGap={2}>
        <AppBox
          p={2}
          bg="blue.300"
          color="white"
          css={css`
            p {
              &:last-of-type {
                color: ${({ theme }) => theme.colors.green[800]};
              }
            }
          `}>
          <p>Using css function</p>
          <p>with template litterals from</p>
          <p>styled component</p>
        </AppBox>
        <AppBox
          p={2}
          bg="yellow.400"
          css={({ theme }) => ({ 'p:last-of-type': { color: theme.colors.pink[400] } })}>
          <p>Using css function</p>
          <p>with object from</p>
          <p>styled component</p>
        </AppBox>
      </AppBox>
    );
  });
