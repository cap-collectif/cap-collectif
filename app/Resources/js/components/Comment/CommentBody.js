import AutoLinkText from '../Utils/AutoLinkText';

const CommentBody = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
       expanded: false,
    };
  },

  renderReadMoreOrLess() {
    if (this.textShouldBeTruncated() && !this.state.expanded) {
      return <button className="btn-link" onClick={this.expand.bind(this, true)}>{this.getIntlMessage('global.read_more')}</button>;
    }
  },

  renderTrashedLabel() {
    if (this.props.comment.isTrashed) {
      return (
        <span className="label label-default">
          { this.getIntlMessage('comment.trashed.label') }
        </span>
      );
    }
    return <span />;
  },


  render() {
    return (
      <div className="opinion__text">
        { this.renderTrashedLabel() }
        <AutoLinkText text={this.generateText()} />
        { this.renderReadMoreOrLess() }
      </div>
    );
  },

  textShouldBeTruncated() {
    return this.props.comment.body.length > 400;
  },

  generateText() {
    let text = '';

    if (!this.textShouldBeTruncated() || this.state.expanded) {
      text = this.props.comment.body;
    } else {
      text = this.props.comment.body.substr(0, 400);
      text = text.substr(0, Math.min(text.length, text.lastIndexOf(' ')));
      if (text.indexOf('.', text.length - 1) === -1) {
        text += '...';
      }
      text += ' ';
    }

    return text.replace(new RegExp('\r?\n', 'g'), '<br />');
  },

  expand(expanded) {
    this.setState({
      expanded: expanded,
    });
  },

});

export default CommentBody;
