// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import type { Connector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Well, Col } from 'react-bootstrap';
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
      <div className="box-content">
        <div className="row">
          <Col xs={1}>
            <Toggle
              icons
              checked={features.registration}
              onChange={() => onToggle('registration', !features.registration)}
            />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="allow-registration" />
          </Col>
        </div>
        <h4>
          <FormattedMessage id="social-medias" />
        </h4>
        <p>
          <FormattedMessage id="allow-registration-with" />
        </p>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              checked={features.login_facebook}
              onChange={() => onToggle('login_facebook', !features.login_facebook)}
            />
          </Col>
          <Col xs={11}>Facebook</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              checked={features.login_gplus}
              onChange={() => onToggle('login_gplus', !features.login_gplus)}
            />
          </Col>
          <Col xs={11}>Google</Col>
        </div>
        <h4>
          <FormattedMessage id="allow" />
        </h4>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
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
          </Col>
          <Col xs={11}>
            <FormattedMessage id="limit-registration-to-some-domains" />
          </Col>
        </div>
        {features.restrict_registration_via_email_domain && <RegistrationEmailDomainsForm />}
        <h4>
          <FormattedMessage id="received-data" />
        </h4>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle checked icons disabled />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="user.register.username.username" />
          </Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle checked icons disabled />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="form.new_password" />
          </Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              checked={features.zipcode_at_register}
              onChange={() => onToggle('zipcode_at_register', !features.zipcode_at_register)}
            />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="user.register.zipcode" />
          </Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              checked={features.user_type}
              onChange={() => onToggle('user_type', !features.user_type)}
            />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="registration.type" />
          </Col>
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
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              checked={features.consent_external_communication}
              onChange={() =>
                onToggle('consent_external_communication', !features.consent_external_communication)
              }
            />
          </Col>
          <Col xs={11}>
            <p>
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
            </p>
          </Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              icons
              disabled={!isSuperAdmin}
              checked={features.captcha}
              onChange={() => onToggle('captcha', !features.captcha)}
            />
          </Col>
          <Col xs={11}>
            <FormattedMessage id="i-am-not-a-bot" />
          </Col>
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

const connector: Connector<{}, Props> = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(RegistrationAdminPage);
