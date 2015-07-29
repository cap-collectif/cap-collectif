const Button = ReactBootstrap.Button;

const DivideButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-divide" onClick={this.click.bind(null, this)}><i className="cap cap-scissor-1"></i></Button>
      </div>
    );
  },

  click() {
    this.props.onModal(true);
  },

});

export default DivideButton;
