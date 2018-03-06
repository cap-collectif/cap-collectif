// @flow
import * as React from 'react';
import Linkify from 'react-linkify';
import { FormattedMessage } from 'react-intl';

const ButtonBody = React.createClass({
  propTypes: {
    body: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      expanded: false
    };
  },

  textShouldBeTruncated(): boolean {
    const { body } = this.props;
    return body.length > 700;
  },

  generateText(): string {
    const { body } = this.props;
    let text = '';

    if (!this.textShouldBeTruncated() || this.state.expanded) {
      text = body;
    } else {
      text = body.substr(0, 700);
      text = text.substr(0, Math.min(text.length, text.lastIndexOf(' ')));
      if (text.indexOf('.', text.length - 1) === -1) {
        text += '[…]';
      }
      text += ' ';
    }

    return text;
  },

  expand(expanded): void {
    this.setState({
      expanded
    });
  },

  renderReadMoreOrLess() {
    if (this.textShouldBeTruncated() && !this.state.expanded) {
      return (
        <button className="btn-link" onClick={this.expand.bind(this, true)}>
          {<FormattedMessage id="global.read_more" />}
        </button>
      );
    }
  },

  render() {
    return (
      <div className="opinion__text">
        <Linkify properties={{ className: 'external-link' }}>
          <div dangerouslySetInnerHTML={{ __html: this.generateText() }} />
        </Linkify>
        {this.renderReadMoreOrLess()}
      </div>
    );
  }
});

export default ButtonBody;
