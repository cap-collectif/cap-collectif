import SynthesisElementActions from '../../actions/SynthesisElementActions';

const ArchiveButtons = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderArchiveButton() {
    if (!this.props.element.archived) {
      return (
        <button type="button" className="btn btn-default" onClick={this.archive.bind(this)}><i className="cap cap-check-4"></i></button>
      );
    }
    return (
      <button type="button" className="btn btn-default active" onClick={this.archive.bind(this)}><i className="cap cap-check-4"></i></button>
    );
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

  archive() {
    const data = { 'archived': !this.props.element.archived };
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
  },

});

export default ArchiveButtons;
