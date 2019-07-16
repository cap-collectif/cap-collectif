// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import Image from '../../../components/Ui/Medias/Image';

storiesOf('Core|Images/Image', module).add(
  'default',
  () => {
    const src = text('Src', 'https://source.unsplash.com/collection/181462');
    const alt = text('Alt', 'My alternative');
    const width = text('Width', '400px');
    const height = text('Height', '300px');
    const objectFit = text('Object fit', 'cover');

    return <Image src={src} width={width} height={height} objectFit={objectFit} alt={alt} />;
  },
  {
    info: {
      text: `
            <p>Le texte alternatif <code>alt</code> de l'image peut rester vide (valeur par défaut) dans le cas des images à but uniquement décoratif et sans intérêt prioritaire pour la communication.</p>
            <p>Emplacement : <code>import Image from '../Ui/Medias/Image';</code></p>
        `,
    },
  },
);
