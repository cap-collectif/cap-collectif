// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, withKnobs } from '@storybook/addon-knobs';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import CardType from '../components/Ui/Card/CardType';
import CardCover from '../components/Ui/Card/CardCover';
import CardStatus from '../components/Ui/Card/CardStatus';

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

      return (
        <CardContainer>
          <CardType color="#707070">{type}</CardType>
          <CardCover>
            <img src={coverImg} alt={coverTitle} />
          </CardCover>
          <div className="card__body">
            <div className="card__body__infos">
              <h3 className="card__title">
                <a href={titleLink}>{title}</a>
              </h3>
            </div>
          </div>
          <CardStatus className="status--primary">{status}</CardStatus>
        </CardContainer>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
