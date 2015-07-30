const Button = ReactBootstrap.Button;

const PublishButton = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-publish" onClick={this.click.bind(this)}><i className="cap cap-check-4"></i></Button>
      </div>
    );
  },

  click() {
    if (typeof this.props.onModal === 'function') {
      this.props.onModal(true);
    }
  },

});

export default PublishButton;
