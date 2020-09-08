// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, text } from 'storybook-addon-knobs';
import DebatePreviewItem from '~/components/InteClient/DebatePreview/DebatePreviewItem/DebatePreviewItem';
import DebatePreviewList from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList';

const inputs = [
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    img: 'https://source.unsplash.com/random/800x800',
  },
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    img: 'https://source.unsplash.com/random/800x800',
  },
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    img: 'https://source.unsplash.com/random/800x800',
  },
];

storiesOf('Inté client|DebatePreview/List', module).add(
  'Default',
  () => <DebatePreviewList debates={arrayObject('debates', inputs)} lang={text('lang', 'fr')} />,
  {
    knobsToBo: {
      componentName: 'DebatePreviewApp',
    },
  },
);

storiesOf('Inté client|DebatePreview/Item', module).add('Default', () => (
  <DebatePreviewItem
    title={{
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    }}
    img="https://source.unsplash.com/random/800x800"
    lang={text('lang', 'fr')}
  />
));
