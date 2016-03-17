import React from 'react';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';

const RegistrationButton = React.createClass({
  mixins: [IntlMixin],

  render() {
    if (!FeatureStore.isActive('registration')) {
      return null;
    }
    return (
      <a href="/register" className="btn btn-primary btn-brand navbar-btn">layout.register</a>
    );
  },

});

export default RegistrationButton;
