const Button = ReactBootstrap.Button;

const DivideButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  click() {
    this.props.onModal(true);
  },

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-divide" onClick={this.click.bind(null, this)}><i className="cap cap-scissor-1"></i></Button>
      </div>
    );
  },

});

export default DivideButton;
