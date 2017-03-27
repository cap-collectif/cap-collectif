// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import { IntlMixin } from 'react-intl';
import { Alert, Well, Col, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { toggleFeature, showNewFieldModal, updateRegistrationFieldModal, deleteRegistrationField } from '../../redux/modules/default';
import type { State, Dispatch, FeatureToggle, FeatureToggles } from '../../types';
import RegistrationCommunicationForm from './RegistrationCommunicationForm';

type Props = {
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  addNewField: () => void,
  isSuperAdmin: boolean,
  deleteField: (id: number) => void,
  updateField: (id: number) => void,
  dynamicFields: Array<Object>
};

export const RegistrationAdminPage = React.createClass({
  propTypes: {
    isSuperAdmin: PropTypes.bool.isRequired,
    features: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    addNewField: PropTypes.func.isRequired,
    deleteField: PropTypes.func.isRequired,
    updateField: PropTypes.func.isRequired,
    dynamicFields: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { updateField, isSuperAdmin, onToggle, deleteField, addNewField, features, dynamicFields } = this.props;
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
            {
              !isSuperAdmin &&
                <Alert bsStyle="info">Cette section est modifiable uniquement par votre administrateur cap-collectif.</Alert>
            }
            <strong>Champ(s) supplémentaire(s)</strong>
          </p>
          {
            dynamicFields.length > 0 &&
              <ListGroup>
                {
                  dynamicFields.map(field =>
                    <ListGroupItem>
                      <div className="pull-right">
                        <Button
                          disabled={!isSuperAdmin}
                          style={{ marginRight: 5 }}
                          onClick={!isSuperAdmin ? null : () => updateField(field.id)}
                        >
                          Modifier
                        </Button>
                        <Button
                          disabled={!isSuperAdmin}
                          onClick={!isSuperAdmin ? null : () => deleteField(field.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                      <div>
                        <strong>{field.question}</strong>
                      </div>
                      <span>{this.getIntlMessage(`global.question.types.${field.type}`)}</span>
                    </ListGroupItem>,
                  )
                }
              </ListGroup>
          }
          <Button
            disabled={!isSuperAdmin}
            style={{ marginBottom: 10 }}
            onClick={!isSuperAdmin ? null : () => { addNewField(); }}
          >
            Ajouter
          </Button>
        </Well>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}><Toggle checked disabled /></Col>
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
  isSuperAdmin: state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN'),
  dynamicFields: state.user.registration_form.questions,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
  addNewField: () => { dispatch(showNewFieldModal()); },
  updateField: (id: number) => { dispatch(updateRegistrationFieldModal(id)); },
  deleteField: (id: number) => { deleteRegistrationField(id, dispatch); },
});

const connector: Connector<{}, Props> = connect(mapStateToProps, mapDispatchToProps);
export default connector(RegistrationAdminPage);
