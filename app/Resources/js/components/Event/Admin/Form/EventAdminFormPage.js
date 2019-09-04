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
import EventForm, { formName } from '../../Form/EventForm';
import type { Dispatch, GlobalState } from '../../../../types';
import AddEventMutation from '../../../../mutations/AddEventMutation';
import ChangeEventMutation from '../../../../mutations/ChangeEventMutation';
import DeleteEventMutation from '../../../../mutations/DeleteEventMutation';
import AlertForm from '../../../Alert/AlertForm';
import type { EventAdminFormPage_event } from '~relay/EventAdminFormPage_event.graphql';
import type { EventAdminFormPage_query } from '~relay/EventAdminFormPage_query.graphql';
import DeleteModal from '../../../Modal/DeleteModal';
import type { FormValues as CustomFormValues } from '../../../Admin/Field/CustomPageFields';

type Props = {|
  intl: IntlShape,
  query: EventAdminFormPage_query,
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
  ...CustomFormValues,
  title: string,
  body: string,
  author?: { value: string, label: string },
  startAt: string,
  endAt: ?string,
  commentable: boolean,
  guestListEnabled: boolean,
  link: ?string,
  addressJson: ?string,
  address: ?string,
  enabled: boolean,
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

const validate = (values: FormValues) => {
  const errors = {};
  const fields = ['title', 'startAt', 'endAt', 'author', 'body'];
  fields.forEach(value => {
    if (value === 'endAt' && values.endAt) {
      if (!values.startAt && values.endAt !== null) {
        errors.startAt = 'fill-field';
      }
      if (values.startAt && values.endAt !== null) {
        // $FlowFixMe
        if (Date.parse(values.startAt) > Date.parse(values.endAt)) {
          errors.endAt = {
            id: 'event-before-date-error',
            values: { before: '<i class="cap cap-attention pr-5" />' },
          };
        }
      }
    }
    if (value === 'body' && values[value] && values[value] === '<p><br></p>') {
      errors[value] = 'fill-field';
    }

    if (value !== 'endAt' && (!values[value] || values[value].length === 0)) {
      errors[value] = 'fill-field';
    }
  });
  if (values.guestListEnabled && values.link) {
    errors.link = 'error-alert-choosing-subscription-mode';
  }

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
  // not shure if it a good way, because the dateTime is not set with good utc
  const startAt = new Date(values.startAt);
  const endAt = values.endAt ? new Date(values.endAt) : null;
  startAt.setHours(startAt.getHours() + 2);
  if (endAt) {
    endAt.setHours(endAt.getHours() + 2);
  }
  const input = {
    title: values.title,
    body: values.body,
    startAt: startAt.toISOString(),
    endAt: endAt ? endAt.toISOString() : null,
    metaDescription: values.metadescription,
    customCode: values.customcode,
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
  const media = values.media && values.media.id ? values.media.id : null;
  const guestListEnabled = values.guestListEnabled ? values.guestListEnabled : false;
  const commentable = values.commentable ? values.commentable : false;
  const enabled = values.enabled ? values.enabled : false;
  const addressJson = values.address;
  delete values.address;
  // not shure if it a good way, because the dateTime is not set with good utc
  const startAt = new Date(values.startAt);
  const endAt = values.endAt ? new Date(values.endAt) : null;
  startAt.setHours(startAt.getHours() + 2);
  if (endAt) {
    endAt.setHours(endAt.getHours() + 2);
  }
  const input = {
    id: values.id,
    title: values.title,
    body: values.body,
    startAt: startAt.toISOString(),
    endAt: endAt ? endAt.toISOString() : null,
    metaDescription: values.metadescription,
    customCode: values.customcode,
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
      dispatch,
      event,
      query,
    } = this.props;
    const { showDeleteModal } = this.state;

    return (
      <>
        <div className="box box-primary container-fluid">
          <EventForm
            event={event}
            onSubmit={event ? updateEvent : onSubmit}
            validate={validate}
            query={query}
          />
          <ButtonToolbar className="box-content__toolbar">
            <SubmitButton
              id={event ? 'confirm-event-edit' : 'confirm-event-create'}
              label="global.save"
              isSubmitting={submitting}
              disabled={pristine || invalid || submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
            {event && (event.viewerDidAuthor || query.viewer.isSuperAdmin) && (
              <>
                <DeleteModal
                  closeDeleteModal={this.cancelCloseDeleteModal}
                  showDeleteModal={showDeleteModal}
                  deleteElement={() => {
                    onDelete(event.id);
                  }}
                  deleteModalTitle="event.alert.delete"
                  deleteModalContent="group.admin.parameters.modal.delete.content"
                  buttonConfirmMessage="group.admin.parameters.modal.delete.button"
                />
                <Button
                  bsStyle="danger"
                  className="ml-5"
                  onClick={this.openDeleteModal}
                  id="delete-event">
                  <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
                </Button>
              </>
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
      </>
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
  query: graphql`
    fragment EventAdminFormPage_query on Query {
      ...EventForm_query
      viewer {
        isSuperAdmin
      }
    }
  `,
  event: graphql`
    fragment EventAdminFormPage_event on Event {
      id
      viewerDidAuthor
      ...EventForm_event
    }
  `,
});
