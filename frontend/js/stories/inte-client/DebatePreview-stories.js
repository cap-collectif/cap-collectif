// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject } from 'storybook-addon-knobs';
import DebatePreviewItem from '~/components/InteClient/DebatePreview/DebatePreviewItem/DebatePreviewItem';
import DebatePreviewList from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList';

const inputs = [
  {
    title: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
    img: 'https://source.unsplash.com/random/800x800',
  },
  {
    title: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
    img: 'https://source.unsplash.com/random/800x800',
  },
  {
    title: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
    img: 'https://source.unsplash.com/random/800x800',
  },
];

storiesOf('Inté client|DebatePreview/List', module).add(
  'Default',
  () => <DebatePreviewList debates={arrayObject('debates', inputs)} />,
  {
    knobsToBo: {
      componentName: 'DebatePreviewApp',
    },
  },
);

storiesOf('Inté client|DebatePreview/Item', module).add('Default', () => (
  <DebatePreviewItem
    title="Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être."
    img="https://source.unsplash.com/random/800x800"
  />
));
