import ProposalPreviewEstimation from '../Detail/ProposalDetailEstimation';

const ProposalPreviewBody = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;

    return (
      <div className="proposal__body" >
        <h2 className="h4 proposal__title">
          <a href={proposal._links.show}>{proposal.title}</a>
        </h2>
        <div className="proposal__infos">
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
          <ProposalPreviewEstimation className="proposal__info" proposal={proposal} />
        </div>
      </div>
    );
  },

});

export default ProposalPreviewBody;
