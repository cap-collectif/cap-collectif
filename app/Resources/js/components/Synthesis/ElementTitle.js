const Link = ReactRouter.Link;

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    link: React.PropTypes.bool,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      link: false,
      style: {},
      className: '',
    };
  },

  renderTitle() {
    if (this.props.element.title) {
      return this.props.element.title;
    }
    if (this.props.element.body) {
      return this.props.element.body.substr(0, 140) + '...';
    }
    return this.getIntlMessage('common.elements.default_title');
  },

  render() {
    if (this.props.link) {
      return (
        <Link style={this.props.style} to={`/element/${this.props.element.id}`} className={this.props.className}>{this.renderTitle()}</Link>
      );
    }
    return (
      <span style={this.props.style} className={this.props.className}>{this.renderTitle()}</span>
    );
  },

});

export default ElementTitle;
