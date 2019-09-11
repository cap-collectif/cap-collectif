// @flow
import React from 'react';
import ReadMoreLink from '../../Utils/ReadMoreLink';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  text?: ?string,
};

type State = {
  expanded: boolean,
  truncated: boolean,
  hideText: boolean,
};

class StepText extends React.Component<Props, State> {
  static defaultProps = {
    text: null,
  };

  state = {
    expanded: true,
    truncated: false,
    hideText: false,
  };

  toggleExpand = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  render() {
    const { text } = this.props;
    if (!text) {
      return null;
    }
    const style = {
      maxHeight: this.state.expanded ? 'none' : '85px',
      visibility: this.state.hideText ? 'hidden' : 'visible',
    };
    return (
      <div className="step__intro">
        <div ref="content" className="step__intro__content" style={style}>
          <WYSIWYGRender value={text} />
        </div>
        <div className="text-center">
          <ReadMoreLink
            visible={this.state.truncated}
            expanded={this.state.expanded}
            onClick={this.toggleExpand}
          />
        </div>
      </div>
    );
  }
}

export default StepText;
