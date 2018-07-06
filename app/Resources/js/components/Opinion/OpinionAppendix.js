// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Panel } from 'react-bootstrap';

type Props = {
  appendix: Object,
  expanded?: boolean,
};

type State = {
  expanded?: boolean,
};

class OpinionAppendix extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { expanded } = props;

    this.state = {
      expanded: expanded !== 'undefined' ? expanded : false,
    };
  }

  toggle = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  renderCaret = () => {
    if (this.state.expanded) {
      return <i className="cap cap-arrow-68" />;
    }
    return <i className="cap cap-arrow-67" />;
  };

  renderContent = () => {
    const appendix = this.props.appendix;
    const style = this.state.expanded ? { marginBottom: '15px' } : {};
    return (
      <Panel
        expanded={this.state.expanded}
        onToggle={() => {}}
        style={style}
        className="opinion__appendix__content">
        <Panel.Collapse>
          <Panel.Body>
            <div dangerouslySetInnerHTML={{ __html: appendix.body }} />
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  };

  render() {
    const appendix = this.props.appendix;

    if (!appendix.body) {
      return null;
    }

    return (
      <div className="opinion__appendix">
        <Button
          className="opinion__appendix__title"
          bsStyle="link"
          style={{ paddingLeft: '0', fontSize: '18px', fontWeight: '500' }}
          onClick={() => {
            this.toggle();
          }}
          title={
            this.state.expanded ? (
              <FormattedMessage
                id="opinion.appendices.hide"
                values={{
                  title: this.props.appendix.type.title,
                }}
              />
            ) : (
              <FormattedMessage
                id="opinion.appendices.show"
                values={{
                  title: this.props.appendix.type.title,
                }}
              />
            )
          }>
          {this.renderCaret()}
          {` ${appendix.type.title}`}
        </Button>
        {this.renderContent()}
      </div>
    );
  }
}

export default OpinionAppendix;
