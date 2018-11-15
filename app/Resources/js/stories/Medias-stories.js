// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, withKnobs, number, text } from '@storybook/addon-knobs';
import DarkenGradientMedia from '../components/Ui/Medias/DarkenGradientMedia';
import SixteenNineMedia from '../components/Ui/Medias/SixteenNineMedia';
import { UserAvatar } from '../components/User/UserAvatar';

storiesOf('Medias', module)
  .addDecorator(withKnobs)
  .add(
    'Darken gradient media',
    () => {
      const width = number('Width', 600);
      const height = number('Height', 400);
      const url = text('Url', 'https://source.unsplash.com/collection/1353633');
      const title = text('Title', 'My title');
      const linearGradient = boolean('Linear Gradient', true);

      return (
        <DarkenGradientMedia
          width={`${width}px`}
          height={`${height}px`}
          url={url}
          title={title}
          linearGradient={linearGradient}
        />
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    '16:9 media',
    () => {
      const url = text('Url', 'https://source.unsplash.com/collection/1353633');
      const alt = text('Alternative', 'My alternative');

      return (
        <SixteenNineMedia>
          <img src={url} alt={alt} />
        </SixteenNineMedia>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Avatar',
    () => {
      const url = text('Url', 'https://source.unsplash.com/collection/181462');
      const imageUrlIsDisplay = boolean('Display url of image', true);
      const name = text('User name', 'Karim');
      const profile = text('Profile link', 'https://ui.cap-collectif.com/');
      const profileLinkIsDisplay = boolean('Display Profile link', true);
      const size = number('Size', 45);

      const author = {
        username: name,
        media: imageUrlIsDisplay ? { url } : null,
        _links: profileLinkIsDisplay ? { profile } : {},
      };

      return <UserAvatar user={author} size={size} defaultAvatar={null} />;
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
