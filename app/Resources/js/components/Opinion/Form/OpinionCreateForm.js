import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';

const OpinionCreateForm = React.createClass({
  propTypes: {
    opinionType: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      title: true,
      body: true,
    };
  },

  render() {
    return (
      <OpinionForm
        onSubmit={(data) => console.log}
        fields={Object.keys(this.state).filter(field => this.state[field])}
      />
    );
  },

});

export default OpinionCreateForm;
