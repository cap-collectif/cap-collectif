import SynthesisElementActions from '../../actions/SynthesisElementActions';

const PublishButton = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  render() {
    return (
      <div className="element__action">
        <button type="button" className="element__action-publish btn btn-lg btn-default" onClick={this.publish.bind(this)}><i className="cap cap-check-4"></i></button>
      </div>
    );
  },

  publish() {
    const data = {
      'archived': true,
      'published': true
    };
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
    this.transitionTo('inbox', {'type': 'new'});
  },

});

export default PublishButton;
