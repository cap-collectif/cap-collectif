import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import classNames from 'classnames';
import autosize from 'autosize';
import { Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import UserAvatar from '../User/UserAvatar';
import FlashMessages from '../Utils/FlashMessages';
import FormMixin from '../../utils/FormMixin';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';
import Input from '../Form/Input';

const CommentForm = React.createClass({
  propTypes: {
    isAnswer: PropTypes.bool,
    focus: PropTypes.bool,
    comment: PropTypes.func,
    user: PropTypes.object,
    intl: PropTypes.object
  },

  mixins: [DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      isAnswer: false,
      user: null
    };
  },

  getInitialState() {
    return {
      form: {
        body: '',
        authorName: '',
        authorEmail: ''
      },
      errors: {
        body: [],
        authorName: [],
        authorEmail: []
      },
      expanded: false,
      isSubmitting: false
    };
  },

  componentDidMount() {
    const { focus, user } = this.props;
    if (focus) {
      ReactDOM.findDOMNode(this.refs.body).focus();
    }
    this.updateConstraints(!user);
  },

  componentWillReceiveProps(nextProps) {
    const { user } = this.props;
    if (nextProps.focus) {
      ReactDOM.findDOMNode(this.refs.body).focus();
      this.setState({ expanded: true });
    }
    if (nextProps.user !== user) {
      this.updateConstraints(!nextProps.user);
    }
  },

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body));
  },

  getFormClasses() {
    const { isAnswer } = this.props;
    return classNames({
      'comment-answer-form': isAnswer
    });
  },

  formValidationRules: {},

  updateConstraints(anonymous) {
    this.formValidationRules = {
      body: {
        notBlank: { message: 'comment.constraints.body' },
        min: { value: 2, message: 'comment.constraints.body' }
      }
    };
    if (anonymous) {
      this.formValidationRules.authorEmail = {
        notBlank: { message: 'comment.constraints.author_email' },
        isEmail: { message: 'comment.constraints.author_email' }
      };
      this.formValidationRules.authorName = {
        notBlank: { message: 'comment.constraints.author_name' },
        min: { value: 2, message: 'comment.constraints.author_name' }
      };
    }
  },

  expand(newState) {
    if (!newState) {
      const $block = $(ReactDOM.findDOMNode(this.refs.commentBlock));
      if (
        // eslint-disable-next-line no-undef
        event.relatedTarget &&
        // eslint-disable-next-line no-undef
        ($(event.relatedTarget).is($block) ||
          // eslint-disable-next-line no-undef
          $block.has($(event.relatedTarget)).length)
      ) {
        return; // clicked on an element inside comment block
      }
      if (this.state.form.body.length === 0) {
        this.setState({ expanded: false, submitted: false });
        return;
      }
    }
    this.setState({ expanded: newState });
  },

  create() {
    const { comment, user } = this.props;
    this.setState({ submitted: true }, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({ isSubmitting: true });
      const data = this.state.form;
      if (user) {
        delete data.authorName;
        delete data.authorEmail;
      }

      comment(data)
        .then(() => {
          this.setState(this.getInitialState());
          autosize.destroy(ReactDOM.findDOMNode(this.refs.body));
        })
        .catch(() => {
          this.setState({ isSubmitting: false, submitted: false });
        });
    });
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form />;
    }
    return null;
  },

  renderAnonymous() {
    const { user } = this.props;
    if (!user) {
      return (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <p>{<FormattedMessage id="comment.with_my_account" />}</p>
              <RegistrationButton />{' '}
              <LoginButton className="btn-darkest-gray navbar-btn btn--connection" />
              <h5>{<FormattedMessage id="comment.why_create_account" />}</h5>
              <ul className="excerpt small">
                <li>{<FormattedMessage id="comment.create_account_reason_1" />}</li>
                <li>{<FormattedMessage id="comment.create_account_reason_2" />}</li>
                <li>{<FormattedMessage id="comment.create_account_reason_3" />}</li>
              </ul>
            </Col>
            <Col sm={12} md={6}>
              <p>{<FormattedMessage id="comment.without_account" />}</p>
              <Input
                type="text"
                ref="authorName"
                id="authorName"
                name="authorName"
                valueLink={this.linkState('form.authorName')}
                label={<FormattedMessage id="global.fullname" />}
                help={<FormattedMessage id="comment.public_name" />}
                groupClassName={this.getGroupStyle('authorName')}
                errors={this.renderFormErrors('authorName')}
              />
              <Input
                type="email"
                ref="authorEmail"
                id="authorEmail"
                name="authorEmail"
                valueLink={this.linkState('form.authorEmail')}
                label={<FormattedMessage id="global.hidden_email" />}
                help={<FormattedMessage id="comment.email_info" />}
                groupClassName={this.getGroupStyle('authorEmail')}
                errors={this.renderFormErrors('authorEmail')}
              />
              <Button
                ref="anonymousComment"
                disabled={this.state.isSubmitting}
                onClick={this.state.isSubmitting ? null : this.create}
                bsStyle="primary"
                className="btn--comment">
                {this.state.isSubmitting ? (
                  <FormattedMessage id="global.loading" />
                ) : (
                  <FormattedMessage id="comment.submit" />
                )}
              </Button>
            </Col>
          </Row>
        </div>
      );
    }
  },

  renderCommentButton() {
    const { user } = this.props;
    if (this.state.expanded || this.state.form.body.length >= 1) {
      if (user) {
        return (
          <Button
            ref="loggedInComment"
            disabled={this.state.isSubmitting}
            onClick={this.state.isSubmitting ? null : this.create}
            bsStyle="primary"
            className="btn--comment">
            {this.state.isSubmitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="comment.submit" />
            )}
          </Button>
        );
      }

      return <div>{this.renderAnonymous()}</div>;
    }
  },

  render() {
    const { isAnswer, user, intl } = this.props;
    const classes = classNames({
      'comment-answer-form': isAnswer
    });
    return (
      <div className={classes} style={{ padding: '5px' }}>
        <UserAvatar user={user} className="pull-left" />
        <div className="opinion__data" ref="commentBlock">
          <form ref={c => (this.form = c)}>
            <Input
              type="textarea"
              name="body"
              ref="body"
              aria-label={intl.formatMessage({ id: 'comment.write' })}
              valueLink={this.linkState('form.body')}
              rows="2"
              onFocus={this.expand.bind(this, true)}
              placeholder="comment.write"
              groupClassName={this.getGroupStyle('body')}
              errors={this.renderFormErrors('body')}
            />
            {this.renderCommentButton()}
          </form>
        </div>
      </div>
    );
  }
});

const mapStateToProps = state => {
  return { user: state.user.user };
};

const container = injectIntl(CommentForm);

export default connect(mapStateToProps)(container);
