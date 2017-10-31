// @flow
import React, { PropTypes } from 'react';

const Loader = React.createClass({
  propTypes: {
    show: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  },

  getDefaultProps() {
    return {
      show: true,
      children: null,
    };
  },

  render() {
    const { children, show } = this.props;
    if (show) {
      return (
        <div className="row">
          <div className="col-xs-2 col-xs-offset-5 spinner-loader-container">
            <div className="spinner-loader" />
          </div>
        </div>
      );
    }
    return Array.isArray(children) ? <div>{children}</div> : children;
  },
});

export default Loader;
