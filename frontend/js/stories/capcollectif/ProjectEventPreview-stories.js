// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Truncate from 'react-truncate';
import Card from '~/components/Ui/Card/Card';
import Tag from '~/components/Ui/Labels/Tag';
import DefaultAvatar from '~/components/Ui/Medias/DefaultAvatar';
import EventPreviewContainer, {
  HeadContent,
  Content,
  TitleContainer,
  TagsList,
} from '~/components/Event/EventPreview/EventPreview.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import Label from '~ui/Labels/Label';
import InlineList from '~ui/List/InlineList';
import TagCity from '~/components/Tag/TagCity/TagCity';
import { TYPE_EVENT } from './EventPreview-stories';

type Props = {
  event: any,
  type: $Values<typeof TYPE_EVENT>,
  replay?: boolean,
};

const eventProps = {
  title: 'Ceci est le titre',
  url: '#',
  timeRange: {
    startAt: new Date(),
  },
  googleMapsAddress: {
    json:
      '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
  },
};

const ProjectEventPreview = ({ event, type, replay }: Props) => {
  const { timeRange, url, title, googleMapsAddress } = event;

  return (
    <EventPreviewContainer>
      <Card.Body>
        <TitleContainer>
          <Icon
            name={type === TYPE_EVENT.ONLINE ? ICON_NAME.eventOnline : ICON_NAME.eventPhysical}
            size={17}
            color={colors.lightBlue}
          />
          <Card.Title>
            <a href={url} title={title}>
              <Truncate lines={2}>{title}</Truncate>
            </a>
          </Card.Title>
        </TitleContainer>

        <HeadContent>
          {timeRange?.startAt && <Card.Date date={timeRange.startAt} />}

          <InlineList>
            {type === TYPE_EVENT.ONLINE && !replay && (
              <li>
                <Label color={colors.dangerColor} fontSize={10} uppercase>
                  Live
                </Label>
              </li>
            )}

            {type === TYPE_EVENT.ONLINE && replay && (
              <li>
                <Label color={colors.lightBlue} fontSize={10} uppercase>
                  Replay
                </Label>
              </li>
            )}

            {type === TYPE_EVENT.PHYSICAL && (
              <li>
                <Label color={colors.lightBlue} fontSize={10} uppercase>
                  Inscription requise
                </Label>
              </li>
            )}

            <li>
              <Label color={colors.successColor} fontSize={10}>
                Approved
              </Label>
            </li>
          </InlineList>
        </HeadContent>

        <Content>
          <TagsList vertical>
            <Tag size="22px" CustomImage={<DefaultAvatar size={22} />}>
              Jean Dupont
            </Tag>

            <TagCity address={googleMapsAddress} size="16px" />
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  );
};

storiesOf('Cap Collectif|ProjectEventPreview', module)
  .add('default', () => (
    <div style={{ maxWidth: 600 }}>
      <ProjectEventPreview event={eventProps} type={TYPE_EVENT.PHYSICAL} />
    </div>
  ))
  .add('online', () => (
    <div style={{ maxWidth: 600 }}>
      <ProjectEventPreview event={eventProps} type={TYPE_EVENT.ONLINE} />
    </div>
  ));
