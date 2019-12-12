// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Truncate from 'react-truncate';
import Card from '~/components/Ui/Card/Card';
import Image from '~/components/Ui/Medias/Image';
import TagsList from '~/components/Ui/List/TagsList';
import Tag from '~/components/Ui/Labels/Tag';
import DefaultAvatar from '~/components/Ui/Medias/DefaultAvatar';
import EventPreviewContainer from '~/components/Event/EventPreview/EventPreview.style';

type Props = {
  isHorizontal?: boolean,
};

export const EventPreview = ({ isHorizontal }: Props) => (
  <EventPreviewContainer className={isHorizontal ? 'isHorizontal' : ''}>
    <Card>
      <Card.Cover>
        <Image src="https://picsum.photos/300/400" />
      </Card.Cover>

      <Card.Body>
        <Card.Date date="2016-12-20T09:00:24+01:00" hasHour={isHorizontal} />
        <div>
          <Card.Title>
            <a href="#event" title="Titre événement">
              <Truncate lines={3}>Titre événement</Truncate>
            </a>
          </Card.Title>

          <TagsList>
            <Tag size="22px" CustomImage={<DefaultAvatar size={22} />}>
              Jean Dupont
            </Tag>
            <Tag size="22px" icon="cap cap-marker-1">
              Lyon
            </Tag>
            <Tag size="22px" icon="cap cap-folder-2">
              Immobilier et 2 autres thèmes
            </Tag>
          </TagsList>
        </div>
      </Card.Body>
    </Card>
  </EventPreviewContainer>
);

storiesOf('Cap Collectif|EventPreview', module).add('default', () => <EventPreview />);

storiesOf('Cap Collectif|EventPreview', module).add('horizontal', () => (
  <EventPreview isHorizontal />
));
