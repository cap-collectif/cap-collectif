// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import GlobalStepItem from '~/components/InteClient/GlobalStep/GlobalStepItem/GlobalStepItem';
import GlobalStepList from '~/components/InteClient/GlobalStep/GlobalStepList/GlobalStepList';

const inputs = [
  {
    title: { fr: '1 Débattez', en: '1 Debate' },
    subtitle: { fr: 'avec 50 dirigeant(e)s européens', en: 'with many european leaders' },
    description: {
      fr: 'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
      en: 'Civic tech Cap Collectif in english',
    },
    colors: { line: '#C2E0FF' },
    lang: 'fr',
  },
  {
    title: { fr: '2 Votez', en: '2 Vote' },
    subtitle: { fr: 'avec 50 dirigeant(e)s européens', en: 'with many european leaders' },
    description: {
      fr: 'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
      en: 'Civic tech Cap Collectif in english',
    },
    colors: { line: '#FFD08A' },
    lang: 'fr',
  },
  {
    title: { fr: '3 Construisez', en: '3 Develop' },
    subtitle: { fr: 'avec 50 dirigeant(e)s européens', en: 'with many european leaders' },
    description: {
      fr: 'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société. La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
      en: 'Civic tech Cap Collectif in english',
    },
    colors: { line: '#CEF3D6' },
    lang: 'fr',
  },
];

storiesOf('Inté client/GlobalStep/List', module).add(
  'Default',
  () => <GlobalStepList steps={inputs} lang={text('lang', 'fr')} />,
  {
    knobsToBo: {
      componentName: 'GlobalStepApp',
    },
  },
);

storiesOf('Inté client/GlobalStep/Item', module).add('Default', () => (
  <GlobalStepItem
    title={{ fr: '1 Débattez', en: '1 Debate' }}
    subtitle={{ fr: 'avec 50 dirigeant(e)s européens', en: 'with many european leaders' }}
    description={{
      fr: 'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
      en: 'Civic tech Cap Collectif in english',
    }}
    colors={{ line: '#C2E0FF' }}
    lang={text('lang', 'fr')}
  />
));
