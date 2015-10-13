const Button = ReactBootstrap.Button;

const SubmitButton = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Button
        disabled={this.props.isSubmitting}
        onClick={!this.props.isSubmitting ? this.props.onSubmit : null}
        bsStyle="primary"
      >
        {this.props.isSubmitting
          ? this.getIntlMessage('global.loading')
          : this.getIntlMessage('global.publish')
        }
      </Button>
    );
  }

});

export default SubmitButton;
