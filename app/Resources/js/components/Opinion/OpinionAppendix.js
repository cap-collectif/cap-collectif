const Button = ReactBootstrap.Button;
const Panel = ReactBootstrap.Panel;

const OpinionAppendix = React.createClass({
  propTypes: {
    appendix: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      expanded: this.props.expanded !== 'undefined' ? this.props.expanded : false,
    };
  },

  renderCaret() {
    if (this.state.expanded) {
      return <i className="cap cap-arrow-68"></i>;
    }
    return <i className="cap cap-arrow-67"></i>;
  },

  renderContent() {
    const appendix = this.props.appendix;
    const style = this.state.expanded ? {marginBottom: '15px'} : {};
    return (
      <Panel collapsible expanded={this.state.expanded} style={style} className="opinion__appendix__content">
        <div dangerouslySetInnerHTML={{__html: appendix.body}} />
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
        <Button className="opinion__appendix__title" bsStyle="link" style={{paddingLeft: '0', fontSize: '18px', fontWeight: '500'}} onClick={this.toggle.bind(null, this)}>
          {this.renderCaret()}
          {' ' + appendix.type.title}
        </Button>
        {this.renderContent()}
      </div>
    );
  },

  toggle() {
    this.setState({
      expanded: !this.state.expanded,
    });
  },

});

export default OpinionAppendix;


