import classNames from 'classnames';
import React from 'react';

const Popover = React.createClass({

  propTypes: {
    id: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),

    left: React.PropTypes.number.isRequired,
    top: React.PropTypes.number.isRequired,
    width: React.PropTypes.string.isRequired,

    placement: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    arrowOffsetLeft: React.PropTypes.oneOfType([
      React.PropTypes.number, React.PropTypes.string,
    ]),
    arrowOffsetTop: React.PropTypes.oneOfType([
      React.PropTypes.number, React.PropTypes.string,
    ]),
    title: React.PropTypes.node,
    children: React.PropTypes.node.isRequired,
  },

  getDefaultProps() {
    return {
      placement: 'right',
      bsClass: 'popover',
    };
  },

  renderTitle() {
    return (
      <h3 className="popover-title">
        {this.props.title}
      </h3>
    );
  },

  render() {
    const classes = {
      popover: true,
      [this.props.placement]: true,
    };

    const style = {
      display: 'block',
      left: this.props.left,
      top: this.props.top,
      width: this.props.width,
      maxWidth: '100%',
    };

    const arrowStyle = {
      left: this.props.arrowOffsetLeft,
      top: this.props.arrowOffsetTop,
    };

    console.log('custom popo');
    return (
      <div
        role="tooltip"
        className={classNames(classes)}
        style={style}
        title={null}
      >
        <div className="arrow" style={arrowStyle} />

        {this.props.title ? this.renderTitle() : null}

        <div className="popover-content">
          {this.props.children}
        </div>
      </div>
    );
  },
});

export default Popover;
