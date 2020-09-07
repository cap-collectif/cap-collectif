// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject } from 'storybook-addon-knobs';
import ProposalPreviewItem from '~/components/InteClient/ProposalPreview/ProposalPreviewItem/ProposalPreviewItem';
import ProposalPreviewList from '~/components/InteClient/ProposalPreview/ProposalPreviewList/ProposalPreviewList';

const inputs = [
  {
    content:
      'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: 'Débattre',
    author: 'Isabelle Kocher',
    job: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
    colors: { button: '#40408E', name: '#79A3E0' },
    link: 'https://go.com',
  },
  {
    content:
      'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: 'Débattre',
    author: 'Isabelle Kocher',
    job: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
    colors: { button: '#40408E', name: '#79A3E0' },
    link: 'https://go.com',
  },
  {
    content:
      'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: 'Débattre',
    author: 'Isabelle Kocher',
    job: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
    colors: { button: '#40408E', name: '#79A3E0' },
    link: 'https://go.com',
  },
  {
    content:
      'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: 'Débattre',
    author: 'Isabelle Kocher',
    job: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
    colors: { button: '#40408E', name: '#79A3E0' },
    link: 'https://go.com',
  },
];

storiesOf('Inté client|ProposalPreview/List', module).add(
  'Default',
  () => <ProposalPreviewList proposals={arrayObject('proposals', inputs)} />,
  {
    knobsToBo: {
      componentName: 'ProposalPreviewApp',
    },
  },
);

storiesOf('Inté client|ProposalPreview/Item', module).add('Default', () => (
  <ProposalPreviewItem
    content="Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être."
    img="https://source.unsplash.com/random/300x300"
    buttonLabel="Débattre"
    author="Isabelle Kocher"
    job="Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co"
    colors={{ button: '#40408E', name: '#79A3E0' }}
    link="https://go.com"
  />
));
