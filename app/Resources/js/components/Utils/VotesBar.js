// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar, OverlayTrigger } from 'react-bootstrap';
import Tooltip from './Tooltip';

type Props = {
  style?: Object,
  max: number,
  value: number,
  helpText?: ?string,
};

class VotesBar extends React.Component<Props> {
  renderBar = () => {
    const { helpText, max, value } = this.props;
    const bar = (
      <ProgressBar
        style={{ marginBottom: '5px' }}
        bsStyle="success"
        max={max}
        now={value}
        label={`${value}%`}
      />
    );
    if (helpText) {
      return this.renderOverlay(bar);
    }
    return bar;
  };

  renderIcon = () => {
    const { helpText } = this.props;
    if (helpText) {
      const icon = (
        <i
          style={{
            fontSize: '24px',
            color: '#999',
            paddingLeft: '15px',
            top: '-5px',
          }}
          className="pull-right cap cap-information"
        />
      );
      return this.renderOverlay(icon);
    }
  };

  renderDoneNb = () => {
    const { value } = this.props;
    return (
      <p className="small excerpt" style={{ marginBottom: '5px' }}>
        <FormattedMessage
          id="opinion.progress.done"
          values={{
            num: value,
          }}
        />
      </p>
    );
  };

  renderLeftNb = () => {
    const { max, value } = this.props;
    const left = max - value;
    if (left > 0) {
      return (
        <p className="small excerpt">
          <FormattedMessage
            id="opinion.progress.left"
            values={{
              left,
              max,
            }}
          />
          {this.renderIcon()}
        </p>
      );
    }
    return (
      <p className="small excerpt">
        <FormattedMessage
          id="opinion.progress.reached"
          values={{
            with: value,
          }}
        />
        {this.renderIcon()}
      </p>
    );
  };

  renderOverlay = (children: Object) => {
    const { helpText } = this.props;
    return (
      <OverlayTrigger
        rootClose
        placement="top"
        overlay={<Tooltip id="votes-bar-tooltip">{helpText}</Tooltip>}>
        {children}
      </OverlayTrigger>
    );
  };

  render() {
    const { max, style } = this.props;
    if (max > 0) {
      return (
        <div style={style} className="progression">
          {this.renderDoneNb()}
          {this.renderBar()}
          {this.renderLeftNb()}
        </div>
      );
    }
    return null;
  }
}

export default VotesBar;
