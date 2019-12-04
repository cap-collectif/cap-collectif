// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, select } from 'storybook-addon-knobs';
import Avatar from '../../components/Ui/Medias/Avatar';
import AvatarGroup from '../../components/Ui/Medias/AvatarGroup';
import DefaultAvatarGroup from '../../components/Ui/Medias/DefaultAvatarGroup';
import DefaultAvatar from '../../components/Ui/Medias/DefaultAvatar';
import AvatarCount from '../../components/Ui/Medias/AvatarCount';

const sizeOption = {
  Small: 'small',
  Normal: 'normal',
};

storiesOf('Core|Avatar', module)
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
  );
