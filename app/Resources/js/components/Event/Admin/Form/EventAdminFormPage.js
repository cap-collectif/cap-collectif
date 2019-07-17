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
import { ButtonToolbar } from 'react-bootstrap';
import SubmitButton from '../../../Form/SubmitButton';
import EventForm, { EventCreateForm, formName } from '../../Form/EventForm';
import type { Dispatch, GlobalState } from '../../../../types';
import AddEventMutation from '../../../../mutations/AddEventMutation';
import ChangeEventMutation from '../../../../mutations/ChangeEventMutation';
import AlertForm from '../../../Alert/AlertForm';
import type { EventAdminFormPage_event } from '~relay/EventAdminFormPage_event.graphql';

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
  addressText: string,
  title: string,
  body: string,
  author?: { value: string, label: string },
  startAt: string,
  endAt: ?string,
  addressText: ?string,
  metaDescription: ?string,
  customCode: ?string,
  commentable: boolean,
  guestListEnabled: boolean,
  addressJson: ?string,
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
  const addressJson = values.addressText;
  delete values.addressText;
  delete values.address;
  const input = {
    ...values,
    themes: values.themes ? values.themes.map(t => t.value) : null,
    projects: values.projects ? values.projects.map(p => p.value) : null,
    media,
    enabled,
    commentable,
    guestListEnabled,
    addressJson,
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
  delete values.addressText;
  const enabled = values.enabled ? values.enabled : false;
  const addressJson = values.addressText;
  delete values.addressText;
  const input = {
    ...values,
    themes: values.themes ? values.themes.map(t => t.value) : null,
    projects: values.projects ? values.projects.map(p => p.value) : null,
    media,
    enabled,
    guestListEnabled,
    commentable,
    addressJson,
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

export class EventAdminFormPage extends React.Component<Props> {
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
    } = this.props;

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
          {this.props.event ? (
            <EventForm event={this.props.event} onSubmit={updateEvent} validate={validate} />
          ) : (
            <EventCreateForm event={null} onSubmit={onSubmit} validate={validate} />
          )}
          <ButtonToolbar className="box-content__toolbar">
            <SubmitButton
              id="confirm-event-create"
              label={this.props.event ? 'action_edit' : 'global.add'}
              isSubmitting={submitting}
              disabled={pristine || invalid || submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
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
      ...EventForm_event
    }
  `,
});
