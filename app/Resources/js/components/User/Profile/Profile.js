// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, type FormProps, Field, SubmissionError } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type Profile_viewer from '~relay/Profile_viewer.graphql';
import type { Dispatch, State } from '../../../types';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UserAvatar from '../UserAvatar';
import UpdateProfilePublicDataMutation from '../../../mutations/UpdateProfilePublicDataMutation';

type RelayProps = {| viewer: Profile_viewer |};
type Props = {|
  ...FormProps,
  ...RelayProps,
  intl: IntlShape,
  initialValues: Object,
  hasValue: Object,
  userTypes: Array<Object>,
  features: Object,
|};

const formName = 'viewerProfileForm';

const validate = (values: Object) => {
  const errors = {};

  const fields = [
    'biography',
    'website',
    'neighborhood',
    'linkedIn',
    'twitter',
    'facebook',
    'username',
  ];
  fields.forEach(value => {
    if (value === 'username') {
      if (!values[value] || values[value].length === 0) {
        errors[value] = 'fill-field';
      }
    }
    if (values[value] && values[value].length < 2) {
      errors[value] = 'two-characters-minimum-required';
    }
    if (value !== 'biography') {
      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required';
      }
    }
  });

  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const media =
    typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  delete values.media;
  const input = {
    ...values,
    media,
  };

  return UpdateProfilePublicDataMutation.commit({ input })
    .then(response => {
      if (!response.updateProfilePublicData || !response.updateProfilePublicData.user) {
        throw new Error('Mutation "updateProfilePublicData" failed.');
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

export class Profile extends Component<Props> {
  render() {
    const {
      viewer,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      userTypes,
      features,
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
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="profile_avatar">
                <FormattedMessage id="form.label_media" />
              </label>
              <UserAvatar className="col-sm-1" user={viewer} />
              <div className="clearfix" />
              <div className="col-sm-3" />
              <Field
                id="profile_avatar"
                name="media"
                component={component}
                type="image"
                divClassName="col-sm-6"
              />
            </div>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="profile-form-username">
                <FormattedMessage id="registration.username" />
                <br />
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
            </div>
            {features.user_type && (
              <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                <label className="col-sm-3 control-label" htmlFor="profile-form-userType">
                  <FormattedMessage id="registration.type" />{' '}
                </label>
                <div>
                  <Field
                    id="profile-form-userType"
                    name="userType"
                    component={component}
                    type="select"
                    divClassName="col-sm-6">
                    <FormattedMessage id="registration.select.type">
                      {(message: string) => <option value="">{message}</option>}
                    </FormattedMessage>
                    {userTypes.map((type, i) => (
                      <option key={i + 1} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Field>
                </div>
              </div>
            )}
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-biography">
                <FormattedMessage id="form.label_biography" />
              </label>
              <div>
                <Field
                  name="biography"
                  component={component}
                  type="textarea"
                  id="public-data-form-biography"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-neighborhood">
                <FormattedMessage id="form.label_neighborhood" />
              </label>
              <div>
                <Field
                  name="neighborhood"
                  component={component}
                  type="text"
                  id="public-data-form-neighborhood"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-website">
                <FormattedMessage id="form.label_website" />
              </label>
              <div>
                <Field
                  name="website"
                  component={component}
                  type="text"
                  id="public-data-form-website"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="clearfix" />
            <h2>
              <FormattedMessage id="social-medias" />
            </h2>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-facebook">
                <FormattedMessage id="user.profile.edit.facebook" />
              </label>
              <div>
                <Field
                  placeholder="https://"
                  name="facebookUrl"
                  component={component}
                  type="text"
                  id="public-data-form-facebook"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-twitter">
                <FormattedMessage id="user.profile.edit.twitter" />
              </label>
              <div>
                <Field
                  placeholder="https://"
                  name="twitterUrl"
                  component={component}
                  type="text"
                  id="public-data-form-twitter"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
              <label className="col-sm-3 control-label" htmlFor="public-data-form-linkedIn">
                <FormattedMessage id="show.label_linked_in_url" />
              </label>
              <div>
                <Field
                  placeholder="https://"
                  name="linkedInUrl"
                  component={component}
                  type="text"
                  id="public-data-form-linkedIn"
                  divClassName="col-sm-6"
                />
              </div>
            </div>
            <div className="clearfix" />
            <h2>
              <FormattedMessage id="confidentialite.title" />
            </h2>
            <div className="horizontal_field_with_border_top">
              <div className="col-sm-3" />
              <Field
                id="profilePageIndexed"
                name="profilePageIndexed"
                component={component}
                type="checkbox"
                labelClassName="font-weight-normal"
                children={<FormattedMessage id="user.profile.edit.profilePageIndexed" />}
                divClassName="col-sm-8"
              />
            </div>
            <div className="horizontal_field_with_border_top">
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
})(Profile);

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    username: props.viewer.username ? props.viewer.username : null,
    biography: props.viewer.biography ? props.viewer.biography : null,
    website: props.viewer.website ? props.viewer.website : null,
    facebookUrl: props.viewer.facebookUrl ? props.viewer.facebookUrl : null,
    linkedInUrl: props.viewer.linkedInUrl ? props.viewer.linkedInUrl : null,
    twitterUrl: props.viewer.twitterUrl ? props.viewer.twitterUrl : null,
    profilePageIndexed: props.viewer.profilePageIndexed ? props.viewer.profilePageIndexed : null,
    userType: props.viewer.userType ? props.viewer.userType.id : null,
    neighborhood: props.viewer.neighborhood ? props.viewer.neighborhood : null,
    media: props.viewer ? props.viewer.media : undefined,
  },
  userTypes: state.default.userTypes,
  features: state.default.features,
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment Profile_viewer on User {
      id
      media {
        id
        name
        size
        url
      }
      url
      username
      biography
      website: websiteUrl
      facebookUrl
      linkedInUrl
      twitterUrl
      profilePageIndexed
      userType {
        id
      }
      neighborhood
    }
  `,
});
