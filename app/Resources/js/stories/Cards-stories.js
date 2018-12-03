// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs';
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
      const cardType = boolean('Display card type', true);
      const type = text('Type', 'My type');
      const colorType = text('Type color', '#707070');
      const cardCover = boolean('Display card cover', true);
      const cardBody = boolean('Display card body', true);
      const title = text('Title', 'Project title');
      const titleTagName = text('Title tag name', 'h2');
      const cardCounters = boolean('Display card counters', true);
      const cardStatus = boolean('Display card status', true);
      const status = text('Status', 'My status');
      const statusBgColor = select('Status background color', statusColorOption, 'default');

      Card.Cover.displayName = 'Card.Cover';
      // $FlowFixMe
      Card.Type.displayName = 'Card.Type';
      // $FlowFixMe
      Card.Status.displayName = 'Card.Status';
      Card.Body.displayName = 'Card.Body';
      // $FlowFixMe
      Card.Title.displayName = 'Card.Title';
      Card.Counters.displayName = 'Card.Counters';

      return (
        <Card>
          {cardType && <Card.Type bgColor={colorType}>{type}</Card.Type>}
          {cardCover && (
            <Card.Cover>
              <Image src="https://source.unsplash.com/collection/1127828" alt="Project title" />
            </Card.Cover>
          )}
          {cardBody && (
            <Card.Body>
              <Card.Title tagName={titleTagName}>
                <a href="https://ui.cap-collectif.com">{title}</a>
              </Card.Title>
            </Card.Body>
          )}
          {cardCounters && (
            <Card.Counters>
              <div className="card-counters__item">
                <div className="card-counters__value">0</div>
                <div>Lorem ipsum</div>
              </div>
              <div className="card-counters__item">
                <div className="card-counters__value">40</div>
                <div>Lorem ipsum</div>
              </div>
            </Card.Counters>
          )}
          {cardStatus && <Card.Status bgColor={statusBgColor}>{status}</Card.Status>}
        </Card>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
        propTablesExclude: [Image, Card.Cover, Card.Counters, Card.Body],
      },
    },
  );
