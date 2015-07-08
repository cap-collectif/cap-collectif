import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';

var CommentForm = React.createClass({
    mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

    getInitialState() {
        return {
            body: '',
            submited: false,
            expanded: false
        };
    },

    isValid(field) {

        if (!this.state.submited) {
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

    },

    getClasses(field) {
      return React.addons.classSet({
        'form-group': true,
        'has-error': !this.isValid(field)
      });
    },

    getFormClasses() {
      return React.addons.classSet({
        'comment-answer-form': this.props.isAnswer
      });
    },

    create(e) {
        e.preventDefault();

        this.setState({
            submited: true
        }, () => {

            if (!this.isValid()) {
                return;
            }

            $(React.findDOMNode(this.refs.create)).button('loading');


            var data = this.state;
            delete data.expanded;
            delete data.submited;
            this.props.comment(data)
            .then(() => {
                this.setState(this.getInitialState());
                autosize.destroy(React.findDOMNode(this.refs.body));
                $(React.findDOMNode(this.refs.create)).button('reset');
            })
            .catch(() => {
                alert('Désolé, un problème est survenu lors de l\'ajout de votre commentaire.');
                this.setState(data);
                $(React.findDOMNode(this.refs.create)).button('reset');
            });
        });
    },

    componentDidMount() {
        if (this.props.focus) {
            React.findDOMNode(this.refs.body).focus();
        }
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

    renderAnonymous() {

        if (!LoginStore.isLoggedIn()) {
            return (
                <div>
                    <div className="row">
                        <div className="col-sm-12  col-md-6">
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
                        </div>
                        <div className="col-sm-12  col-md-6">
                            <p>{ this.getIntlMessage('comment.without_account') }</p>
                            <div className={this.getClasses('authorName')}>
                                <label for="authorName" className="control-label h5">
                                    { this.getIntlMessage('global.fullname') }
                                </label>
                                <input valueLink={this.linkState('authorName')}
                                       type="text" id="authorName"
                                       name="authorName" className="form-control"
                                />
                                <p className="excerpt small">
                                    { this.getIntlMessage('comment.public_name') }
                                </p>
                            </div>
                            <div className={ this.getClasses('authorEmail') }>
                                <label for="authorEmail" className="control-label h5">
                                    { this.getIntlMessage('global.hidden_email') }
                                </label>
                                <input valueLink={this.linkState('authorEmail')}
                                       type="email" id="authorEmail"
                                       name="authorEmail" className="form-control"
                                />
                                <p className="excerpt small">
                                    { this.getIntlMessage('comment.email_info') }
                                </p>
                            </div>
                            <button ref="create" className="btn btn-primary" data-loading-text={this.getIntlMessage('global.loading')} onClick={this.create.bind(this)}>
                                { this.getIntlMessage('comment.submit') }
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

    },

    renderCommentButton() {
        if (this.state.expanded || this.state.body.length >= 1) {
            if (LoginStore.isLoggedIn()) {
                return (
                    <input className="btn btn-primary" type="submit"
                           value={this.getIntlMessage('comment.submit')}
                           onClick={this.create.bind(this)}
                    />
                );
            }
            return (
                <div>
                    { this.renderAnonymous() }
                </div>
            );
        }
    },

    expand(newSate) {
        if (!newSate) {
             if (event.relatedTarget && $(event.relatedTarget).is(':button')) {
                return; // clicked on comment button
             }
             if (this.state.body.length === 0) {
                this.setState({expanded: newSate, submited: false});
                return;
             }
        }
        this.setState({'expanded': newSate});
    },

    render() {
        var comment = this.props.comment;
        return (
            <div className={ this.getFormClasses() }>
                <UserAvatar user={LoginStore.user} />
                <div className="opinion__data" onBlur={this.expand.bind(this, false)}>
                    <form>
                        <div className={ this.getClasses('body') }>
                            <textarea valueLink={this.linkState('body')}
                                      name="body"
                                      onFocus={this.expand.bind(this, true)}
                                      placeholder={this.getIntlMessage('global.comment')}
                                      ref="body" rows="2" className="form-control"
                            />
                        </div>
                        { this.renderCommentButton() }
                    </form>
                </div>
            </div>
        );
    }
});

export default CommentForm;
