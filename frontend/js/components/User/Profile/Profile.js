// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { type Profile_viewer } from '~relay/Profile_viewer.graphql';
import type { Dispatch, State } from '~/types';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UserAvatarDeprecated from '../UserAvatarDeprecated';
import UpdateProfilePublicDataMutation from '~/mutations/UpdateProfilePublicDataMutation';
import {
  occitanieUrl,
  isSsoFcOrOccitanie,
  getSsoTradKey,
} from '~/components/User/Profile/PersonalData';
import { REGEX_USERNAME } from '~/constants/FormConstants';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import {
  fbRegEx,
  instagramRegEx,
  linkedInRegEx,
  twitterRegEx,
} from '~/components/Utils/SocialNetworkRegexUtils';
import { isUrl } from '~/services/Validator';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Text from '~/components/Ui/Primitives/Text';
import Avatar from '~/components/Ui/Medias/Avatar';
import LeaveOrganizationModal from './LeaveOrganizationModal';

type RelayProps = {| viewer: Profile_viewer |};
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  intl: IntlShape,
  initialValues: Object,
  hasValue: Object,
  userTypes: Array<Object>,
|};

const formName = 'viewerProfileForm';

const validate = (values: Object) => {
  const errors = {};
  const fields = [
    'biography',
    'neighborhood',
    'linkedInUrl',
    'twitterUrl',
    'instagramUrl',
    'facebookUrl',
    'username',
  ];

  fields.forEach(value => {
    if (value === 'username') {
      if (!values[value] || values[value].length < 2) {
        errors[value] = 'registration.constraints.username.min';
      }
      if (values[value] && !REGEX_USERNAME.test(values[value])) {
        errors[value] = 'registration.constraints.username.symbol';
      }
    }
    if (values.facebookUrl && (!values.facebookUrl.match(fbRegEx) || !isUrl(values.facebookUrl))) {
      errors.facebookUrl = {
        id: 'error-invalid-facebook-url',
      };
    }

    if (
      values.twitterUrl &&
      (!values.twitterUrl.match(twitterRegEx) || !isUrl(values.twitterUrl))
    ) {
      errors.twitterUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: { SocialNetworkName: 'Twitter' },
      };
    }

    if (
      values.instagramUrl &&
      (!values.instagramUrl.match(instagramRegEx) || !isUrl(values.instagramUrl))
    ) {
      errors.instagramUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: { SocialNetworkName: 'Instagram' },
      };
    }

    if (
      values.linkedInUrl &&
      (!values.linkedInUrl.match(linkedInRegEx) || !isUrl(values.linkedInUrl))
    ) {
      errors.linkedInUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: { SocialNetworkName: 'LinkedIn' },
      };
    }
    if (values[value] && values[value].length < 2) {
      errors[value] = 'two-characters-minimum-required';
    }
    if (value === 'biography') {
      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required';
      }
    } else if (values[value] && values[value].length > 256) {
      errors[value] = '256-characters-maximum-required';
    }
  });

  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const media =
    typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null;
  delete values.media;

  const profilePageIndexed =
    typeof values.doNotIndexProfile !== 'undefined'
      ? !values.doNotIndexProfile
      : props.viewer.profilePageIndexed;
  if (typeof values.doNotIndexProfile !== 'undefined') {
    delete values.doNotIndexProfile;
  }

  const input = {
    ...values,
    profilePageIndexed,
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

export const Profile = ({
  viewer,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  handleSubmit,
  submitting,
  userTypes,
  error,
}: Props) => {
  const useNoIndexProfile = useFeatureFlag('noindex_on_profiles');
  const useUserType = useFeatureFlag('user_type');
  const { organizations } = viewer;

  return (
    <form onSubmit={handleSubmit} className="form-horizontal">
      <Panel id="capco_horizontal_form">
        <Panel.Heading>{renderHeader}</Panel.Heading>
        <Panel.Body>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="profile_avatar">
              <FormattedMessage id="sonata.media.provider.image" />
            </label>
            {/* $FlowFixMe */}
            <UserAvatarDeprecated className="col-sm-1" user={viewer} />
            <div className="clearfix" />
            <div className="col-sm-3" />
            <Field
              id="profile_avatar"
              name="media"
              disabled={window.location.hostname === occitanieUrl}
              component={component}
              type="image"
              divClassName="col-sm-6"
            />
            {isSsoFcOrOccitanie(false) && (
              <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                <FormattedMessage id={getSsoTradKey()} />
              </div>
            )}
          </div>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="profile-form-username">
              <FormattedMessage id="global.fullname" />
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
                disabled={window.location.hostname === occitanieUrl}
                id="profile-form-username"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          {useUserType && (
            <div className="horizontal_field_with_border_top no-border">
              <label className="col-sm-3 control-label" htmlFor="profile-form-userType">
                <FormattedMessage id="registration.type" />{' '}
              </label>
              <div>
                <Field
                  id="profile-form-userType"
                  name="userType"
                  component={component}
                  type="select"
                  disabled={window.location.hostname === occitanieUrl}
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
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-biography">
              <FormattedMessage id="form.label_biography" />
            </label>
            <div>
              <Field
                name="biography"
                component={component}
                disabled={window.location.hostname === occitanieUrl}
                type="textarea"
                id="public-data-form-biography"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-neighborhood">
              <FormattedMessage id="form.label_neighborhood" />
            </label>
            <div>
              <Field
                name="neighborhood"
                component={component}
                type="text"
                disabled={window.location.hostname === occitanieUrl}
                id="public-data-form-neighborhood"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          {organizations?.length ? (
            <>
              <div className="clearfix" />
              <h2>
                <FormattedMessage id="capco.module.organizations" />
              </h2>
              {organizations.map(org => (
                <Flex
                  key={org?.id}
                  p={4}
                  justify="space-between"
                  bg="gray.100"
                  border="normal"
                  borderRadius="normal"
                  borderColor="gray.200"
                  mb={4}>
                  <Flex alignItems="center" spacing={2} as="a" href={org?.url} color="gray.900">
                    {org?.media?.url ? (
                      <Avatar size="tiny" alt={org.username || ''} src={org.media.url || ''} />
                    ) : null}
                    <Text>{org?.username}</Text>
                  </Flex>
                  <LeaveOrganizationModal
                    organizationName={org?.username || ''}
                    organizationId={org?.id || ''}
                  />
                </Flex>
              ))}
            </>
          ) : null}
          <div className="clearfix" />
          <h2>
            <FormattedMessage id="social-medias" />
          </h2>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-facebook">
              <FormattedMessage id="user.profile.edit.facebook" />
            </label>
            <div>
              <Field
                placeholder="https://"
                name="facebookUrl"
                component={component}
                disabled={window.location.hostname === occitanieUrl}
                type="text"
                id="public-data-form-facebook"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-instagram">
              <FormattedMessage id="instagram-profile" />
            </label>
            <div>
              <Field
                placeholder="https://"
                name="instagramUrl"
                component={component}
                disabled={window.location.hostname === occitanieUrl}
                type="text"
                id="public-data-form-instagram"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-twitter">
              <FormattedMessage id="user.profile.edit.twitter" />
            </label>
            <div>
              <Field
                placeholder="https://"
                disabled={window.location.hostname === occitanieUrl}
                name="twitterUrl"
                component={component}
                type="text"
                id="public-data-form-twitter"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          <div className="horizontal_field_with_border_top no-border">
            <label className="col-sm-3 control-label" htmlFor="public-data-form-linkedIn">
              <FormattedMessage id="show.label_linked_in_url" />
            </label>
            <div>
              <Field
                placeholder="https://"
                name="linkedInUrl"
                disabled={window.location.hostname === occitanieUrl}
                component={component}
                type="text"
                id="public-data-form-linkedIn"
                divClassName="col-sm-6"
              />
              {isSsoFcOrOccitanie(false) && (
                <div className="col-sm-6 excerpt mb-5 text-right" style={{ marginLeft: 28 }}>
                  <FormattedMessage id={getSsoTradKey()} />
                </div>
              )}
            </div>
          </div>
          <div className="clearfix" />
          {!useNoIndexProfile ? (
            <>
              <h2>
                <FormattedMessage id="confidentialite.title" />
              </h2>
              <div className="horizontal_field_with_border_top">
                <div className="col-sm-3" />
                <Field
                  id="profilePageIndexed"
                  name="doNotIndexProfile"
                  component={component}
                  type="checkbox"
                  labelClassName="font-weight-normal"
                  divClassName="col-sm-8">
                  <FormattedMessage id="user.profile.edit.profilePageIndexed" />
                </Field>
              </div>
            </>
          ) : null}
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
};

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
    facebookUrl: props.viewer.facebookUrl ? props.viewer.facebookUrl : null,
    linkedInUrl: props.viewer.linkedInUrl ? props.viewer.linkedInUrl : null,
    twitterUrl: props.viewer.twitterUrl ? props.viewer.twitterUrl : null,
    instagramUrl: props.viewer.instagramUrl ? props.viewer.instagramUrl : null,
    doNotIndexProfile: !props.viewer.profilePageIndexed,
    userType: props.viewer.userType ? props.viewer.userType.id : null,
    neighborhood: props.viewer.neighborhood ? props.viewer.neighborhood : null,
    media: props.viewer ? props.viewer.media : undefined,
  },
  userTypes: state.default.userTypes,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));

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
      username
      biography
      facebookUrl
      linkedInUrl
      instagramUrl
      twitterUrl
      organizations {
        id
        url
        username
        media {
          url
        }
      }
      profilePageIndexed
      userType {
        id
      }
      neighborhood
    }
  `,
});
