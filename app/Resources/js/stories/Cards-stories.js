// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import Card from '../components/Ui/Card/Card';
import Image from '../components/Ui/Medias/Image';

const statusColorOption = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
  Primary: 'primary',
  Default: 'default',
};

storiesOf('Cards', module)
  .addDecorator(withKnobs)
  .add(
    'Card',
    () => {
      const type = text('Type', 'My type');
      const colorType = text('Type color', '#707070');
      const status = text('Status', 'My status');
      const statusBgColor = select('Status background color', statusColorOption, 'default');
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
          <Card.Type bgColor={colorType}>{type}</Card.Type>
          <Card.Cover>
            <Image src="https://source.unsplash.com/collection/1127828" alt="Project title" />
          </Card.Cover>
          <Card.Body>
            <Card.Title tagName={titleTagName}>
              <a href={titleLink}>{title}</a>
            </Card.Title>
          </Card.Body>
          <Card.Status bgColor={statusBgColor}>{status}</Card.Status>
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
