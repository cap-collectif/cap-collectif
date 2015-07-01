import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';

var FormattedDate = ReactIntl.FormattedDate;

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
    },

    componentDidUpdate() {
        autosize($('#commentInput'));
    },

    renderAnonymous() {

        if (!LoginStore.isLoggedIn()) {
            return (
                <div>
                    <p className="excerpt">{ this.getIntlMessage('global.all_required') }</p>
                    <div className="row">
                        <div className="col-sm-12  col-md-6">
                            <div className="form-group">
                                <label for="commentName" className="control-label h5 big-label">
                                    { this.getIntlMessage('global.name') }
                                    <span className="pull-right">
                                        <a href="/login">
                                            { this.getIntlMessage('comment.with_my_account') }
                                        </a>
                                    </span>
                                </label>
                                <input valueLink={this.linkState('authorName')} type="text" id="commentName" name="authorName" required="required" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label for="commentEmail" className="control-label  h5">
                                    { this.getIntlMessage('global.masked_email') }
                                </label>
                                <input valueLink={this.linkState('authorEmail')} type="email" id="commentEmail" name="authorEmail" required="required" className="form-control" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    },

    renderLoggedIn() {
        if (LoginStore.isLoggedIn()) {
            var user = LoginStore.user;
            console.log(user);
            console.log(user.username);
            return (
                <div className="media">
                    <UserAvatar user={user} />
                    <div className="media-body">
                        <p className="media--aligned excerpt">
                            <a href={user._links.profile}>
                                { user.username }
                            </a>
                        </p>
                    </div>
                </div>
            );
        }
    },

    render() {
        var comment = this.props.comment;
        return (
            <div>
                { this.renderLoggedIn() }
                <div className="opinion__data">
                    <form className="commentForm">
                        { this.renderAnonymous() }
                        <div className="form-group">
                            <label for="commentInput" className="control-label  h5">
                                { this.getIntlMessage('global.message') }
                            </label>
                            <textarea valueLink={this.linkState('body')} rows="5" id="commentInput" className="form-control" />
                        </div>
                        <input className="btn  btn-primary" type="submit" value={this.getIntlMessage('comment.submit')} onClick={this.create.bind(this)} />
                    </form>
                </div>
            </div>
        );
    }
});

export default CommentForm;
