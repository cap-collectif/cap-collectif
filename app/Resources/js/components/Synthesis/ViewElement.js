const ViewElement = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderElementTitle() {
    if (this.props.element.title) {
      return (
        <h3 className="h3  synthesis__element__title">{this.props.element.title}</h3>
      );
    }
    return (
      <h3 className="h3  synthesis__element__title">Argument</h3>
    );
  },

  renderElementBody() {
    if (this.props.element.body) {
      return (
        <p className="synthesis__element__body">{this.props.element.body.replace(/(<([^>]+)>)/ig, '')}</p>
      );
    }
  },

  render() {
    return (
      <li className="synthesis__element">
        {this.renderElementTitle()}
        {this.renderElementBody()}
      </li>
    );
  },

});

export default ViewElement;
