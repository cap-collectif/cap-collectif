// @flow
// This is a cleanup of https://github.com/ethanselzer/react-hover-observer
import * as React from 'react';

const noop = () => {};

type State = { isHovering: boolean };
type Props = Object;

/**
 * Use this component to inject an isHovering props
 */
class HoverObserver extends React.Component<Props, State> {
  timerIds = [];

  static defaultProps = {
    hoverDelayInMs: 0,
    hoverOffDelayInMs: 0,
    onHoverChanged: noop,
    onMouseEnter: ({ setIsHovering }: Object) => setIsHovering(),
    onMouseLeave: ({ unsetIsHovering }: Object) => unsetIsHovering(),
    onMouseOver: noop,
    onMouseOut: noop,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }

  componentWillUnmount() {
    this.clearTimers();
  }

  onMouseEnter = (e: Event) => {
    const { onMouseEnter } = this.props;
    onMouseEnter({
      e,
      setIsHovering: this.setIsHovering,
      unsetIsHovering: this.unsetIsHovering,
    });
  };

  onMouseLeave = (e: Event) => {
    const { onMouseLeave } = this.props;
    onMouseLeave({
      e,
      setIsHovering: this.setIsHovering,
      unsetIsHovering: this.unsetIsHovering,
    });
  };

  onMouseOver = (e: Event) => {
    const { onMouseOver } = this.props;
    onMouseOver({
      e,
      setIsHovering: this.setIsHovering,
      unsetIsHovering: this.unsetIsHovering,
    });
  };

  onMouseOut = (e: Event) => {
    const { onMouseOut } = this.props;
    onMouseOut({
      e,
      setIsHovering: this.setIsHovering,
      unsetIsHovering: this.unsetIsHovering,
    });
  };

  setIsHovering = () => {
    this.clearTimers();
    const { hoverDelayInMs } = this.props;

    const hoverScheduleId = setTimeout(() => {
      const newState = { isHovering: true };
      const { onHoverChanged } = this.props;

      this.setState(newState, () => {
        onHoverChanged(newState);
      });
    }, hoverDelayInMs);

    this.timerIds.push(hoverScheduleId);
  };

  unsetIsHovering = () => {
    this.clearTimers();
    const { hoverOffDelayInMs } = this.props;

    const hoverOffScheduleId = setTimeout(() => {
      const newState = { isHovering: false };
      const { onHoverChanged } = this.props;
      this.setState(newState, () => {
        onHoverChanged(newState);
      });
    }, hoverOffDelayInMs);

    this.timerIds.push(hoverOffScheduleId);
  };

  clearTimers = () => {
    const ids = this.timerIds;
    while (ids.length) {
      clearTimeout(ids.pop());
    }
  };

  renderChildrenWithProps(children: React.Element<*>, props: Props) {
    return React.Children.map(children, child => React.cloneElement(child, props));
  }

  render() {
    const { children } = this.props;
    const { isHovering } = this.state;
    const childProps = {
      ...this.props,
      isHovering,
      hoverDelayInMs: undefined,
      hoverOffDelayInMs: undefined,
      onMouseEnter: undefined,
      onMouseLeave: undefined,
      onMouseOver: undefined,
      onMouseOut: undefined,
      onHoverChanged: undefined,
      children: undefined,
    };

    // We use a div here, because with a span, if the element is resized, things
    // can go into inifinite loop: hovering -> resize -> not hovering -> resize -> hovering ...
    return (
      <div
        {...{
          onMouseEnter: this.onMouseEnter,
          onMouseLeave: this.onMouseLeave,
          onMouseOver: this.onMouseOver,
          onMouseOut: this.onMouseOut,
        }}
        className="d-ib">
        {this.renderChildrenWithProps(children, childProps)}
      </div>
    );
  }
}

export default HoverObserver;
