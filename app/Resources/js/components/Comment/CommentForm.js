
var FormattedDate = ReactIntl.FormattedDate;

var CommentForm = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        var comment = this.props.comment;
        return (
            <form className="commentForm">
                <p className="excerpt">Tous les champs sont obligatoires.</p>
                <div className="row">
                    <div className="col-sm-12  col-md-6">
                        <div className="form-group">
                            <label for="commentName" className="control-label  h5" style="width:100%;">
                                Nom
                                <span className="pull-right">
                                    <a href="/comments/Idea/3/login">
                                        Commenter avec mon compte
                                    </a>
                                </span>
                            </label>
                            <input type="text" id="commentName" name="authorName" required="required" className="form-control">
                        </div>
                        <div className="form-group">
                            <label for="commentEmail" className="control-label  h5">
                                Adresse électronique (masquée)
                            </label>
                            <input type="email" id="commentEmail" name="authorEmail" required="required" className="form-control">
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label for="commentInput" className="control-label  h5">Message</label>
                    <textarea id="commentInput" name="body" required="required" rows="5" className="form-control"></textarea>
                </div>
                <input type="submit" value="Post" />
            </form>
        );
    }
});

export default CommentForm;
