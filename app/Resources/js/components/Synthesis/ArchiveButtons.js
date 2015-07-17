import SynthesisElementActions from '../../actions/SynthesisElementActions';

var ArchiveButtons = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  archive(e) {
    var data = { 'archived': !this.props.element.archived };
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
  },

  render() {
    return (
      <div className="element__action">
        <div className="element__action-archive btn-group btn-group-lg">
          {this.renderArchiveButton()}
        </div>
      </div>
    );
  },

  renderArchiveButton() {
    if (!this.props.element.archived) {
      return (
        <button type="button" className="btn btn-default" onClick={this.archive.bind(this)}><i className="cap cap-check-4"></i></button>
      );
    }
    return (
      <button type="button" className="btn btn-default active" onClick={this.archive.bind(this)}><i className="cap cap-check-4"></i></button>
    );
  }

});

export default ArchiveButtons;
