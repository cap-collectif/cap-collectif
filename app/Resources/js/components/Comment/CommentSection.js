import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import CommentActions from '../../actions/CommentActions';
import CommentStore from '../../stores/CommentStore';
import Loader from '../Utils/Loader';
import FlashMessages from '../Utils/FlashMessages';

const MessagePagination = 10;

const CommentSection = React.createClass({
  propTypes: {
    uri: PropTypes.string,
    object: PropTypes.string,
  },

  getInitialState() {
    return {
      countWithAnswers: 0,
      count: 0,
      comments: [],
      isLoading: true,
      isLoadingMore: false,
      filter: 'last',
      offset: 0,
      limit: MessagePagination,
      messages: {
        errors: [],
        success: [],
      },
    };
  },

  componentWillMount() {
    CommentStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadCommentsFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadCommentsFromServer();
    }
  },

  componentWillUnmount() {
    CommentStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      messages: CommentStore.messages,
    });
    if (CommentStore.isSync) {
      this.setState(
        {
          countWithAnswers: CommentStore.countWithAnswers,
          count: CommentStore.count,
          comments: CommentStore.comments,
          isLoading: false,
          isLoadingMore: false,
        },
        () => {
          this.resetLoadMoreButton();
        },
      );
      return;
    }

    this.setState(
      {
        isLoading: true,
      },
      () => {
        this.loadCommentsFromServer();
      },
    );
  },

  comment(data) {
    const { object, uri } = this.props;
    return CommentActions.create(uri, object, data);
  },

  updateSelectedValue() {
    this.setState({
      filter: $(ReactDOM.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      comments: [],
    });
  },

  loadCommentsFromServer() {
    const { object, uri } = this.props;
    CommentActions.loadFromServer(
      uri,
      object,
      this.state.offset,
      this.state.limit,
      this.state.filter,
    );
  },

  resetLoadMoreButton() {
    const loadMoreButton = ReactDOM.findDOMNode(this.refs.loadMore);
    if (loadMoreButton) {
      $(loadMoreButton).button('reset');
    }
  },

  loadMore() {
    $(ReactDOM.findDOMNode(this.refs.loadMore)).button('loading');
    this.setState(
      {
        isLoadingMore: true,
        limit: this.state.limit + MessagePagination,
      },
      () => {
        this.loadCommentsFromServer();
      },
    );
  },

  renderFilter() {
    if (this.state.count > 1) {
      return (
        <Col
          xsOffset={2}
          sm={4}
          className="hidden-xs"
          style={{ marginTop: '10px', marginBottom: '20px' }}>
          <select
            ref="filter"
            className="form-control"
            value={this.state.filter}
            onChange={() => this.updateSelectedValue()}>
            <option value="popular">{<FormattedMessage id="global.filter_popular" />}</option>
            <option value="last">{<FormattedMessage id="global.filter_last" />}</option>
            <option value="old">{<FormattedMessage id="global.filter_old" />}</option>
          </select>
        </Col>
      );
    }
  },

  renderLoadMore() {
    if (
      !this.state.isLoading &&
      (this.state.limit < this.state.count || this.state.isLoadingMore)
    ) {
      return (
        <button
          className="btn btn-block btn-dark-grey"
          ref="loadMore"
          data-loading-text={<FormattedMessage id="global.loading" />}
          onClick={this.loadMore}>
          <FormattedMessage id="comment.more" />
        </button>
      );
    }
    return null;
  },

  render() {
    return (
      <div className="comments__section">
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} />
        <h3>
          <FormattedMessage id="proposal.tabs.comments" />
        </h3>
        <Row>
          <Col componentClass="h4" id="proposal-page-comments-counter" sm={6}>
            <FormattedHTMLMessage
              id="comment.list"
              values={{
                num: this.state.countWithAnswers,
              }}
            />
          </Col>
          {this.renderFilter()}
        </Row>
        <Loader show={this.state.isLoading} />
        <CommentForm comment={this.comment} focus={false} />
        <CommentList
          {...this.props}
          comments={this.state.comments}
          root
          onVote={this.loadCommentsFromServer}
        />
        {this.renderLoadMore()}
      </div>
    );
  },
});

export default CommentSection;
