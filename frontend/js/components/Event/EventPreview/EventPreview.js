// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Truncate from 'react-truncate';
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
import {
  getEndDateFromStartAt,
  isEventLive,
} from '~/components/Event/EventPageContent/EventHelperFunctions';

type Props = {|
  +event: EventPreview_event,
  +hasIllustrationDisplayed: boolean,
  +isHighlighted?: boolean,
  +isAuthorHidden?: boolean,
  +displayReview?: boolean,
  +registrationRequired?: boolean,
|};

export const EventPreview = ({
  event,
  hasIllustrationDisplayed,
  isHighlighted = false,
  isAuthorHidden = false,
  displayReview = false,
}: Props) => {
  const {
    title,
    googleMapsAddress,
    author,
    themes,
    steps,
    timeRange,
    url,
    guestListEnabled,
  }: EventPreview_event = event;

  const hasStarted =
    timeRange.startAt != null
      ? new Date(timeRange.startAt).getTime() <= new Date().getTime()
      : false;
  const hasEnded =
    timeRange.endAt != null
      ? new Date(timeRange.endAt).getTime() <= new Date().getTime()
      : timeRange.startAt != null
      ? getEndDateFromStartAt(timeRange.startAt).getTime() <= new Date().getTime()
      : false;
  const isEventDone = hasStarted && hasEnded;
  const isLive = isEventLive(timeRange.startAt, timeRange.endAt);
  const hasTag = isLive || guestListEnabled || displayReview;

  return (
    <EventPreviewContainer isHighlighted={isHighlighted}>
      <EventImage event={event} enabled={hasIllustrationDisplayed} />

      <Card.Body>
        <HeadContent>
          <DateContainer>
            {timeRange?.startAt && <Card.Date date={timeRange.startAt} />}

            {isEventDone && (
              <div className="past-container">
                <span className="separator">-</span>
                <FormattedMessage id="passed-singular" />
              </div>
            )}
          </DateContainer>

          {hasTag && (
            <InlineList>
              {guestListEnabled && (
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
            <Icon name={ICON_NAME.eventPhysical} size={17} color={colors.lightBlue} />
            <Card.Title>
              <a href={url} title={title}>
                <Truncate lines={2}>{title}</Truncate>
              </a>
            </Card.Title>
          </TitleContainer>

          <TagsList>
            {author && !isAuthorHidden && <TagUser user={author} size={20} />}
            {googleMapsAddress && <TagCity address={googleMapsAddress} size="16px" />}
            {themes && themes.length > 0 && <TagThemes themes={themes} size="16px" />}
            {/* For now we only display the first step */}
            {steps.length ? <TagStep step={steps[0]} size="16px" /> : null}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  );
};

const mapStateToProps = (state: State) => ({
  hasIllustrationDisplayed: state.default.features.display_pictures_in_event_list || false,
});

const Container = connect<any, any, _, _, _, _>(mapStateToProps)(EventPreview);

export default createFragmentContainer(Container, {
  event: graphql`
    fragment EventPreview_event on Event {
      title
      url
      guestListEnabled
      timeRange {
        startAt
        endAt
      }
      googleMapsAddress {
        __typename
        ...TagCity_address
      }
      themes {
        __typename
        ...TagThemes_themes
      }
      steps {
        __typename
        ...TagStep_step
      }
      author {
        ...TagUser_user
      }
      ...EventImage_event
      ...EventLabelStatus_event
    }
  `,
});
