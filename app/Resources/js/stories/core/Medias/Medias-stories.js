// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import Media from '../../../components/Ui/Medias/Media/Media';
import Avatar from '../../../components/Ui/Medias/Avatar';

storiesOf('Core|Medias', module).add(
  'Media',
  () => {
    const src = text('Src', 'https://source.unsplash.com/collection/181462');
    const alt = text('Alt', 'My alternative');
    const headingComponentClass = text('Heading component class', 'h1');

    Media.Left.displayName = 'Media.Left';
    Media.Body.displayName = 'Media.Body';
    Media.Heading.displayName = 'Media.Heading';

    return (
      <Media>
        <Media.Left>
          <Avatar src={src} alt={alt} />
        </Media.Left>
        <Media.Body>
          <Media.Heading componentClass={headingComponentClass}>Media Heading</Media.Heading>
          <p>
            Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante
            sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra
            turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis
            in faucibus.
          </p>
        </Media.Body>
      </Media>
    );
  },
  {
    info: {
      text: `
            <p>Emplacement : <code>import Media from '../Ui/Medias/Media/Media';</code></p>
        `,
      propTablesExclude: [Avatar],
    },
  },
);
