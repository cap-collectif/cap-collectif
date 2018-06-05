// @flow
import * as React from 'react';
import {type IntlShape, injectIntl, FormattedMessage} from 'react-intl';
import {connect, type MapStateToProps} from 'react-redux';
import {reduxForm, type FormProps, Field, SubmissionError} from 'redux-form';
import {createFragmentContainer, graphql} from 'react-relay';
import {Panel, ButtonToolbar, Button} from 'react-bootstrap';
import type {Dispatch, State, GlobalState } from '../../../types';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UserAvatar from '../UserAvatar';
import UpdateProfilePublicDataMutation from '../../../mutations/UpdateProfilePublicDataMutation';
import UserAdminProfile_user from './__generated__/UserAdminProfile_user.graphql';

type RelayProps = { user: UserAdminProfile_user };
type Props = FormProps &
  RelayProps & {
  intl: IntlShape,
  initialValues: Object,
  hasValue: Object,
  userTypes: Array<Object>,
  features: Object,
};

const formName = 'user-admin-edit-profile';

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
    if (values[value] && values[value].length <= 2) {
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
  const {intl} = props;
  const media =
    typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  delete values.media;
  const input = {
    ...values,
    media,
  };

  return UpdateProfilePublicDataMutation.commit({input})
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
          _error: intl.formatMessage({id: 'global.error.server.form'}),
        });
      }
    });
};


export class UserAdminProfile extends React.Component<Props, State> {
  render() {
    const {
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
      <Panel id="capco_horizontal_form">
        <h2 className="page-header">
          <FormattedMessage id="user.edition"/>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="box-content box-content__content-form">
            <Field
              id="profile_avatar"
              name="media"
              label={<FormattedMessage id="form.label_media"/>}
              component={component}
              type="image"
            />
            <Field
              name="username"
              label={
                <div><FormattedMessage id="registration.username"/>
                  <span className="excerpt">
                  <FormattedMessage id="global.mandatory"/>
                </span></div>
              }
              component={component}
              required
              type="text"
              id="profile-form-username"
              divClassName="col-sm-4"
            />
            <div className="clearfix"/>
            {features.user_type && (
              <Field
                id="profile-form-userType"
                name="userType"
                component={component}
                type="select"
                label={<FormattedMessage id="registration.type"/>}
              >
                <FormattedMessage id="registration.select.type">
                  {message => <option value="">{message}</option>}
                </FormattedMessage>
                {userTypes.map((type, i) => (
                  <option key={i + 1} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Field>
            )}
            <div className="clearfix"/>
            <Field
              name="biography"
              component={component}
              type="textarea"
              id="public-data-form-biography"
              label={<FormattedMessage id="form.label_biography"/>}
              divClassName="col-sm-8"
            />
            <div className="clearfix"/>
            <Field
              name="neighborhood"
              component={component}
              type="text"
              id="public-data-form-neighborhood"
              label={<FormattedMessage id="form.label_neighborhood"/>}
              divClassName="col-sm-4"
            />
            <div className="clearfix"/>
            <Field
              name="website"
              component={component}
              type="text"
              id="public-data-form-website"
              label={<FormattedMessage id="form.label_website"/>}
              divClassName="col-sm-4"
            />
            <div className="clearfix"/>
            <h2>
              <FormattedMessage id="social-medias"/>
            </h2>
                <Field
                  placeholder="https://"
                  name="facebookUrl"
                  component={component}
                  type="text"
                  id="public-data-form-facebook"
                  label={<FormattedMessage id="user.profile.edit.facebook"/>}
                  divClassName="col-sm-4"
                />
            <div className="clearfix"/>
            <Field
                  placeholder="https://"
                  name="twitterUrl"
                  component={component}
                  type="text"
                  id="public-data-form-twitter"
                  divClassName="col-sm-4"
                  label={<FormattedMessage id="user.profile.edit.twitter"/>}
                />
            <div className="clearfix"/>
            <Field
                  placeholder="https://"
                  name="linkedInUrl"
                  component={component}
                  type="text"
                  id="public-data-form-linkedIn"
                  divClassName="col-sm-4"
                  label={<FormattedMessage id="show.label_linked_in_url"/>}
                />
            <div className="clearfix"/>
            <h2 className="page-header">
              <FormattedMessage id="confidentialite.title"/>
            </h2>
              <Field
                id="profilePageIndexed"
                name="profilePageIndexed"
                component={component}
                type="checkbox"
                labelClassName="font-weight-normal"
                children={<FormattedMessage id="user.profile.edit.profilePageIndexed"/>}
                divClassName="col-sm-8"
              />
              <ButtonToolbar className="box-content__toolbar">
                <Button
                  disabled={invalid || submitting}
                  type="submit"
                  bsStyle="primary"
                  id="profile-form-save">
                  <FormattedMessage
                    id={submitting ? 'global.loading' : 'global.save_modifications'}
                  />
                </Button>
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
        </form>
      </Panel>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminProfile);

const mapStateToProps: MapStateToProps<*, *, *> = (
  state: GlobalState,
  {user}: RelayProps,
) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  currentUser: state.user.user,
  initialValues: {
    username: user.username ? user.username : null,
    biography: user.biography ? user.biography : null,
    website: user.website ? user.website : null,
    facebookUrl: user.facebookUrl ? user.facebookUrl : null,
    linkedInUrl: user.linkedInUrl ? user.linkedInUrl : null,
    twitterUrl: user.twitterUrl ? user.twitterUrl : null,
    profilePageIndexed: user.profilePageIndexed ? user.profilePageIndexed : null,
    userType: user.userType ? user.userType.id : null,
    neighborhood: user.neighborhood ? user.neighborhood : null,
    media: user ? user.media : undefined,
  },
  userTypes: state.default.userTypes,
  features: state.default.features,
});

const container = connect(mapStateToProps)(injectIntl(form));

// same as Profile.js I have to find a solution to merge both in one
export default createFragmentContainer(
  container,
  graphql`
    fragment UserAdminProfile_user on User {
      id
      media {
        id
        name
        size
        url
      }
      show_url
      username
      biography
      website
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
);
