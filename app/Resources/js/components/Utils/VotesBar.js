import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';

const VotesBar = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    max: React.PropTypes.number.isRequired,
    value: React.PropTypes.number.isRequired,
    helpText: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  renderBar() {
    const bar = <ProgressBar style={{ marginBottom: '5px' }} bsStyle="success" max={this.props.max} now={this.props.value} label="%(percent)s%" />;
    if (this.props.helpText) {
      return this.renderOverlay(bar);
    }
    return bar;
  },

  renderIcon() {
    if (this.props.helpText) {
      const icon = <i style={{ fontSize: '24px', color: '#999', paddingLeft: '15px', top: '-5px' }} className="pull-right cap cap-information"></i>;
      return this.renderOverlay(icon);
    }
  },

  renderDoneNb() {
    return (
      <p className="small excerpt" style={{ marginBottom: '5px' }}>
        <FormattedMessage message={this.getIntlMessage('opinion.progress.done')} num={this.props.value} />
      </p>
    );
  },

  renderLeftNb() {
    const left = this.props.max - this.props.value;
    if (left > 0) {
      return (
        <p className="small excerpt">
          <FormattedMessage message={this.getIntlMessage('opinion.progress.left')} left={left} max={this.props.max}/>
          {this.renderIcon()}
        </p>
      );
    }
    return (
      <p className="small excerpt">
        <FormattedMessage message={this.getIntlMessage('opinion.progress.reached')} with={this.props.value}/>
        {this.renderIcon()}
      </p>
    );
  },

  renderOverlay(children) {
    return (
      <OverlayTrigger rootClose placement="top"
        overlay={
          <Tooltip id="votes-bar-tooltip">
            { this.props.helpText }
          </Tooltip>
        }
      >
        { children }
      </OverlayTrigger>
    );
  },

  render() {
    if (this.props.max > 0) {
      return (
        <div style={this.props.style} className="progression">
          {this.renderDoneNb()}
          {this.renderBar()}
          {this.renderLeftNb()}
        </div>
      );
    }
    return null;
  },

});

export default VotesBar;
