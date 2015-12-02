import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageContent from './ProposalPageContent';
import ProposalPageAnswer from './ProposalPageAnswer';
import ProposalPageAlert from './ProposalPageAlert';
// import ProposalPageVotes from './ProposalPageVotes';
import ProposalPageComments from './ProposalPageComments';
// import ProposalVoteBox from '../Vote/ProposalVoteBox';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalPage = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    proposal: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    return (
      <div>
        <ProposalPageAlert proposal={proposal} />
        <div id="sidebar-container" className="container sidebar__container">
          <Row>
            <Col xs={12}>
              <ProposalPageHeader proposal={this.props.proposal} />
              <ProposalPageAnswer proposal={proposal} />
              <ProposalPageContent
                proposal={proposal}
                form={this.props.form}
                themes={this.props.themes}
                districts={this.props.districts}
              />
              {/* <ProposalPageVotes proposal={proposal} /> */}
              <ProposalPageComments form={this.props.form} id={proposal.id} />
            </Col>
            {/* <div id="sidebar-overlay" /> */}
            {/* proposal.canContribute
              ? <ProposalVoteBox proposal={proposal} />
              : null
            */}
          </Row>
        </div>
      </div>
    );
  },

});

export default ProposalPage;
