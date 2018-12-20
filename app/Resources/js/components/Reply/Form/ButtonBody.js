// @flow
import * as React from 'react';
import Linkify from 'react-linkify';
import { FormattedMessage } from 'react-intl';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  body: string,
};

type State = {
  expanded: boolean,
};

class ButtonBody extends React.Component<Props, State> {
  state = {
    expanded: false,
  };

  textShouldBeTruncated = (): boolean => {
    const { body } = this.props;
    return body.length > 700;
  };

  generateText = (): string => {
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
  };

  expand = (expanded: $FlowFixMe): void => {
    this.setState({
      expanded,
    });
  };

  renderReadMoreOrLess = () => {
    if (this.textShouldBeTruncated() && !this.state.expanded) {
      return (
        <button className="btn-link" onClick={this.expand.bind(this, true)}>
          {<FormattedMessage id="global.read_more" />}
        </button>
      );
    }
  };

  render() {
    const { body } = this.props;

    if (!body || body === '<p><br /></p>') {
      return null;
    }

    return (
      <div className="opinion__text">
        <Linkify properties={{ className: 'external-link' }}>
          <WYSIWYGRender value={this.generateText()} />
        </Linkify>
        {this.renderReadMoreOrLess()}
      </div>
    );
  }
}

export default ButtonBody;
