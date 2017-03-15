import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';
import Toggle from 'react-toggle';
import type { State } from '../../types';

const RegistrationAdminPage = React.createClass({
  propTypes: {
  },
  mixins: [IntlMixin],

  render() {
    const { features } = this.props;
    return (
      <div>
        <h2>Réseaux sociaux</h2>
        <p>Permettre l'inscription via:</p>
        <Toggle
          // disabled={s.step_type === 'collect'}
          // checked={s.isSelected}
          // onChange={() => {
          //   if (s.isSelected) {
          //     unSelectStep(dispatch, proposalId, s.id);
          //   } else {
          //     selectStep(dispatch, proposalId, s.id);
          //   }
          // }}
        />
        <h2>Données recueillies</h2>
        <h2>Documents à accepter</h2>
        <h2>Communication</h2>
      </div>
    );
  },

});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});
export default connect(mapStateToProps)(RegistrationAdminPage);
