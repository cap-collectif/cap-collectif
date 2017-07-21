// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import OpinionSourceAddButton from './OpinionSourceAddButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import { showSourceCreateModal } from '../../../redux/modules/opinion';

const OpinionSourceAdd = React.createClass({
  propTypes: {
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
    };
  },

  render() {
    const { disabled, dispatch } = this.props;
    return (
      <div>
        <OpinionSourceAddButton
          disabled={disabled}
          handleClick={() => {
            dispatch(showSourceCreateModal());
          }}
        />
        {!disabled && <OpinionSourceFormModal source={null} />}
      </div>
    );
  },
});

export default connect()(OpinionSourceAdd);
