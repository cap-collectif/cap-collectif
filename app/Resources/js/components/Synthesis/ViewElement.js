var ViewElement = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <li className="synthesis__element">
        {this.renderElementTitle()}
        {this.renderElementBody()}
      </li>
    );
  },

  renderElementTitle() {
    if (this.props.element) {
      if (this.props.element.title) {
        return (
          <h3 className="h3  synthesis__element__title">{this.props.element.title}</h3>
        );
      }
      return (
        <h3 className="h3  synthesis__element__title">Argument</h3>
      );
    }
  },

  renderElementBody() {
    if (this.props.element) {
      return (
        <p className="synthesis__element__body">{this.props.element.body.replace(/(<([^>]+)>)/ig,"")}</p>
      );
    }
  }

});

export default ViewElement;
