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
          <a href={proposal._links.show}>{proposal.title}</a>
        </h3>
        <div>
          <ul>
            {proposal.theme
              ? <li>{proposal.theme}</li>
              : null
            }
            {proposal.district
              ? <li>{proposal.district}</li>
              : null
            }
            {proposal.cost
              ? <li>{proposal.cost}</li>
              : null
            }
          </ul>
        </div>
        <Label>{proposal.status}</Label>
      </div>
    );
  },

});

export default ProposalPreviewBody;
