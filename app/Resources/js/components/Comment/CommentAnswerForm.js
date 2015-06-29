import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';

var CommentAnswerForm = React.createClass({
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
        autosize($('.comment-textarea'));
    },

    renderSubmit() {
        if (this.state.body.length > 1) {
            return <input className="btn  btn-primary" type="submit" onClick={this.create.bind(this)} />
        }
    },

    render() {
        var comment = this.props.comment;
        return (
            <form className="commentAnswerForm">
                <div className="form-group">
                    <textarea valueLink={this.linkState('body')} name="body" rows="1" required="required" className="form-control comment-textarea" placeholder={this.getIntlMessage('global.comment')} />
                </div>
                { this.renderSubmit() }
            </form>
        );
    }
});

export default CommentAnswerForm;
