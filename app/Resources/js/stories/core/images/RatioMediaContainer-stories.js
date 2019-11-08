// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number, text } from '@storybook/addon-knobs';

import RatioMediaContainer from '../../../components/Ui/Medias/RatioMediaContainer';

storiesOf('Core|Images/RatioMediaContainer', module).add(
  'default',
  () => {
    const url = text('Url', 'https://source.unsplash.com/collection/1353633');
    const alt = text('Alternative', 'My alternative');
    const ratioX = number('ratio (x)', 16);
    const ratioY = number('ratio (y)', 9);

    return (
      <RatioMediaContainer ratioX={ratioX} ratioY={ratioY}>
        <img src={url} alt={alt} />
      </RatioMediaContainer>
    );
  },
  {
    info: {
      text: `
          <p>Ce composant permet d'ajouter des images avec un ratio spécifique (comme par exemple <code>16/9</code>).</p>
          <p> Il est important pour l'accessibilité d'indiquer le texte alternative (<code>alt</code>) dans la balise <code>img</code> que vous allez ajouter.</p>
          <p>Emplacement : <code>import RatioMediaContainer from '../Ui/Medias/RatioMediaContainer';</code></p>
        `,
    },
  },
);
