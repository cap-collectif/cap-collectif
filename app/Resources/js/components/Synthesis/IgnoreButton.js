import SynthesisElementActions from '../../actions/SynthesisElementActions';

const Button = ReactBootstrap.Button;

const IgnoreButton = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-ignore" onClick={this.ignore.bind(null, this)}><i className="cap cap-delete-2"></i></Button>
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
