// @flow
import React, { PropTypes } from 'react';
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
  reorder: (list: Array<Object>) => void,
  dynamicFields: Array<Object>,
};

export const RegistrationAdminPage = React.createClass({
  propTypes: {
    isSuperAdmin: PropTypes.bool.isRequired,
    features: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    addNewField: PropTypes.func.isRequired,
    reorder: PropTypes.func.isRequired,
    dynamicFields: PropTypes.array.isRequired,
  },

  render() {
    const { reorder, isSuperAdmin, onToggle, addNewField, features, dynamicFields } = this.props;
    return (
      <div style={{ margin: '0 15px' }}>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.registration}
              onChange={() => onToggle('registration', !features.registration)}
            />
          </Col>
          <Col xs={11}>Permettre l'inscription</Col>
        </div>
        <h2>Réseaux sociaux</h2>
        <p>Permettre l'inscription via :</p>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.login_facebook}
              onChange={() => onToggle('login_facebook', !features.login_facebook)}
            />
          </Col>
          <Col xs={11}>Facebook</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.login_gplus}
              onChange={() => onToggle('login_gplus', !features.login_gplus)}
            />
          </Col>
          <Col xs={11}>Google</Col>
        </div>
        <h2>Autorisation</h2>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.restrict_registration_via_email_domain}
              onChange={() =>
                onToggle(
                  'restrict_registration_via_email_domain',
                  !features.restrict_registration_via_email_domain,
                )}
            />
          </Col>
          <Col xs={11}>Limiter l'inscription à certains noms de domaine</Col>
        </div>
        {features.restrict_registration_via_email_domain && <RegistrationEmailDomainsForm />}
        <h2>Données recueillies</h2>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle checked disabled />
          </Col>
          <Col xs={11}>Nom ou pseudonyme</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle checked disabled />
          </Col>
          <Col xs={11}>Mot de passe</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.zipcode_at_register}
              onChange={() => onToggle('zipcode_at_register', !features.zipcode_at_register)}
            />
          </Col>
          <Col xs={11}>Code postal</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.user_type}
              onChange={() => onToggle('user_type', !features.user_type)}
            />
          </Col>
          <Col xs={11}>Statut</Col>
        </div>
        <Well bsClass={isSuperAdmin ? 'div' : 'well'}>
          <p style={{ marginTop: 10 }}>
            {!isSuperAdmin && (
              <Alert bsStyle="info">
                Cette section est modifiable uniquement par votre administrateur cap-collectif.
              </Alert>
            )}
            <strong>Champ(s) supplémentaire(s)</strong>
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
            disabled={!isSuperAdmin}
            style={{ marginBottom: 10 }}
            onClick={
              !isSuperAdmin
                ? null
                : () => {
                    addNewField();
                  }
            }>
            Ajouter
          </Button>
        </Well>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.consent_external_communication}
              onChange={() =>
                onToggle(
                  'consent_external_communication',
                  !features.consent_external_communication,
                )}
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
                      href={`${window.location.protocol}//${window.location
                        .host}/admin/settings/settings.global/list`}>
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
              disabled={!isSuperAdmin}
              checked={features.captcha}
              onChange={() => onToggle('captcha', !features.captcha)}
            />
          </Col>
          <Col xs={11}>Je ne suis pas un robot</Col>
        </div>
        <h2>Communication</h2>
        <RegistrationCommunicationForm />
      </div>
    );
  },
});

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

const connector: Connector<{}, Props> = connect(mapStateToProps, mapDispatchToProps);
export default connector(RegistrationAdminPage);
