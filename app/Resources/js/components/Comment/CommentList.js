import Comment from './Comment';
import Fetcher from '../../services/Fetcher';

var CommentList = React.createClass({
    mixins: [ReactIntl.IntlMixin],
    getInitialState() {
        return {
            comments: []
        };
    },

    componentDidMount() {

        Fetcher.get('/ideas/'+ this.props.idea + '/comments')
        .then((data) => {
            this.setState({
                'comments': data
            });
        });

    },

    render() {
        return (
            <div>
                <h2 className="h2">{ this.state.comments.length } commentaires</h2>
                <ul className="media-list  opinion__list">
                      {
                          this.state.comments.map((comment) => {
                              return <Comment key={comment.id} comment={comment} />;
                          })
                      }
                </ul>
            </div>
        );
    }
});

export default CommentList;
