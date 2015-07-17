import SynthesisElementActions from '../../actions/SynthesisElementActions';

const DisableButtons = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderDisableButton() {
    if (this.props.element.enabled) {
      return (
        <button type="button" className="btn btn-default" onClick={this.disable.bind(this)}><i className="cap cap-delete-2"></i></button>
      );
    }
    return (
      <button type="button" className="btn btn-default active" onClick={this.disable.bind(this)}><i className="cap cap-delete-2"></i></button>
    );
  },

  render() {
    return (
      <div className="element__action">
        <div className="element__action-disable btn-group btn-group-lg">
          {this.renderDisableButton()}
        </div>
      </div>
    );
  },

  disable() {
    const data = { 'enabled': !this.props.element.enabled };
    SynthesisElementActions.disable(this.props.synthesis.id, this.props.element.id, data);
  },

});

export default DisableButtons;
