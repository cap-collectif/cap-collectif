// @flow
import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { Button, Panel } from 'react-bootstrap';

const OpinionAppendix = React.createClass({
  propTypes: {
    appendix: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const { expanded } = this.props;
    return {
      expanded: expanded !== 'undefined' ? expanded : false,
    };
  },

  toggle() {
    this.setState({
      expanded: !this.state.expanded,
    });
  },

  renderCaret() {
    if (this.state.expanded) {
      return <i className="cap cap-arrow-68" />;
    }
    return <i className="cap cap-arrow-67" />;
  },

  renderContent() {
    const appendix = this.props.appendix;
    const style = this.state.expanded ? { marginBottom: '15px' } : {};
    return (
      <Panel
        collapsible
        expanded={this.state.expanded}
        style={style}
        className="opinion__appendix__content">
        <div dangerouslySetInnerHTML={{ __html: appendix.body }} />
      </Panel>
    );
  },

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
            this.state.expanded
              ? <FormattedMessage
                  message={this.getIntlMessage('opinion.appendices.hide')}
                  title={this.props.appendix.type.title}
                />
              : <FormattedMessage
                  message={this.getIntlMessage('opinion.appendices.show')}
                  title={this.props.appendix.type.title}
                />
          }>
          {this.renderCaret()}
          {` ${appendix.type.title}`}
        </Button>
        {this.renderContent()}
      </div>
    );
  },
});

export default OpinionAppendix;
