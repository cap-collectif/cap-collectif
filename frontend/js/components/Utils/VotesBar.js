// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import { Flex, Text, Tooltip } from '@cap-collectif/ui';

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
            top: '-5px',
          }}
          className="pull-right cap-information"
        />
      );
      return this.renderOverlay(icon);
    }
  };

  renderDoneNb = () => {
    const { value } = this.props;
    return (
      <Flex className="small excerpt" style={{ marginBottom: '5px' }}>
        <FormattedMessage
          id="opinion.progress.done"
          values={{
            num: value,
          }}
        />
      </Flex>
    );
  };

  renderLeftNb = () => {
    const { max, value } = this.props;
    const left = max - value;
    if (left > 0) {
      return (
        <Flex className="small excerpt" gap={2}>
          <FormattedMessage
            id="opinion.progress.left"
            values={{
              left,
              max,
            }}
          />
          {this.renderIcon()}
        </Flex>
      );
    }
    return (
      <Flex className="small excerpt">
        <FormattedMessage
          id="opinion.progress.reached"
          values={{
            with: value,
          }}
        />
        {this.renderIcon()}
      </Flex>
    );
  };

  renderOverlay = (children: Object) => {
    const { helpText } = this.props;
    return (
      <Tooltip
        placement="top"
        label={
          <Text textAlign="center" lineHeight="sm" fontSize={1} marginBottom={0}>
            {helpText}
          </Text>
        }
        id="votes-bar-tooltip"
        className="text-left"
        style={{ wordBreak: 'break-word' }}>
        <div>{children}</div>
      </Tooltip>
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
