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
            loadingMore: false,
            filter: 'last',
            offset: 0,
            limit: 10
        };
    },

    componentWillMount() {
        CommentStore.addChangeListener(this.onChange);
    },

    componentWillUnmount() {
        CommentStore.removeChangeListener(this.onChange);
    },

    componentDidMount() {
        this.loadCommentsFromServer();
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.state.filter != prevState.filter) {
            this.loadCommentsFromServer();
        }
    },

    onChange() {
       if (CommentStore.isSync) {
            this.setState({
                 comments_total: CommentStore.count,
                 comments: CommentStore.comments,
                 loaded: true,
                 loadingMore: false,
            });

            let loadMoreButton = React.findDOMNode(this.refs.loadMore);
            if (loadMoreButton) {
                $(loadMoreButton).button('reset');
            }

            return;
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
            <h4>{this.getIntlMessage('comment.publish')}</h4>
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
                      <option value="old">{this.getIntlMessage('global.old')}</option>
                    </select>
                </div>
            );
        }
    },

    renderLoadMore() {
        if (this.state.limit < this.state.comments_total) {
            return (
                <button className="btn btn-block btn-default" ref="loadMore" data-loading-text="Loading..." onClick={this.loadMore.bind(this)}>
                    { this.getIntlMessage('global.more') }
                </button>
            );
        }
        return ;
    },

    updateSelectedValue(e) {
        this.setState({
            filter: $("#comments-filter").val()
        });
    },

    loadCommentsFromServer() {
        CommentActions.loadFromServer(
            this.props.uri,
            this.props.object,
            this.state.offset,
            this.state.limit,
            this.state.filter
        );
    },

    loadMore() {

        $(React.findDOMNode(this.refs.loadMore)).button('loading');
        this.setState({
            loadingMore: true,
            limit: this.state.limit + 10
        }, () => {
            this.loadCommentsFromServer();
        });
    }

});

export default CommentSection;
