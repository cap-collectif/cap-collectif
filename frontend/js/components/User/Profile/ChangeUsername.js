// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { type ChangeUsername_viewer } from '~relay/ChangeUsername_viewer.graphql';
import type { Dispatch, State } from '../../../types';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePublicDataMutation from '../../../mutations/UpdateProfilePublicDataMutation';

type RelayProps = {| viewer: ChangeUsername_viewer |};
type FormValues = {| username?: string |};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  intl: IntlShape,
  formValues: FormValues,
|};

const formName = 'viewerChangeUsernameForm';

const validate = (formValues: FormValues) => {
  const errors = {};

  if (!formValues.username || formValues.username.length === 0) {
    errors.username = 'fill-field';
  }

  return errors;
};

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const input = {
    ...formValues,
  };

  return UpdateProfilePublicDataMutation.commit({ input })
    .then((response: Object) => {
      if (!response.updateProfilePublicData || !response.updateProfilePublicData.user) {
        throw new Error('Mutation "updateChangeUsernamePublicData" failed.');
      }
    })
    .catch(response => {
      if (response.response && response.response.message) {
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

const renderHeader = (
  <div className="panel-heading profile-header">
    <h1>
      <FormattedMessage id="user.profile.title" />
    </h1>
  </div>
);

const renderFooter = (invalid: boolean, submitting: boolean) => (
  <div className="col-sm-offset-4">
    <Button disabled={invalid || submitting} type="submit" bsStyle="primary" id="profile-form-save">
      <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
    </Button>
  </div>
);

export class ChangeUsername extends Component<Props> {
  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
    } = this.props;

    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        <Panel id="capco_horizontal_form">
          <Panel.Heading>{renderHeader}</Panel.Heading>
          <Panel.Body>
            <h2 className="page-header">
              <FormattedMessage id="user.edition" />
            </h2>
            <div className="border-0">
              <label className="col-sm-3 control-label" htmlFor="profile-form-username">
                <p className="mb-0">
                  <FormattedMessage id='global.fullname' />
                </p>
                <span className="excerpt">
                  <FormattedMessage id="global.mandatory" />
                </span>
              </label>
              <div>
                <Field
                  name="username"
                  component={component}
                  required
                  type="text"
                  id="profile-form-username"
                  divClassName="col-sm-6"
                />
              </div>
              <div className="col-sm-3" />
              <ButtonToolbar className="col-sm-6 pl-0">
                <AlertForm
                  valid={valid}
                  invalid={invalid}
                  errorMessage={error}
                  submitSucceeded={submitSucceeded}
                  submitFailed={submitFailed}
                  submitting={submitting}
                />
              </ButtonToolbar>
            </div>
          </Panel.Body>
          <Panel.Footer>{renderFooter(invalid, submitting)}</Panel.Footer>
        </Panel>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ChangeUsername);

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    username: props.viewer.username ? props.viewer.username : null,
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment ChangeUsername_viewer on User {
      id
      username
    }
  `,
});
