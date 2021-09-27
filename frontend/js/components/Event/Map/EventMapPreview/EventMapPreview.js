// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import Card from '~/components/Ui/Card/Card';
import TagUser from '~/components/Tag/TagUser/TagUser';
import TagCity from '~/components/Tag/TagCity/TagCity';
import TagsList from '~/components/Ui/List/TagsList';
import EventImage from '~/components/Event/EventImage/EventImage';
import EventMapPreviewContainer from './EventMapPreview.style';
import type { State } from '~/types';
import type { EventMapPreview_event } from '~relay/EventMapPreview_event.graphql';
import Text from '~ui/Primitives/Text';

type EventMapPreviewProps = {
  event: EventMapPreview_event,
  hasIllustrationDisplayed: boolean,
};

export const EventMapPreview = ({ hasIllustrationDisplayed, event }: EventMapPreviewProps) => {
  const { title, url, timeRange, googleMapsAddress, author }: EventMapPreview_event = event;

  return (
    <EventMapPreviewContainer>
      <Card>
        <EventImage event={event} enabled={hasIllustrationDisplayed} />
        <Card.Body>
          <Card.Title>
            <a href={url} title={title}>
              <Text m={0} as="div" truncate={100}>
                {title}
              </Text>
            </a>
          </Card.Title>

          <TagsList>
            {author && <TagUser user={author} size={16} />}
            {timeRange && timeRange.startAt && <Card.Date date={timeRange.startAt} />}
            {googleMapsAddress && <TagCity address={googleMapsAddress} size="16px" />}
          </TagsList>
        </Card.Body>
      </Card>
    </EventMapPreviewContainer>
  );
};

const mapStateToProps = (state: State) => ({
  hasIllustrationDisplayed: state.default.features.display_pictures_in_event_list,
});

const Container = connect<any, any, _, _, _, _>(mapStateToProps)(EventMapPreview);

export default createFragmentContainer(Container, {
  event: graphql`
    fragment EventMapPreview_event on Event {
      id
      title
      url
      timeRange {
        startAt
      }
      googleMapsAddress {
        __typename
        ...TagCity_address
      }
      author {
        ...TagUser_user
      }
      ...EventImage_event
    }
  `,
});
