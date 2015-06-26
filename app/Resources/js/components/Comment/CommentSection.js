import CommentList from './CommentList';
import Fetcher from '../../services/Fetcher';
var FormattedMessage  = ReactIntl.FormattedMessage;


var CommentSection = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        return {
            comments_total: 0,
            comments: [],
            can_report: true,
            filter: 'last'
        };
    },

    componentDidMount() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, 5000);
    },

    render() {
        return (
        <div>
            <div className="row">
                <h2 className="h2 col-sm-6">
                    <FormattedMessage
                        message={this.getIntlMessage('comment.list')}
                        num={this.state.comments_total}
                    />
                </h2>
                { this.renderFilter() }
            </div>
            <CommentList comments={this.state.comments} can_report={this.state.can_report} />
            { this.renderLoadMore() }
        </div>
        );
    },

    renderFilter() {
        if (this.state.comments_total > 0) {
            return (
                <div className="col-sm-6 hidden-xs">
                    <select className="h2 form-control" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
                      <option value="popular">{this.getIntlMessage('global.popular')}</option>
                      <option value="last">{this.getIntlMessage('global.last')}</option>
                    </select>
                </div>
            );
        }
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
            this.loadCommentsFromServer();
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

    loadCommentsFromServer() {
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
                'can_report': data.canReport,
                'filter': this.state.filter
            });
        });
    },

    loadMore() {
        this.props.queryParams.limit += 20;
        this.loadCommentsFromServer();
    }

});

export default CommentSection;
