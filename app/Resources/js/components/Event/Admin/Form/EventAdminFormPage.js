// @flow
import * as React from 'react';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import {
  SubmissionError,
  isPristine,
  isValid,
  isInvalid,
  isSubmitting,
  submit,
  hasSubmitSucceeded,
  hasSubmitFailed,
} from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, ButtonToolbar } from 'react-bootstrap';
import SubmitButton from '../../../Form/SubmitButton';
import EventForm, { EventCreateForm, formName } from '../../Form/EventForm';
import type { Dispatch, GlobalState } from '../../../../types';
import AddEventMutation from '../../../../mutations/AddEventMutation';
import ChangeEventMutation from '../../../../mutations/ChangeEventMutation';
import DeleteEventMutation from '../../../../mutations/DeleteEventMutation';
import AlertForm from '../../../Alert/AlertForm';
import type { EventAdminFormPage_event } from '~relay/EventAdminFormPage_event.graphql';
import DeleteModal from '../../../Modal/DeleteModal';

type Props = {|
  intl: IntlShape,
  event?: ?EventAdminFormPage_event,
  pristine: boolean,
  valid: boolean,
  submitting: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  invalid: boolean,
  dispatch: Dispatch,
|};

type FormValues = {|
  title: string,
  body: string,
  author?: { value: string, label: string },
  startAt: string,
  endAt: ?string,
  metaDescription: ?string,
  customCode: ?string,
  commentable: boolean,
  guestListEnabled: boolean,
  addressJson: ?string,
  address: ?string,
  enabled: boolean,
  // $FlowFixMe
  media: ?{
    id: string,
    url: string,
  },
  themes: ?[],
  projects: ?[],
|};

type EditFormValue = {|
  ...FormValues,
  id: string,
|};
type State = { showDeleteModal: boolean };

const validate = (values: any) => {
  const errors = {};

  const fields = ['title', 'startAt', 'endAt', 'author', 'description'];
  fields.forEach(value => {
    if (value === 'endAt') {
      if (!values.startAt && values.endAt) {
        errors.startAt = 'fill-field';
        return;
      }
      if (values.startAt && values.startAt.length > 0 && values.endAt && values.endAt.length > 0) {
        if (Date.parse(values.startAt) > Date.parse(values.endAt)) {
          errors.endAt = 'date.end_before_start';
          return;
        }
      }
    }
    if (values[value] && values[value].length === 0) {
      errors[value] = 'fill-field';
    }
  });

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const media =
    typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  const guestListEnabled = values.guestListEnabled ? values.guestListEnabled : false;
  const commentable = values.commentable ? values.commentable : false;
  const enabled = values.enabled ? values.enabled : false;
  const addressJson = values.address;
  delete values.address;
  const input = {
    title: values.title,
    body: values.body,
    startAt: values.startAt,
    endAt: values.endAt ? values.endAt : null,
    metaDescription: values.metaDescription,
    customCode: values.customCode,
    commentable,
    guestListEnabled,
    addressJson,
    enabled,
    media,
    themes: values.themes ? values.themes.map(t => t.value) : null,
    projects: values.projects ? values.projects.map(p => p.value) : null,
    author: values.author ? values.author.value : undefined,
  };

  return AddEventMutation.commit({ input })
    .then(response => {
      if (!response.addEvent || !response.addEvent.eventEdge) {
        throw new Error('Mutation "AddEventMutation" failed.');
      }
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

const updateEvent = (values: EditFormValue, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const media =
    typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  const guestListEnabled = values.guestListEnabled ? values.guestListEnabled : false;
  const commentable = values.commentable ? values.commentable : false;
  const enabled = values.enabled ? values.enabled : false;
  const addressJson = values.address;
  delete values.address;
  const input = {
    id: values.id,
    title: values.title,
    body: values.body,
    startAt: values.startAt,
    endAt: values.endAt ? values.endAt : null,
    metaDescription: values.metaDescription,
    customCode: values.customCode,
    commentable,
    guestListEnabled,
    addressJson,
    enabled,
    media,
    themes: values.themes ? values.themes.map(t => t.value) : null,
    projects: values.projects ? values.projects.map(p => p.value) : null,
    author: values.author ? values.author.value : undefined,
  };

  return ChangeEventMutation.commit({ input })
    .then(response => {
      if (!response.changeEvent || !response.changeEvent.event) {
        throw new Error('Mutation "ChangeEventMutation" failed.');
      }
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

const onDelete = (eventId: string) =>
  DeleteEventMutation.commit({
    input: {
      eventId,
    },
  }).then(() => {
    window.location.href = `${window.location.protocol}//${window.location.host}/admin/capco/app/event/list`;
  });

export class EventAdminFormPage extends React.Component<Props, State> {
  state = {
    showDeleteModal: false,
  };

  openDeleteModal = () => {
    this.setState({ showDeleteModal: true });
  };

  cancelCloseDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  };

  render() {
    const {
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      submitting,
      intl,
      dispatch,
      event,
    } = this.props;
    const { showDeleteModal } = this.state;

    return (
      <div>
        <p>
          <strong>
            <FormattedMessage id="permalink-unavailable" />{' '}
          </strong>
          <FormattedMessage id="proposal-form-not-linked-to-a-project" /> |{' '}
          <b>{intl.formatMessage({ id: 'proposal_form.admin.reference' })} : </b>{' '}
        </p>
        <div className="box box-primary container-fluid">
          {event ? (
            <EventForm event={event} onSubmit={updateEvent} validate={validate} />
          ) : (
            <EventCreateForm event={null} onSubmit={onSubmit} validate={validate} />
          )}
          <ButtonToolbar className="box-content__toolbar">
            <SubmitButton
              id="confirm-event-create"
              label={event ? 'action_edit' : 'global.add'}
              isSubmitting={submitting}
              disabled={pristine || invalid || submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
            {event && (
              <div>
                <DeleteModal
                  closeDeleteModal={this.cancelCloseDeleteModal}
                  showDeleteModal={showDeleteModal}
                  deleteElement={() => {
                    onDelete(event.id);
                  }}
                  deleteModalTitle="group.admin.parameters.modal.delete.title"
                  deleteModalContent="group.admin.parameters.modal.delete.content"
                  buttonConfirmMessage="group.admin.parameters.modal.delete.button"
                />
                <div>
                  <Button bsStyle="danger" className="ml-5" onClick={this.openDeleteModal}>
                    <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
                  </Button>
                </div>
              </div>
            )}
            <AlertForm
              valid={valid}
              invalid={invalid}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  pristine: isPristine(formName)(state),
  valid: isValid(formName)(state),
  invalid: isInvalid(formName)(state),
  submitting: isSubmitting(formName)(state),
  submitSucceeded: hasSubmitSucceeded(formName)(state),
  submitFailed: hasSubmitFailed(formName)(state),
});

export const EventAdminFormCreatePage = connect(mapStateToProps)(injectIntl(EventAdminFormPage));

export default createFragmentContainer(EventAdminFormCreatePage, {
  event: graphql`
    fragment EventAdminFormPage_event on Event {
      id
      ...EventForm_event
    }
  `,
});
