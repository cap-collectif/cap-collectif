// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';
import moment from 'moment';
import Card from '~/components/Ui/Card/Card';
import TagCity from '~/components/Tag/TagCity/TagCity';
import EventPreviewContainer, {
  HeadContent,
  Content,
  TagsList,
  TitleContainer,
} from '../EventPreview/EventPreview.style';
import type { ProjectEventPreview_event } from '~relay/ProjectEventPreview_event.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Label from '~ui/Labels/Label';
import InlineList from '~ui/List/InlineList';
import { TYPE_EVENT } from '~/components/Event/EventPreview/EventPreview';
import IconRounded from '~ui/Icons/IconRounded';
import Tag from '~ui/Labels/Tag';

type Props = {
  event: ProjectEventPreview_event,
  className?: string,
  live?: boolean,
  replay?: boolean,
  speaker?: string,
  registrationRequired?: boolean,
  type?: $Values<typeof TYPE_EVENT>,
};

export const ProjectEventPreview = ({
  event,
  live,
  replay,
  speaker,
  type = TYPE_EVENT.PHYSICAL,
}: Props) => {
  const {
    title,
    googleMapsAddress,
    timeRange,
    url,
    guestListEnabled,
  }: ProjectEventPreview_event = event;
  const hasTag = live || replay || guestListEnabled;

  // Flow doesn't understand that startAt for moment is not null here...
  // $FlowFixMe
  const isPast = timeRange?.startAt ? moment(new Date()).isAfter(timeRange.startAt) : null;

  return (
    <EventPreviewContainer isProject>
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

          {isPast && timeRange?.startAt && (
            <div className="past-container">
              <span className="separator">-</span>
              <FormattedMessage id="passed-singular" />
            </div>
          )}

          {hasTag && (
            <InlineList>
              {live && (
                <li>
                  <Label color={colors.dangerColor} fontSize={10}>
                    <FormattedMessage id="en-direct" />
                  </Label>
                </li>
              )}

              {replay && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="replay" />
                  </Label>
                </li>
              )}

              {guestListEnabled && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="registration-required" />
                  </Label>
                </li>
              )}
            </InlineList>
          )}
        </HeadContent>

        <Content>
          <TagsList vertical>
            {googleMapsAddress && type === TYPE_EVENT.PHYSICAL && (
              <TagCity googleMapsAddress={googleMapsAddress} size="16px" />
            )}

            {speaker && (
              <Tag size="16px">
                <IconRounded size={18} color={colors.darkGray}>
                  <Icon name={ICON_NAME.micro} color="#fff" size={10} />
                </IconRounded>
              </Tag>
            )}

            {type === TYPE_EVENT.ONLINE && (
              <Tag size="16px">
                <IconRounded size={18} color={colors.darkGray}>
                  <Icon name={ICON_NAME.camera} color="#fff" size={10} />
                </IconRounded>
                <FormattedMessage id="global.online" />
              </Tag>
            )}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  );
};

export default createFragmentContainer(ProjectEventPreview, {
  event: graphql`
    fragment ProjectEventPreview_event on Event {
      title
      url
      guestListEnabled
      timeRange {
        startAt
      }
      googleMapsAddress {
        json
      }
    }
  `,
});
