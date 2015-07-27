const Button = ReactBootstrap.Button;

const DivideButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-divide"><i className="cap cap-scissor-1"></i></Button>
      </div>
    );
  },

});

export default DivideButton;
