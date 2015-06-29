import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';

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

    isAnonymous() {
        return true;
    },

    componentDidUpdate() {
        autosize($('#commentInput'));
    },

    renderAnonymous() {

        if (this.isAnonymous()) {
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
        if (!this.isAnonymous()) {
                return (
                    <UserAvatar user={comment.user} />
                );
        }
    },

    render() {
        var comment = this.props.comment;
        return (
            <form className="commentForm">
                { this.renderAnonymous() }
                { this.renderLoggedIn() }
                <div className="form-group">
                    <label for="commentInput" className="control-label  h5">
                        { this.getIntlMessage('global.message') }
                    </label>
                    <textarea valueLink={this.linkState('body')} rows="5" id="commentInput" className="form-control" />
                </div>
                <input className="btn  btn-primary" type="submit" value={this.getIntlMessage('comment.submit')} onClick={this.create.bind(this)} />
            </form>
        );
    }
});

export default CommentForm;
