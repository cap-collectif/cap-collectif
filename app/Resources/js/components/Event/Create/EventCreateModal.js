// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { isInvalid, submit, isSubmitting } from 'redux-form';
import type { IntlShape } from 'react-intl';
import styled from 'styled-components';
import { formName } from '../Form/EventForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { closeEventCreateModal } from '../../../redux/modules/event';
import type { State, Dispatch } from '../../../types';
import type { EventCreateModal_query } from '~relay/EventCreateModal_query.graphql';
import type { EventCreateModal_event } from '~relay/EventCreateModal_event.graphql';
import { formName as requirementsFormName } from '../../Requirements/RequirementsForm';
import colors from '../../../utils/colors';
import { EventAdminFormCreatePage } from '../Admin/Form/EventAdminFormPage';

type RelayProps = {|
  query: EventCreateModal_query,
  event: EventCreateModal_event,
|};

type Props = {|
  ...RelayProps,
  intl: IntlShape,
  show: boolean,
  submitting: boolean,
  dispatch: Dispatch,
  invalid: boolean,
|};

const EventFormInModal = styled(EventAdminFormCreatePage)`
  & box {
    padding: 0;
  }
  .box-title {
    padding-bottom: 5px;
    font-size: 18px;
    border-bottom: 1px solid ${colors.borderColor};
    margin-bottom: 15px;
    color: ${colors.darkText};
  }
`;

export class EventCreateModal extends React.Component<Props> {
  render() {
    const { submitting, dispatch, show, invalid, query, event } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => {
          dispatch(closeEventCreateModal());
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="event-proposal" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EventFormInModal query={query} event={event} isModal />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              dispatch(closeEventCreateModal());
            }}
          />
          <SubmitButton
            label="global.submit"
            id="confirm-event-submit"
            disabled={invalid}
            isSubmitting={submitting}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  show: state.event.showEventCreateModal === true,
  invalid: isInvalid(formName)(state),
  submitting: isSubmitting(formName)(state),
});

export const container = connect(mapStateToProps)(injectIntl(EventCreateModal));

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventCreateModal_query on Query {
      ...EventForm_query
    }
  `,
  event: graphql`
    fragment EventCreateModal_event on Event {
      ...EventForm_event
    }
  `,
});
