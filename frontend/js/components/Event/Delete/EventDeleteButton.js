// @flow
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Button, Overlay } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import Popover from '~/components/Utils/Popover';
import type { EventPageHeaderButtons_event } from '~relay/EventPageHeaderButtons_event.graphql';
import DeleteEventMutation from '~/mutations/DeleteEventMutation';
import AppDispatcher from '~/dispatchers/AppDispatcher';

type Props = {|
  event: EventPageHeaderButtons_event,
|};

const DeleteEventPopover: StyledComponent<{}, {}, typeof Popover> = styled(Popover)`
  max-width: unset;
  line-height: normal;
  font-size: 16px;
  height: 258px;
  width: 287px;

  .popover-title {
    display: flex;
    padding: 12px 14px;
    font-size: 16px;
    font-weight: 600;
    background: #fff;
    color: #000;
    line-height: normal;
    span:first-letter {
      text-transform: uppercase;
    }
    div {
      margin-left: 50px;
      cursor: pointer;
      font-size: 30px;
      font-weight: 700;
      opacity: 0.2;
      line-height: 1;
      display: none;
    }
  }

  .popover-content {
    padding: 0;
    > span {
      padding: 14px;
      display: block;
      padding-bottom: 15px;
      border-bottom: 1px solid #ebebeb;
      margin-bottom: 15px;
    }
  }

  .event-delete-popover-button-container {
    padding: 0 14px;
    float: right;
    button {
      float: right;
      margin-bottom: 10px;
    }
  }

  @media (min-width: 991px) {
    .event-delete-popover-button-container {
      display: flex;
    }
    .event-delete-popover-button-cancel {
      margin-right: 10px;
    }
    .popover-title div {
      display: block;
    }

    height: 192px;
    width: 436px;
  }
`;

const onDelete = (eventId: string) => {
  return DeleteEventMutation.commit({
    input: { eventId },
  })
    .then(() => {
      window.location.href = '/events?delete=success';
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'danger',
          content: 'opinion.request.failure',
        },
      });
    });
};

export const EventDeleteButton = ({ event }: Props) => {
  const intl = useIntl();
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <>
      <Overlay
        trigger="click"
        show={show}
        placement="top"
        target={target.current}
        rootClose
        onHide={() => setShow(false)}>
        <DeleteEventPopover
          id={`event-${event.id}-delete-popover`}
          title={
            <>
              <FormattedMessage id="event.alert.delete" />
              <div onClick={() => setShow(false)} aria-hidden="true">
                ×
              </div>
            </>
          }>
          <>
            <FormattedMessage id="notification-send-to-all-members" />
            <div className="event-delete-popover-button-container">
              <Button
                onClick={() => setShow(false)}
                bsStyle="default"
                className="event-delete-popover-button-cancel">
                <FormattedMessage id="global.cancel" />
              </Button>
              <Button
                bsStyle="danger"
                className="event-delete-popover-button-confirm"
                onClick={() => {
                  onDelete(event.id);
                }}>
                <FormattedMessage id="global.removeDefinitively" />
              </Button>
            </div>
          </>
        </DeleteEventPopover>
      </Overlay>
      <Button
        id="btn-delete-event"
        bsStyle="danger"
        className="btn--outline"
        ref={target}
        onClick={() => setShow(!show)}>
        <i className="cap cap-bin-2" />
        <span className="ml-5">{intl.formatMessage({ id: 'global.delete' })}</span>
      </Button>
    </>
  );
};

export default EventDeleteButton;
