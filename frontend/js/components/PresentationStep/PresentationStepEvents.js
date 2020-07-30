// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type {
  PresentationStepEventsQueryResponse,
  PresentationStepEventsQueryVariables,
} from '~relay/PresentationStepEventsQuery.graphql';
import ProjectEventPreview from '~/components/Event/ProjectEventPreview/ProjectEventPreview';
import { Container } from './PresentationStepEvents.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Arrow from '~ui/Slider/Arrow';
import IconRounded from '~ui/Icons/IconRounded';
import colors from '~/utils/colors';
import config from '~/config';

const settingsSlider = {
  dots: false,
  infinite: false,
  speed: 500,
  prevArrow: (
    <Arrow>
      <IconRounded size={36} borderColor={colors.borderColor}>
        <Icon name={ICON_NAME.chevronLeft} size={18} color={colors.iconGrayColor} />
      </IconRounded>
    </Arrow>
  ),
  nextArrow: (
    <Arrow>
      <IconRounded size={36} borderColor={colors.borderColor}>
        <Icon name={ICON_NAME.chevronRight} size={18} color={colors.iconGrayColor} />
      </IconRounded>
    </Arrow>
  ),
};

export type Props = {|
  +projectId: string,
|};

class PresentationStepEvents extends React.Component<Props> {
  renderEventList = ({
    error,
    props,
  }: {
    ...ReactRelayReadyState,
    props: ?PresentationStepEventsQueryResponse,
  }) => {
    if (error) {
      return graphqlError;
    }
    if (
      props &&
      props.events.edges &&
      props.events.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean).length > 0
    ) {
      return (
        <Container id="PresentationStepEvents" className="block">
          <h2 className="h2">
            <FormattedMessage id="global.events" />{' '}
            <span className="small excerpt">{props.events.totalCount}</span>
          </h2>

          <Slider
            {...{
              ...settingsSlider,
              slidesToShow: config.isMobile || props.events.totalCount === 1 ? 1 : 2,
              arrows: props.events.totalCount > 2 && !config.isMobile,
            }}>
            {props.events.edges &&
              props.events.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(node => <ProjectEventPreview event={node} key={node.id} />)}
          </Slider>
        </Container>
      );
    }
    // We display nothing in case of loading or empty result
    return null;
  };

  render() {
    const { projectId } = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query PresentationStepEventsQuery($count: Int, $orderBy: EventOrder!, $project: ID!) {
            events(orderBy: $orderBy, first: $count, project: $project, isFuture: null) {
              totalCount
              edges {
                node {
                  id
                  ...ProjectEventPreview_event
                }
              }
            }
          }
        `}
        variables={
          ({
            count: 100,
            project: projectId,
            orderBy: {
              field: 'START_AT',
              direction: 'DESC',
            },
          }: PresentationStepEventsQueryVariables)
        }
        render={this.renderEventList}
      />
    );
  }
}

export default PresentationStepEvents;
