// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import ProposalPreviewItem from '~/components/InteClient/ProposalPreview/ProposalPreviewItem/ProposalPreviewItem'
import ProposalPreviewList from '~/components/InteClient/ProposalPreview/ProposalPreviewList/ProposalPreviewList'

const inputs = [
  {
    content: {
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    },
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: {
      fr: 'Débattre',
      en: 'Discuss',
    },
    author: 'Isabelle Kocher',
    job: {
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    },
    colors: {
      button: '#40408E',
      name: '#79A3E0',
    },
    link: {
      fr: 'https://go.com',
      en: 'https://go.com',
    },
    lang: 'fr',
  },
  {
    content: {
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    },
    img: 'https://nextgen.cap-collectif.com/media/default/0001/01/2dd6b1c54eb423d3bfebd9689499f27142e0e3be.jpeg',
    buttonLabel: {
      fr: 'Débattre',
      en: 'Discuss',
    },
    author: 'Isabelle Kocher',
    job: {
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    },
    colors: {
      button: '#40408E',
      name: '#79A3E0',
    },
    link: {
      fr: 'https://go.com',
      en: 'https://go.com',
    },
    lang: 'fr',
  },
  {
    content: {
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    },
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: {
      fr: 'Débattre',
      en: 'Discuss',
    },
    author: 'Isabelle Kocher',
    job: {
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    },
    colors: {
      button: '#40408E',
      name: '#79A3E0',
    },
    link: {
      fr: 'https://go.com',
      en: 'https://go.com',
    },
    lang: 'fr',
  },
  {
    content: {
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    },
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: {
      fr: 'Débattre',
      en: 'Discuss',
    },
    author: 'Isabelle Kocher',
    job: {
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    },
    colors: {
      button: '#40408E',
      name: '#79A3E0',
    },
    link: {
      fr: 'https://go.com',
      en: 'https://go.com',
    },
    lang: 'fr',
  },
  {
    content: {
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    },
    img: 'https://source.unsplash.com/random/300x300',
    buttonLabel: {
      fr: 'Débattre',
      en: 'Discuss',
    },
    author: 'Isabelle Kocher',
    job: {
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    },
    colors: {
      button: '#40408E',
      name: '#79A3E0',
    },
    link: {
      fr: 'https://go.com',
      en: 'https://go.com',
    },
    lang: 'fr',
  },
]
storiesOf('Inté client/ProposalPreview/List', module).add(
  'Default',
  () => <ProposalPreviewList proposals={inputs} lang={text('lang', 'fr')} />,
  {
    knobsToBo: {
      componentName: 'ProposalPreviewApp',
    },
  },
)
storiesOf('Inté client/ProposalPreview/Item', module).add('Default', () => (
  <ProposalPreviewItem
    content={{
      fr: 'Mettons fin à la recherche de profit à court terme en dotant nos entreprises d’une raison d’être.',
      en: 'Lets end the search.',
    }}
    img="https://source.unsplash.com/random/300x300"
    buttonLabel={{
      fr: 'Débattre',
      en: 'Discuss',
    }}
    author="Isabelle Kocher"
    job={{
      fr: 'Coordinatrice des actions du Collectif Économie Inclusive at Simplon.co',
      en: 'Important job',
    }}
    colors={{
      button: '#40408E',
      name: '#79A3E0',
    }}
    link={{
      fr: 'https://go.com',
      en: 'https://go.com',
    }}
    lang={text('lang', 'fr')}
  />
))
