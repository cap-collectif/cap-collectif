// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Alert, Well } from 'react-bootstrap';
import Toggle from 'react-toggle';
import environment, { graphqlError } from '../../createRelayEnvironment';
import { toggleFeature } from '../../redux/modules/default';
import type { State, Dispatch, FeatureToggle, FeatureToggles } from '../../types';
import RegistrationCommunicationForm from './RegistrationCommunicationForm';
import RegistrationEmailDomainsForm from './RegistrationEmailDomainsForm';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import RegistrationFormQuestions from './RegistrationFormQuestions';

type Props = {
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  isSuperAdmin: boolean,
};

const dynamicFieldsComponent = ({ error, props }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.registrationForm) {
      return <RegistrationFormQuestions {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class RegistrationAdminPage extends React.Component<Props> {
  render() {
    const { isSuperAdmin, onToggle, features } = this.props;
    return (
      <div className="box-content box-content__content-form">
        <div className="d-flex align-items-center mb-15">
          <Toggle
            icons
            checked={features.registration}
            onChange={() => onToggle('registration', !features.registration)}
          />
          <FormattedMessage id="allow-registration" />
        </div>
        <h4>
          <FormattedMessage id="social-medias" />
        </h4>
        <p>
          <FormattedMessage id="allow-registration-with" />
        </p>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            checked={features.login_facebook}
            onChange={() => onToggle('login_facebook', !features.login_facebook)}
          />
          Facebook
        </div>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            checked={features.login_gplus}
            onChange={() => onToggle('login_gplus', !features.login_gplus)}
          />
          Google
        </div>
        <h4>
          <FormattedMessage id="allow" />
        </h4>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            checked={features.restrict_registration_via_email_domain}
            onChange={() =>
              onToggle(
                'restrict_registration_via_email_domain',
                !features.restrict_registration_via_email_domain,
              )
            }
          />
          <FormattedMessage id="limit-registration-to-some-domains" />
        </div>
        {features.restrict_registration_via_email_domain && <RegistrationEmailDomainsForm />}
        <h4>
          <FormattedMessage id="received-data" />
        </h4>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle checked icons disabled />
          <FormattedMessage id="user.register.username.username" />
        </div>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle checked icons disabled />
          <FormattedMessage id="form.new_password" />
        </div>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            checked={features.zipcode_at_register}
            onChange={() => onToggle('zipcode_at_register', !features.zipcode_at_register)}
          />
          <FormattedMessage id="user.register.zipcode" />
        </div>
        <div className="d-flex align-items-center mb-15">
          <Toggle
            icons
            checked={features.user_type}
            onChange={() => onToggle('user_type', !features.user_type)}
          />
          <FormattedMessage id="registration.type" />
        </div>
        <Well bsClass={isSuperAdmin ? 'div' : 'well'}>
          <p style={{ marginTop: 10 }}>
            {!isSuperAdmin && (
              <Alert bsStyle="info">
                Cette section est modifiable uniquement par votre administrateur cap-collectif.
              </Alert>
            )}
            <strong>
              <FormattedMessage id="more-fields" />
            </strong>
          </p>
          <QueryRenderer
            query={graphql`
              query RegistrationAdminPageQuery {
                registrationForm {
                  ...RegistrationFormQuestions_registrationForm
                }
              }
            `}
            environment={environment}
            variables={{}}
            render={dynamicFieldsComponent}
          />
        </Well>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            disabled
            checked={features.consent_internal_communication}
            onChange={() =>
              onToggle('consent_internal_communication', !features.consent_internal_communication)
            }
          />
          <span>
            <strong>
              <FormattedMessage id="request-consent-to-receive-information-related-to-the-platform" />
            </strong>
          </span>
        </div>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            checked={features.consent_external_communication}
            onChange={() =>
              onToggle('consent_external_communication', !features.consent_external_communication)
            }
          />
          <span>
            <strong>
              <FormattedMessage id="registration.enable_consent_external_communication.title" />
            </strong>
            <br />
            <FormattedMessage
              id="registration.enable_consent_external_communication.subtitle"
              values={{
                link: (
                  <a
                    className="external-link"
                    href={`${window.location.protocol}//${
                      window.location.host
                    }/admin/settings/settings.global/list`}>
                    <FormattedMessage id="proposal.admin.general" />
                  </a>
                ),
              }}
            />
          </span>
        </div>
        <div className="d-flex align-items-center mb-15 mt-15">
          <Toggle
            icons
            disabled={!isSuperAdmin}
            checked={features.captcha}
            onChange={() => onToggle('captcha', !features.captcha)}
          />
          <FormattedMessage id="i-am-not-a-bot" />
        </div>
        <h3>
          <FormattedMessage id="communication" />
        </h3>
        <RegistrationCommunicationForm />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(RegistrationAdminPage);
