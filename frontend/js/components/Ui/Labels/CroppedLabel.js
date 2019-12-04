// @flow
import * as React from 'react';
import { Label, OverlayTrigger } from 'react-bootstrap';
import Tooltip from '../../Utils/Tooltip';

type LabelType = {
  name: string,
  color: string,
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
      const tooltip = (
        <Tooltip placement="top" id="tooltip">
          {label.name}
        </Tooltip>
      );

      return (
        <OverlayTrigger overlay={tooltip} placement="top">
          <Label bsStyle={label.color} className={className}>
            {label.name.substring(0, 9)}…
          </Label>
        </OverlayTrigger>
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
