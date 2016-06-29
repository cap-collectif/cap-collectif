import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ViewTree from './View/ViewTree';
import { connect } from 'react-redux';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  render() {
    if (this.props.synthesis.enabled || (this.props.user && this.props.user.vip)) {
      return (
        <div className="synthesis__view">
          <ViewTree synthesis={this.props.synthesis} />
        </div>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ViewBox);
