import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { Col, Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import type { State, Dispatch } from '../../types';

const toggleFeatureA = {};
const showNewFieldModal = {};

const RegistrationAdminPage = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    toggleFeature: PropTypes.func.isRequired,
    addNewField: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    $('input').iCheck('destroy');
  },

  componentDidUpdate() {
    $('input').iCheck('destroy');
  },

  render() {
    const { toggleFeature, addNewField, features } = this.props;
    return (
      <div style={{ marginLeft: 15 }}>
        <h2>Réseaux sociaux</h2>
        <p>Permettre l'inscription via:</p>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.login_facebook}
              onChange={() => toggleFeature('login_facebook', !features.login_facebook)}
            />
          </Col>
          <Col xs={11}>Facebook</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.login_gplus}
              onChange={() => toggleFeature('login_gplus', !features.login_gplus)}
            />
          </Col>
          <Col xs={11}>Google</Col>
        </div>
        <h2>Données recueillies</h2>
        <p>Receuillir les données suivantes auprès de l'utilisateur:</p>
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
              onChange={() => toggleFeature('zipcode_at_register', !features.zipcode_at_register)}
            />
          </Col>
          <Col xs={11}>Code postal</Col>
        </div>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}>
            <Toggle
              checked={features.user_type}
              onChange={() => toggleFeature('user_type', !features.user_type)}
            />
          </Col>
          <Col xs={11}>Type de profil</Col>
        </div>
        <p>
          <strong>Champ(s) supplémentaire(s)</strong>
        </p>
        <Button onClick={() => addNewField()}>
          Ajouter
        </Button>
        <div className="row" style={{ padding: '10px 0' }}>
          <Col xs={1}><Toggle checked disabled /></Col>
          <Col xs={11}>Je ne suis pas un robot</Col>
        </div>
        <h2>Documents à accepter</h2>
        <h2>Communication</h2>
      </div>
    );
  },

});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleFeature: (feature, value) => dispatch(toggleFeatureA(feature, value)),
  addNewField: () => dispatch(showNewFieldModal()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(RegistrationAdminPage);
