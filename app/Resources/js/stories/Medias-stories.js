// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, withKnobs, number, text, select } from '@storybook/addon-knobs';
import DarkenGradientMedia from '../components/Ui/Medias/DarkenGradientMedia';
import RatioMediaContainer from '../components/Ui/Medias/RatioMediaContainer';
import Media from '../components/Ui/Medias/Media/Media';
import Image from '../components/Ui/Medias/Image';
import Avatar from '../components/Ui/Medias/Avatar';
import AvatarGroup from '../components/Ui/Medias/AvatarGroup';
import DefaultAvatarGroup from '../components/Ui/Medias/DefaultAvatarGroup';
import DefaultAvatar from '../components/Ui/Medias/DefaultAvatar';
import DefaultImage from '../components/Ui/Medias/DefaultImage';
import ProjectIcon from '../components/Ui/Icons/ProjectIcon';
import AvatarCount from '../components/Ui/Medias/AvatarCount';

const sizeOption = {
  Small: 'small',
  Normal: 'normal',
};

storiesOf('Medias', module)
  .addDecorator(withKnobs)
  .add(
    'Darken gradient media',
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
  )
  .add(
    'Ratio media container',
    () => {
      const url = text('Url', 'https://source.unsplash.com/collection/1353633');
      const alt = text('Alternative', 'My alternative');
      const ratioX = number('ratio (x)', 16);
      const ratioY = number('ratio (y)', 9);

      return (
        <RatioMediaContainer ratioX={ratioX} ratioY={ratioY}>
          <img src={url} alt={alt} />
        </RatioMediaContainer>
      );
    },
    {
      info: {
        text: `
          <p>Ce composant permet d'ajouter des images avec un ratio spécifique (comme par exemple <code>16/9</code>).</p>
          <p> Il est important pour l'accessibilité d'indiquer le texte alternative (<code>alt</code>) dans la balise <code>img</code> que vous allez ajouter.</p>
          <p>Emplacement : <code>import RatioMediaContainer from '../Ui/Medias/RatioMediaContainer';</code></p>
        `,
      },
    },
  )
  .add(
    'Avatar',
    () => {
      const size = select('Size', sizeOption, 'normal');
      const src = text('Src', 'https://source.unsplash.com/collection/181462');
      const alt = text('Alt', 'My alternative');

      return <Avatar size={size} src={src} alt={alt} />;
    },
    {
      info: {
        text: `
          <p>Si vous avez besoin de placer du texte à sa droite, vous pouvez utiliser le composant <a href="https://ui.cap-collectif.com/?selectedKind=Medias&selectedStory=Media">Media</a>.</p>
          <p>Emplacement : <code>import Avatar from '../Ui/Medias/Avatar';</code></p>
        `,
      },
    },
  )
  .add(
    'Avatar Group',
    () => {
      const childrenSize = select('Children size', sizeOption, 'normal');
      const src = text('Src', 'https://source.unsplash.com/collection/181462');
      const alt = text('Alt', 'My alternative');

      return (
        <AvatarGroup childrenSize={childrenSize}>
          <Avatar size={childrenSize} src={src} alt={alt} />
          <DefaultAvatarGroup size={childrenSize} />
          <Avatar size={childrenSize} src={src} alt={alt} />
          <DefaultAvatar size={childrenSize} />
        </AvatarGroup>
      );
    },
    {
      info: {
        text: `
          <p><code>AvatarGroup</code> reçoit en enfant tout type d'avatar.</p>
          <p>Emplacement : <code>import AvatarGroup from '../Ui/Medias/AvatarGroup';</code></p>
        `,
        propTablesExclude: [Avatar, DefaultAvatarGroup, DefaultAvatar],
      },
    },
  )
  .add(
    'Avatar Count',
    () => {
      const size = select('Size', sizeOption, 'normal');
      const numberContent = text('Number', '8');

      return <AvatarCount size={size}>{numberContent}</AvatarCount>;
    },
    {
      info: {
        text: `
          <p>Emplacement : <code>import AvatarCount from '../Ui/Medias/AvatarCount';</code></p>
        `,
      },
    },
  )
  .add(
    'Default avatar group',
    () => {
      const size = select('Size', sizeOption, 'normal');

      return <DefaultAvatarGroup size={size} />;
    },
    {
      info: {
        text: `
          <p>La couleur de l'avatar par défaut est la <code>Couleur primaire</code>. Celle ci est personnalisable par le client dans le back office.</p>
          <p>Si vous avez besoin de placer du texte à sa droite, vous pouvez utiliser le composant <a href="https://ui.cap-collectif.com/?selectedKind=Medias&selectedStory=Media">Media</a>.</p>
          <p>Emplacement : <code>import DefaultAvatarGroup from '../Ui/Medias/DefaultAvatarGroup';</code></p>
        `,
      },
    },
  )
  .add(
    'Default avatar',
    () => {
      const size = select('Size', sizeOption, 'normal');

      return <DefaultAvatar size={size} />;
    },
    {
      info: {
        text: `
          <p>La couleur de l'avatar par défaut est la <code>Couleur primaire</code>. Celle ci est personnalisable par le client dans le back office.</p>
          <p>Si vous avez besoin de placer du texte à sa droite, vous pouvez utiliser le composant <a href="https://ui.cap-collectif.com/?selectedKind=Medias&selectedStory=Media">Media</a>.</p>
          <p>Emplacement : <code>import DefaultImage from '../Ui/Medias/DefaultImage';</code></p>
        `,
      },
    },
  )
  .add(
    'Default image',
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
  )
  .add(
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
            <p>Le texte alternatif <code>alt</code> de l'image peut rester vide (valeur par défaut) dans le cas des images à but uniquement décoratif et sans intérêt prioritaire pour la communication.</p>
            <p>Emplacement : <code>import Image from '../Ui/Medias/Image';</code></p>
        `,
      },
    },
  );
