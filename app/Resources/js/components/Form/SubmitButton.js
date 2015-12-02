const Button = ReactBootstrap.Button;

const SubmitButton = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    label: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      label: 'global.publish',
      bsStyle: 'primary',
    };
  },

  render() {
    return (
      <Button
        id="confirm-delete"
        disabled={this.props.isSubmitting}
        onClick={!this.props.isSubmitting ? this.props.onSubmit : null}
        bsStyle={this.props.bsStyle}
      >
        {this.props.isSubmitting
          ? this.getIntlMessage('global.loading')
          : this.getIntlMessage(this.props.label)
        }
      </Button>
    );
  },

});

export default SubmitButton;
