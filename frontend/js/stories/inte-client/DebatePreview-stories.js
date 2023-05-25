// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import DebatePreviewItem from '~/components/InteClient/DebatePreview/DebatePreviewItem/DebatePreviewItem';
import DebatePreviewList from '~/components/InteClient/DebatePreview/DebatePreviewList/DebatePreviewList';

const inputs = [
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    buttonText: {
      fr: 'Participer',
      en: 'Participate',
    },
    img: 'https://source.unsplash.com/random/800x800',
    link: {
      fr: 'https://gogo.com',
      en: 'https://gogo.com',
    },
    lang: 'fr',
  },
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    buttonText: {
      fr: 'Participer',
      en: 'Participate',
    },
    img: 'https://source.unsplash.com/random/800x800',
    link: {
      fr: 'https://gogo.com',
      en: 'https://gogo.com',
    },
    lang: 'fr',
  },
  {
    title: {
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    },
    buttonText: {
      fr: 'Participer',
      en: 'Participate',
    },
    img: 'https://source.unsplash.com/random/800x800',
    link: {
      fr: 'https://gogo.com',
      en: 'https://gogo.com',
    },
    lang: 'fr',
  },
];

storiesOf('Inté client/DebatePreview/List', module).add(
  'Default',
  () => <DebatePreviewList debates={inputs} lang={text('lang', 'fr')} />,
  {
    knobsToBo: {
      componentName: 'DebatePreviewApp',
    },
  },
);

storiesOf('Inté client/DebatePreview/Item', module).add('Default', () => (
  <DebatePreviewItem
    title={{
      fr: "Comment dépasser la recherche de profit à court terme de l'entreprise ?",
      en: 'How are you ?',
    }}
    link={{
      fr: 'https://gogo.com',
      en: 'https://gogo.com',
    }}
    buttonText={{
      fr: 'Participer',
      en: 'Participate',
    }}
    img="https://source.unsplash.com/random/800x800"
    lang={text('lang', 'fr')}
  />
));
