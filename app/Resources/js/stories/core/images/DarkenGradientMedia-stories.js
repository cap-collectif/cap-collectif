// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text } from 'storybook-addon-knobs';
import DarkenGradientMedia from '../../../components/Ui/Medias/DarkenGradientMedia';

storiesOf('Core|Images/DarkenGradientMedia', module).add(
  'default',
  () => {
    const width = text('Width', '600px');
    const height = text('Height', '400px');
    const url = text('Url', 'https://source.unsplash.com/collection/1353633');
    const alt = text('Alt', '');
    const linearGradient = boolean('Linear Gradient', true);
    const content = text('Content', null);

    return (
      <DarkenGradientMedia
        width={width}
        height={height}
        url={url}
        alt={alt}
        linearGradient={linearGradient}>
        {content}
      </DarkenGradientMedia>
    );
  },
  {
    info: {
      text: `
          <p>Ce composant permet d'ajouter un léger dégradé noir sur une image.</p>
          <p>Ce dégradé peut être utile afin d'améliorer le contraste de l'image et ainsi permettre une meilleure lecture d'un texte superposé.</p>
          <p>Si l'image n'est pas à but décoratif, veuillez préciser l'attribut <code>alt</code>.</p>
          <p>Emplacement : <code>import DarkenGradientMedia from '../Ui/Medias/DarkenGradientMedia';</code></p>
        `,
    },
  },
);
