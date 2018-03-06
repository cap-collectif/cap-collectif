import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TreeView from './TreeView';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: PropTypes.object.isRequired,
    user: PropTypes.object
  },

  getDefaultProps() {
    return {
      user: null
    };
  },

  render() {
    const { synthesis, user } = this.props;
    if (synthesis.enabled || (user && user.vip)) {
      return (
        <div className="synthesis__view">
          <TreeView synthesis={synthesis} />
        </div>
      );
    }
    return null;
  }
});

const mapStateToProps = state => {
  return {
    user: state.user.user
  };
};

export default connect(mapStateToProps)(ViewBox);
