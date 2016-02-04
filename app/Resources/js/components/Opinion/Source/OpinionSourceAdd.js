import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

import OpinionSourceAddButton from './OpinionSourceAddButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';

const OpinionSourceAdd = React.createClass({
  propTypes: {
    show: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      show: true,
    };
  },

  getInitialState() {
    return {
      isSubmitting: false,
      showModal: false,
    };
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div>
        <OpinionSourceAddButton handleClick={this.show.bind(null, this)} />
        <OpinionSourceFormModal show={this.state.showModal} onClose={this.close} />
      </div>
    );
  },

});

export default OpinionSourceAdd;
