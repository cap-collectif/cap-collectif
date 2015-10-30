import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';

const Col = ReactBootstrap.Col;

const ProposalPreview = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({
      'media': true,
      'media--macro': true,
      'block': true,
      'block--bordered': true,
      'bg-vip': proposal.author && proposal.author.vip,
    });

    return (
      <Col componentClass="li" xs={12} sm={6} md={4} ld={2}>
        <div className={classes}>
          <ProposalPreviewHeader proposal={proposal} />
          <ProposalPreviewBody proposal={proposal} />
          <ProposalPreviewFooter proposal={proposal} />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
