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
      <div className={classes} style={{clear: 'both', paddingTop: '5px'}}>
        <h3 className="opinion__title" style={{marginTop: 0, height: '110px', wordBreak: 'break-word', overflow: 'hidden'}}>
          <a href={proposal._links.show}>{proposal.title}</a>
        </h3>
        <div>
        {proposal.theme
          ? <div style={{marginTop: 5}}>
              <span>
                <i className="cap cap-tag-1-1"></i>{proposal.theme.title}
              </span>
            </div>
          : null
        }
        {proposal.district
          ? <div style={{marginTop: 5}}>
              <span>
                <i className="cap cap-marker-1-1"></i>{proposal.district.name}
              </span>
            </div>
          : null
        }
      </div>
      <Label bsStyle={proposal.status.color}>{proposal.status.name}</Label>
    </div>
    );
  },

});

export default ProposalPreviewBody;
