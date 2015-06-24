import CommentList from './CommentList';
import Fetcher from '../../services/Fetcher';
var FormattedMessage  = ReactIntl.FormattedMessage;


var CommentSection = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        return {
            comments_total: 0,
            comments: [],
            filter: 'last'
        };
    },

    componentDidMount() {
        this.refreshComments();
    },

    render() {
        return (
        <div>
            <div className="row h2">
                <h2 className="col-xs-6">
                    <FormattedMessage
                        message={this.getIntlMessage('comment.list')}
                        num={this.state.comments_total}
                    />
                </h2>
                <select id="comment-filter" className="col-xs-6" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
                  <option value="popular">Populaire</option>
                  <option value="last">Récent</option>
                </select>
            </div>
            <CommentList comments={this.state.comments} />
            { this.renderLoadMore() }
        </div>
        );
    },

    updateSelectedValue(e) {

        this.setState({
            'comments_total': this.state.comments_total,
            'comments': this.state.comments,
            'filter': $("#comment-filter").val()
        });

    },

    componentDidUpdate(prevProps, prevState) {
        if (this.state.filter != prevState.filter) {
            this.refreshComments();
        }
    },

    renderLoadMore() {

        if (this.props.queryParams.limit < this.state.comments_total) {
            return (
                <button className="btn btn-default" onClick={this.loadMore.bind(this)}>
                    { this.getIntlMessage('global.more') }
                </button>
            );
        }
        return ;
    },

    refreshComments() {
        Fetcher
        .get('/ideas/'+ this.props.idea +
             '/comments?offset=' + this.props.queryParams.offset +
             '&limit=' + this.props.queryParams.limit +
             '&filter=' + this.state.filter
        )
        .then((data) => {
            this.setState({
                'comments_total': data.total_count,
                'comments': data.comments,
                'filter': this.state.filter
            });
        });
    },

    loadMore() {
        this.props.queryParams.limit += 20;
        this.refreshComments();
    }

});

export default CommentSection;
