import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';
import OpinionInfos from './OpinionInfos';

const OpinionPreview = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const opinion = this.props.opinion;
    return (
      <div className="opinion__body box">
        <UserAvatar user={opinion.author} />
        <div className="opinion__data">
          <OpinionInfos opinion={opinion} />
          <h3 className="opinion__title">
            <a href={opinion._links.show}>
              { opinion.title }
            </a>
          </h3>
          <p className="opinion__votes excerpt small">
            { opinion.votes_total } votes • { opinion.arguments_count } arguments • { opinion.sources_count } sources
          </p>
        </div>
      </div>
    );
  },

});

export default OpinionPreview;
