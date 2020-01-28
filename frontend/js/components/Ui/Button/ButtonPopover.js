// @flow
import * as React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import Popover from '~/components/Utils/Popover';

export const PLACEMENT: {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
};

type Props = {|
  id: string,
  trigger: React.Node,
  children: React.Element<*>,
  onClose?: ?() => void,
  placement?: $Values<typeof PLACEMENT>,
|};

class ButtonPopover extends React.Component<Props> {
  overlayRef: any;

  constructor(props: Props) {
    super(props);
    this.overlayRef = React.createRef();
  }

  handleCancel = () => {
    this.overlayRef.current.hide();
  };

  render() {
    const { id, placement = PLACEMENT.TOP, children, trigger } = this.props;

    return (
      <OverlayTrigger
        trigger="click"
        placement={placement}
        ref={this.overlayRef}
        overlay={
          <Popover id={`${id}-popover`}>
            {React.cloneElement(children, {
              onClose: this.handleCancel,
            })}
          </Popover>
        }>
        {trigger}
      </OverlayTrigger>
    );
  }
}

export default ButtonPopover;
