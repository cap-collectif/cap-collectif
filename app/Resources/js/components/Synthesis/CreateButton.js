const Button = ReactBootstrap.Button;

const CreateButton = React.createClass({
  propTypes: {
    parent: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Button bsSize="large" bsStyle="primary" type="button" className="synthesis__action--create btn-block" onClick={this.click.bind(null, this)}>
        <i className="cap cap-folder-add"></i>
        {' ' + this.getIntlMessage('edition.action.create.button')}
      </Button>
    );
  },

  click() {
    this.props.onModal(true, this.props.parent);
  },

});

export default CreateButton;
