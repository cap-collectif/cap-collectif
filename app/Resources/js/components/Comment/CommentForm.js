import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';
import FlashMessages from '../Utils/FlashMessages';
import ValidatorMixin from '../../utils/ValidatorMixin';
import Input from '../Form/Input';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Button = ReactBootstrap.Button;

const CommentForm = React.createClass({
  propTypes: {
    isAnswer: React.PropTypes.bool,
    focus: React.PropTypes.bool,
    comment: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, ValidatorMixin],

  getDefaultProps() {
    return {
      isAnswer: false,
    };
  },

  getInitialState() {
    return {
      body: '',
      expanded: false,
      isSubmitting: false,
      authorName: null,
      authorEmail: null,
    };
  },

  componentDidMount() {
    if (this.props.focus) {
      React.findDOMNode(this.refs.body).focus();
    }
    const constraints = LoginStore.isLoggedIn() ?
      {
        body: {
          notBlank: {message: 'comment.constraints.body'},
          min: {value: 2, message: 'comment.constraints.body'},
        },
      }
      : {
        authorEmail: {
          notBlank: {message: 'comment.constraints.author_email'},
          isEmail: {message: 'comment.constraints.author_email'},
        },
        authorName: {
          notBlank: {message: 'comment.constraints.author_name'},
          min: {value: 2, message: 'comment.constraints.author_name'},
        },
        body: {
          notBlank: {message: 'comment.constraints.body'},
          min: {value: 2, message: 'comment.constraints.body'},
        },
      }
    ;
    this.initForm('form', constraints);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.focus) {
      React.findDOMNode(this.refs.body).focus();
      this.setState({'expanded': true});
    }
  },

  componentDidUpdate() {
    autosize(React.findDOMNode(this.refs.body));
  },

  getFormClasses() {
    return React.addons.classSet({
      'comment-answer-form': this.props.isAnswer,
    });
  },

  expand(newState) {
    if (!newState) {
      const $block = $(React.findDOMNode(this.refs.commentBlock));
      if (event.relatedTarget && ($(event.relatedTarget).is($block) || $block.has($(event.relatedTarget)).length)) {
        return; // clicked on an element inside comment block
      }
      if (this.state.body.length === 0) {
        this.setState({expanded: false, submitted: false});
        return;
      }
    }
    this.setState({'expanded': newState});
  },

  create() {
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({isSubmitting: true});

      const data = {
        body: this.state.body,
      };
      if (!LoginStore.isLoggedIn()) {
        data.authorName = this.state.authorName;
        data.authorEmail = this.state.authorEmail;
      }

      this.props.comment(data)
      .then(() => {
        this.setState(this.getInitialState());
        autosize.destroy(React.findDOMNode(this.refs.body));
      })
      .catch(() => {
        this.setState({isSubmitting: false, submitted: false});
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
    if (!LoginStore.isLoggedIn()) {
      return (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <p>{ this.getIntlMessage('comment.with_my_account') }</p>
              <a className="btn btn-primary" href={window.location.protocol + '//' + window.location.host + '/login'} >
                { this.getIntlMessage('global.login') }
              </a>
              <h5>{ this.getIntlMessage('comment.why_create_account') }</h5>
              <ul className="excerpt small">
                <li>
                  { this.getIntlMessage('comment.create_account_reason_1') }
                </li>
                <li>
                  { this.getIntlMessage('comment.create_account_reason_2') }
                </li>
                <li>
                  { this.getIntlMessage('comment.create_account_reason_3') }
                </li>
              </ul>
            </Col>
              <Col sm={12} md={6}>
                <p>{ this.getIntlMessage('comment.without_account') }</p>
                <Input
                  type="text"
                  ref="authorName"
                  id="authorName"
                  name="authorName"
                  valueLink={this.linkState('authorName')}
                  label={ this.getIntlMessage('global.fullname') }
                  help={ this.getIntlMessage('comment.public_name') }
                  groupClassName={this.getGroupStyle('authorName')}
                  errors={this.renderFormErrors('authorName')}
                  bsStyle={this.getFieldStyle('authorName')}
                />
                <Input
                  type="email"
                  ref="authorEmail"
                  id="authorEmail"
                  name="authorEmail"
                  valueLink={this.linkState('authorEmail')}
                  label={ this.getIntlMessage('global.hidden_email') }
                  help={ this.getIntlMessage('comment.email_info') }
                  groupClassName={this.getGroupStyle('authorEmail')}
                  errors={this.renderFormErrors('authorEmail')}
                  bsStyle={this.getFieldStyle('authorEmail')}
                />
                <Button ref="anonymousComment"
                  disabled={this.state.isSubmitting}
                  onClick={this.state.isSubmitting ? null : this.create.bind(null, this)}
                  bsStyle="primary"
                >
                  {this.state.isSubmitting
                    ? this.getIntlMessage('global.loading')
                    : this.getIntlMessage('comment.submit')
                  }
                </Button>
              </Col>
          </Row>
        </div>
      );
    }
  },

  renderCommentButton() {
    if (this.state.expanded || this.state.body.length >= 1) {
      if (LoginStore.isLoggedIn()) {
        return (
          <Button ref="loggedInComment"
            disabled={this.state.isSubmitting}
            onClick={this.state.isSubmitting ? null : this.create.bind(null, this)}
            bsStyle="primary"
          >
            {this.state.isSubmitting
              ? this.getIntlMessage('global.loading')
              : this.getIntlMessage('comment.submit')
            }
          </Button>
        );
      }

      return <div>{ this.renderAnonymous() }</div>;
    }
  },

  render() {
    return (
      <div className={ this.getFormClasses() }>
        <UserAvatar user={LoginStore.user} className="pull-left" />
        <div className="opinion__data" ref="commentBlock" onBlur={this.expand.bind(this, false)}>
          <form ref="form">
            <Input
              type="textarea"
              name="body"
              ref="body"
              valueLink={this.linkState('body')}
              rows="2"
              onFocus={this.expand.bind(this, true)}
              placeholder={this.getIntlMessage('comment.write')}
              groupClassName={this.getGroupStyle('body')}
              errors={this.renderFormErrors('body')}
              bsStyle={this.getFieldStyle('body')}
            />
            { this.renderCommentButton() }
          </form>
        </div>
      </div>
    );
  },

});

export default CommentForm;
