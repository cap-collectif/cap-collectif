const Link = ReactRouter.Link;

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    linkType: React.PropTypes.string,
    hasLink: React.PropTypes.bool,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      hasLink: false,
      linkType: 'none',
      style: {},
      className: '',
      onClick: null,
    };
  },

  openOriginalContribution() {
    window.open(this.props.element.linkedDataUrl);
    return false;
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
    if (!this.props.hasLink) {
      return (
        <span style={this.props.style} className={className} onClick={this.props.onClick} >
          {this.renderTitle()}
        </span>
      );
    }
    if (this.props.linkType === 'edition') {
      return (
        <Link style={this.props.style} to={`/element/${this.props.element.id}`} className={this.props.className}>
          {this.renderTitle()}
        </Link>
      );
    }
    return (
      <a style={this.props.style} href={this.props.element.linkedDataUrl} className={this.props.className} onClick={this.openOriginalContribution}>
        {this.renderTitle()}
      </a>
    );
  },

});

export default ElementTitle;
