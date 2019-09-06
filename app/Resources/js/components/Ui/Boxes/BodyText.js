// @flow
import * as React from 'react';
import ReadMoreLink from '../../Utils/ReadMoreLink';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {|
  +text?: ?string,
  +maxLines: number,
|};

type State = {|
  +expanded: boolean,
  +truncated: boolean,
  +hideText: boolean,
|};

export const LINE_HEIGHT = 22;
export const DEFAULT_MAX_LINES = 7;

class BodyText extends React.Component<Props, State> {
  static defaultProps = {
    text: null,
    maxLines: DEFAULT_MAX_LINES,
  };

  refContent: { current: null | HTMLDivElement };

  hasMoreLines = false;

  constructor(props: Props) {
    super(props);
    this.refContent = React.createRef<HTMLDivElement>();
    this.state = {
      expanded: true,
      truncated: false,
      hideText: false,
    };
  }

  componentDidMount = () => {
    if (this.refContent.current) {
      const { height } = this.refContent.current.getBoundingClientRect();
      const { maxLines } = this.props;
      const lines = height / LINE_HEIGHT;
      this.hasMoreLines = lines > maxLines;
      this.setState({
        truncated: this.hasMoreLines,
        expanded: !this.hasMoreLines,
      });
    }
  };

  toggleExpand = () => {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  };

  render() {
    const { text, maxLines } = this.props;
    if (!text) {
      return null;
    }
    const { truncated, hideText, expanded } = this.state;
    const style = {
      maxHeight: expanded ? `none` : `${LINE_HEIGHT * maxLines}px`,
      overflow: expanded ? 'visible' : 'hidden',
      visibility: hideText ? 'hidden' : 'visible',
    };
    return (
      <div className="step__intro">
        <div ref={this.refContent} className="body__infos__content">
          <WYSIWYGRender
            style={{
              lineHeight: `${LINE_HEIGHT}px`,
              ...style,
            }}
            value={text}
          />
        </div>
        {this.hasMoreLines && (
          <div className="text-center body__infos__read-more">
            <ReadMoreLink visible={truncated} expanded={expanded} onClick={this.toggleExpand} />
          </div>
        )}
      </div>
    );
  }
}

export default BodyText;
