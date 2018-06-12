import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TreeView from './TreeView';

class ViewBox extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object.isRequired,
    user: PropTypes.object,
  };

  static defaultProps = {
    user: null,
  };

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
}

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ViewBox);
