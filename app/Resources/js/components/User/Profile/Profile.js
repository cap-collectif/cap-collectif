// @flow
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import {
  Panel,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import {connect, type MapStateToProps} from 'react-redux';
import {
  reduxForm,
  type FormProps,
  Field,
  SubmissionError,
  unregisterField,
  change,
  formValueSelector
} from 'redux-form';
import {FormattedMessage, injectIntl, type IntlShape} from 'react-intl';
import type Profile_viewer from './__generated__/Profile_viewer.graphql';
import type {Dispatch, State} from '../../../types';
import component from "../../Form/Field";
import AlertForm from "../../Alert/AlertForm";

type RelayProps = { profileForm: Profile_viewer };
type Props = FormProps &
  RelayProps & {
  viewer: Profile_viewer,
  intl: IntlShape,
  initialValues: Object,
  hasValue: Object,
};

const formName = 'viewerProfileForm';

const validate = (values: Object, props: Props) => {
  const errors = {};

  // const addressFields = ['address', 'address2', 'city', 'zipCode'];
  // addressFields.forEach(value => {
  //   if (value !== 'address2') {
  //     if (!values[value] || values[value].length === 0) {
  //       errors[value] = 'fill-or-delete-field';
  //     }
  //   }
  //   if (values[value] && values[value].length <= 2) {
  //     errors[value] = 'two-characters-minimum-required';
  //   }
  //   if (values[value] && values[value].length > 256) {
  //     errors[value] = '256-characters-maximum-required';
  //   }
  // });

  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
  const input = {
    ...values,
    userId: props.viewer.id
  };

  // return UpdateProfilePersonalDataMutation.commit({input})
  //   .then(response => {
  //     if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.viewer) {
  //       throw new Error('Mutation "updateProfilePersonalData" failed.');
  //     }
  //   })
  //   .catch(response => {
  //     if (response.response.message) {
  //       throw new SubmissionError({
  //         _error: response.response.message,
  //       });
  //     } else {
  //       throw new SubmissionError({
  //         _error: intl.formatMessage({id: 'global.error.server.form'}),
  //       });
  //     }
  //   });
};

type ProfileState = {
  showDeleteModal: boolean,
};

export class Profile extends Component<Props, ProfileState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showDeleteModal: false,
    };
  }

  render() {
    const {
      viewer,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      hasValue
    } = this.props;

    return (
      <Panel id="profile-form">
        <h2>
          <FormattedMessage id="user.edition"/>
        </h2>
        <form onSubmit={handleSubmit} className="form-horizontal">
          <div className="">
            <label className="col-sm-3 control-label">
              <FormattedMessage id="form.label_media"/>
            </label>
            <Field
              id="proposal_media"
              name="media"
              component={component}
              type="image"
            />
          </div>
          <div className="">
            <label className="col-sm-3 control-label">
              <FormattedMessage id="form.label_username"/>
            </label>
            <div>
              <Field
                name="username"
                component={component}
                type="text"
                id="personal-data-form-username"
                divClassName="col-sm-4"
              />
            </div>
          </div>
          <div className="">
            <label className="col-sm-3 control-label">
              <FormattedMessage id="form.label_username"/>
            </label>
            <div>
              <Field
                name="biography"
                component={component}
                type="textarea"
                id="personal-data-form-biography"
                divClassName="col-sm-4"
              />
            </div>
          </div>
          <div className="">
            <label className="col-sm-3 control-label">
              <FormattedMessage id="form.label_website"/>
            </label>
            <div>
              <Field
                name="username"
                component={component}
                type="text"
                id="personal-data-form-website"
                divClassName="col-sm-4"
              />
            </div>
          </div>
          <h2>
            <FormattedMessage id="admin.label.social network"/>
          </h2>
          <div className="">
            <label className="col-sm-3 control-label">
              <FormattedMessage id="user.profile.edit.facebook"/>
            </label>
            <div>
              <Field
                name="username"
                component={component}
                type="text"
                id="personal-data-form-username"
                divClassName="col-sm-4"
              />
            </div>
          </div>
          <div className="personal_data_field">
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || submitting}
                type="submit"
                bsStyle="primary"
                id="profile-form-save"
              >
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'}/>
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
})(Profile);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  initialValues: {
    username: props.viewer.username ? props.viewer.username : null,
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment Profile_viewer on User {
      id
      media {
        url
      }
      username
      biography
      website
      facebookUrl
      linkedInUrl
      twitterUrl
      profilePageIndexed
    }
  `,
);
