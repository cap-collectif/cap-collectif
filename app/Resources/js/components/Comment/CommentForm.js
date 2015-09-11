import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';
import FlashMessages from '../Utils/FlashMessages';
import ValidatorMixin from '../../utils/ValidatorMixin';

const Input = ReactBootstrap.Input;
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

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form={true} />;
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
                    <div className={'form-group ' + this.getGroupStyle('authorName')}>
                          <label htmlFor="authorName" className="control-label h5">
                              { this.getIntlMessage('global.fullname') }
                          </label>
                          <span className="help-block">
                            { this.getIntlMessage('comment.public_name') }
                          </span>
                          <Input valueLink={this.linkState('authorName')}
                                 type="text" ref="authorName" id="authorName"
                                 name="authorName" className="form-control"
                                 bsStyle={this.getFieldStyle('authorName')}
                          />
                          {this.renderFormErrors('authorName')}
                      </div>
                    <div className={'form-group ' + this.getGroupStyle('authorEmail')}>
                          <label htmlFor="authorEmail" className="control-label h5">
                              { this.getIntlMessage('global.hidden_email') }
                          </label>
                          <span className="help-block">
                            { this.getIntlMessage('comment.email_info') }
                          </span>
                          <Input valueLink={this.linkState('authorEmail')}
                                 type="email" ref="authorEmail" id="authorEmail"
                                 name="authorEmail" className="form-control"
                                 bsStyle={this.getFieldStyle('authorEmail')}
                          />
                          {this.renderFormErrors('authorEmail')}
                      </div>
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
            <div className={'form-group ' + this.getGroupStyle('body')}>
              <Input valueLink={this.linkState('body')}
                type="textarea"
                name="body"
                onFocus={this.expand.bind(this, true)}
                placeholder={this.getIntlMessage('comment.write')}
                ref="body" rows="2" className="form-control"
                bsStyle={this.getFieldStyle('body')}
              />
              {this.renderFormErrors('body')}
            </div>
            { this.renderCommentButton() }
          </form>
        </div>
      </div>
    );
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

});

export default CommentForm;
