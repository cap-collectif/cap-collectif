import AutoLinkText from '../Utils/AutoLinkText';

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
                text += '...';
            }
            text += ' ';
        }

        return text.replace(new RegExp('\r?\n','g'), '<br />');
    },


    render() {
        return (
            <div className='opinion__text'>
                { this.renderTrashedLabel() }
                <AutoLinkText text={this.generateText()} />
                { this.renderReadMoreOrLess() }
            </div>
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
