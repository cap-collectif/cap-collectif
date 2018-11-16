// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, withKnobs, number, text } from '@storybook/addon-knobs';
import DarkenGradientMedia from '../components/Ui/Medias/DarkenGradientMedia';
import { UserAvatar } from '../components/User/UserAvatar';
import RatioMediaContainer from '../components/Ui/Medias/RatioMediaContainer';
import Media from '../components/Ui/Medias/Media/index';
import Image from '../components/Ui/Medias/Image';

storiesOf('Medias', module)
  .addDecorator(withKnobs)
  .add(
    'Darken gradient media',
    () => {
      const width = text('Width', '600px');
      const height = text('Height', '400px');
      const url = text('Url', 'https://source.unsplash.com/collection/1353633');
      const linearGradient = boolean('Linear Gradient', true);
      const content = text('Content', null);

      return (
        <DarkenGradientMedia
          width={width}
          height={height}
          url={url}
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
        `,
      },
    },
  )
  .add(
    'Ratio media container',
    () => {
      const url = text('Url', 'https://source.unsplash.com/collection/1353633');
      const alt = text('Alternative', 'My alternative');
      const width = number('Width (ratio)', 16);
      const height = number('Height (ratio)', 9);

      return (
        <RatioMediaContainer width={width} height={height}>
          <img src={url} alt={alt} />
        </RatioMediaContainer>
      );
    },
    {
      info: {
        text: `
          <p>Ce composant permet d'ajouter des images avec un ratio spécifique (comme par exemple <code>16/9</code>.</p>
          <p> Il est important pour l'accessibilité d'indiquer le texte alternative (<code>alt</code>) dans la balise <code>img</code> que vous allez ajouter.</p>
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

      return <UserAvatar user={author} size={size} />;
    },
    {
      info: {
        text: `
          <p>La couleur de l'avatar par défaut est la <code>Couleur primaire</code>. Celle ci est personnalisable par le client dans le back office.</p>
          <p>Si vous avez besoin de placer du texte à sa droite, veuillez plutôt utiliser le composant <a href="">Media</a>.</p>
        `,
      },
    },
  )
  .add(
    'Media',
    () => {
      const src = text('Src', 'https://source.unsplash.com/collection/181462');
      const alt = text('Alt', 'My alternative');
      const width = number('Width', 45);
      const height = number('Height', 45);
      const headingComponentClass = text('Heading component class', 'h1');

      Media.Left.displayName = 'Media.Left';
      Media.Body.displayName = 'Media.Body';
      Media.Heading.displayName = 'Media.Heading';

      return (
        <Media>
          <Media.Left>
            <Image src={src} width={width} height={height} alt={alt} />
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
            <p>Lorem</p>
        `,
      },
    },
  )
  .add(
    'Image',
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
            <p>Lorem</p>
        `,
      },
    },
  );
