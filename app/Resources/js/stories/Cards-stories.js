// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, withKnobs } from '@storybook/addon-knobs';
import Card from '../components/Ui/Card/Card';
import Image from '../components/Ui/Medias/Image';

storiesOf('Cards', module)
  .addDecorator(withKnobs)
  .add(
    'Card',
    () => {
      const type = text('Type', 'My type');
      const status = text('Status', 'My status');
      const coverImg = text('Cover image', 'https://source.unsplash.com/collection/1127828');
      const coverTitle = text('Cover title', 'Project title');
      const titleLink = text('Title link', 'https://ui.cap-collectif.com');
      const title = text('Title', 'Project title');
      const titleTagName = text('Title tag name', 'h2');

      Card.Cover.displayName = 'Card.Cover';
      Card.Type.displayName = 'Card.Type';
      Card.Status.displayName = 'Card.Status';
      Card.Body.displayName = 'Card.Body';
      Card.Title.displayName = 'Card.Title';

      return (
        <Card>
          <Card.Type color="#707070">{type}</Card.Type>
          <Card.Cover>
            <Image src={coverImg} alt={coverTitle} />
          </Card.Cover>
          <Card.Body>
            <div className="flex-1">
              <Card.Title tagName={titleTagName}>
                <a href={titleLink}>{title}</a>
              </Card.Title>
            </div>
          </Card.Body>
          <Card.Status className="status--primary">{status}</Card.Status>
        </Card>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
        propTablesExclude: [Image],
      },
    },
  );
