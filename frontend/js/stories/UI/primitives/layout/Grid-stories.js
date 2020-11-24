// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select, text } from 'storybook-addon-knobs';
import Grid from '~ui/Primitives/Layout/Grid';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight } from '~ui/Primitives/constants';

const getMode = () =>
  select(
    'Fit mode',
    {
      AutoFit: 'auto-fit',
      AutoFill: 'auto-fill',
    },
    'auto-fit',
  );

const getMin = () => text('Min', '100px');

const getMax = () => text('Max', '1fr');

const content = (
  <>
    <AppBox p={2} bg="green.300">
      Venti
    </AppBox>
    <AppBox p={2} bg="red.400">
      Klee
    </AppBox>
    <AppBox p={2} bg="blue.300">
      Qiqi
    </AppBox>
    <AppBox p={2} bg="purple.600" color="white" fontWeight={FontWeight.Black}>
      Fishcl
    </AppBox>
  </>
);

storiesOf('Design system|Primitives/Layout/Grid', module)
  .add('default', () => {
    return <Grid>{content}</Grid>;
  })
  .add('with responsive styles', () => {
    return (
      <Grid templateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr']} gap={[2, 4, 5]}>
        {content}
      </Grid>
    );
  })
  .add('with auto fit', () => {
    return <Grid autoFit>{content}</Grid>;
  })
  .add('with auto fill', () => {
    return <Grid autoFill>{content}</Grid>;
  })
  .add('with auto sizing columns options', () => {
    const isAutoFit = getMode() === 'auto-fit';
    return (
      <Grid
        {...(isAutoFit
          ? {
              autoFit: {
                min: getMin(),
                max: getMax(),
              },
            }
          : {
              autoFill: {
                min: getMin(),
                max: getMax(),
              },
            })}>
        {content}
      </Grid>
    );
  });
