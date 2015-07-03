import CommentActions from '../../actions/CommentActions';
import UserAvatar from '../User/UserAvatar';

var CommentAnswerForm = React.createClass({
    mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

    getInitialState(  ) {
        return {
            body: '',
        };
    },

    componentDidMount() {
        if (this.props.focus) {
            React.findDOMNode(this.refs.body).focus();
        }
    },

    create(e) {
        e.preventDefault();
        let data = this.state;
        data.parent = this.props.comment.id;
        CommentActions.create(this.props.uri, this.props.object, data);
        this.setState({ body: ''});
        autosize.destroy(React.findDOMNode(this.refs.body));
    },

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.focus && !$(React.findDOMNode(this.refs.body)).is(':focus')) {
            React.findDOMNode(this.refs.body).focus();
        }
    },

    componentDidUpdate() {
        autosize($(React.findDOMNode(this.refs.body)));
    },

    renderSubmit() {
        if (this.state.body.length > 1) {
            return <input className="btn btn-primary" type="submit" onClick={this.create.bind(this)} />
        }
    },

    render() {
        var comment = this.props.comment;
        return (
            <form className="commentAnswerForm">
                <div className="form-group">
                    <textarea valueLink={this.linkState('body')} ref="body" name="body"
                              rows="1" required="required" className="form-control"
                              placeholder={this.getIntlMessage('global.comment')}
                    />
                </div>
                { this.renderSubmit() }
            </form>
        );
    }
});

export default CommentAnswerForm;
