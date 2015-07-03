import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';

var CommentForm = React.createClass({
    mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

    getInitialState(  ) {
        return {
            body: '',
        };
    },

    create(e) {
        e.preventDefault();
        CommentActions.create(this.props.uri, this.props.object, this.state);
        this.setState(this.getInitialState());
        autosize.destroy(React.findDOMNode(this.refs.body));
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
                            <a className="btn btn-block btn-primary" href={window.location.protocol + '//' + window.location.host + '/login'} >
                               { this.getIntlMessage('global.login') }
                            </a>
                        </div>
                        <div className="col-sm-12  col-md-6">
                            <p>{ this.getIntlMessage('comment.without_account') }</p>
                            <div className="form-group">
                                <label for="commentName" className="control-label h5 big-label">
                                    { this.getIntlMessage('global.name') }
                                </label>
                                <input valueLink={this.linkState('authorName')} type="text" id="commentName"
                                       name="authorName" className="form-control"
                                />
                                <p className="excerpt">
                                    { this.getIntlMessage('comment.public_name') }
                                </p>
                            </div>
                            <div className="form-group">
                                <label for="commentEmail" className="control-label  h5">
                                    { this.getIntlMessage('global.hidden_email') }
                                </label>
                                <input valueLink={this.linkState('authorEmail')} type="email" id="commentEmail"
                                       name="authorEmail" className="form-control"
                                />
                            </div>
                            <button className="btn btn-block btn-success" onClick={this.create.bind(this)}>
                                { this.getIntlMessage('comment.submit') }
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

    },

    renderUserAvatar() {
        return (
            <div className="media col-sm-1">
                <UserAvatar user={LoginStore.user} />
            </div>
        );
    },

    renderCommentButton() {
        if (this.state.body.length > 2) {
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

    render() {
        var comment = this.props.comment;
        return (
            <div className="row">
                { this.renderUserAvatar() }
                <div className="opinion__data col-sm-11">
                    <form>
                        <div className="form-group">
                            <textarea valueLink={this.linkState('body')} placeholder={this.getIntlMessage('global.comment')}
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
