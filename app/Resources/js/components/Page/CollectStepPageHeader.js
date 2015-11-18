import ProposalCreate from '../Proposal/Create/ProposalCreate';
const FormattedMessage = ReactIntl.FormattedMessage;

const CollectStepPageHeader = React.createClass({
  propTypes: {
    count: React.PropTypes.number,
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      count: 0,
    };
  },

  render() {
    return (
      <h2 className="h2">
        <FormattedMessage
          message={this.getIntlMessage('proposal.count')}
          num={this.props.count}
        />
        <span className="pull-right">
          <ProposalCreate
            form={this.props.form}
            themes={this.props.themes}
            districts={this.props.districts}
          />
        </span>
      </h2>
    );
  },

});

export default CollectStepPageHeader;
