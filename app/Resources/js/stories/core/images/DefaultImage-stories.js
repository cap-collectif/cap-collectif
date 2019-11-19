// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import DefaultImage from '../../../components/Ui/Medias/DefaultImage';
import ProjectIcon from '../../../components/Ui/Icons/ProjectIcon';

storiesOf('Core|Images/DefaultImage', module).add(
  'default',
  () => {
    const width = text('Width', '100%');
    const height = text('Height', '100%');

    ProjectIcon.displayName = 'ProjectIcon';

    return (
      <DefaultImage width={width} height={height}>
        <ProjectIcon />
      </DefaultImage>
    );
  },
  {
    info: {
      text: `
          <p>La couleur de fond par défaut est la <code>Couleur primaire</code>. Celle ci est personnalisable par le client dans le back office.</p>
          <p>Emplacement : <code>import DefaultImage from '../Ui/Medias/DefaultImage';</code></p>
        `,
      propTablesExclude: [ProjectIcon],
    },
  },
);
