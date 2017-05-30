// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

import OpinionSourceAddButton from './OpinionSourceAddButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';

const OpinionSourceAdd = React.createClass({
  propTypes: {
    disabled: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
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
    const { disabled } = this.props;
    return (
      <div>
        <OpinionSourceAddButton
          disabled={disabled}
          handleClick={this.show.bind(null, this)}
        />
        {!disabled
          ? <OpinionSourceFormModal
              show={this.state.showModal}
              onClose={this.close}
            />
          : null}
      </div>
    );
  },
});

export default OpinionSourceAdd;
