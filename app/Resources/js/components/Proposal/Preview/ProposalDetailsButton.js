const Button = ReactBootstrap.Button;

const ProposalDetailsButton = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const classes = {
      'btn--outline': true,
      'proposal__details__button': true,
    };
    classes[this.props.className] = true;
    return (
      <Button bsStyle="default" style={{width: '100%'}} className={classNames(classes)} href={this.props.proposal._links.show} >
        {this.getIntlMessage('proposal.details') }
      </Button>
    );
  },

});

export default ProposalDetailsButton;
