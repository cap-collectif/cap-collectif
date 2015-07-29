import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';

const OpinionVersionForm = React.createClass({
  propTypes: {
    isAnswer: React.PropTypes.bool,
    focus: React.PropTypes.bool,
    comment: React.PropTypes.function,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      body: '',
      submitted: false,
      expanded: false,
    };
  },

  componentDidMount() {
  },

  componentWillReceiveProps(nextProps) {
  },

  componentDidUpdate() {
  },

  getClasses(field) {
    return React.addons.classSet({
      'form-group': true,
      'has-error': !this.isValid(field),
    });
  },

  renderCommentButton() {
    if (this.state.expanded || this.state.body.length >= 1) {
      if (LoginStore.isLoggedIn()) {
        return (
          <button ref="loggedInComment" data-loading-text={this.getIntlMessage('global.loading')}
            className="btn btn-primary"
            onClick={this.create.bind(this)}
          >
            {this.getIntlMessage('comment.submit')}
          </button>
        );
      }

      return <div>{ this.renderAnonymous() }</div>;
    }
  },


  render() {
    return (
      <div className={ this.getFormClasses() }>
      </div>
    );
  },

  getFormClasses() {
    return React.addons.classSet({
      'comment-answer-form': this.props.isAnswer,
    });
  },

  create(e) {
    e.preventDefault();

    this.setState({
      submitted: true,
    }, () => {
      if (!this.isValid()) {
        return;
      }
      const commentButton = React.findDOMNode(this.refs.loggedInComment)
        ? React.findDOMNode(this.refs.loggedInComment)
        : React.findDOMNode(this.refs.anonymousComment)
      ;
      $(commentButton).button('loading');

      const data = this.state;
      delete data.expanded;
      delete data.submitted;
      this.props.comment(data)
      .then(() => {
        this.setState(this.getInitialState());
        $(commentButton).button('reset');
      })
      .catch(() => {
        alert(this.getIntlMessage('comment.submit_error'));
        this.setState(data);
        $(commentButton).button('reset');
      });
      autosize.destroy(React.findDOMNode(this.refs.body));
    });
  },

  isValid(field) {

    if (!this.state.submitted) {
      return true;
    }

    if (field === 'authorEmail') {
      return new Validator(this.state.authorEmail).isEmail();
    }

    if (field === 'authorName') {
      return new Validator(this.state.authorName).min(2);
    }

    if (field === 'body') {
      return new Validator(this.state.body).min(2);
    }

    if (!field) {
      if (LoginStore.isLoggedIn()) {
        return this.isValid('body');
      }

      return this.isValid('body') && this.isValid('authorEmail') && this.isValid('authorName');
    }

    return false;
  },

});

export default OpinionVersionForm;
