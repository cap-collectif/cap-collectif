const Label = ReactBootstrap.Label;

const ProposalPreviewBody = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({
      'media__content': true,
    });

    return (
      <div className={classes}>
        <h3 className="opinion__title">
          <a href={proposal._links || '#'}>{proposal.title}</a>
        </h3>
        <div>
          <ul>
            <li>Thème</li>
            <li>Localisation</li>
            <li>Cout estimé</li>
          </ul>
        </div>
        <Label>{proposal.status}</Label>
      </div>
    );
  },

});

export default ProposalPreviewBody;
