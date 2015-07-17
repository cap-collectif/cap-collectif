var MoveButtons = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <div className="element__action-alter btn-group btn-group-lg">
          <button type="button" className="btn btn-default"><i className="cap cap-folder-2-1"></i></button>
          <button type="button" className="btn btn-default"><i className="cap cap-scissor-1"></i></button>
        </div>
      </div>
    );
  }

});

export default MoveButtons;
