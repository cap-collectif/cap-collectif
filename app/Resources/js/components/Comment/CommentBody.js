var CommentBody = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        return {
           expanded: false
        };
    },

    textShouldBeTruncated() {
        return this.props.comment.body.length > 400;
    },

    generateText() {

        var text = "";

        if (!this.textShouldBeTruncated() || this.state.expanded) {
            text = this.props.comment.body;
        } else {
            text = this.props.comment.body.substr(0, 400);
            text = text.substr(0, Math.min(text.length, text.lastIndexOf(" ")));

            if (text.indexOf('.', text.length - 1) == -1) {
                text += '&hellip;';
            }
            text += ' ';
        }

        return text;
    },

    render() {
        return (
            <p className='opinion__text'>
                { this.renderTrashedLabel() }
                <span dangerouslySetInnerHTML={{__html: this.generateText() }}></span>
                { this.renderReadMoreOrLess() }
            </p>
        )
    },

    renderReadMoreOrLess() {
        if (this.textShouldBeTruncated() && !this.state.expanded) {
            return <a onClick={this.expand.bind(this, true)}>{this.getIntlMessage('global.read_more')}</a>
        }
    },

    expand(expanded) {
        this.setState({
            expanded: expanded
        });
    },

    renderTrashedLabel() {
        if (this.props.comment.isTrashed) {
            return(
                <span className="label label-default" style="position: static">
                    { this.getIntlMessage('comment.trashed.label') }
                </span>
            );
        }

        return;
    }
});

export default CommentBody;
