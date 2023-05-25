// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import WhatsNew from '~/components/InteClient/WhatsNew/WhatsNew';

const news = [
  {
    title: "Faut-il inscrire un seuil d'âge de non-consentement dès 13 ans dans la loi ?",
    body: "Le 14 février sur CNEWS, la ministre de l'enseignement supérieur Frédérique Vidal déclarait",
    cover: 'https://ichef.bbci.co.uk/news/640/cpsprodpb/59E3/production/_107911032_justice.jpg',
    url: '',
    hasSeparator: true,
    isButtonPlain: false,
  },
  {
    title:
      "Faut-il mettre en place un <strong>revenu universel</strong> sous forme de crédit d'impôt ?",
    body: 'Benoît HAMON et Gaspard KOENING s’expriment. Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre provisoire',
    cover: 'https://i.ytimg.com/vi/pXM2kKICN_Q/maxresdefault.jpg',
    url: '',
    hasSeparator: false,
    isButtonPlain: true,
  },
];

storiesOf('Inté client/WhatsNew', module).add(
  'Default',
  () => (
    <div style={{ maxWidth: '1100px', margin: 'auto' }}>
      <WhatsNew newsArray={news} />
    </div>
  ),
  {
    knobsToBo: {
      componentName: 'WhatsNewApp',
    },
  },
);
