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
            countWithAnswers: 0,
            count: 0,
            comments: [],
            isReportingEnabled: true,
            isLoading: true,
            isLoadingMore: false,
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

    render() {
        return (
        <div>
            <div className="row">
                <h2 className="h2 col-sm-6">
                    <FormattedMessage
                        message={this.getIntlMessage('comment.list')}
                        num={this.state.countWithAnswers}
                    />
                </h2>
                { this.renderFilter() }
            </div>
            { this.renderLoader() }
            {(!this.state.isLoading
                ? <CommentForm uri={this.props.uri} object={this.props.object} />
                : <span />
            )}
            <CommentList {...this.props}
                         comments={this.state.comments}
                         root={true}
                         isReportingEnabled={this.state.isReportingEnabled}
            />
            { this.renderLoadMore() }
        </div>
        );
    },

    onChange() {
       if (CommentStore.isSync) {
            this.setState({
                 countWithAnswers: CommentStore.countWithAnswers,
                 count: CommentStore.count,
                 isReportingEnabled: CommentStore.isReportingEnabled,
                 comments: CommentStore.comments,
                 isLoading: false,
                 isLoadingMore: false,
            }, () => {
                this.resetLoadMoreButton();
            });

            return;
       }

        this.setState({
            isLoading: true,
        }, () => {
            this.loadCommentsFromServer();
        });
    },


    renderLoader() {
        if (this.state.isLoading) {
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
        if (this.state.count > 1) {
            return (
                <div className="col-sm-6 hidden-xs">
                    <select ref="filter" className="h2 form-control" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
                      <option value="popular">{this.getIntlMessage('global.popular')}</option>
                      <option value="last">{this.getIntlMessage('global.last')}</option>
                      <option value="old">{this.getIntlMessage('global.old')}</option>
                    </select>
                </div>
            );
        }
    },

    renderLoadMore() {
        if (!this.state.isLoading && (this.state.limit < this.state.count || this.state.isLoadingMore)) {
            return (
                <button className="btn btn-block btn-grey" ref="loadMore" data-loading-text={this.getIntlMessage('global.loading')} onClick={this.loadMore.bind(this)}>
                    { this.getIntlMessage('comment.more') }
                </button>
            );
        }
        return ;
    },

    updateSelectedValue(e) {
        this.setState({
            filter: $(React.findDOMNode(this.refs.filter)).val(),
            isLoading: true,
            comments: []
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

    resetLoadMoreButton() {
        let loadMoreButton = React.findDOMNode(this.refs.loadMore);
        if (loadMoreButton) {
            $(loadMoreButton).button('reset');
        }
    },

    loadMore() {

        $(React.findDOMNode(this.refs.loadMore)).button('loading');

        this.setState({
            isLoadingMore: true,
            limit: this.state.limit + 10
        }, () => {
            this.loadCommentsFromServer();
        });
    }

});

export default CommentSection;
