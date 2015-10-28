import LoginStore from '../../../stores/LoginStore';

import UserAvatar from '../../User/UserAvatar';
import SubmitButton from '../../Form/SubmitButton';
import ProposalVoteForm from './ProposalVoteForm';

const Col = ReactBootstrap.Col;

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleFailure() {
    this.setState({isSubmitting: false});
  },

  handleSubmit() {
    this.setState({isSubmitting: true});
  },

  handleSubmitSuccess() {
    this.setState({isSubmitting: false});
  },

  render() {
    return (
      <Col xs={12} sm={3} className="sidebar" id="sidebar">
        <div className="block block--bordered box sidebar-hideable sidebar-hidden-small">
          {LoginStore.isLoggedIn()
            ? <UserAvatar user={LoginStore.user} />
            : null
          }
          <div className="sidebar__form">
            <ProposalVoteForm
              proposal={this.props.proposal}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleFailure.bind(null, this)}
              onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
              onSubmitFailure={this.handleFailure.bind(null, this)}
             />
          </div>
          <SubmitButton
            isSubmitting={this.state.isSubmitting}
            onSubmit={this.handleSubmit.bind(null, this)}
          />
          {!LoginStore.isLoggedIn()
            ? <p className="p--topped text-center">
                <a href="/login">Soutenir avec mon compte</a>
              </p>
            : null
          }
        </div>
      </Col>
    );
  },

});

export default ProposalVoteBox;
