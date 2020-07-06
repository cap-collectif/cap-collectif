// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';
import moment from 'moment';
import Card from '~/components/Ui/Card/Card';
import TagUser from '~/components/Tag/TagUser/TagUser';
import TagCity from '~/components/Tag/TagCity/TagCity';
import TagThemes from '~/components/Tag/TagThemes/TagThemes';
import EventImage from '~/components/Event/EventImage/EventImage';
import EventPreviewContainer, {
  HeadContent,
  Content,
  TagsList,
  TitleContainer,
  DateContainer,
} from './EventPreview.style';
import EventLabelStatus from '~/components/Event/EventLabelStatus';
import type { EventPreview_event } from '~relay/EventPreview_event.graphql';
import type { State } from '~/types';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Label from '~ui/Labels/Label';
import InlineList from '~ui/List/InlineList';
import TagStep from '~/components/Tag/TagStep/TagStep';

export const TYPE_EVENT: {
  PHYSICAL: 'PHYSICAL',
  ONLINE: 'ONLINE',
} = {
  PHYSICAL: 'PHYSICAL',
  ONLINE: 'ONLINE',
};

type Props = {
  event: EventPreview_event,
  hasIllustrationDisplayed: boolean,
  isHighlighted?: boolean,
  isAuthorHidden?: boolean,
  displayReview?: boolean,
  live?: boolean,
  replay?: boolean,
  registrationRequired?: boolean,
  step?: any,
  type?: $Values<typeof TYPE_EVENT>,
};

export const EventPreview = ({
  event,
  hasIllustrationDisplayed,
  isHighlighted = false,
  isAuthorHidden = false,
  displayReview = false,
  live,
  replay,
  step,
  type = TYPE_EVENT.PHYSICAL,
}: Props) => {
  const {
    title,
    googleMapsAddress,
    author,
    themes,
    timeRange,
    url,
    guestListEnabled,
  }: EventPreview_event = event;
  const hasTag = live || guestListEnabled || displayReview;

  // Flow doesn't understand that startAt for moment is not null here...
  // $FlowFixMe
  const isPast = timeRange?.startAt ? moment(new Date()).isAfter(timeRange.startAt) : null;

  return (
    <EventPreviewContainer isHighlighted={isHighlighted}>
      <EventImage event={event} enabled={hasIllustrationDisplayed} />

      <Card.Body>
        <HeadContent>
          <DateContainer>
            {timeRange?.startAt && <Card.Date date={timeRange.startAt} />}

            {isPast && timeRange?.startAt && (
              <div className="past-container">
                <span className="separator">-</span>
                <FormattedMessage id="passed-singular" />
              </div>
            )}

            {replay && (
              <div className="replay">
                <Label color={colors.lightBlue} fontSize={10}>
                  <FormattedMessage id="replay" />
                </Label>
              </div>
            )}
          </DateContainer>

          {hasTag && (
            <InlineList>
              {live && (
                <li>
                  <Label color={colors.dangerColor} fontSize={10}>
                    <FormattedMessage id="en-direct" />
                  </Label>
                </li>
              )}

              {!guestListEnabled && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="registration-required" />
                  </Label>
                </li>
              )}

              {displayReview && (
                <li>
                  <EventLabelStatus event={event} />
                </li>
              )}
            </InlineList>
          )}
        </HeadContent>

        <Content>
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

          <TagsList>
            {author && !isAuthorHidden && <TagUser user={author} size={20} />}
            {googleMapsAddress && <TagCity googleMapsAddress={googleMapsAddress} size="16px" />}
            {themes && themes.length > 0 && <TagThemes themes={themes} size="16px" />}
            {step && <TagStep step={step} size="16px" />}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  );
};

const mapStateToProps = (state: State) => ({
  hasIllustrationDisplayed: state.default.features.display_pictures_in_event_list || false,
});

const Container = connect(mapStateToProps)(EventPreview);

export default createFragmentContainer(Container, {
  event: graphql`
    fragment EventPreview_event on Event {
      title
      url
      guestListEnabled
      timeRange {
        startAt
      }
      googleMapsAddress {
        json
      }
      themes {
        title
      }
      author {
        ...TagUser_user
      }
      ...EventImage_event
      ...EventLabelStatus_event
    }
  `,
});
