const Link = ReactRouter.Link;

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    link: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      link: 'none',
      style: {},
      className: '',
      onClick: null,
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
    const className = this.props.className + (this.props.onClick ? ' btn btn-link' : '');
    if (this.props.link === 'none') {
      return (
        <span style={this.props.style} className={className} onClick={this.props.onClick} >
          {this.renderTitle()}
        </span>
      );
    }
    if (this.props.link === 'edition') {
      return (
        <Link style={this.props.style} to={`/element/${this.props.element.id}`} className={this.props.className}>
          {this.renderTitle()}
        </Link>
      );
    }
    return (
      <a style={this.props.style} href={this.props.element.linkedDataUrl} className={this.props.className}>
        {this.renderTitle()}
      </a>
    );
  },

});

export default ElementTitle;
