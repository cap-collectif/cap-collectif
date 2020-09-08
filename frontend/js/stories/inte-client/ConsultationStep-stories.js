// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, text } from 'storybook-addon-knobs';
import ConsultationStepItem from '~/components/InteClient/ConsultationStep/ConsultationStepItem/ConsultationStepItem';
import ConsultationStepList from '~/components/InteClient/ConsultationStep/ConsultationStepList/ConsultationStepList';

const inputs = [
  {
    number: '1',
    title: { fr: 'Lancement de la consultation à l’échelle européenne.', en: 'Well play' },
    date: { fr: '15 septembre au 23 octobre', en: '15 september to 23 october' },
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '2',
    title: { fr: 'Lancement de la consultation à l’échelle européenne.', en: 'Well play' },
    date: { fr: '15 septembre au 23 octobre', en: '15 september to 23 october' },
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '3',
    title: { fr: 'Lancement de la consultation à l’échelle européenne.', en: 'Well play' },
    date: { fr: '15 septembre au 23 octobre', en: '15 september to 23 october' },
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '4',
    title: { fr: 'Lancement de la consultation à l’échelle européenne.', en: 'Well play' },
    date: { fr: '15 septembre au 23 octobre', en: '15 september to 23 october' },
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
  {
    number: '5',
    title: { fr: 'Lancement de la consultation à l’échelle européenne.', en: 'Well play' },
    date: { fr: '15 septembre au 23 octobre', en: '15 september to 23 october' },
    colors: { primary: '#40408E', secondary: '#E0F0FF' },
  },
];

storiesOf('Inté client|ConsultationStep/List', module).add(
  'Default',
  () => <ConsultationStepList steps={arrayObject('steps', inputs)} lang={text('lang', 'fr')} />,
  {
    knobsToBo: {
      componentName: 'ConsultationStepApp',
    },
  },
);

storiesOf('Inté client|ConsultationStep/Item', module).add('Default', () => (
  <ConsultationStepItem
    number="1"
    title={{
      fr: 'Lancement de la consultation à l’échelle européenne.',
      en: 'Well play',
    }}
    date={{ fr: '15 septembre au 23 octobre', en: '15 september to 23 october' }}
    colors={{ primary: '#40408E', secondary: '#E0F0FF' }}
    lang={text('lang', 'fr')}
  />
));
