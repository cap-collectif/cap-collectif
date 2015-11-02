
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
        <h2 className="h4 proposal__title">
          <a href={proposal._links.show}>{proposal.title}</a>
        </h2>
        <div>
        {proposal.theme
          ? <div className="proposal__info">
              <i className="cap cap-tag-1-1"></i>{proposal.theme.title}
            </div>
          : null
        }
        {proposal.district
          ? <div className="proposal__info">
              <i className="cap cap-marker-1-1"></i>{proposal.district.name}
            </div>
          : null
        }
      </div>
    </div>
    );
  },

});

export default ProposalPreviewBody;
