const Button = ReactBootstrap.Button;

const CreateButton = React.createClass({
  propTypes: {
    parent: React.PropTypes.object,
    onModal: React.PropTypes.func,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    return (
      <Button bsStyle="primary" type="button" className={'synthesis__action--create btn-block ' + this.props.className} onClick={this.click.bind(null, this)}>
        <i className="cap cap-folder-add"></i>
        {' ' + this.getIntlMessage('edition.action.create.label')}
      </Button>
    );
  },

  click() {
    this.props.onModal(true, this.props.parent);
  },

});

export default CreateButton;
