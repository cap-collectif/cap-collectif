// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Well, Col, Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { arrayMove } from 'react-sortable-hoc';
import { toggleFeature, showNewFieldModal } from '../../redux/modules/default';
import { reorderRegistrationQuestions } from '../../redux/modules/user';
import type { State, Dispatch, FeatureToggle, FeatureToggles } from '../../types';
import RegistrationCommunicationForm from './RegistrationCommunicationForm';
import RegistrationQuestionSortableList from './RegistrationQuestionSortableList';
import RegistrationEmailDomainsForm from './RegistrationEmailDomainsForm';

type Props = {
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  addNewField: () => void,
  isSuperAdmin: boolean,
  reorder: Function,
  dynamicFields: Array<Object>,
};

export class RegistrationAdminPage extends React.Component<Props> {
  render() {
    const { reorder, isSuperAdmin, onToggle, addNewField, features, dynamicFields } = this.props;
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
          {dynamicFields.length > 0 && (
            <RegistrationQuestionSortableList
              items={dynamicFields}
              onSortEnd={({ oldIndex, newIndex }) => {
                reorder(arrayMove(dynamicFields, oldIndex, newIndex));
              }}
              lockAxis="y"
              useDragHandle
            />
          )}
          <Button
            className="box-content__toolbar"
            disabled={!isSuperAdmin}
            style={{ marginBottom: 10 }}
            onClick={
              !isSuperAdmin
                ? null
                : () => {
                    addNewField();
                  }
            }>
            <FormattedMessage id="link_action_create" />
          </Button>
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
  dynamicFields: state.user.registration_form.questions,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
  addNewField: () => {
    dispatch(showNewFieldModal());
  },
  reorder: (list: Array<Object>) => {
    reorderRegistrationQuestions(list, dispatch);
  },
});

const connector: Connector<{}, Props> = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(RegistrationAdminPage);
