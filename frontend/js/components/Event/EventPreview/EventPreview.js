// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import Card from '~/components/Ui/Card/Card';
import TagUser from '~/components/Tag/TagUser/TagUser';
import TagCity from '~/components/Tag/TagCity/TagCity';
import TagThemes from '~/components/Tag/TagThemes/TagThemes';
import TagsList from '~/components/Ui/List/TagsList';
import EventImage from '~/components/Event/EventImage/EventImage';
import EventPreviewContainer from './EventPreview.style';
import type { EventPreview_event } from '~relay/EventPreview_event.graphql';
import type { State } from '~/types';

type EventPreviewProps = {
  event: EventPreview_event,
  hasIllustrationDisplayed: boolean,
  className?: string,
  isHorizontal?: boolean,
  isHighlighted?: boolean,
  isAuthorHidden?: boolean,
  isDateInline?: boolean,
};

export const EventPreview = ({
  event,
  className,
  hasIllustrationDisplayed,
  isHighlighted = false,
  isHorizontal = false,
  isAuthorHidden = false,
  isDateInline = false,
}: EventPreviewProps) => {
  const { title, googleMapsAddress, author, themes, timeRange, url }: EventPreview_event = event;

  return (
    <EventPreviewContainer
      isHighlighted={isHighlighted}
      className={`${isHorizontal ? 'isHorizontal' : ''} ${className || ''}`}>
      <Card>
        <EventImage event={event} enabled={hasIllustrationDisplayed} isHorizontal={isHorizontal} />
        <Card.Body>
          {timeRange && timeRange.startAt && (
            <Card.Date date={timeRange.startAt} isInline={isHorizontal || isDateInline} />
          )}

          <div className="wrapper-content">
            <Card.Title>
              <a href={url} title={title}>
                <Truncate lines={3}>{title}</Truncate>
              </a>
            </Card.Title>

            <TagsList>
              {author && !isAuthorHidden && <TagUser user={author} size={16} />}
              {googleMapsAddress && <TagCity googleMapsAddress={googleMapsAddress} size="16px" />}
              {themes && themes.length > 0 && <TagThemes themes={themes} size="16px" />}
            </TagsList>
          </div>
        </Card.Body>
      </Card>
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
      id
      title
      url
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
    }
  `,
});
