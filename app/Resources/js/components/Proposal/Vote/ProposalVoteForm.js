import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
import { connect } from 'react-redux';

const ProposalVoteForm = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStepId: PropTypes.number.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
    userHasVote: PropTypes.bool,
    user: PropTypes.object,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      userHasVote: false,
      user: null,
    };
  },

  getInitialState() {
    return {
      form: {
        username: '',
        email: '',
        comment: '',
        private: false,
      },
      errors: {
        username: [],
        email: [],
        comment: [],
        private: [],
      },
      serverErrors: [],
    };
  },

  componentDidMount() {
    if (!this.props.user) {
      this.formValidationRules = {
        username: {
          min: { value: 2, message: 'proposal.vote.constraints.username' },
          notBlank: { message: 'proposal.vote.constraints.username' },
        },
        email: {
          notBlank: { message: 'proposal.vote.constraints.email' },
          isEmail: { message: 'proposal.vote.constraints.email' },
        },
      };
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSubmitting && nextProps.isSubmitting) {
      if (this.isValid()) {
        if (this.props.user && this.props.userHasVote) {
          ProposalActions
            .deleteVote(this.props.selectionStepId, this.props.proposal.id, this.props.proposal.estimation)
            .then(() => {
              this.setState(this.getInitialState());
              this.props.onSubmitSuccess();
            })
            .catch(() => {
              this.props.onSubmitFailure();
            })
          ;
          return;
        }
        const data = this.state.form;
        if (this.props.user) {
          delete data.username;
          delete data.email;
        }
        ProposalActions
          .vote(
            this.props.selectionStepId,
            this.props.proposal.id,
            this.props.proposal.estimation,
            data
          )
          .then(() => {
            this.setState(this.getInitialState());
            this.props.onSubmitSuccess();
          })
          .catch((error) => {
            this.setState({
              serverErrors: error.response.errors,
            });
            this.props.onSubmitFailure();
          })
        ;
        return;
      }

      this.props.onValidationFailure();
    }
  },

  formValidationRules: {},

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    const anonymous = !this.props.user;
    const userHasVote = this.props.userHasVote;
    const commentLabel = (
      <span>
        {this.getIntlMessage('proposal.vote.form.comment')}
        <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
      </span>
    );

    return (
      <form ref="form">

        <FlashMessages errors={this.state.serverErrors} translate={false} />

        {
          anonymous
          && <Input
              type="text"
              name="proposal-vote__username"
              valueLink={this.linkState('form.username')}
              ref="username"
              label={this.getIntlMessage('proposal.vote.form.username')}
              groupClassName={this.getGroupStyle('username')}
              errors={this.renderFormErrors('username')}
          />
        }

        {
          anonymous
          && <Input
              type="text"
              name="proposal-vote__email"
              valueLink={this.linkState('form.email')}
              ref="email"
              label={this.getIntlMessage('proposal.vote.form.email')}
              groupClassName={this.getGroupStyle('email')}
              errors={this.renderFormErrors('email')}
          />
        }

        {
          (!this.state.form.private && (anonymous || !userHasVote))
            && <Input
              type="textarea"
              name="proposal-vote__comment"
              valueLink={this.linkState('form.comment')}
              ref="comment"
              label={commentLabel}
              placeholder={this.getIntlMessage('proposal.vote.form.comment_placeholder')}
              groupClassName={this.getGroupStyle('comment')}
              errors={this.renderFormErrors('comment')}
            />
        }

        {
          (this.state.form.comment.length > 0 || (!anonymous && userHasVote))
            ? null
            : <Input
              type="checkbox"
              name="proposal-vote__private"
              checkedLink={this.linkState('form.private')}
              ref="private"
              label={this.getIntlMessage('proposal.vote.form.private')}
              groupClassName={this.getGroupStyle('private')}
              errors={this.renderFormErrors('private')}
            />
        }

      </form>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteForm);
