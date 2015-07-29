const Link = ReactRouter.Link;

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.element.title) {
      return (
        <Link to={'/element/' + this.props.element.id} >{this.props.element.title}</Link>
      );
    }
    return (
      <Link to={'/element/' + this.props.element.id} >{this.getIntlMessage('common.elements.default_title')}</Link>
    );
  },

});

export default ElementTitle;
