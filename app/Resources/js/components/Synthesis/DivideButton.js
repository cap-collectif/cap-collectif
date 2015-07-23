const DivideButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <button type="button" className="element__action-divide btn btn-default btn-lg"><i className="cap cap-scissor-1"></i></button>
      </div>
    );
  },

});

export default DivideButton;
