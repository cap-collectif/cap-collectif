// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject } from 'storybook-addon-knobs';
import ConsultationStepItem from '~/components/InteClient/ConsultationStep/ConsultationStepItem/ConsultationStepItem';
import ConsultationStepList from '~/components/InteClient/ConsultationStep/ConsultationStepList/ConsultationStepList';

const inputs = [
  {
    number: '1',
    title: 'Lancement de la consultation à l’échelle européenne.',
    date: '15 septembre au 23 octobre',
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '2',
    title:
      "Remise du Baromètre au Ministre de l'Économie, des Finances et de la Relance Bruno Le Maire",
    date: '15 septembre au 23 octobre',
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '3',
    title: 'Lancement de la consultation à l’échelle européenne.',
    date: '15 septembre au 23 octobre',
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '4',
    title: 'Lancement de la consultation à l’échelle européenne.',
    date: '15 septembre au 23 octobre',
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '5',
    title: 'Lancement de la consultation à l’échelle européenne.',
    date: '15 septembre au 23 octobre',
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
];

storiesOf('Inté client|ConsultationStep/List', module).add(
  'Default',
  () => <ConsultationStepList steps={arrayObject('steps', inputs)} />,
  {
    knobsToBo: {
      componentName: 'ConsultationStepApp',
    },
  },
);

storiesOf('Inté client|ConsultationStep/Item', module).add('Default', () => (
  <ConsultationStepItem
    number="1"
    title="Lancement de la consultation à l’échelle européenne."
    date="15 septembre au 23 octobre"
    colors={{ primary: '#40408E', secondary: '#E0F0FF' }}
  />
));
