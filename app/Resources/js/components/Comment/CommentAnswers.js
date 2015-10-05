import CommentList from './CommentList';

const CommentAnswers = React.createClass({
  propTypes: {
    comments: React.PropTypes.array,
    isReportingEnabled: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.comments) {
      return (
        <div>
          <CommentList comments={this.props.comments} isReportingEnabled={this.props.isReportingEnabled} root={false}/>
        </div>
      );
    }
    return null;
  },

});

export default CommentAnswers;
