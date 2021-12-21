// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import type {
  EventLabelStatus_event,
  EventReviewStatus,
} from '~relay/EventLabelStatus_event.graphql';
import Popover from '~ds/Popover';
import colors from '~/utils/colors';
import EyeBar from '../Ui/Icons/EyeBar';

type Props = {|
  +event: EventLabelStatus_event,
|};

const LabelStatus: StyledComponent<{ color: string }, {}, HTMLSpanElement> = styled.span`
  font-size: 14px;
  padding: 2px 10px;
  color: ${colors.white};
  border-radius: 13px;
  background-color: ${({ color }) => color};
  display: inline-flex;
  align-items: center;
  height: 21px;
  white-space: nowrap;
`;

const getLabelColor = (status: EventReviewStatus) => {
  switch (status) {
    case 'APPROVED':
      return colors.successColor;
    case 'AWAITING':
      return colors.orange;
    default:
      return colors.dangerColor;
  }
};

const getLabelMessage = (status: EventReviewStatus) => {
  switch (status) {
    case 'APPROVED':
      return 'approved';
    case 'AWAITING':
      return 'waiting-examination';
    default:
      return 'refused';
  }
};

const getOverlayMessage = (status: EventReviewStatus) => {
  switch (status) {
    case 'REFUSED':
      return 'event-preview-refused-by-admin';
    case 'AWAITING':
      return 'event-preview-waiting-exam';
    default:
      return '';
  }
};

export const EventLabelStatus = ({ event }: Props) =>
  event.review ? (
    <Popover placement="top" trigger={['mouseenter']}>
      <Popover.Trigger>
        <LabelStatus
          id="event-label-status"
          color={event.review ? getLabelColor(event.review.status) : ''}>
          {event.review &&
            (event.review.status === 'REFUSED' || event.review.status === 'AWAITING') && (
              <EyeBar className="mr-5" color="#fff" />
            )}
          <FormattedMessage id={getLabelMessage(event.review.status)} />
        </LabelStatus>
      </Popover.Trigger>
      {event.review && event.review.status !== 'APPROVED' ? (
        <Popover.Content>
          <Popover.Body>
            <FormattedMessage id="global.private" />
            <br /> <br />
            <FormattedMessage id={event.review ? getOverlayMessage(event.review.status) : ''} />
          </Popover.Body>
        </Popover.Content>
      ) : (
        <></>
      )}
    </Popover>
  ) : null;

export default createFragmentContainer(EventLabelStatus, {
  event: graphql`
    fragment EventLabelStatus_event on Event {
      review {
        id
        status
        refusedReason
      }
    }
  `,
});
