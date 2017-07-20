// @flow
import React from 'react';
import Linkify from 'react-linkify';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';

const ButtonBody = React.createClass({
  propTypes: {
    body: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      expanded: false,
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
      expanded,
    });
  },

  renderReadMoreOrLess() {
    if (this.textShouldBeTruncated() && !this.state.expanded) {
      return (
        <button className="btn-link" onClick={this.expand.bind(this, true)}>
          {this.getIntlMessage('global.read_more')}
        </button>
      );
    }
  },

  render() {
    return (
      <div className="opinion__text">
        <Linkify properties={{ className: 'external-link' }}>
          <FormattedHTMLMessage message={this.generateText()} />
        </Linkify>
        {this.renderReadMoreOrLess()}
      </div>
    );
  },
});

export default ButtonBody;
