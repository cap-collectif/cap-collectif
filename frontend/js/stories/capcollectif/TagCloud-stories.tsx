// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import TagCloud from '~/components/Ui/TagCloud/TagCloud'

const data = [
  {
    tag: {
      value: 'Amélioration',
      count: 325,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'infrastructures',
      count: 300,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'françaises',
      count: 300,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'outre-mer',
      count: 290,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'mise',
      count: 70,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'Faible',
      count: 65,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'Niveau',
      count: 50,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'Maire',
      count: 130,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'action',
      count: 125,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'problèmes',
      count: 55,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: '68',
      count: 34,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'eux',
      count: 30,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'voie',
      count: 40,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'famille',
      count: 71,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'faits',
      count: 70,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'durcir',
      count: 35,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'non',
      count: 32,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'élaboration',
      count: 28,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'lui',
      count: 23,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'terrain',
      count: 34,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'eau',
      count: 50,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'publique',
      count: 50,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'gendarmerie',
      count: 130,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'souvent',
      count: 40,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'pouvoir',
      count: 120,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'règles',
      count: 30,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'ados',
      count: 65,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'débat',
      count: 200,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'politique',
      count: 255,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'concertation',
      count: 170,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'consulter',
      count: 70,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'innover',
      count: 35,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'sentir',
      count: 70,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'problèmes',
      count: 35,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'entente',
      count: 70,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
  {
    tag: {
      value: 'co-construire',
      count: 35,
      onClick: () => {},
    },
    marginBottom: -1 * Math.floor(Math.random() * 25),
  },
]
storiesOf('Cap Collectif/TagCloud', module).add('default', () => {
  return (
    <div
      style={{
        margin: 'auto',
        maxWidth: 650,
      }}
    >
      <TagCloud minSize={12} maxSize={45} tags={data} />
    </div>
  )
})
