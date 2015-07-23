import SynthesisElementActions from '../../actions/SynthesisElementActions';

const IgnoreButton = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  render() {
    return (
      <div className="element__action">
        <button type="button" className="element__action-ignore btn btn-lg btn-default" onClick={this.ignore.bind(this)}><i className="cap cap-delete-2"></i></button>
      </div>
    );
  },

  ignore() {
    const data = {
      'archived': true,
      'published': false,
    };
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
    this.transitionTo('inbox', {'type': 'new'});
  },

});

export default IgnoreButton;
