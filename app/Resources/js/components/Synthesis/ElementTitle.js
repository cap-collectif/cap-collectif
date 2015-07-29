const Link = ReactRouter.Link;

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    link: React.PropTypes.bool,
    classes: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      link: true,
    };
  },

  renderTitle() {
    if (this.props.element.title) {
      return this.props.element.title;
    }
    return this.getIntlMessage('common.elements.default_title');
  },

  render() {
    if (this.props.link) {
      return (
        <Link to={'/element/' + this.props.element.id} className={this.props.classes}>{this.renderTitle()}</Link>
      );
    }
    return (
      <span className={this.props.classes}>{this.renderTitle()}</span>
    );
  },

});

export default ElementTitle;
