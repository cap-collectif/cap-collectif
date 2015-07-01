import CommentList from './CommentList';
import CommentForm from './CommentForm';
import Fetcher from '../../services/Fetcher';
import CommentActions from '../../actions/CommentActions';
import CommentStore from '../../stores/CommentStore';

var FormattedMessage  = ReactIntl.FormattedMessage;


var CommentSection = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        return {
            comments_total: 0,
            comments: [],
            can_report: true,
            loaded: false,
            filter: 'last'
        };
    },

    componentWillMount() {
        CommentStore.addChangeListener(this._onChange);
    },

    componentDidMount() {
        this.loadCommentsFromServer();
    },

    componentWillUnmount() {
        CommentStore.removeChangeListener(this._onChange);
    },

    _onChange() {
       if (CommentStore.isSync) {
            this.setState({
                 comments_total: CommentStore.count,
                 comments: CommentStore.comments,
                 loaded: true,
                 filter: this.state.filter
            });
            return ;
       }
       this.loadCommentsFromServer();
    },

    render() {
        return (
        <div>
            { this.renderLoader() }
            <div className="row">
                <h2 className="h2 col-sm-6">
                    <FormattedMessage
                        message={this.getIntlMessage('comment.list')}
                        num={this.state.comments_total}
                    />
                </h2>
                { this.renderFilter() }
            </div>
            <CommentList {...this.props} comments={this.state.comments}  root={true} can_report={this.state.can_report} />
            { this.renderLoadMore() }
            <h4>Publier un commentaire</h4>
            <CommentForm uri={this.props.uri} object={this.props.object} />
        </div>
        );
    },

    renderLoader() {
        if (!this.state.loaded) {
            return (
                <div className= "row">
                    <div className="col-sm-2 col-sm-offset-5">
                         <div className="spinner-loader"></div>
                    </div>
                </div>
            );
        }
    },

    renderFilter() {
        if (this.state.comments_total > 1) {
            return (
                <div className="col-sm-6 hidden-xs">
                    <select id="comments-filter" className="h2 form-control" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
                      <option value="popular">{this.getIntlMessage('global.popular')}</option>
                      <option value="last">{this.getIntlMessage('global.last')}</option>
                    </select>
                </div>
            );
        }
    },

    updateSelectedValue(e) {

        this.setState({
            comments_total: this.state.comments_total,
            comments: this.state.comments,
            loaded: true,
            filter: $("#comments-filter").val()
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
        CommentActions.loadFromServer(
            this.props.uri,
            this.props.object,
            this.props.queryParams.offset,
            this.props.queryParams.limit,
            this.state.filter
        );
    },

    loadMore() {
        this.props.queryParams.limit += 20;
        this.loadCommentsFromServer();
    }

});

export default CommentSection;
