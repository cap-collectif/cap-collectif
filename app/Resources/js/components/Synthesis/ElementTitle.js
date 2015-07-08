let Link = ReactRouter.Link;

var ElementTitle = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <span>
        {this.renderTitle()}
      </span>
    );
  },

  renderTitle() {
    if (this.props.element.title) {
      return (
        <Link to={"/element/" + this.props.element.id} >{this.props.element.title}</Link>
      );
    }
    return (
      <Link to={"/element/" + this.props.element.id} >{this.getIntlMessage('common.elements.default_title')}</Link>
    );
  }

});

export default ElementTitle;
