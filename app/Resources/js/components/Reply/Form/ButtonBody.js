// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Linkify from 'react-linkify';
import { FormattedMessage } from 'react-intl';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import type { GlobalState } from '~/types';

type Props = {
  body: string,
  readMore: boolean,
};

type State = {
  expanded: boolean,
};

class ButtonBody extends React.Component<Props, State> {
  state = {
    expanded: false,
  };

  textShouldBeTruncated = (): boolean => {
    const { readMore, body } = this.props;
    return readMore && body.length > 700;
  };

  generateText = (): string => {
    const { body } = this.props;
    const { expanded } = this.state;
    let text = '';

    if (!this.textShouldBeTruncated() || expanded) {
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
    const { expanded } = this.state;

    if (this.textShouldBeTruncated() && !expanded) {
      return (
        <button className="btn-link" onClick={this.expand.bind(this, true)} type="button">
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
      <div className="opinion__text mb-15">
        <Linkify properties={{ className: 'external-link' }}>
          <WYSIWYGRender value={this.generateText()} />
        </Linkify>
        {this.renderReadMoreOrLess()}
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  readMore: state.default.features.read_more,
});

export default connect(mapStateToProps)(ButtonBody);
