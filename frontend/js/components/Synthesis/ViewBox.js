import React from 'react';
import { connect } from 'react-redux';
import TreeView from './TreeView';

type Props = {
  synthesis: Object,
  user?: ?Object,
};

class ViewBox extends React.Component<Props> {
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
