// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject } from 'storybook-addon-knobs';
import GlobalStepItem from '~/components/InteClient/GlobalStep/GlobalStepItem/GlobalStepItem';
import GlobalStepList from '~/components/InteClient/GlobalStep/GlobalStepList/GlobalStepList';

const inputs = [
  {
    title: '1 Débattez',
    subtitle: 'avec 50 dirigeant(e)s européens',
    description:
      'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
    colors: { line: '#C2E0FF' },
  },
  {
    title: '2 Votez',
    subtitle: 'et proposez vos solutions',
    description:
      'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
    colors: { line: '#FFD08A' },
  },
  {
    title: '3 Construisez',
    subtitle: 'la synthèse remise au Ministre',
    description:
      'La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société.',
    colors: { line: '#CEF3D6' },
  },
];

storiesOf('Inté client|GlobalStep/List', module).add(
  'Default',
  () => <GlobalStepList steps={arrayObject('users', inputs)} />,
  {
    knobsToBo: {
      componentName: 'UserSliderApp',
    },
  },
);

storiesOf('Inté client|GlobalStep/Item', module).add('Default', () => (
  <GlobalStepItem
    title="1 Débattez"
    subtitle="avec 50 dirigeant(e)s européens"
    description="La civic tech Cap Collectif, le NextGen Entreprise Summit et 50 dirigeant(e)s français et internationaux s’associent aujourd’hui pour vous proposer de repenser le rôle de l’entreprise dans la société."
    colors={{ line: '#C2E0FF' }}
  />
));
