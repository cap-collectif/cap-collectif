import React from 'react';
import PropTypes from 'prop-types';
import TreeView from '../TreeView';

class Preview extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
  };

  static defaultProps = {
    synthesis: {},
  };

  render() {
    const { synthesis } = this.props;
    return (
      <div className="synthesis__view" style={{ paddingTop: '30px' }}>
        <TreeView synthesis={synthesis} />
      </div>
    );
  }
}

export default Preview;
