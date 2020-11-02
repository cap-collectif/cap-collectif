// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import TagCloud from '~/components/Ui/TagCloud/TagCloud';

const data = [
  { value: 'Amélioration', count: 325 },
  { value: 'infrastructures', count: 300 },
  { value: 'françaises', count: 300 },
  { value: 'outre-mer', count: 290 },
  { value: 'mise', count: 70 },
  { value: 'Faible', count: 65 },
  { value: 'Niveau', count: 50 },
  { value: 'Maire', count: 130 },
  { value: 'action', count: 125 },
  { value: 'problèmes', count: 55 },
  { value: '68', count: 34 },
  { value: 'eux', count: 30 },
  { value: 'voie', count: 40 },
  { value: 'famille', count: 71 },
  { value: 'faits', count: 70 },
  { value: 'durcir', count: 35 },
  { value: 'non', count: 32 },
  { value: 'élaboration', count: 28 },
  { value: 'lui', count: 23 },
  { value: 'terrain', count: 34 },
  { value: 'eau', count: 50 },
  { value: 'publique', count: 50 },
  { value: 'gendarmerie', count: 130 },
  { value: 'souvent', count: 40 },
  { value: 'pouvoir', count: 120 },
  { value: 'règles', count: 30 },
  { value: 'ados', count: 65 },
  { value: 'débat', count: 200 },
  { value: 'politique', count: 255 },
  { value: 'concertation', count: 170 },
  { value: 'consulter', count: 70 },
  { value: 'innover', count: 35 },
  { value: 'sentir', count: 70 },
  { value: 'problèmes', count: 35 },
  { value: 'entente', count: 70 },
  { value: 'co-construire', count: 35 },
];

storiesOf('Cap Collectif|TagCloud', module).add('default', () => {
  return (
    <div style={{ margin: 'auto', maxWidth: 650 }}>
      <TagCloud minSize={12} maxSize={45} tags={data} />
    </div>
  );
});
