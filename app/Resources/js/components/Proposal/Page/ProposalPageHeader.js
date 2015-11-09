import LoginStore from '../../../stores/LoginStore';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import ProposalEditModal from '../Edit/ProposalEditModal';
import EditButton from '../../Form/EditButton';

const FormattedDate = ReactIntl.FormattedDate;
const FormattedMessage = ReactIntl.FormattedMessage;
const Label = ReactBootstrap.Label;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      showEditModal: false,
    }
  },

  toggleEditModal(value) {
    this.setState({showEditModal: value});
  },

  render() {
    const proposal = this.props.proposal;
    const createdDate = (
      <FormattedDate
       value={moment(proposal.created_at)}
       day="numeric" month="long" year="numeric"
      />
    );
    return (
      <div className="container--custom container--with-sidebar">
        <h1 className="consultation__header__title h1">{proposal.title}</h1>
        <div className="media">
          <UserAvatar className="pull-left" user={proposal.author} />
          <div className="media-body">
            <p className="media--aligned excerpt">
              <FormattedMessage
                message={this.getIntlMessage('proposal.infos.header')}
                user={<UserLink user={proposal.author} />}
                theme={proposal.theme ? 'yes' : 'no'}
                themeLink={
                  <a href={proposal.theme._links.show}>
                    {proposal.theme.title}
                  </a>
                }
                createdDate={createdDate}
              />
              <EditButton
                author={this.props.proposal.author}
                onClick={this.toggleEditModal.bind(null, true)}
                hasWrapper
                wrapperClassName="pull-right"
              />
            </p>
          </div>
        </div>
        <ul className="nav nav-pills project__infos">
          {/* proposal.votes_count > 0
            ? <li>
                <div className="value">{proposal.votes_count}</div>
                <div className="excerpt category">votes</div>
              </li>
            : null
          */}
          <li>
            <div className="value">{proposal.comments_count}</div>
            <div className="excerpt category">
              <FormattedMessage
                message={this.getIntlMessage('comment.count_no_nb')}
                count={proposal.comments_count}
              />
            </div>
          </li>
          {proposal.status
            ? <li style={{fontSize: 26, paddingTop: 5}}>
                <Label bsSize="large" bsStyle={proposal.status.color}>{proposal.status.name}</Label>
              </li>
            : null
          }
        </ul>
        <div style={{marginTop: 15}}>
          <span>
            <i className="cap cap-marker-1-1"></i>{proposal.district.name}
          </span>
        </div>
        <ProposalEditModal
          proposal={this.props.proposal}
          form={this.props.form}
          themes={this.props.themes}
          districts={this.props.districts}
          show={this.state.showEditModal}
          onToggleModal={this.toggleEditModal}
        />
      </div>
    );
  },

});

export default ProposalPageHeader;
