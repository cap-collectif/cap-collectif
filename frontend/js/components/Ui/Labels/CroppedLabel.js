// @flow
import * as React from 'react';
import { Label } from 'react-bootstrap';
import type { BsStyle } from '~/types/ReactBootstrap.type';
import Tooltip from '~ds/Tooltip/Tooltip';

type LabelType = {
  name: string,
  color: BsStyle,
};

type Props = {
  label: LabelType,
  maxSize: number,
  className?: string,
};

export class CroppedLabel extends React.Component<Props> {
  static defaultProps = {
    maxSize: 9,
  };

  render() {
    const { label, maxSize, className } = this.props;

    if (label.name.length > maxSize) {
      return (
        <Tooltip
          placement="top"
          label={label.name}
          id="tooltip"
          className="text-left"
          style={{ wordBreak: 'break-word' }}>
          <Label bsStyle={label.color} className={className}>
            {label.name.substring(0, 9)}…
          </Label>
        </Tooltip>
      );
    }

    return (
      <Label bsStyle={label.color} className={className}>
        {label.name}
      </Label>
    );
  }
}

export default CroppedLabel;
