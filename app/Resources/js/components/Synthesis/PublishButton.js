const Button = ReactBootstrap.Button;

const PublishButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-publish" onClick={this.click.bind(null, this)}><i className="cap cap-check-4"></i></Button>
      </div>
    );
  },

  click() {
    this.props.onModal(true, this.props.element);
  },

});

export default PublishButton;
