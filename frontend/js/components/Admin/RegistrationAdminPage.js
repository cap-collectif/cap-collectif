// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Well } from 'react-bootstrap';
import Toggle from '~/components/Ui/Toggle/Toggle';
import environment, { graphqlError } from '../../createRelayEnvironment';
import { toggleFeature } from '~/redux/modules/default';
import type { State, Dispatch, FeatureToggle, FeatureToggles } from '~/types';
import RegistrationEmailDomainsForm from './RegistrationEmailDomainsForm';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import RegistrationFormQuestions from './RegistrationFormQuestions';
import AdvancedSection from './Registration/AdvancedSection';
import type { RegistrationAdminPage_query } from '~relay/RegistrationAdminPage_query.graphql';
import type { RegistrationAdminPageQueryResponse } from '~relay/RegistrationAdminPageQuery.graphql';
import RegistrationFormCommunication from '~/components/Admin/RegistrationFormCommunication';

export type Props = {|
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  isSuperAdmin: boolean,
  query: RegistrationAdminPage_query,
|};

const renderQuestions = ({
  error,
  props,
  retry,
}: {
  ...ReactRelayReadyState,
  props: ?RegistrationAdminPageQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.registrationForm) {
      if (!props.registrationForm.isIndexationDone) {
        if (retry) {
          setTimeout(() => {
            retry();
          }, 5000);
        }
        return <Loader />;
      }
      return <RegistrationFormQuestions {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

const renderCommunication = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?RegistrationAdminPageQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.registrationForm) {
      return <RegistrationFormCommunication {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

const registrationAdminQuestionsAndCommunicationQuery = graphql`
  query RegistrationAdminPageQuery {
    registrationForm {
      ...RegistrationFormQuestions_registrationForm
      ...RegistrationFormCommunication_registrationForm
      ... on RegistrationForm {
        isIndexationDone
      }
    }
  }
`;

export class RegistrationAdminPage extends React.Component<Props> {
  render() {
    const { isSuperAdmin, onToggle, features, query } = this.props;
    return (
      <>
        <QueryRenderer
          query={registrationAdminQuestionsAndCommunicationQuery}
          environment={environment}
          variables={{}}
          render={renderCommunication}
        />

        <div className="box box-primary container-fluid">
          <div className="box-content box-content__content-form">
            <h3 className="box-title">
              <FormattedMessage id="allow" />
            </h3>
            <div className="d-flex align-items-baseline mb-15">
              <Toggle
                id="toggle-registration"
                checked={features.registration}
                onChange={() => onToggle('registration', !features.registration)}
                label={<FormattedMessage id="allow-registration" />}
              />
            </div>
            <h4>
              <FormattedMessage id="allow" />
            </h4>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-restrict-registration-email-domain"
                checked={features.restrict_registration_via_email_domain}
                onChange={() =>
                  onToggle(
                    'restrict_registration_via_email_domain',
                    !features.restrict_registration_via_email_domain,
                  )
                }
                label={<FormattedMessage id="limit-registration-to-some-domains" />}
              />
            </div>
          </div>
          {features.restrict_registration_via_email_domain && <RegistrationEmailDomainsForm />}
        </div>

        <div className="box box-primary container-fluid">
          <div className="box-content box-content__content-form">
            <h3>
              <FormattedMessage id="received-data" />
            </h3>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-fullname"
                checked
                disabled
                label={<FormattedMessage id="global.fullname" />}
              />
            </div>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-password"
                checked
                disabled
                label={<FormattedMessage id="registration.password" />}
              />
            </div>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-zipcode"
                checked={features.zipcode_at_register}
                onChange={() => onToggle('zipcode_at_register', !features.zipcode_at_register)}
                label={<FormattedMessage id="user.register.zipcode" />}
              />
            </div>
            <div className="d-flex align-items-baseline mb-15">
              <Toggle
                id="toggle-userType"
                checked={features.user_type}
                onChange={() => onToggle('user_type', !features.user_type)}
                label={<FormattedMessage id="registration.type" />}
              />
            </div>
            {isSuperAdmin && (
              <Well bsClass={isSuperAdmin ? 'div' : 'well'}>
                <p className="mt-10">
                  <strong>
                    <FormattedMessage id="more-fields" />
                  </strong>
                </p>
                <QueryRenderer
                  query={registrationAdminQuestionsAndCommunicationQuery}
                  environment={environment}
                  variables={{}}
                  render={renderQuestions}
                />
              </Well>
            )}
          </div>
        </div>

        <div className="box box-primary container-fluid">
          <div className="box-content box-content__content-form">
            <FormattedMessage id="capco.module.newsletter" tagName="h3" />
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-consent-internal-communication"
                disabled={!isSuperAdmin}
                checked={features.consent_internal_communication}
                onChange={() =>
                  onToggle(
                    'consent_internal_communication',
                    !features.consent_internal_communication,
                  )
                }
                label={
                  <span>
                    <strong>
                      <FormattedMessage id="request-consent-to-receive-information-related-to-the-platform" />
                    </strong>
                  </span>
                }
              />
            </div>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-consent-external-communication"
                checked={features.consent_external_communication}
                onChange={() =>
                  onToggle(
                    'consent_external_communication',
                    !features.consent_external_communication,
                  )
                }
                label={
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
                            href={`${window.location.protocol}//${window.location.host}/admin/settings/settings.global/list`}>
                            <FormattedMessage id="global.general" />
                          </a>
                        ),
                      }}
                    />
                  </span>
                }
              />
            </div>
            <div className="d-flex align-items-baseline mb-15 mt-15">
              <Toggle
                id="toggle-captcha"
                disabled={!isSuperAdmin}
                checked={features.captcha}
                onChange={() => onToggle('captcha', !features.captcha)}
                label={<FormattedMessage id="i-am-not-a-bot" />}
              />
            </div>
          </div>
        </div>

        <AdvancedSection query={query} />
      </>
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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default createFragmentContainer(connector(RegistrationAdminPage), {
  query: graphql`
    fragment RegistrationAdminPage_query on Query {
      ...AdvancedSection_query
    }
  `,
});
