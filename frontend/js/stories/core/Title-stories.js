// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import Title, { TYPE } from '~/components/Ui/Title/Title';

storiesOf('Core/Title', module).add('default', () => {
  const myTitle = text('Content', 'Ceci est un titre');

  return (
    <>
      <Title type={TYPE.H1}>{myTitle}</Title>
      <Title type={TYPE.H2}>{myTitle}</Title>
      <Title type={TYPE.H3}>{myTitle}</Title>
    </>
  );
});
