import React from 'react';
import TreeView from '../TreeView';

const Preview = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      synthesis: {},
    };
  },

  render() {
    const { synthesis } = this.props;
    return (
      <div className="synthesis__view" style={{ paddingTop: '30px' }}>
        <TreeView synthesis={synthesis} />
      </div>
    );
  },
});

export default Preview;
